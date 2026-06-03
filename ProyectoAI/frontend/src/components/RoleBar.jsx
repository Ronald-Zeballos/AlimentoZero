import React from "react";

export function RoleBar({ currentRole, onRoleChange }) {
  if (!currentRole || currentRole === "landing") return null;
  return (
    <div className="role-bar active">
      <div className="container">
        <div className="d-flex align-items-center py-2 gap-1 small flex-wrap">
          <span className="text-muted me-2 fw-bold">Rol activo:</span>
          {["restaurant", "buyer", "driver", "social"].map((role) => {
            const icon = { restaurant: "🍽️", buyer: "🛒", driver: "🚚", social: "🤝" }[role] || "";
            const label = { restaurant: "Restaurante", buyer: "Comprador", driver: "Repartidor", social: "Entidad Social" }[role];
            return (
              <button
                key={role}
                className={`btn btn-sm ${currentRole === role ? "btn-success" : "btn-outline-success"}`}
                onClick={() => onRoleChange(role)}
              >
                {icon} {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
