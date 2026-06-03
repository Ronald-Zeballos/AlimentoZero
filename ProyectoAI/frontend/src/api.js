import { CONFIG, apiFetch } from "./constants";

export const marketApi = {
  summary: (params = {}) => apiFetch(CONFIG.marketBaseUrl, "/api/v1/market/dashboard/summary?" + new URLSearchParams(params)),
  listings: (params = {}) => apiFetch(CONFIG.marketBaseUrl, "/api/v1/market/listings?" + new URLSearchParams(params)),
  listing: (id) => apiFetch(CONFIG.marketBaseUrl, "/api/v1/market/listings/" + id),
  createListing: (payload) => apiFetch(CONFIG.marketBaseUrl, "/api/v1/market/listings", { method: "POST", headers: { "X-Merchant-Id": CONFIG.merchantId }, body: JSON.stringify(payload) }),
  publishListing: (id) => apiFetch(CONFIG.marketBaseUrl, "/api/v1/market/listings/" + id + "/publish", { method: "POST" }),
  reserveListing: (id, quantity) => apiFetch(CONFIG.marketBaseUrl, "/api/v1/market/listings/" + id + "/reserve", { method: "POST", body: JSON.stringify({ quantity }) }),
  createOrder: (payload) => apiFetch(CONFIG.marketBaseUrl, "/api/v1/market/orders", { method: "POST", body: JSON.stringify(payload) }),
  orders: (buyerId) => apiFetch(CONFIG.marketBaseUrl, "/api/v1/market/orders?" + new URLSearchParams({ buyerId })),
  pickupOrder: (id) => apiFetch(CONFIG.marketBaseUrl, "/api/v1/market/orders/" + id + "/pickup", { method: "POST" }),
  createDonationRequest: (payload) => apiFetch(CONFIG.marketBaseUrl, "/api/v1/market/donation-requests", { method: "POST", body: JSON.stringify(payload) }),
  donationRequests: (receiverOrgId) => apiFetch(CONFIG.marketBaseUrl, "/api/v1/market/donation-requests?" + new URLSearchParams({ receiverOrgId })),
  approveDonationRequest: (id) => apiFetch(CONFIG.marketBaseUrl, "/api/v1/market/donation-requests/" + id + "/approve", { method: "POST" })
};

export const iamApi = {
  coreCatalog: () => apiFetch(CONFIG.iamBaseUrl, "/api/v1/iam/core-platform/marketplace/catalog"),
  roleCatalog: () => apiFetch(CONFIG.iamBaseUrl, "/api/v1/iam/roles/catalog/marketplace"),
  bootstrapRoles: () => apiFetch(CONFIG.iamBaseUrl, "/api/v1/iam/roles/bootstrap/marketplace", { method: "POST" }),
  roles: () => apiFetch(CONFIG.iamBaseUrl, "/api/v1/iam/roles"),
  profileCatalog: () => apiFetch(CONFIG.iamBaseUrl, "/api/v1/iam/profiles/catalog/marketplace"),
  bootstrapProfiles: () => apiFetch(CONFIG.iamBaseUrl, "/api/v1/iam/profiles/bootstrap/marketplace", { method: "POST" }),
  profiles: (actorType = "") => apiFetch(CONFIG.iamBaseUrl, "/api/v1/iam/profiles" + (actorType ? "?" + new URLSearchParams({ actorType }) : "")),
  profile: (profileKey) => apiFetch(CONFIG.iamBaseUrl, "/api/v1/iam/profiles/" + profileKey)
};

export const aiApi = {
  objectives: () => apiFetch(CONFIG.aiBaseUrl, "/api/v1/ai/market/objectives"),
  complete: (prompt) => apiFetch(CONFIG.aiBaseUrl, "/api/v1/ai/complete", { method: "POST", body: JSON.stringify({ prompt }) }),
  ragQa: (question, namespace = "restaurant-forms") => apiFetch(CONFIG.aiBaseUrl, "/api/v1/ai/rag/qa", { method: "POST", body: JSON.stringify({ question, namespace }) }),
  recommendations: (payload) => apiFetch(CONFIG.aiBaseUrl, "/api/v1/ai/market/recommendations", { method: "POST", body: JSON.stringify(payload) }),
  briefing: (payload) => apiFetch(CONFIG.aiBaseUrl, "/api/v1/ai/market/briefings", { method: "POST", body: JSON.stringify(payload) })
};
