import React from "react";

export function MetricCard({ label, value, sub, icon, color }) {
  return (
    <div className="metric-card card border-0 shadow-sm p-3 h-100">
      <div className="d-flex align-items-center gap-3 h-100">
        {icon && (
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: color || "var(--soft-green)",
            display: "grid", placeItems: "center",
            fontSize: "1.5rem", flexShrink: 0
          }}>
            {icon}
          </div>
        )}
        <div>
          <div className="fw-bold fs-3" style={{ color: "var(--green-dark)", lineHeight: 1.1 }}>{value}</div>
          <div className="text-muted small">{label}</div>
          {sub && <div className="text-muted small mt-1">{sub}</div>}
        </div>
      </div>
    </div>
  );
}
