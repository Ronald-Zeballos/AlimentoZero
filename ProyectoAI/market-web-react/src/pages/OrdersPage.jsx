import { AppTopBar } from "../components/AppTopBar";
import { OperationalListingCard } from "../components/OperationalListingCard";
import { EmptyState, LoadingState } from "../components/StateViews";
import { SectionHeader } from "../components/SectionHeader";
import {
  formatMoney,
  formatPickupLabel,
  quantityRemaining,
  sortByUrgency,
  statusLabel
} from "../utils/market";

function BuyerOrders({ currentProfile, orders, summary, onConfirmPickup }) {
  return (
    <>
      <AppTopBar
        currentProfile={currentProfile}
        eyebrow="Tus pedidos"
        title="Reservas y retiros"
        subtitle="Como en un delivery, aqui sigues tu operacion despues de comprar."
        accent="buyer"
      />
      <div className="metrics-grid">
        <article className="metric-card">
          <span>Reservas</span>
          <strong>{summary?.reservedOrders ?? 0}</strong>
        </article>
        <article className="metric-card">
          <span>Retiros</span>
          <strong>{summary?.pickedUpOrders ?? 0}</strong>
        </article>
      </div>
      {orders.length > 0 ? (
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
      ) : (
        <EmptyState
          title="Todavia no tienes reservas"
          subtitle="Cuando compres un pack aparecera aqui con su codigo de retiro."
          actionLabel="Explorar packs"
          to="/explorar"
        />
      )}
    </>
  );
}

function NgoOrders({
  currentProfile,
  donationRequests,
  summary,
  onApproveDonation
}) {
  return (
    <>
      <AppTopBar
        currentProfile={currentProfile}
        eyebrow="Solicitudes ONG"
        title="Tu cola de recepcion social"
        subtitle="Gestiona aprobaciones y mantén trazabilidad de los lotes solicitados."
        accent="ngo"
      />
      <div className="metrics-grid">
        <article className="metric-card">
          <span>Solicitudes</span>
          <strong>{summary?.requestedDonations ?? 0}</strong>
        </article>
        <article className="metric-card">
          <span>Aprobadas</span>
          <strong>{summary?.approvedDonations ?? 0}</strong>
        </article>
      </div>
      {donationRequests.length > 0 ? (
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
      ) : (
        <EmptyState
          title="Aun no hay solicitudes cargadas"
          subtitle="Cuando pidas una donacion la veras aca con su estado real."
          actionLabel="Ver donaciones"
          to="/explorar"
        />
      )}
    </>
  );
}

function MerchantOrders({ currentProfile, summary, listings }) {
  return (
    <>
      <AppTopBar
        currentProfile={currentProfile}
        eyebrow="Rendimiento"
        title="Como esta respondiendo tu inventario"
        subtitle="Este espacio reemplaza los pedidos del comprador por lectura de recuperacion comercial."
        accent="merchant"
      />
      <div className="metrics-grid">
        <article className="metric-card">
          <span>Ingresos recuperados</span>
          <strong>{formatMoney(summary?.rescueRevenue ?? 0)}</strong>
        </article>
        <article className="metric-card">
          <span>Retirados</span>
          <strong>{summary?.pickedUpOrders ?? 0}</strong>
        </article>
        <article className="metric-card">
          <span>Activos</span>
          <strong>{summary?.activeListings ?? 0}</strong>
        </article>
      </div>
      <SectionHeader
        eyebrow="Seguimiento"
        title="Publicaciones con foco"
        subtitle="El equipo valida aqui que el comercio tenga su propia vista operativa."
      />
      <div className="ops-grid">
        {sortByUrgency(listings).map((listing) => (
          <OperationalListingCard
            key={listing.id}
            listing={listing}
            eyebrow="Recuperacion"
            body={`${quantityRemaining(listing)} unidades restantes y ${listing.mealsEquivalent} raciones estimadas.`}
            actionLabel="Abrir ficha"
          />
        ))}
      </div>
    </>
  );
}

function TransporterOrders({ currentProfile, summary, listings }) {
  const transportListings = sortByUrgency(
    listings.filter((listing) => listing.requiresTransport)
  );

  return (
    <>
      <AppTopBar
        currentProfile={currentProfile}
        eyebrow="Operacion"
        title="Cola logistica del dia"
        subtitle="No es una bandeja de compras: es una mesa de retiros, ventanas y carga de ruta."
        accent="transporter"
      />
      <div className="metrics-grid">
        <article className="metric-card">
          <span>Rutas requeridas</span>
          <strong>{summary?.transportRequiredListings ?? 0}</strong>
        </article>
        <article className="metric-card">
          <span>Casos criticos</span>
          <strong>{summary?.criticalListings ?? 0}</strong>
        </article>
      </div>
      <div className="ops-grid">
        {transportListings.map((listing) => (
          <OperationalListingCard
            key={listing.id}
            listing={listing}
            eyebrow="Task"
            body={`Recojo en ${listing.address}. ${quantityRemaining(listing)} paquetes siguen pendientes.`}
            actionLabel="Ver detalle"
          />
        ))}
      </div>
    </>
  );
}

