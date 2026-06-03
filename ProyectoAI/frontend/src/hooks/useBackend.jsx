import { useState, useCallback } from "react";
import { marketApi, iamApi, aiApi } from "../api";
import { normalizeListing, normalizeOrder, normalizeDonationRequest, CONFIG } from "../constants";

export function useBackend(showToast) {
  const [backendOnline, setBackendOnline] = useState(false);
  const [iamSnapshot, setIamSnapshot] = useState({ coreCatalog: null, roleCatalog: [], roles: [], profileCatalog: [], profiles: [] });
  const [aiSnapshot, setAiSnapshot] = useState({ objectives: [], briefing: null, recommendations: null });

  const bootstrapIamData = useCallback(async () => {
    const coreCatalog = await iamApi.coreCatalog();
    const roleCatalog = await iamApi.roleCatalog();
    await iamApi.bootstrapRoles();
    const roles = await iamApi.roles();
    const profileCatalog = await iamApi.profileCatalog();
    await iamApi.bootstrapProfiles();
    let profiles = await iamApi.profiles();
    if (profiles[0]?.profileKey) await iamApi.profile(profiles[0].profileKey);
    const snapshot = { coreCatalog, roleCatalog, roles, profileCatalog, profiles };
    setIamSnapshot(snapshot);
    return snapshot;
  }, []);

  const loadAiInsights = useCallback(async () => {
    const objectives = await aiApi.objectives();
    const objective = objectives[0]?.code || objectives[0]?.name || "MAXIMIZE_IMPACT";
    const payload = { objective, listings: [], preferredCategories: ["Bakery", "Produce", "Ready Meals"], maxPrice: 40, maxDistanceKm: 8 };
    const [recommendations, briefing] = await Promise.all([
      aiApi.recommendations(payload),
      aiApi.briefing({ ...payload, profileKey: "restaurant" })
    ]);
    const snapshot = { objectives, briefing, recommendations };
    setAiSnapshot(snapshot);
    return snapshot;
  }, []);

  const loadBackendData = useCallback(async (products, orders, donationRequests, setProducts, setOrders, setDonationRequests) => {
    try {
      await bootstrapIamData();
      const [summary, listings, donationListings, discountedListings] = await Promise.all([
        marketApi.summary({ actorType: "MERCHANT", actorId: CONFIG.merchantId, organizationId: CONFIG.merchantId }),
        marketApi.listings(),
        marketApi.listings({ listingType: "DONATION" }),
        marketApi.listings({ listingType: "DISCOUNTED_SALE" })
      ]);
      const mergedListings = [...listings, ...donationListings, ...discountedListings]
        .filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index);
      if (mergedListings[0]?.id) await marketApi.listing(mergedListings[0].id);
      setProducts(mergedListings.map(normalizeListing));
      const [fetchedOrders, fetchedRequests] = await Promise.all([
        marketApi.orders(CONFIG.buyerId),
        marketApi.donationRequests(CONFIG.receiverOrgId)
      ]);
      setOrders(fetchedOrders.map(normalizeOrder));
      setDonationRequests(fetchedRequests.map(normalizeDonationRequest));
      setBackendOnline(true);
      if (summary) window.marketSummary = summary;
      try {
        await loadAiInsights();
      } catch { /* AI not available */ }
    } catch {
      setBackendOnline(false);
    }
  }, [bootstrapIamData, loadAiInsights]);

  return { backendOnline, iamSnapshot, aiSnapshot, loadBackendData };
}
