import { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import {
  approveDonationRequest,
  confirmRescueOrderPickup,
  createDonationRequest,
  createRescueOrder
} from "./api";
import { BottomNav } from "./components/BottomNav";
import { ErrorState, LoadingState } from "./components/StateViews";
import { useActivityFeed } from "./hooks/useActivityFeed";
import { useAuthSession } from "./hooks/useAuthSession";
import { useGeoLocation } from "./hooks/useGeoLocation";
import { useMarketplaceData } from "./hooks/useMarketplaceData";
import { useMarketplaceSession } from "./hooks/useMarketplaceSession";
import { useToast } from "./hooks/useToast";
import { AuthPage } from "./pages/AuthPage";
import { ExplorePage } from "./pages/ExplorePage";
import { HomePage } from "./pages/HomePage";
import { OfferDetailPage } from "./pages/OfferDetailPage";
import { OrdersPage } from "./pages/OrdersPage";
import { ProfilePage } from "./pages/ProfilePage";
import { PublishPage } from "./pages/PublishPage";
import { resolveRoleHomePath } from "./utils/market";

const GUEST_PROFILE = {
  profileKey: "PUBLIC_GUEST",
  displayName: "Explora sin cuenta",
  actorType: "BUYER",
  actorId: "guest-browser",
  organizationId: null,
  suggestedObjective: "BUYER_DISCOVERY"
};

function RoleHomeRoute({
  actorType,
  session,
  market,
  onReserve,
  isAuthenticated,
  locationState,
  onOpenAuth
}) {
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const matchingProfile = session.profiles.find((profile) => profile.actorType === actorType);
    if (matchingProfile && session.currentProfile?.profileKey !== matchingProfile.profileKey) {
      session.selectProfile(matchingProfile.profileKey);
    }
  }, [actorType, isAuthenticated, session]);

  const routeProfile = isAuthenticated
    ? session.profiles.find((profile) => profile.actorType === actorType) || session.currentProfile
    : GUEST_PROFILE;

  return (
    <HomePage
      market={market}
      currentProfile={routeProfile}
      onReserve={onReserve}
      session={session}
      isAuthenticated={isAuthenticated}
      locationState={locationState}
      onOpenAuth={onOpenAuth}
    />
  );
}

