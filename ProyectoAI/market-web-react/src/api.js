const JSON_HEADERS = {
  "Content-Type": "application/json"
};
const DEMO_TENANT_ID = "demo-tenant";
const DEMO_MERCHANT_ID = "merchant-la-paz";
const DEMO_BUYER_ID = "buyer-demo";
const DEMO_REQUESTER_ID = "ngo-user-demo";
const DEMO_RECEIVER_ORG_ID = "fundacion-banco-alimentos";

function withTenantHeaders(headers = {}) {
  return {
    ...headers,
    "X-Tenant-Id": DEMO_TENANT_ID
  };
}

async function parseJsonResponse(response) {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function fetchListings() {
  const response = await fetch("/market-api/listings");
  return parseJsonResponse(response);
}

export async function fetchListingById(id) {
  const response = await fetch(`/market-api/listings/${id}`);
  return parseJsonResponse(response);
}

export async function createListing(payload) {
  const response = await fetch("/market-api/listings", {
    method: "POST",
    headers: withTenantHeaders({
      ...JSON_HEADERS,
      "X-Merchant-Id": DEMO_MERCHANT_ID
    }),
    body: JSON.stringify(payload)
  });
  return parseJsonResponse(response);
}

export async function publishListing(id) {
  const response = await fetch(`/market-api/listings/${id}/publish`, {
    method: "POST"
  });
  return parseJsonResponse(response);
}

export async function reserveListing(id, quantity) {
  const response = await fetch(`/market-api/listings/${id}/reserve`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ quantity })
  });
  return parseJsonResponse(response);
}

export async function createRescueOrder(listingId, quantity) {
  const response = await fetch("/market-api/orders", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({
      listingId,
      buyerId: DEMO_BUYER_ID,
      quantity
    })
  });
  return parseJsonResponse(response);
}

export async function fetchBuyerOrders() {
  const response = await fetch(`/market-api/orders?buyerId=${encodeURIComponent(DEMO_BUYER_ID)}`, {
    headers: withTenantHeaders()
  });
  return parseJsonResponse(response);
}

export async function confirmRescueOrderPickup(orderId) {
  const response = await fetch(`/market-api/orders/${orderId}/pickup`, {
    method: "POST"
  });
  return parseJsonResponse(response);
}

export async function createDonationRequest(listingId, quantity) {
  const response = await fetch("/market-api/donation-requests", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({
      listingId,
      requesterId: DEMO_REQUESTER_ID,
      receiverOrgId: DEMO_RECEIVER_ORG_ID,
      quantity
    })
  });
  return parseJsonResponse(response);
}

export async function fetchDonationRequests() {
  const response = await fetch(
    `/market-api/donation-requests?receiverOrgId=${encodeURIComponent(DEMO_RECEIVER_ORG_ID)}`,
    {
      headers: withTenantHeaders()
    }
  );
  return parseJsonResponse(response);
}

export async function approveDonationRequest(requestId) {
  const response = await fetch(`/market-api/donation-requests/${requestId}/approve`, {
    method: "POST"
  });
  return parseJsonResponse(response);
}

export async function recommendListings({ objective, listings, preferredCategories, maxPrice, maxDistanceKm }) {
  const response = await fetch("/ai-api/market/recommendations", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({
      objective,
      listings,
      preferredCategories,
      maxPrice,
      maxDistanceKm
    })
  });
  return parseJsonResponse(response);
}

export async function fetchMarketplaceRoleCatalog() {
  const response = await fetch("/iam-api/roles/catalog/marketplace");
  return parseJsonResponse(response);
}

export async function fetchTenantRoles() {
  const response = await fetch("/iam-api/roles", {
    headers: withTenantHeaders()
  });
  return parseJsonResponse(response);
}

export async function bootstrapMarketplaceRoles() {
  const response = await fetch("/iam-api/roles/bootstrap/marketplace", {
    method: "POST",
    headers: withTenantHeaders()
  });
  return parseJsonResponse(response);
}
