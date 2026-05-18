import { Routes, Route } from "react-router-dom";
import {
  approveDonationRequest,
  confirmRescueOrderPickup,
  createDonationRequest,
  createRescueOrder
} from "./api";
import { BottomNav } from "./components/BottomNav";
import { LoadingState, ErrorState } from "./components/StateViews";
import { useActivityFeed } from "./hooks/useActivityFeed";
import { useMarketplaceData } from "./hooks/useMarketplaceData";
import { useMarketplaceSession } from "./hooks/useMarketplaceSession";
import { useToast } from "./hooks/useToast";
import { ExplorePage } from "./pages/ExplorePage";
import { HomePage } from "./pages/HomePage";
import { OfferDetailPage } from "./pages/OfferDetailPage";
import { OrdersPage } from "./pages/OrdersPage";
import { ProfilePage } from "./pages/ProfilePage";
import { PublishPage } from "./pages/PublishPage";

function App() {
  const session = useMarketplaceSession();
  const market = useMarketplaceData({
    tenantId: session.tenantId,
    currentProfile: session.currentProfile
  });
  const activity = useActivityFeed({
    tenantId: session.tenantId,
    currentProfile: session.currentProfile
  });
  const { toast, showToast } = useToast();

  async function handleReserve(listing, quantity = 1) {
    const profile = session.currentProfile;
    if (!profile) {
      showToast("Selecciona un perfil antes de operar.");
      return;
    }

    try {
      if (listing.listingType === "DONATION") {
        const request = await createDonationRequest(listing.id, quantity, {
          requesterId: profile.actorId,
          receiverOrgId: profile.organizationId || profile.actorId
        });
        activity.setDonationRequests((current) => [request, ...current]);
        showToast("Solicitud de donacion enviada al flujo social.");
      } else {
        const order = await createRescueOrder(listing.id, quantity, {
          buyerId: profile.actorId
        });
        activity.setOrders((current) => [order, ...current]);
        showToast("Reserva confirmada y guardada en tus pedidos.");
      }

      await Promise.all([market.reload(), activity.reloadActivity()]);
    } catch (error) {
      showToast(error.message || "No pudimos completar esta accion.");
    }
  }

  async function handleConfirmPickup(orderId) {
    try {
      const updated = await confirmRescueOrderPickup(orderId);
      activity.setOrders((current) =>
        current.map((order) => (order.id === updated.id ? updated : order))
      );
      await market.reload();
      showToast("Pedido marcado como retirado.");
    } catch {
      showToast("No pudimos confirmar el retiro.");
    }
  }

  async function handleApproveDonation(requestId) {
    try {
      const updated = await approveDonationRequest(requestId);
      activity.setDonationRequests((current) =>
        current.map((request) => (request.id === updated.id ? updated : request))
      );
      await market.reload();
      showToast("Solicitud de donacion aprobada.");
    } catch {
      showToast("No pudimos aprobar la solicitud.");
    }
  }

  const hasBlockingState = session.loading && !session.currentProfile;

  return (
    <div className="app-shell">
      <div className="app-gradient" />
      <main className="app-main">
        {hasBlockingState ? <LoadingState message="Sincronizando perfiles, roles y objetivos..." /> : null}
        {!hasBlockingState && session.error ? (
          <ErrorState message={session.error} onRetry={session.reloadSession} />
        ) : null}
        {!hasBlockingState && !session.error ? (
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  market={market}
                  currentProfile={session.currentProfile}
                  onReserve={handleReserve}
                  onToast={showToast}
                />
              }
            />
            <Route
              path="/explorar"
              element={
                <ExplorePage market={market} onReserve={handleReserve} onToast={showToast} />
              }
            />
            <Route
              path="/publicar"
              element={
                <PublishPage
                  currentProfile={session.currentProfile}
                  tenantId={session.tenantId}
                  market={market}
                  onToast={showToast}
                />
              }
            />
            <Route
              path="/pedidos"
              element={
                <OrdersPage
                  currentProfile={session.currentProfile}
                  orders={activity.orders}
                  donationRequests={activity.donationRequests}
                  summary={market.summary}
                  loading={activity.loading}
                  onConfirmPickup={handleConfirmPickup}
                  onApproveDonation={handleApproveDonation}
                />
              }
            />
            <Route
              path="/perfil"
              element={
                <ProfilePage
                  tenantId={session.tenantId}
                  session={session}
                  market={market}
                  activity={activity}
                  onToast={showToast}
                />
              }
            />
            <Route
              path="/ofertas/:listingId"
              element={
                <OfferDetailPage
                  listings={market.listings}
                  onReserve={handleReserve}
                  onToast={showToast}
                />
              }
            />
          </Routes>
        ) : null}
      </main>
      <BottomNav />
      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}

export default App;
