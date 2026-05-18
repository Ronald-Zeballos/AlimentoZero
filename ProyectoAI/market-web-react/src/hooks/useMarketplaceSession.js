import { useEffect, useState } from "react";
import {
  bootstrapMarketplaceProfiles,
  bootstrapMarketplaceRoles,
  fetchMarketplaceProfiles,
  fetchRecommendationObjectives,
  fetchTenantRoles
} from "../api";
import { DEFAULT_TENANT_ID } from "../constants";

export function useMarketplaceSession() {
  const [tenantId] = useState(DEFAULT_TENANT_ID);
  const [profiles, setProfiles] = useState([]);
  const [currentProfileKey, setCurrentProfileKey] = useState("");
  const [roles, setRoles] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadSession() {
    setLoading(true);
    setError("");

    try {
      let nextProfiles = await fetchMarketplaceProfiles({ tenantId });
      if (nextProfiles.length === 0) {
        const bootstrapped = await bootstrapMarketplaceProfiles(tenantId);
        nextProfiles = bootstrapped.profiles;
      }

      const [tenantRoles, objectiveCatalog] = await Promise.all([
        fetchTenantRoles(tenantId).catch(async () => {
          const response = await bootstrapMarketplaceRoles(tenantId);
          return response.roles;
        }),
        fetchRecommendationObjectives()
      ]);

      setProfiles(nextProfiles);
      setRoles(tenantRoles);
      setObjectives(objectiveCatalog);
      setCurrentProfileKey((current) => current || nextProfiles[0]?.profileKey || "");
    } catch {
      setError("No pudimos sincronizar perfiles, roles y objetivos desde IAM/AI.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSession();
  }, []);

  return {
    tenantId,
    profiles,
    roles,
    objectives,
    loading,
    error,
    currentProfile: profiles.find((profile) => profile.profileKey === currentProfileKey) || null,
    currentProfileKey,
    selectProfile: setCurrentProfileKey,
    reloadSession: loadSession
  };
}
