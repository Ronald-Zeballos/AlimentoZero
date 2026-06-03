export const CONFIG = {
  tenantId: "demo-tenant",
  merchantId: "merchant-la-paz",
  buyerId: "buyer-demo",
  requesterId: "social-demo",
  receiverOrgId: "org-food-bank",
  iamBaseUrl: "http://localhost:8080",
  aiBaseUrl: "http://localhost:8091",
  marketBaseUrl: "http://localhost:8092"
};

export const ROLE_BY_EMAIL = {
  "rest@test.com": "restaurant",
  "buyer@test.com": "buyer",
  "driver@test.com": "driver",
  "social@test.com": "social"
};

export const ROLE_LABELS = {
  restaurant: "Restaurante El Sabor",
  buyer: "Comprador Demo",
  driver: "Pedro Rodriguez",
  social: "Banco de Alimentos Santa Cruz"
};

export const DEFAULT_MAP_CENTER = [-17.7833, -63.1821];

export const STATUS_LABELS = {
  confirmed: "Confirmado",
  preparing: "Preparando",
  ready: "Listo",
  picked_up: "Retirado",
  in_transit: "En tránsito",
  delivered: "Entregado"
};

const API_TIMEOUT_MS = 6000;

export function headers(extra = {}) {
  return {
    "Content-Type": "application/json",
    "X-Tenant-Id": CONFIG.tenantId,
    ...extra
  };
}

