import { useEffect, useState } from "react";
import {
  bootstrapMarketplaceProfiles,
  bootstrapMarketplaceRoles,
  fetchMarketplaceProfiles,
  fetchRecommendationObjectives,
  fetchTenantRoles
} from "../api";
import { DEFAULT_TENANT_ID } from "../constants";

export function useMarketplaceSession({
  preferredProfileKey = "",
  accountDisplayName = ""
} = {}) {
  const [tenantId] = useState(DEFAULT_TENANT_ID);
  const [profiles, setProfiles] = useState([]);
  const [currentProfileKey, setCurrentProfileKey] = useState("");
  const [roles, setRoles] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function resolveDefaultProfileKey(nextProfiles, currentKey, explicitProfileKey) {
    if (explicitProfileKey) {
      return explicitProfileKey;
    }

    if (currentKey) {
      return currentKey;
    }

    return (
      nextProfiles.find((profile) => profile.actorType === "BUYER")?.profileKey ||
      nextProfiles[0]?.profileKey ||
      ""
    );
  }

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
      setCurrentProfileKey((current) =>
        resolveDefaultProfileKey(nextProfiles, current, preferredProfileKey)
      );
    } catch {
      setError("No pudimos sincronizar perfiles, roles y objetivos desde IAM/AI.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    if (preferredProfileKey) {
      setCurrentProfileKey(preferredProfileKey);
    }
  }, [preferredProfileKey]);

  const matchedProfile =
    profiles.find((profile) => profile.profileKey === currentProfileKey) || null;
  const currentProfile = matchedProfile
    ? {
        ...matchedProfile,
        displayName: accountDisplayName || matchedProfile.displayName
      }
    : null;

  return {
    tenantId,
    profiles,
    roles,
    objectives,
    loading,
    error,
    currentProfile,
    currentProfileKey,
    selectProfile: setCurrentProfileKey,
    reloadSession: loadSession
  };
}
