import { formatMoney, formatPickupLabel, statusLabel } from "../utils/market";
import { EmptyState, LoadingState } from "../components/StateViews";
import { SectionHeader } from "../components/SectionHeader";

export function OrdersPage({
  currentProfile,
  orders,
  donationRequests,
  summary,
  loading,
  onConfirmPickup,
  onApproveDonation
}) {
  return (
    <div className="page-container">
      <SectionHeader
        eyebrow="Actividad real"
        title="Pedidos y solicitudes"
        subtitle="La actividad visible depende del perfil activo y sale del backend."
      />
      {loading ? <LoadingState /> : null}
      {!loading && orders.length === 0 && donationRequests.length === 0 ? (
        <EmptyState
          title="Todavia no hay actividad directa para este perfil"
          subtitle={`El perfil ${currentProfile?.displayName || "actual"} sigue viendo metricas en el panel.`}
          actionLabel="Ir al panel"
          to="/perfil"
        />
      ) : null}
      {summary ? (
        <div className="metrics-grid">
          <article className="metric-card">
            <span>Reservas</span>
            <strong>{summary.reservedOrders}</strong>
          </article>
          <article className="metric-card">
            <span>Retiros</span>
            <strong>{summary.pickedUpOrders}</strong>
          </article>
          <article className="metric-card">
            <span>Donaciones aprobadas</span>
            <strong>{summary.approvedDonations}</strong>
          </article>
        </div>
      ) : null}
      {orders.length > 0 ? (
        <>
          <SectionHeader eyebrow="Compras" title="Rescue orders" />
          <div className="orders-stack">
            {orders.map((order) => (
              <article className="order-card" key={order.id}>
                <div>
                  <strong>{order.listingTitle}</strong>
                  <p>{formatPickupLabel(order.pickupStart, order.pickupEnd, order.city)}</p>
                  <p>
                    Codigo: {order.pickupCode} | Total: {formatMoney(order.totalPrice, order.currency)}
                  </p>
                  <span className="pill">{statusLabel(order.status)}</span>
                </div>
                <div className="order-actions">
                  <button
                    type="button"
                    className="primary-button slim"
                    disabled={order.status !== "RESERVED"}
                    onClick={() => onConfirmPickup(order.id)}
                  >
                    Confirmar retiro
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : null}
      {donationRequests.length > 0 ? (
        <>
          <SectionHeader eyebrow="Donaciones" title="Donation requests" />
          <div className="orders-stack">
            {donationRequests.map((request) => (
              <article className="order-card" key={request.id}>
                <div>
                  <strong>{request.listingTitle}</strong>
                  <p>{formatPickupLabel(request.pickupStart, request.pickupEnd, request.city)}</p>
                  <p>
                    Receptor: {request.receiverOrgId} | Cantidad: {request.quantity}
                  </p>
                  <span className="pill">{statusLabel(request.status)}</span>
                </div>
                <div className="order-actions">
                  <button
                    type="button"
                    className="primary-button slim"
                    disabled={request.status !== "REQUESTED"}
                    onClick={() => onApproveDonation(request.id)}
                  >
                    Aprobar solicitud
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
