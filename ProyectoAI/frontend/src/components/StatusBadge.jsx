import React from "react";

export function StatusBadge({ status, labels }) {
  if (!status) return null;
  const s = status.toLowerCase();
  const styleMap = {
    confirmed: "bg-warning text-dark",
    preparing: "bg-info text-dark",
    ready: "bg-success",
    picked_up: "bg-primary",
    "in transit": "bg-primary",
    in_transit: "bg-primary",
    delivered: "bg-secondary",
    cancelled: "bg-danger",
    "en revision": "bg-warning text-dark",
    aprobada: "bg-success"
  };
  return <span className={`status-badge ${styleMap[s] || "bg-secondary"}`}>{labels?.[s] || status}</span>;
}
