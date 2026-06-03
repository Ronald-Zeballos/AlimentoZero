import React, { useState, useCallback, useEffect, useRef } from "react";
import { aiApi } from "../api";
import { GUIDE_INTENTS, normalizeText } from "../constants";
import { findFallbackAnswer, loadFallbackKnowledge } from "../assistantFallback";

const INITIAL_GREETING = "Hola, soy Ali. Puedo guiarte por tu panel o responder con ayuda local si la IA no esta disponible.";

const TAB_LABELS = {
  profile: "Perfil",
  publish: "Publicar",
  orders: "Pedidos",
  products: "Productos",
  fiscal: "Donaciones",
  available: "Disponibles",
  requests: "Solicitudes",
  impact: "Impacto",
  mine: "Mis repartos",
  map: "Mapa",
  offers: "Ofertas",
  search: "Buscar",
  restaurants: "Restaurantes cerca",
  track: "Seguimiento",
  location: "Ubicacion"
};

function buildSystem(role, tab) {
  return `Eres Ali, asistente de AlimentoZero. El usuario tiene rol "${role}" y esta en "${tab}". Responde breve, practico y solo con funciones permitidas para ese rol.`;
}

function wantsFormFill(text) {
  const lower = normalizeText(text);
  const action = /(rellen|complet|llen|carg|public|crea|agreg|actualiz|cambi|edit)/.test(lower);
  const target = /(nit|razon social|telefono|direccion|producto|oferta|precio|stock|descripcion|categoria|donacion|rescate)/.test(lower);
  return action && target;
}

