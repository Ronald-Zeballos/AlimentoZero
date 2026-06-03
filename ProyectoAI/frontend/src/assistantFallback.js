import { normalizeText } from "./constants";

export const DEFAULT_FALLBACK_KNOWLEDGE = [
  {
    role: "restaurant",
    tab: "profile",
    target: "restaurantProfile",
    questions: ["quiero cambiar mi nit", "actualizar nit", "editar rut", "datos fiscales", "razon social"],
    answer: "Para cambiar el NIT entra a Perfil. Ahi esta el formulario de datos fiscales con razon social, NIT, telefono y direccion."
  },
  {
    role: "restaurant",
    tab: "publish",
    target: "restaurantProductFormCard",
    questions: ["publicar oferta", "crear producto", "donar excedente", "agregar comida", "subir producto"],
    answer: "Para publicar una oferta entra a Publicar. Completa nombre, categoria, precio original, precio rescate, stock, descripcion y tipo de oferta."
  },
  {
    role: "restaurant",
    tab: "orders",
    target: "restaurantOrdersCard",
    questions: ["gestionar pedidos", "cambiar estado pedido", "marcar preparando", "marcar listo", "codigo recogida"],
    answer: "En Pedidos puedes cambiar el estado de cada orden: confirmado, preparando, listo y retirado. El codigo de recogida aparece junto al pedido."
  },
  {
    role: "restaurant",
    tab: "products",
    target: "restaurantProductsCard",
    questions: ["ver stock", "inventario", "activar producto", "eliminar producto", "mis productos"],
    answer: "En Productos ves tu inventario publicado, stock y estado de cada oferta."
  },
  {
    role: "buyer",
    tab: "offers",
    target: "buyerOffers",
    questions: ["ver ofertas", "comprar comida", "agregar al carrito", "ofertas disponibles"],
    answer: "En Ofertas puedes comprar productos con descuento. Las donaciones se muestran para transparencia, pero solo las entidades sociales pueden solicitarlas."
  },
  {
    role: "buyer",
    tab: "restaurants",
    target: "buyerRestaurants",
    questions: ["restaurantes cerca", "buscar restaurantes", "ver restaurantes cerca", "locales cercanos"],
    answer: "En Restaurantes ves locales cercanos y su ubicacion aproximada en el mapa."
  },
  {
    role: "buyer",
    tab: "orders",
    target: "buyerOrders",
    questions: ["mis pedidos", "historial de pedidos", "ver pedido", "estado de mi pedido"],
    answer: "En Mis Pedidos ves tus compras, estado, restaurante, total y opcion de rastreo cuando hay repartidor."
  },
  {
    role: "buyer",
    tab: "profile",
    target: "buyerProfile",
    questions: ["cambiar telefono", "editar usuario", "mi perfil", "cambiar direccion"],
    answer: "En Perfil puedes actualizar nombre, email, telefono, direccion y preferencias alimenticias."
  },
  {
    role: "social",
    tab: "available",
    target: "socialAvailable",
    questions: ["solicitar donacion", "donaciones disponibles", "pedir alimentos", "alimentos gratis"],
    answer: "Como entidad social, entra a Disponibles para solicitar donaciones. Esta accion no usa carrito porque no es una compra."
  },
  {
    role: "social",
    tab: "requests",
    target: "socialRequests",
    questions: ["mis solicitudes", "estado solicitud", "solicitudes de donacion", "historial donaciones"],
    answer: "En Solicitudes puedes revisar el estado de tus pedidos de donacion y coordinar las aprobadas."
  },
  {
    role: "driver",
    tab: "available",
    target: "driverAvailable",
    questions: ["repartos disponibles", "aceptar reparto", "entregas disponibles", "tomar pedido"],
    answer: "En Disponibles puedes aceptar repartos listos para retirar."
  },
  {
    role: "driver",
    tab: "map",
    target: "driverMapPane",
    questions: ["ver mapa", "ruta", "ubicacion entrega", "donde entregar"],
    answer: "En Mapa ves origen, destino y ruta estimada del reparto activo."
  },
  {
    role: null,
    tab: null,
    target: null,
    questions: ["se cayo la ia", "no responde la ia", "api key", "openai no funciona"],
    answer: "Si la IA externa no responde, sigo usando esta ayuda local. Para OpenAI revisa que ai-service/.env tenga OPENAI_API_KEY y AI_PROFILE=openai."
  }
];

export async function loadFallbackKnowledge() {
  try {
    const response = await fetch("/assistant-fallback.json", { cache: "no-store" });
    if (!response.ok) throw new Error("fallback json unavailable");
    const data = await response.json();
    return Array.isArray(data) && data.length ? data : DEFAULT_FALLBACK_KNOWLEDGE;
  } catch {
    return DEFAULT_FALLBACK_KNOWLEDGE;
  }
}

function tokens(text) {
  return normalizeText(String(text || ""))
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function scoreText(question, candidate) {
  const q = new Set(tokens(question));
  const c = new Set(tokens(candidate));
  if (!q.size || !c.size) return 0;
  let hits = 0;
  q.forEach((token) => { if (c.has(token)) hits += 1; });
  return hits / Math.sqrt(q.size * c.size);
}

export function findFallbackAnswer(question, role, knowledge) {
  const candidates = (knowledge || DEFAULT_FALLBACK_KNOWLEDGE).filter((entry) => !entry.role || entry.role === role);
  let best = null;
  for (const entry of candidates) {
    const haystack = [...(entry.questions || []), entry.answer || ""];
    const score = Math.max(...haystack.map((text) => scoreText(question, text)));
    if (!best || score > best.score) best = { ...entry, score };
  }
  return best && best.score >= 0.22 ? best : null;
}