export async function apiFetch(baseUrl, path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const response = await fetch(baseUrl + path, {
      ...options,
      signal: controller.signal,
      headers: { ...headers(), ...(options.headers || {}) }
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}`);
    }
    if (response.status === 204) return null;
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value));
}

export function money(value) {
  return "$" + Number(value).toFixed(2);
}

export function normalizeText(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function imageForFood(name = "") {
  const key = normalizeText(String(name));
  if (key.includes("pizza")) return "/assets/orders/pizza-margherita.jpg";
  if (key.includes("pasta") || key.includes("alfredo") || key.includes("lasana")) return "/assets/orders/pasta-alfredo.jpg";
  if (key.includes("ensalada") || key.includes("cesar")) return "/assets/orders/ensalada-cesar.jpg";
  if (key.includes("tirami") || key.includes("postre")) return "/assets/orders/tiramisu.jpg";
  if (key.includes("sopa")) return "/assets/orders/sopa-dia.jpg";
  if (key.includes("pan") || key.includes("artesanal")) return "/assets/orders/pan-artesanal.jpg";
  return "/assets/orders/pasta-alfredo.jpg";
}

export function normalizeListing(item) {
  const title = item.title || item.name;
  return {
    id: item.id,
    name: title,
    restaurant: item.merchantId || item.restaurant || "Restaurante",
    desc: item.description || item.desc || "",
    price: Number(item.rescuePrice ?? item.price ?? 0),
    originalPrice: Number(item.originalPrice ?? item.price ?? 0),
    stock: Number(item.quantityAvailable ?? item.stock ?? 0),
    reserved: Number(item.quantityReserved ?? 0),
    cat: item.category || item.cat || "Comida",
    img: item.img || "🍽️",
    imageUrl: item.imageUrl || imageForFood(title),
    isDonation: item.listingType === "DONATION" || item.isDonation || Number(item.rescuePrice ?? item.price ?? 0) === 0,
    donationValue: Number(item.originalPrice ?? item.donationValue ?? 0),
    expiry: item.expirationDate ? item.expirationDate.slice(0, 10) : item.expiry,
    pickupStart: item.pickupStart,
    pickupEnd: item.pickupEnd,
    foodCondition: item.foodCondition || "GOOD",
    listingType: item.listingType || (item.isDonation ? "DONATION" : "DISCOUNTED_SALE"),
    status: item.status || "PUBLISHED",
    currency: item.currency || "BOB",
    requiresTransport: !!item.requiresTransport,
    kgRescued: Number(item.kgRescued ?? 1),
    mealsEquivalent: Number(item.mealsEquivalent ?? item.stock ?? 1),
    co2KgAvoided: Number(item.co2KgAvoided ?? 1),
    address: item.address || "Centro",
    city: item.city || "Santa Cruz de la Sierra",
    latitude: Number(item.latitude ?? DEFAULT_MAP_CENTER[0]),
    longitude: Number(item.longitude ?? DEFAULT_MAP_CENTER[1])
  };
}

export function normalizeOrder(order) {
  const itemName = order.listingTitle || order.items?.[0]?.name || "Pedido";
  return {
    id: order.id,
    items: [{ id: order.listingId || order.items?.[0]?.id, name: itemName, qty: order.quantity || order.items?.[0]?.qty || 1, price: Number(order.unitPrice || order.items?.[0]?.price || 0), imageUrl: order.imageUrl || order.items?.[0]?.imageUrl || imageForFood(itemName) }],
    total: Number(order.totalPrice || order.total || 0),
    status: ({ RESERVED: "confirmed", PICKED_UP: "picked_up", CANCELLED: "delivered" }[order.status] || String(order.status || "confirmed").toLowerCase()),
    restaurant: order.merchantId || order.restaurant || "Restaurante",
    driver: order.pickedUpAt ? "Pedro Rodriguez" : null,
    timeline: order.pickedUpAt ? ["confirmed", "ready", "picked_up"] : ["confirmed"],
    pickupCode: order.pickupCode,
    city: order.city
  };
}

export function normalizeDonationRequest(request) {
  return {
    id: request.id,
    product: request.listingTitle || request.product,
    qty: request.quantity || request.qty || 1,
    status: ({ REQUESTED: "En revision", APPROVED: "Aprobada" }[request.status] || request.status || "En revision"),
    people: (request.quantity || request.qty || 1) * 3,
    raw: request
  };
}

export const MOCK_PRODUCTS = [
  { id: "p1", name: "Pizza Margherita", restaurant: "Restaurante El Sabor", price: 25, originalPrice: 50, stock: 5, cat: "Comida preparada", img: "🍕", isDonation: false, foodCondition: "GOOD", listingType: "DISCOUNTED_SALE", status: "PUBLISHED", latitude: -17.7833, longitude: -63.1821 },
  { id: "p2", name: "Pasta Alfredo", restaurant: "Restaurante El Sabor", price: 30, originalPrice: 60, stock: 3, cat: "Comida preparada", img: "🍝", isDonation: false, foodCondition: "GOOD", listingType: "DISCOUNTED_SALE", status: "PUBLISHED", latitude: -17.7833, longitude: -63.1821 },
  { id: "p3", name: "Ensalada Cesar", restaurant: "Pizzeria Napoli", price: 20, originalPrice: 45, stock: 4, cat: "Comida preparada", img: "🥗", isDonation: false, foodCondition: "GOOD", listingType: "DISCOUNTED_SALE", status: "PUBLISHED", latitude: -17.7698, longitude: -63.1963 },
  { id: "p4", name: "Pan Artesanal", restaurant: "Panaderia Artesanal", price: 10, originalPrice: 25, stock: 8, cat: "Panaderia", img: "🥖", isDonation: false, foodCondition: "GOOD", listingType: "DISCOUNTED_SALE", status: "PUBLISHED", latitude: -17.7954, longitude: -63.1664 },
  { id: "p5", name: "Sopa del dia", restaurant: "Restaurante El Sabor", price: 0, originalPrice: 35, stock: 6, cat: "Comida preparada", img: "🍜", isDonation: true, foodCondition: "GOOD", listingType: "DONATION", donationValue: 35, latitude: -17.7833, longitude: -63.1821 },
  { id: "p6", name: "Tiramisu", restaurant: "Pizzeria Napoli", price: 0, originalPrice: 40, stock: 4, cat: "Postres", img: "🍰", isDonation: true, foodCondition: "EXPIRING_SOON", listingType: "DONATION", donationValue: 40, latitude: -17.7698, longitude: -63.1963 }
].map(normalizeListing);

export const MOCK_ORDERS = [
  { id: "o1", items: [{ id: "p1", name: "Pizza Margherita", qty: 2, price: 25 }], total: 50, status: "confirmed", restaurant: "Restaurante El Sabor", pickupCode: "ABC123" },
  { id: "o2", items: [{ id: "p3", name: "Ensalada Cesar", qty: 1, price: 20 }], total: 20, status: "preparing", restaurant: "Pizzeria Napoli" },
  { id: "o3", items: [{ id: "p4", name: "Pan Artesanal", qty: 3, price: 10 }], total: 30, status: "ready", restaurant: "Panaderia Artesanal", driver: "Pedro Rodriguez", pickupCode: "DEF456" }
];

export const MOCK_DONATION_REQUESTS = [
  { id: "dr1", product: "Sopa del dia", qty: 2, status: "En revision", people: 6 },
  { id: "dr2", product: "Tiramisu", qty: 1, status: "Aprobada", people: 3 }
];

export const MOCK_DRIVER_DELIVERIES = [
  { id: "d1", code: "PED-101", restaurant: "Restaurante El Sabor", origin: "Plaza 24 de Septiembre", destination: "Equipetrol Norte", distance: "3.2 km", fee: 5, status: "ready" },
  { id: "d2", code: "PED-102", restaurant: "Pizzeria Napoli", origin: "Av. San Martin", destination: "Urubo", distance: "4.1 km", fee: 6, status: "ready" },
  { id: "d3", code: "PED-103", restaurant: "Panaderia Artesanal", origin: "Av. Cañoto", destination: "Barrio Hamacas", distance: "2.8 km", fee: 4.5, status: "ready" }
];

export const MOCK_DRIVER_ACTIVE = [
  { id: "da1", code: "PED-201", restaurant: "Pizzeria Napoli", destination: "Equipetrol Norte", pickupCode: "ABC123", status: "in_transit" },
  { id: "da2", code: "PED-202", restaurant: "Restaurante El Sabor", destination: "Centro", pickupCode: "XYZ789", status: "in_transit" }
];

export const GUIDE_INTENTS = [
  { role: "restaurant", tab: "profile", target: "restaurantProfile", keywords: ["nit", "rut", "fiscal", "impuesto", "razon social"], message: "Te llevo al formulario de datos fiscales para cambiar el NIT." },
  { role: "restaurant", tab: "publish", target: "restaurantProductFormCard", keywords: ["publicar", "crear oferta", "agregar producto", "producto", "donar excedente"], message: "Te llevo a publicar una oferta." },
  { role: "restaurant", tab: "orders", target: "restaurantOrdersCard", keywords: ["pedido", "pedidos", "estado", "preparando", "listo"], message: "Te llevo a gestionar pedidos." },
  { role: "restaurant", tab: "products", target: "restaurantProductsCard", keywords: ["stock", "inventario", "productos", "activar", "eliminar"], message: "Te llevo a productos e inventario." },
  { role: "restaurant", tab: "fiscal", target: "restaurantFiscalCard", keywords: ["certificado", "donacion", "deduccion", "beneficio fiscal"], message: "Te llevo a donaciones y certificado fiscal." },
  { role: "restaurant", tab: "location", target: "restaurantLocation", keywords: ["ubicacion", "direccion", "mapa", "local"], message: "Te llevo a la ubicacion del restaurante." },
  { role: "buyer", tab: "offers", target: "buyerOffers", keywords: ["ofertas", "comprar", "comida", "carrito"], message: "Te llevo a ofertas disponibles." },
  { role: "buyer", tab: "search", target: "buyerSearch", keywords: ["buscar", "busqueda", "filtrar"], message: "Te llevo al buscador de ofertas." },
  { role: "buyer", tab: "restaurants", target: "buyerRestaurants", keywords: ["restaurante", "restaurantes cerca", "cerca"], message: "Te llevo a restaurantes cercanos." },
  { role: "buyer", tab: "orders", target: "buyerOrders", keywords: ["mis pedidos", "pedido", "historial"], message: "Te llevo a tus pedidos." },
  { role: "buyer", tab: "track", target: "buyerTrack", keywords: ["seguimiento", "rastrear", "repartidor", "entrega"], message: "Te llevo al seguimiento de entregas." },
  { role: "buyer", tab: "location", target: "buyerLocation", keywords: ["ubicacion", "direccion", "donde estoy"], message: "Te llevo a tu ubicacion." },
  { role: "buyer", tab: "profile", target: "buyerProfile", keywords: ["usuario", "perfil", "telefono", "email", "preferencias"], message: "Te llevo a gestionar tu usuario." },
  { role: "social", tab: "available", target: "socialAvailable", keywords: ["donaciones disponibles", "solicitar donacion", "alimentos"], message: "Te llevo a donaciones disponibles." },
  { role: "social", tab: "requests", target: "socialRequests", keywords: ["solicitudes", "historial", "impacto", "aprobar"], message: "Te llevo a solicitudes e impacto." },
  { role: "driver", tab: "available", target: "driverAvailable", keywords: ["repartos disponibles", "aceptar reparto"], message: "Te llevo a repartos disponibles." },
  { role: "driver", tab: "mine", target: "driverMine", keywords: ["mis repartos", "recogi", "entrega"], message: "Te llevo a tus repartos." },
  { role: "driver", tab: "map", target: "driverMapPane", keywords: ["mapa", "ruta", "ubicacion"], message: "Te llevo al mapa de ruta." }
];
