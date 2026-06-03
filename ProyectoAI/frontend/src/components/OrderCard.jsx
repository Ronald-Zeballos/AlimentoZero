import React from "react";

export function OrderCard({ order, labels, onView }) {
  if (!order) return null;

  const status = (order.status || "").toLowerCase();
  const badgeStyle = {
    confirmed: "bg-warning text-dark",
    preparing: "bg-info text-dark",
    ready: "bg-success",
    picked_up: "bg-primary",
    in_transit: "bg-primary",
    delivered: "bg-secondary"
  };

  const isSocial = labels === "social";

  return (
    <div className="card border-0 shadow-sm hover-card mb-3">
      <div className="card-body">
        <div className="d-flex gap-3">
          {order.productImg && <img src={order.productImg} className="order-thumb" alt="" />}
          <div className="flex-grow-1 min-w-0">
            <div className="d-flex justify-content-between align-items-start mb-1">
              <h6 className="fw-bold mb-0 text-truncate">
                {isSocial ? `${order.product || "Producto"} x${order.qty || 1}` : `${order.items?.[0]?.name || "Pedido"} x${order.items?.[0]?.qty || 1}`}
              </h6>
              {order.total != null && <span className="fw-bold ms-2" style={{ color: "var(--green)", whiteSpace: "nowrap" }}>${Number(order.total).toFixed(2)}</span>}
            </div>
            <div className="d-flex gap-2 align-items-center">
              <span className={`status-badge ${badgeStyle[status] || "bg-secondary"}`}>{labels?.[status] || order.status}</span>
              {order.pickupCode && <small className="text-muted">Codigo: <strong>{order.pickupCode}</strong></small>}
              {order.people && <small className="text-muted">{order.people} personas beneficiadas</small>}
            </div>
            {order.restaurant && <small className="text-muted d-block mt-1">{order.restaurant}</small>}
            {order.driver && <small className="text-muted d-block">Repartidor: {order.driver}</small>}
          </div>
          {(order.listingType === "DONATION" || order.isDonation) && !isSocial && onView && (
            <button className="btn btn-outline-success btn-sm align-self-center flex-shrink-0" onClick={() => onView(order)}>Ver detalle</button>
          )}
        </div>
      </div>
    </div>
  );
}

export function Timeline({ items = [], labels = {} }) {
  return (
    <ul className="timeline">
      {items.map((step, index) => (
        <li key={index} className={step.done ? "completed" : step.active ? "active" : ""}>
          {labels[step.key] || step.label || step.key}
        </li>
      ))}
    </ul>
  );
}