function App() {
  const navigate = useNavigate();
  const auth = useAuthSession();
  const geo = useGeoLocation();
  const session = useMarketplaceSession({
    preferredProfileKey: auth.activeAccount?.profileKey || "",
    accountDisplayName: auth.activeAccount?.fullName || ""
  });
  const viewerProfile = auth.isAuthenticated ? session.currentProfile : GUEST_PROFILE;
  const market = useMarketplaceData({
    tenantId: session.tenantId,
    currentProfile: viewerProfile
  });
  const activity = useActivityFeed({
    tenantId: session.tenantId,
    currentProfile: auth.isAuthenticated ? session.currentProfile : null
  });
  const { toast, showToast } = useToast();

  function openAuth() {
    navigate("/acceso");
  }

  function resolveAccountHome() {
    return resolveRoleHomePath({ actorType: auth.activeAccount?.role });
  }

  function handleLogout() {
    auth.logout();
    showToast("Sesion cerrada.");
    navigate("/comprador");
  }

  async function handleReserve(listing, quantity = 1) {
    if (!auth.isAuthenticated) {
      showToast("Inicia sesion para reservar o pedir una donacion.");
      openAuth();
      return;
    }

    const profile = session.currentProfile;
    if (!profile) {
      showToast("Todavia no pudimos cargar tu experiencia.");
      return;
    }

    try {
      if (listing.listingType === "DONATION") {
        const request = await createDonationRequest(listing.id, quantity, {
          requesterId: profile.actorId,
          receiverOrgId: profile.organizationId || profile.actorId
        });
        activity.setDonationRequests((current) => [request, ...current]);
        showToast("Solicitud de donacion enviada.");
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

  const hasBlockingState = session.loading && !viewerProfile;
  const roleHomePath = auth.isAuthenticated
    ? resolveRoleHomePath(session.currentProfile || { actorType: auth.activeAccount?.role })
    : "/comprador";
  const canAccessActor = (actorType) =>
    auth.isAuthenticated && auth.activeAccount?.role === actorType;
  const availableProfiles = auth.isAuthenticated
    ? session.profiles.filter((profile) => profile.profileKey === auth.activeAccount?.profileKey)
    : [];

  return (
    <div className="app-shell">
      <div className="app-gradient" />
      <main className="app-main">
        {hasBlockingState ? <LoadingState message="Preparando la experiencia..." /> : null}
        {!hasBlockingState && session.error ? (
          <ErrorState message={session.error} onRetry={session.reloadSession} />
        ) : null}
        {!hasBlockingState && !session.error ? (
          <Routes>
            <Route path="/" element={<Navigate to={roleHomePath} replace />} />
            <Route
              path="/comprador"
              element={
                !auth.isAuthenticated || canAccessActor("BUYER") ? (
                  <RoleHomeRoute
                    actorType="BUYER"
                    session={session}
                    market={market}
                    onReserve={handleReserve}
                    isAuthenticated={auth.isAuthenticated}
                    locationState={geo}
                    onOpenAuth={openAuth}
                  />
                ) : (
                  <Navigate to={resolveAccountHome()} replace />
                )
              }
            />
            <Route
              path="/comercio"
              element={
                canAccessActor("MERCHANT") ? (
                  <RoleHomeRoute
                    actorType="MERCHANT"
                    session={session}
                    market={market}
                    onReserve={handleReserve}
                    isAuthenticated={auth.isAuthenticated}
                    locationState={geo}
                    onOpenAuth={openAuth}
                  />
                ) : auth.isAuthenticated ? (
                  <Navigate to={resolveAccountHome()} replace />
                ) : (
                  <AuthPage
                    auth={auth}
                    onToast={showToast}
                    intentMessage="Ingresa para abrir el tablero de tienda y publicar nuevos packs."
                  />
                )
              }
            />
            <Route
              path="/ong"
              element={
                canAccessActor("NGO") ? (
                  <RoleHomeRoute
                    actorType="NGO"
                    session={session}
                    market={market}
                    onReserve={handleReserve}
                    isAuthenticated={auth.isAuthenticated}
                    locationState={geo}
                    onOpenAuth={openAuth}
                  />
                ) : auth.isAuthenticated ? (
                  <Navigate to={resolveAccountHome()} replace />
                ) : (
                  <AuthPage
                    auth={auth}
                    onToast={showToast}
                    intentMessage="Ingresa para gestionar solicitudes y recepcion solidaria."
                  />
                )
              }
            />
            <Route
              path="/logistica"
              element={
                canAccessActor("TRANSPORTER") ? (
                  <RoleHomeRoute
                    actorType="TRANSPORTER"
                    session={session}
                    market={market}
                    onReserve={handleReserve}
                    isAuthenticated={auth.isAuthenticated}
                    locationState={geo}
                    onOpenAuth={openAuth}
                  />
                ) : auth.isAuthenticated ? (
                  <Navigate to={resolveAccountHome()} replace />
                ) : (
                  <AuthPage
                    auth={auth}
                    onToast={showToast}
                    intentMessage="Ingresa para ver rutas, retiros y tareas de reparto."
                  />
                )
              }
            />
            <Route
              path="/coordinacion"
              element={
                canAccessActor("COORDINATOR") ? (
                  <RoleHomeRoute
                    actorType="COORDINATOR"
                    session={session}
                    market={market}
                    onReserve={handleReserve}
                    isAuthenticated={auth.isAuthenticated}
                    locationState={geo}
                    onOpenAuth={openAuth}
                  />
                ) : auth.isAuthenticated ? (
                  <Navigate to={resolveAccountHome()} replace />
                ) : (
                  <AuthPage
                    auth={auth}
                    onToast={showToast}
                    intentMessage="Ingresa para acceder al centro de operaciones."
                  />
                )
              }
            />
            <Route
              path="/admin"
              element={
                canAccessActor("ADMIN") ? (
                  <RoleHomeRoute
                    actorType="ADMIN"
                    session={session}
                    market={market}
                    onReserve={handleReserve}
                    isAuthenticated={auth.isAuthenticated}
                    locationState={geo}
                    onOpenAuth={openAuth}
                  />
                ) : auth.isAuthenticated ? (
                  <Navigate to={resolveAccountHome()} replace />
                ) : (
                  <AuthPage
                    auth={auth}
                    onToast={showToast}
                    intentMessage="Ingresa para ver el panel de control y la salud general de la demo."
                  />
                )
              }
            />
            <Route
              path="/explorar"
              element={
                <ExplorePage
                  market={market}
                  currentProfile={viewerProfile}
                  session={session}
                  onReserve={handleReserve}
                  onToast={showToast}
                  isAuthenticated={auth.isAuthenticated}
                  onOpenAuth={openAuth}
                  locationState={geo}
                />
              }
            />
            <Route
              path="/publicar"
              element={
                auth.isAuthenticated ? (
                  <PublishPage
                    currentProfile={session.currentProfile}
                    tenantId={session.tenantId}
                    market={market}
                    onToast={showToast}
                  />
                ) : (
                  <AuthPage
                    auth={auth}
                    onToast={showToast}
                    intentMessage="Crea tu cuenta o entra para publicar tus propios packs."
                  />
                )
              }
            />
            <Route
              path="/pedidos"
              element={
                auth.isAuthenticated ? (
                  <OrdersPage
                    currentProfile={session.currentProfile}
                    orders={activity.orders}
                    donationRequests={activity.donationRequests}
                    summary={market.summary}
                    loading={activity.loading}
                    onConfirmPickup={handleConfirmPickup}
                    onApproveDonation={handleApproveDonation}
                    marketListings={market.listings}
                    session={session}
                  />
                ) : (
                  <AuthPage
                    auth={auth}
                    onToast={showToast}
                    intentMessage="Ingresa para ver tus pedidos, solicitudes y actividad."
                  />
                )
              }
            />
            <Route
              path="/perfil"
              element={
                auth.isAuthenticated ? (
                  <ProfilePage
                    tenantId={session.tenantId}
                    session={session}
                    market={market}
                    activity={activity}
                    onToast={showToast}
                    onLogout={handleLogout}
                    availableProfiles={availableProfiles}
                  />
                ) : (
                  <AuthPage
                    auth={auth}
                    onToast={showToast}
                    intentMessage="Inicia sesion o crea una cuenta para guardar tu experiencia."
                  />
                )
              }
            />
            <Route
              path="/acceso"
              element={
                <AuthPage
                  auth={auth}
                  onToast={showToast}
                />
              }
            />
            <Route
              path="/ofertas/:listingId"
              element={
                <OfferDetailPage
                  listings={market.listings}
                  currentProfile={viewerProfile}
                  onReserve={handleReserve}
                  onToast={showToast}
                />
              }
            />
          </Routes>
        ) : null}
      </main>
      <BottomNav currentProfile={viewerProfile} isAuthenticated={auth.isAuthenticated} />
      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}

export default App;
