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
