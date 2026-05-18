import { useEffect, useState } from "react";
import { fetchBuyerOrders, fetchDonationRequests } from "../api";

export function useActivityFeed({ tenantId, currentProfile }) {
  const [orders, setOrders] = useState([]);
  const [donationRequests, setDonationRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadActivity() {
    if (!currentProfile) {
      return;
    }

    setLoading(true);
    try {
      const nextOrders =
        currentProfile.actorType === "BUYER"
          ? await fetchBuyerOrders({
              tenantId,
              buyerId: currentProfile.actorId
            })
          : [];
      const nextRequests =
        currentProfile.actorType === "NGO"
          ? await fetchDonationRequests({
              tenantId,
              receiverOrgId: currentProfile.organizationId
            })
          : [];

      setOrders(nextOrders);
      setDonationRequests(nextRequests);
    } catch {
      setOrders([]);
      setDonationRequests([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadActivity();
  }, [tenantId, currentProfile?.profileKey]);

  return {
    orders,
    donationRequests,
    loading,
    reloadActivity: loadActivity,
    setOrders,
    setDonationRequests
  };
}
