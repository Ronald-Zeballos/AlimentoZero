import { useEffect, useState } from "react";
import {
  fetchDashboardSummary,
  fetchListings,
  fetchMarketBriefing,
  recommendListings
} from "../api";
import { PROFILE_PREFERRED_CATEGORIES } from "../constants";
import { mapRecommendationCandidate } from "../utils/market";

export function useMarketplaceData({ tenantId, currentProfile }) {
  const [listings, setListings] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [briefing, setBriefing] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiMode, setAiMode] = useState("loading");

  async function loadMarketData() {
    if (!currentProfile) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const filters =
        currentProfile.actorType === "MERCHANT"
          ? { merchantId: currentProfile.actorId }
          : currentProfile.actorType === "NGO"
            ? { listingType: "DONATION" }
            : {};

      const loadedListings = await fetchListings(filters);
      setListings(loadedListings);

      const candidatePayload = loadedListings.map(mapRecommendationCandidate);
      const preferredCategories =
        PROFILE_PREFERRED_CATEGORIES[currentProfile.profileKey] || ["Ready Meals"];

      try {
        const [recommendationResponse, briefingResponse, summaryResponse] = await Promise.all([
          recommendListings({
            objective: currentProfile.suggestedObjective,
            listings: candidatePayload,
            preferredCategories,
            maxPrice: 30,
            maxDistanceKm: 6
          }),
          fetchMarketBriefing({
            objective: currentProfile.suggestedObjective,
            profileKey: currentProfile.profileKey,
            listings: candidatePayload,
            preferredCategories,
            maxPrice: 30,
            maxDistanceKm: 6
          }),
          fetchDashboardSummary({
            tenantId,
            actorType: currentProfile.actorType,
            actorId: currentProfile.actorId,
            organizationId: currentProfile.organizationId
          })
        ]);

        setRecommendations(recommendationResponse.recommendations);
        setBriefing(briefingResponse);
        setSummary(summaryResponse);
        setAiMode("live");
      } catch {
        setRecommendations(
          loadedListings.slice(0, 3).map((listing, index) => ({
            listingId: listing.id,
            title: listing.title,
            score: 88 - index * 6,
            critical: index === 0,
            reasons: ["Fallback local", "Sincronizacion IA pendiente"]
          }))
        );
        setBriefing(null);
        setSummary(
          await fetchDashboardSummary({
            tenantId,
            actorType: currentProfile.actorType,
            actorId: currentProfile.actorId,
            organizationId: currentProfile.organizationId
          }).catch(() => null)
        );
        setAiMode("fallback");
      }
    } catch {
      setError("No pudimos cargar las ofertas del marketplace.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMarketData();
  }, [tenantId, currentProfile?.profileKey]);

  return {
    listings,
    recommendations,
    briefing,
    summary,
    loading,
    error,
    aiMode,
    reload: loadMarketData,
    setListings
  };
}
