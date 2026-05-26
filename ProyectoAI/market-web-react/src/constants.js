export const DEFAULT_TENANT_ID = "demo-tenant";

export const CATEGORY_OPTIONS = [
  "Todo",
  "Panaderia",
  "Comida rapida",
  "Comida saludable",
  "Cafe",
  "Postres",
  "Parrilla",
  "Mercado",
  "Sushi",
  "Donaciones"
];

export const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80";

export const ROLE_HOME_PATHS = {
  BUYER: "/comprador",
  MERCHANT: "/comercio",
  NGO: "/ong",
  TRANSPORTER: "/logistica",
  COORDINATOR: "/coordinacion",
  ADMIN: "/admin"
};

export const ROLE_NAV_ITEMS = {
  BUYER: [
    { to: "/comprador", label: "Inicio" },
    { to: "/explorar", label: "Promos" },
    { to: "/pedidos", label: "Pedidos" },
    { to: "/perfil", label: "Mi perfil" }
  ],
  MERCHANT: [
    { to: "/comercio", label: "Tablero" },
    { to: "/explorar", label: "Inventario" },
    { to: "/publicar", label: "Publicar" },
    { to: "/perfil", label: "Cuenta" }
  ],
  NGO: [
    { to: "/ong", label: "Centro" },
    { to: "/explorar", label: "Donaciones" },
    { to: "/pedidos", label: "Solicitudes" },
    { to: "/perfil", label: "Perfil" }
  ],
  TRANSPORTER: [
    { to: "/logistica", label: "Base" },
    { to: "/explorar", label: "Rutas" },
    { to: "/pedidos", label: "Operacion" },
    { to: "/perfil", label: "Perfil" }
  ],
  COORDINATOR: [
    { to: "/coordinacion", label: "Centro" },
    { to: "/explorar", label: "Monitoreo" },
    { to: "/pedidos", label: "Flujos" },
    { to: "/perfil", label: "Perfil" }
  ],
  ADMIN: [
    { to: "/admin", label: "Control" },
    { to: "/explorar", label: "Vista" },
    { to: "/pedidos", label: "Equipo" },
    { to: "/perfil", label: "Cuenta" }
  ]
};

export const BUYER_CATEGORY_SPOTLIGHTS = [
  { label: "Pan recien horneado", category: "Panaderia" },
  { label: "Combos rapidos", category: "Comida rapida" },
  { label: "Menus saludables", category: "Comida saludable" },
  { label: "Cafe y postres", category: "Cafe" },
  { label: "Postres frios", category: "Postres" }
];

export const BUYER_PROMO_BANNERS = [
  {
    title: "Hasta 70% menos",
    body: "Packs listos para retirar hoy y evitar desperdicio en tu zona.",
    accent: "warm"
  },
  {
    title: "Donaciones con impacto",
    body: "Activa el modo solidario y descubre lotes reservados para organizaciones.",
    accent: "green"
  },
  {
    title: "Recojo rapido",
    body: "Ventanas cortas, comercios cercanos y confirmacion de retiro en un toque.",
    accent: "dark"
  }
];

export const PROFILE_PREFERRED_CATEGORIES = {
  BUYER_NEIGHBOR: ["Comida rapida", "Panaderia"],
  MERCHANT_BAKERY: ["Panaderia", "Cafe"],
  NGO_FOOD_BANK: ["Mercado", "Comida saludable"],
  TRANSPORT_LAST_MILE: ["Mercado", "Panaderia"],
  COORDINATOR_CITY: ["Mercado", "Comida rapida"],
  ADMIN_TENANT: ["Comida rapida", "Mercado"]
};

export const ROLE_COPY = {
  BUYER: {
    eyebrow: "Rescata comida hoy",
    title: "Tu marketplace de packs sorpresa",
    subtitle:
      "Busca ofertas cercanas, descubre promos del dia y confirma tu retiro como en una app de delivery."
  },
  MERCHANT: {
    eyebrow: "Recuperacion comercial",
    title: "Convierte excedentes en ingresos",
    subtitle:
      "Controla publicaciones, packs criticos e impacto economico desde un tablero de comercio."
  },
  NGO: {
    eyebrow: "Abastecimiento solidario",
    title: "Coordina donaciones con criterio",
    subtitle:
      "Prioriza lotes urgentes, gestiona solicitudes y organiza recepcion por impacto social."
  },
  TRANSPORTER: {
    eyebrow: "Ultima milla",
    title: "Rutas urgentes y retiros trazables",
    subtitle:
      "Detecta ventanas cortas, retiros con transporte requerido y carga operativa del dia."
  },
  COORDINATOR: {
    eyebrow: "Centro de operaciones",
    title: "Supervisa la ciudad en tiempo real",
    subtitle:
      "Monitorea casos criticos, aprobaciones y cobertura transversal entre comercios y aliados."
  },
  ADMIN: {
    eyebrow: "Centro de control",
    title: "Equipo, accesos y salud operativa",
    subtitle:
      "Revisa el estado general de la demo, los accesos cargados y la actividad visible desde una vista elegante de backoffice."
  }
};