function CoordinatorOrders({ currentProfile, summary, listings }) {
  return (
    <>
      <AppTopBar
        currentProfile={currentProfile}
        eyebrow="Flujos"
        title="Operacion transversal"
        subtitle="Aqui se juntan comercio, ONG y logistica en una sola lectura operativa."
        accent="coordinator"
      />
      <div className="metrics-grid">
        <article className="metric-card">
          <span>Criticos</span>
          <strong>{summary?.criticalListings ?? 0}</strong>
        </article>
        <article className="metric-card">
          <span>Donaciones</span>
          <strong>{summary?.approvedDonations ?? 0}</strong>
        </article>
        <article className="metric-card">
          <span>Transporte</span>
          <strong>{summary?.transportRequiredListings ?? 0}</strong>
        </article>
      </div>
      <div className="ops-grid">
        {sortByUrgency(listings).map((listing) => (
          <OperationalListingCard
            key={listing.id}
            listing={listing}
            eyebrow="Monitoreo"
            body={`${listing.listingType === "DONATION" ? "Circuito social" : "Circuito comercial"} en ${listing.city}.`}
            actionLabel="Auditar"
          />
        ))}
      </div>
    </>
  );
}

function AdminOrders({ currentProfile, summary, session }) {
  return (
    <>
      <AppTopBar
        currentProfile={currentProfile}
        eyebrow="IAM y control"
        title="Inventario institucional"
        subtitle="Lo que valida el trabajo: perfiles, roles y objetivos disponibles por tenant."
        accent="admin"
      />
      <div className="metrics-grid">
        <article className="metric-card">
          <span>Perfiles</span>
          <strong>{session.profiles.length}</strong>
        </article>
        <article className="metric-card">
          <span>Roles</span>
          <strong>{session.roles.length}</strong>
        </article>
        <article className="metric-card">
          <span>Objetivos IA</span>
          <strong>{session.objectives.length}</strong>
        </article>
        <article className="metric-card">
          <span>Packs activos</span>
          <strong>{summary?.activeListings ?? 0}</strong>
        </article>
      </div>
      <section className="panel-card">
        <SectionHeader
          eyebrow="Actor map"
          title="Perfiles del tenant"
          subtitle="Vista administrativa separada del resto de roles."
        />
        <div className="compact-stack">
          {session.profiles.map((profile) => (
            <article key={profile.profileKey} className="mini-row">
              <strong>{profile.displayName}</strong>
              <span>{profile.actorType}</span>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export function OrdersPage({
  currentProfile,
  orders,
  donationRequests,
  summary,
  loading,
  onConfirmPickup,
  onApproveDonation,
  marketListings,
  session
}) {
  if (loading) {
    return (
      <div className="page-container">
        <LoadingState message="Cargando actividad del perfil..." />
      </div>
    );
  }

  return (
    <div className="page-container">
      {currentProfile?.actorType === "BUYER" ? (
        <BuyerOrders
          currentProfile={currentProfile}
          orders={orders}
          summary={summary}
          onConfirmPickup={onConfirmPickup}
        />
      ) : null}
      {currentProfile?.actorType === "NGO" ? (
        <NgoOrders
          currentProfile={currentProfile}
          donationRequests={donationRequests}
          summary={summary}
          onApproveDonation={onApproveDonation}
        />
      ) : null}
      {currentProfile?.actorType === "MERCHANT" ? (
        <MerchantOrders
          currentProfile={currentProfile}
          summary={summary}
          listings={marketListings}
        />
      ) : null}
      {currentProfile?.actorType === "TRANSPORTER" ? (
        <TransporterOrders
          currentProfile={currentProfile}
          summary={summary}
          listings={marketListings}
        />
      ) : null}
      {currentProfile?.actorType === "COORDINATOR" ? (
        <CoordinatorOrders
          currentProfile={currentProfile}
          summary={summary}
          listings={marketListings}
        />
      ) : null}
      {currentProfile?.actorType === "ADMIN" ? (
        <AdminOrders
          currentProfile={currentProfile}
          summary={summary}
          session={session}
        />
      ) : null}
    </div>
  );
}
