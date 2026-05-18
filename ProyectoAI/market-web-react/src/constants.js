export const DEFAULT_TENANT_ID = "demo-tenant";
export const CATEGORY_OPTIONS = ["Todo", "Ready Meals", "Cafe", "Produce", "Sushi", "Bakery"];
export const QUICK_ACTIONS = [
  { label: "Comprar packs", to: "/explorar", accent: "sale" },
  { label: "Ver donaciones", to: "/explorar?type=DONATION", accent: "donation" },
  { label: "Publicar rescate", to: "/publicar", accent: "impact" },
  { label: "Panel por perfil", to: "/perfil", accent: "default" }
];
export const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80";

export const PROFILE_PREFERRED_CATEGORIES = {
  BUYER_NEIGHBOR: ["Ready Meals", "Bakery"],
  MERCHANT_BAKERY: ["Bakery", "Cafe"],
  NGO_FOOD_BANK: ["Produce", "Ready Meals"],
  TRANSPORT_LAST_MILE: ["Produce", "Ready Meals"],
  COORDINATOR_CITY: ["Produce", "Bakery"],
  ADMIN_TENANT: ["Ready Meals", "Produce"]
};