function extractJsonObject(text) {
  if (!text) return null;
  const cleaned = String(text).replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

function numberFrom(text) {
  if (!text) return "";
  const match = String(text).match(/\d+(?:[.,]\d+)?/);
  return match ? match[0].replace(",", ".") : "";
}

function localFillExtraction(text) {
  const lower = normalizeText(text);
  const fields = {};
  const profileFields = {};

  const nit = text.match(/\bnit\s*(?:es|:|=)?\s*([0-9-]{5,})/i);
  const phone = text.match(/(?:telefono|tel|celular)\s*(?:es|:|=)?\s*([+0-9\s-]{7,})/i);
  const legalName = text.match(/razon social\s*(?:es|:|=)?\s*([^,.]+)/i);
  const address = text.match(/direccion\s*(?:es|:|=)?\s*([^,.]+)/i);

  if (nit) profileFields.nit = nit[1].trim();
  if (phone) profileFields.phone = phone[1].trim();
  if (legalName) profileFields.legalName = legalName[1].trim();
  if (address) profileFields.address = address[1].trim();

  const productName = text.match(/(?:producto|plato|oferta|publica|publicar|carga|crear)\s+(?:llamado|llamada|de)?\s*([^,.;]+)/i);
  const originalPrice = text.match(/(?:precio original|original)\s*(?:de|es|:|=)?\s*([0-9]+(?:[.,][0-9]+)?)/i);
  const rescuePrice = text.match(/(?:precio rescate|rescate|precio)\s*(?:de|es|:|=)?\s*([0-9]+(?:[.,][0-9]+)?)/i);
  const stock = text.match(/(?:stock|cantidad|unidades|porciones)\s*(?:de|es|:|=)?\s*([0-9]+)/i);

  if (productName && !lower.includes("nit")) fields.name = productName[1].trim();
  if (originalPrice) fields.originalPrice = numberFrom(originalPrice[1]);
  if (rescuePrice) fields.rescuePrice = numberFrom(rescuePrice[1]);
  if (stock) fields.stock = stock[1];
  if (lower.includes("pan")) fields.category = "Panaderia";
  if (lower.includes("bebida")) fields.category = "Bebidas";
  if (lower.includes("fruta") || lower.includes("verdura")) fields.category = "Frutas y verduras";
  if (lower.includes("donacion") || lower.includes("donar")) fields.listingType = "DONATION";
  if (lower.includes("por vencer")) fields.foodCondition = "EXPIRING_SOON";

  if (Object.keys(profileFields).length) return { form: "profile", fields: profileFields };
  if (Object.keys(fields).length) return { form: "product", fields };
  return null;
}

function normalizeFillPayload(payload, text) {
  const candidate = payload?.fill || payload;
  if (candidate?.form && candidate?.fields) return candidate;
  return localFillExtraction(text);
}

async function extractFillWithAi(text) {
  const prompt = `Extrae datos para formularios de restaurante de AlimentoZero.
Devuelve SOLO JSON valido con esta forma:
{"form":"product|profile","fields":{...},"reply":"mensaje breve"}
Campos product permitidos: name, category, originalPrice, rescuePrice, stock, description, foodCondition, listingType.
category debe ser una de: Comida preparada, Panaderia, Bebidas, Frutas y verduras.
foodCondition debe ser GOOD, EXPIRING_SOON o DAMAGED.
listingType debe ser DISCOUNTED_SALE o DONATION.
Campos profile permitidos: legalName, nit, phone, address.
Texto usuario: ${text}`;

  const response = await aiApi.ragQa(prompt, "restaurant-form-fill");
  const raw = response?.answer || response?.content || "";
  const parsed = extractJsonObject(raw);
  return normalizeFillPayload(parsed, text) || localFillExtraction(text);
}

export function AiPanel({ currentRole = null, currentTab = null, onNavigate }) {
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState(() => [{ text: INITIAL_GREETING, user: false }]);
  const [aiInput, setAiInput] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const [fallbackKnowledge, setFallbackKnowledge] = useState([]);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [aiMessages]);

  useEffect(() => {
    loadFallbackKnowledge().then(setFallbackKnowledge);
  }, []);

  const addMessage = useCallback((text, user = true) => {
    setAiMessages((prev) => [...prev, { text, user }]);
  }, []);

  const sendNavigation = useCallback((intent) => {
    if (!intent?.tab) return;
    onNavigate?.(intent);
  }, [onNavigate]);

  const handleAiSend = useCallback(async () => {
    const text = aiInput.trim();
    if (!text || aiThinking) return;

    setAiInput("");
    addMessage(text, true);
    setAiThinking(true);

    const lower = normalizeText(text);

    if (currentRole === "restaurant" && wantsFormFill(text)) {
      try {
        const fill = await extractFillWithAi(text);
        if (fill?.form && fill?.fields && Object.keys(fill.fields).length > 0) {
          const intent = {
            role: "restaurant",
            tab: fill.form === "profile" ? "profile" : "publish",
            target: fill.form === "profile" ? "restaurantProfile" : "restaurantProductFormCard",
            fill,
            message: fill.form === "profile" ? "Complete los datos fiscales con tu pedido." : "Complete la oferta con tu pedido."
          };
          sendNavigation(intent);
          addMessage(fill.reply || "Listo, complete los campos que pude identificar. Revisa el formulario antes de guardar.", false);
          setAiThinking(false);
          return;
        }
      } catch {
        const fill = localFillExtraction(text);
        if (fill) {
          sendNavigation({
            role: "restaurant",
            tab: fill.form === "profile" ? "profile" : "publish",
            target: fill.form === "profile" ? "restaurantProfile" : "restaurantProductFormCard",
            fill,
            message: "Complete el formulario con ayuda local."
          });
          addMessage("No pude usar la IA, pero complete los campos que pude detectar localmente.", false);
          setAiThinking(false);
          return;
        }
      }
    }

    const matched = GUIDE_INTENTS.find((entry) =>
      (!entry.role || entry.role === currentRole) && entry.keywords.some((kw) => lower.includes(normalizeText(kw)))
    );

    if (matched) {
      sendNavigation(matched);
      addMessage(`${matched.message} Te llevo a ${TAB_LABELS[matched.tab] || matched.tab}.`, false);
      setAiThinking(false);
      return;
    }

    if (lower.includes("hola") || lower.includes("buenas") || lower.includes("ayuda")) {
      addMessage("Puedo llevarte a formularios y secciones con frases como: cambiar mi NIT, ver restaurantes cerca, mis pedidos, solicitar donacion o ver mapa.", false);
      setAiThinking(false);
      return;
    }

    try {
      const prompt = `${buildSystem(currentRole || "visitante", currentTab || "inicio")}\n\nPregunta: ${text}`;
      const response = await aiApi.ragQa(prompt, "alimentozero-web");
      addMessage(response?.answer || response?.content || "No recibi una respuesta clara de la IA.", false);
    } catch {
      const fallback = findFallbackAnswer(text, currentRole, fallbackKnowledge);
      if (fallback) {
        sendNavigation(fallback);
        addMessage(fallback.answer, false);
      } else {
        addMessage("No pude contactar a la IA. Prueba con: cambiar mi NIT, publicar oferta, restaurantes cerca, mis pedidos, solicitar donacion o mapa de ruta.", false);
      }
    } finally {
      setAiThinking(false);
    }
  }, [aiInput, aiThinking, currentRole, currentTab, fallbackKnowledge, addMessage, sendNavigation]);

  const fabVisible = currentRole && currentRole !== "landing";

  return (
    <>
      <button
        className={`ai-fab ${fabVisible ? "active" : ""}`}
        id="aiFab"
        onClick={() => setAiOpen((value) => !value)}
        title="Asistente Ali"
      >
        AI
      </button>

      <div className={`ai-panel ${aiOpen ? "active" : ""}`} id="aiPanel">
        <div className="card-body px-3 py-2 border-bottom d-flex justify-content-between align-items-center" style={{ background: "linear-gradient(135deg, var(--green-dark), var(--green-bright))", color: "#fff" }}>
          <small className="fw-bold">Ali - Asistente</small>
          <button className="btn btn-sm btn-link text-white p-0 text-decoration-none" onClick={() => setAiOpen(false)}>x</button>
        </div>
        <div className="ai-messages px-3 py-2" ref={messagesRef}>
          {aiMessages.map((msg, index) => (
            <div key={index} className={`ai-message mb-2 ${msg.user ? "user" : ""}`}>
              <small>{msg.text}</small>
            </div>
          ))}
          {aiThinking && <div className="ai-message mb-2"><small className="text-muted">Pensando...</small></div>}
        </div>
        <div className="d-flex gap-2 px-3 py-2 border-top">
          <input
            className="form-control form-control-sm"
            placeholder="Escribe tu consulta..."
            value={aiInput}
            onChange={(event) => setAiInput(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") handleAiSend(); }}
          />
          <button className="btn btn-success btn-sm" onClick={handleAiSend} disabled={aiThinking}>Enviar</button>
        </div>
      </div>
    </>
  );
}
