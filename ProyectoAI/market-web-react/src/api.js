import { DEFAULT_TENANT_ID } from "./constants";

const JSON_HEADERS = {
  "Content-Type": "application/json"
};

function withTenantHeaders(tenantId = DEFAULT_TENANT_ID, headers = {}) {
  return {
    ...headers,
    "X-Tenant-Id": tenantId
  };
}

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });
  return search.toString();
}

async function parseJsonResponse(response) {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function fetchListings(filters = {}) {
  const query = buildQuery(filters);
  const response = await fetch(`/market-api/listings${query ? `?${query}` : ""}`);
  return parseJsonResponse(response);
}

export async function fetchListingById(id) {
  const response = await fetch(`/market-api/listings/${id}`);
  return parseJsonResponse(response);
}

export async function createListing(payload, { tenantId = DEFAULT_TENANT_ID, merchantId } = {}) {
  const response = await fetch("/market-api/listings", {
    method: "POST",
    headers: withTenantHeaders(tenantId, {
      ...JSON_HEADERS,
      "X-Merchant-Id": merchantId
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

export async function createRescueOrder(listingId, quantity, { buyerId }) {
  const response = await fetch("/market-api/orders", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({
      listingId,
      buyerId,
      quantity
    })
  });
  return parseJsonResponse(response);
}

export async function fetchBuyerOrders({ tenantId = DEFAULT_TENANT_ID, buyerId }) {
  const response = await fetch(
    `/market-api/orders?${buildQuery({
      buyerId
    })}`,
    {
      headers: withTenantHeaders(tenantId)
    }
  );
  return parseJsonResponse(response);
}

export async function confirmRescueOrderPickup(orderId) {
  const response = await fetch(`/market-api/orders/${orderId}/pickup`, {
    method: "POST"
  });
  return parseJsonResponse(response);
}

export async function createDonationRequest(
  listingId,
  quantity,
  { requesterId, receiverOrgId }
) {
  const response = await fetch("/market-api/donation-requests", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({
      listingId,
      requesterId,
      receiverOrgId,
      quantity
    })
  });
  return parseJsonResponse(response);
}

export async function fetchDonationRequests({
  tenantId = DEFAULT_TENANT_ID,
  receiverOrgId
}) {
  const response = await fetch(
    `/market-api/donation-requests?${buildQuery({
      receiverOrgId
    })}`,
    {
      headers: withTenantHeaders(tenantId)
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

export async function fetchDashboardSummary({
  tenantId = DEFAULT_TENANT_ID,
  actorType,
  actorId,
  organizationId
}) {
  const response = await fetch(
    `/market-api/dashboard/summary?${buildQuery({
      actorType,
      actorId,
      organizationId
    })}`,
    {
      headers: withTenantHeaders(tenantId)
    }
  );
  return parseJsonResponse(response);
}

export async function recommendListings({
  objective,
  listings,
  preferredCategories,
  maxPrice,
  maxDistanceKm
}) {
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

export async function fetchMarketBriefing({
  objective,
  profileKey,
  listings,
  preferredCategories,
  maxPrice,
  maxDistanceKm
}) {
  const response = await fetch("/ai-api/market/briefings", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({
      objective,
      profileKey,
      listings,
      preferredCategories,
      maxPrice,
      maxDistanceKm
    })
  });
  return parseJsonResponse(response);
}

export async function fetchRecommendationObjectives() {
  const response = await fetch("/ai-api/market/objectives");
  return parseJsonResponse(response);
}

export async function fetchMarketplaceRoleCatalog() {
  const response = await fetch("/iam-api/roles/catalog/marketplace");
  return parseJsonResponse(response);
}

export async function fetchTenantRoles(tenantId = DEFAULT_TENANT_ID) {
  const response = await fetch("/iam-api/roles", {
    headers: withTenantHeaders(tenantId)
  });
  return parseJsonResponse(response);
}

export async function bootstrapMarketplaceRoles(tenantId = DEFAULT_TENANT_ID) {
  const response = await fetch("/iam-api/roles/bootstrap/marketplace", {
    method: "POST",
    headers: withTenantHeaders(tenantId)
  });
  return parseJsonResponse(response);
}

export async function fetchMarketplaceProfiles({
  tenantId = DEFAULT_TENANT_ID,
  actorType
} = {}) {
  const response = await fetch(`/iam-api/profiles?${buildQuery({ actorType })}`, {
    headers: withTenantHeaders(tenantId)
  });
  return parseJsonResponse(response);
}

export async function fetchMarketplaceProfile(profileKey, tenantId = DEFAULT_TENANT_ID) {
  const response = await fetch(`/iam-api/profiles/${profileKey}`, {
    headers: withTenantHeaders(tenantId)
  });
  return parseJsonResponse(response);
}

export async function bootstrapMarketplaceProfiles(tenantId = DEFAULT_TENANT_ID) {
  const response = await fetch("/iam-api/profiles/bootstrap/marketplace", {
    method: "POST",
    headers: withTenantHeaders(tenantId)
  });
  return parseJsonResponse(response);
}
