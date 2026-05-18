import {
  startTransition,
  useDeferredValue,
  useEffect,
  useState
} from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams
} from "react-router-dom";
import {
  approveDonationRequest,
  bootstrapMarketplaceRoles,
  confirmRescueOrderPickup,
  createDonationRequest,
  createListing,
  createRescueOrder,
  fetchBuyerOrders,
  fetchDonationRequests,
  fetchListingById,
  fetchListings,
  fetchMarketplaceRoleCatalog,
  fetchTenantRoles,
  publishListing,
  recommendListings
} from "./api";

const CATEGORY_OPTIONS = ["Todo", "Ready Meals", "Cafe", "Produce", "Sushi", "Bakery"];
const QUICK_ACTIONS = [
  { label: "Comprar packs", to: "/explorar", accent: "sale" },
  { label: "Ver donaciones", to: "/explorar?type=DONATION", accent: "donation" },
  { label: "Publicar rescate", to: "/publicar", accent: "impact" },
  { label: "Mis pedidos", to: "/pedidos", accent: "default" }
];
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80";

function estimateDistance(listing) {
  return listing.city?.toLowerCase().includes("la paz") ? 1.6 : 3.2;
}

function hoursToExpire(listing) {
  return Math.max(
    0,
    Math.round((new Date(listing.expirationDate).getTime() - Date.now()) / 36e5)
  );
}

function mapRecommendationCandidate(listing) {
  return {
    id: listing.id,
    title: listing.title,
    category: listing.category,
    listingType: listing.listingType,
    rescuePrice: Number(listing.rescuePrice ?? 0),
    quantityAvailable: Number(listing.quantityAvailable ?? 0),
    distanceKm: estimateDistance(listing),
    hoursToExpire: hoursToExpire(listing),
    requiresTransport: Boolean(listing.requiresTransport),
    mealsEquivalent: Number(listing.mealsEquivalent ?? 0)
  };
}

function formatMoney(value, currency = "BOB") {
  if (Number(value) === 0) {
    return "Gratis";
  }

  return `${currency} ${Number(value).toFixed(0)}`;
}

function formatHoursLabel(listing) {
  const hours = hoursToExpire(listing);
  return hours <= 1 ? "Retira hoy" : `${hours} h`;
}

function statusLabel(status) {
  switch (status) {
    case "SOLD_OUT":
      return "Agotado";
    case "EXPIRED":
      return "Vencido";
    case "AVAILABLE":
      return "Disponible";
    case "RESERVED":
      return "Reservado";
    case "REQUESTED":
      return "Solicitado";
    case "APPROVED":
      return "Aprobado";
    case "PICKED_UP":
      return "Retirado";
    default:
      return status;
  }
}

function formatPickupLabel(start, end, city) {
  return `${city} · ${new Date(start).toLocaleString("es-BO")} - ${new Date(end).toLocaleTimeString("es-BO", {
    hour: "2-digit",
    minute: "2-digit"
  })}`;
}

function useMarketplaceData() {
  const [listings, setListings] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [roleSource, setRoleSource] = useState("none");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiMode, setAiMode] = useState("loading");

  async function reloadRoles() {
    try {
      const tenantRoles = await fetchTenantRoles();
      setRoles(tenantRoles);
      setRoleSource("tenant");
      return;
    } catch {
      try {
        const roleCatalog = await fetchMarketplaceRoleCatalog();
        setRoles(roleCatalog);
        setRoleSource("catalog");
      } catch {
        setRoles([]);
        setRoleSource("none");
      }
    }
  }

  async function reload() {
    setLoading(true);
    setError("");

    try {
      const loadedListings = await fetchListings();
      setListings(loadedListings);

      try {
        const response = await recommendListings({
          objective: "BUYER_DISCOVERY",
          listings: loadedListings.map(mapRecommendationCandidate),
          preferredCategories: ["Ready Meals", "Bakery"],
          maxPrice: 30,
          maxDistanceKm: 6
        });
        setRecommendations(response.recommendations);
        setAiMode("live");
      } catch {
        setRecommendations(
          loadedListings.slice(0, 3).map((listing, index) => ({
            listingId: listing.id,
            title: listing.title,
            score: 88 - index * 6,
            critical: index === 0,
            reasons: ["Fallback local", "Sincronizacion IA pendiente"]
          }))
        );
        setAiMode("fallback");
      }

      await reloadRoles();
    } catch {
      setError("No pudimos cargar las ofertas del marketplace.");
    } finally {
      setLoading(false);
    }
  }

  async function bootstrapRoles() {
    const response = await bootstrapMarketplaceRoles();
    setRoles(response.roles);
    setRoleSource("tenant");
    return response;
  }

  useEffect(() => {
    reload();
  }, []);

  return {
    listings,
    recommendations,
    roles,
    roleSource,
    loading,
    error,
    aiMode,
    reload,
    bootstrapRoles,
    setListings
  };
}

function App() {
  const market = useMarketplaceData();
  const [orders, setOrders] = useState([]);
  const [donationRequests, setDonationRequests] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [toast, setToast] = useState("");

  async function reloadActivity() {
    setActivityLoading(true);
    try {
      const [loadedOrders, loadedRequests] = await Promise.all([
        fetchBuyerOrders(),
        fetchDonationRequests()
      ]);
      setOrders(loadedOrders);
      setDonationRequests(loadedRequests);
    } catch {
      setOrders([]);
      setDonationRequests([]);
    } finally {
      setActivityLoading(false);
    }
  }

  useEffect(() => {
    reloadActivity();
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function showToast(message) {
    setToast(message);
  }

  async function handleReserve(listing, quantity = 1) {
    try {
      if (listing.listingType === "DONATION") {
        const request = await createDonationRequest(listing.id, quantity);
        setDonationRequests((current) => [request, ...current]);
        showToast("Solicitud de donacion enviada a la organizacion receptora.");
      } else {
        const order = await createRescueOrder(listing.id, quantity);
        setOrders((current) => [order, ...current]);
        showToast("Reserva confirmada y guardada en tus pedidos.");
      }

      await market.reload();
    } catch (error) {
      showToast(error.message || "No pudimos completar esta accion.");
    }
  }

  async function handleConfirmPickup(orderId) {
    try {
      const updated = await confirmRescueOrderPickup(orderId);
      setOrders((current) =>
        current.map((order) => (order.id === updated.id ? updated : order))
      );
      showToast("Pedido marcado como retirado.");
    } catch {
      showToast("No pudimos confirmar el retiro.");
    }
  }

  async function handleApproveDonation(requestId) {
    try {
      const updated = await approveDonationRequest(requestId);
      setDonationRequests((current) =>
        current.map((request) => (request.id === updated.id ? updated : request))
      );
      showToast("Solicitud de donacion aprobada.");
    } catch {
      showToast("No pudimos aprobar la solicitud.");
    }
  }

  return (
    <div className="app-shell">
      <div className="app-gradient" />
      <main className="app-main">
        <Routes>
          <Route
            path="/"
            element={<HomePage market={market} onReserve={handleReserve} onToast={showToast} />}
          />
          <Route
            path="/explorar"
            element={<ExplorePage market={market} onReserve={handleReserve} onToast={showToast} />}
          />
          <Route
            path="/publicar"
            element={<PublishPage market={market} onToast={showToast} />}
          />
          <Route
            path="/pedidos"
            element={
              <OrdersPage
                orders={orders}
                donationRequests={donationRequests}
                loading={activityLoading}
                onConfirmPickup={handleConfirmPickup}
                onApproveDonation={handleApproveDonation}
              />
            }
          />
          <Route
            path="/perfil"
            element={
              <ProfilePage
                market={market}
                orders={orders}
                donationRequests={donationRequests}
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
      </main>
      <BottomNav />
      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}

function HomePage({ market, onReserve, onToast }) {
  const featuredListings = market.listings.slice(0, 4);
  const recommendationCards = market.recommendations
    .map((recommendation) =>
      market.listings.find((listing) => listing.id === recommendation.listingId)
    )
    .filter(Boolean);

  return (
    <PageContainer>
      <HeroHeader />
      <QuickActions />
      <SectionHeader
        eyebrow="Recomendado para vos"
        title="Rescata comida cerca de vos"
        subtitle={
          market.aiMode === "live"
            ? "La IA ya priorizo las ofertas con mejor mezcla de urgencia, distancia y precio."
            : "Estamos usando un fallback local mientras la capa de IA termina de responder."
        }
      />
      <RecommendationStrip listings={recommendationCards} onReserve={onReserve} />
      <SectionHeader eyebrow="Ofertas vivas" title="Marketplace hibrido" />
      {market.loading ? <LoadingState /> : null}
      {market.error ? <ErrorState message={market.error} onRetry={market.reload} /> : null}
      {!market.loading && !market.error ? (
        <>
          <CategoryRail />
          <CardGrid listings={featuredListings} onReserve={onReserve} />
          <InfoBanner onToast={onToast} />
        </>
      ) : null}
    </PageContainer>
  );
}

function ExplorePage({ market, onReserve, onToast }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todo");
  const deferredQuery = useDeferredValue(query);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("type") === "DONATION") {
      setCategory("Todo");
      setQuery("donacion");
    }
  }, [location.search]);

  const filteredListings = market.listings.filter((listing) => {
    const matchesQuery =
      !deferredQuery ||
      [listing.title, listing.category, listing.description, listing.city]
        .join(" ")
        .toLowerCase()
        .includes(deferredQuery.toLowerCase());
    const matchesCategory = category === "Todo" || listing.category === category;
    return matchesQuery && matchesCategory;
  });

  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Explorar"
        title="Busca packs, donaciones y rescates"
        subtitle="Filtra rapido por categoria o busca por barrio, tipo de comida o urgencia."
      />
      <div className="search-panel">
        <input
          className="search-input"
          placeholder="Buscar comida, negocios o packs cercanos"
          value={query}
          onChange={(event) => {
            const nextValue = event.target.value;
            startTransition(() => setQuery(nextValue));
          }}
        />
        <div className="chips">
          {CATEGORY_OPTIONS.map((item) => (
            <button
              key={item}
              type="button"
              className={item === category ? "chip active" : "chip"}
              onClick={() => startTransition(() => setCategory(item))}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      {market.loading ? <LoadingState /> : null}
      {!market.loading && filteredListings.length === 0 ? (
        <EmptyState
          title="No encontramos ofertas con esos filtros"
          subtitle="Proba limpiar la busqueda o volve a Todo para ver mas rescates."
          actionLabel="Limpiar filtros"
          onAction={() => {
            setQuery("");
            setCategory("Todo");
            onToast("Filtros reiniciados.");
          }}
        />
      ) : null}
      {!market.loading && filteredListings.length > 0 ? (
        <CardGrid listings={filteredListings} onReserve={onReserve} />
      ) : null}
    </PageContainer>
  );
}

function PublishPage({ market, onToast }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [listingType, setListingType] = useState("DISCOUNTED_SALE");
  const [form, setForm] = useState({
    title: "Pack sorpresa de almuerzo",
    description: "Platos del dia listos para retiro rapido.",
    category: "Ready Meals",
    imageUrl: DEFAULT_IMAGE,
    originalPrice: "48",
    rescuePrice: "22",
    quantityAvailable: "5",
    city: "La Paz",
    address: "Av. 16 de Julio 1200",
    pickupStart: "2026-05-16T15:00",
    pickupEnd: "2026-05-16T20:00",
    expirationDate: "2026-05-16T21:00",
    foodCondition: "READY_TO_EAT",
    requiresTransport: false,
    kgRescued: "6.5",
    mealsEquivalent: "8",
    co2KgAvoided: "4.2"
  });

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const created = await createListing({
        ...form,
        listingType,
        currency: "BOB",
        originalPrice: Number(form.originalPrice),
        rescuePrice: listingType === "DONATION" ? 0 : Number(form.rescuePrice),
        quantityAvailable: Number(form.quantityAvailable),
        latitude: -16.5,
        longitude: -68.15,
        requiresTransport: form.requiresTransport,
        kgRescued: Number(form.kgRescued),
        mealsEquivalent: Number(form.mealsEquivalent),
        co2KgAvoided: Number(form.co2KgAvoided)
      });
      await publishListing(created.id);
      await market.reload();
      onToast("Oferta publicada y disponible en el marketplace.");
      navigate(`/ofertas/${created.id}`);
    } catch {
      onToast("No pudimos publicar la oferta. Revisa los datos e intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Publicar"
        title="Publica un excedente real"
        subtitle="Este formulario crea y publica una oferta real en market-service."
      />
      <form className="publish-form" onSubmit={handleSubmit}>
        <label>
          Nombre del pack
          <input
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
          />
        </label>
        <label>
          Descripcion
          <textarea
            rows="3"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
        </label>
        <div className="form-row">
          <label>
            Categoria
            <select
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
            >
              {CATEGORY_OPTIONS.filter((item) => item !== "Todo").map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tipo de publicacion
            <select value={listingType} onChange={(event) => setListingType(event.target.value)}>
              <option value="DISCOUNTED_SALE">Venta con descuento</option>
              <option value="DONATION">Donacion gratuita</option>
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Precio original
            <input
              type="number"
              min="0"
              value={form.originalPrice}
              onChange={(event) => setForm({ ...form, originalPrice: event.target.value })}
            />
          </label>
          <label>
            Precio de rescate
            <input
              type="number"
              min="0"
              disabled={listingType === "DONATION"}
              value={listingType === "DONATION" ? 0 : form.rescuePrice}
              onChange={(event) => setForm({ ...form, rescuePrice: event.target.value })}
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Cantidad disponible
            <input
              type="number"
              min="1"
              value={form.quantityAvailable}
              onChange={(event) => setForm({ ...form, quantityAvailable: event.target.value })}
            />
          </label>
          <label>
            Ciudad
            <input
              value={form.city}
              onChange={(event) => setForm({ ...form, city: event.target.value })}
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Retiro desde
            <input
              type="datetime-local"
              value={form.pickupStart}
              onChange={(event) => setForm({ ...form, pickupStart: event.target.value })}
            />
          </label>
          <label>
            Retiro hasta
            <input
              type="datetime-local"
              value={form.pickupEnd}
              onChange={(event) => setForm({ ...form, pickupEnd: event.target.value })}
            />
          </label>
        </div>
        <label>
          Direccion
          <input
            value={form.address}
            onChange={(event) => setForm({ ...form, address: event.target.value })}
          />
        </label>
        <div className="form-row">
          <label>
            Kg rescatados
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.kgRescued}
              onChange={(event) => setForm({ ...form, kgRescued: event.target.value })}
            />
          </label>
          <label>
            Raciones
            <input
              type="number"
              min="0"
              value={form.mealsEquivalent}
              onChange={(event) => setForm({ ...form, mealsEquivalent: event.target.value })}
            />
          </label>
        </div>
        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? "Publicando..." : "Publicar oferta"}
        </button>
      </form>
    </PageContainer>
  );
}

function OrdersPage({
  orders,
  donationRequests,
  loading,
  onConfirmPickup,
  onApproveDonation
}) {
  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Actividad real"
        title="Pedidos y solicitudes"
        subtitle="Esta pantalla ya sale del backend: compras reservadas y donaciones pedidas."
      />
      {loading ? <LoadingState /> : null}
      {!loading && orders.length === 0 && donationRequests.length === 0 ? (
        <EmptyState
          title="Todavia no generaste actividad"
          subtitle="Reserva un pack o solicita una donacion y aparecera aca con estado real."
          actionLabel="Explorar ofertas"
          to="/explorar"
        />
      ) : null}
      {!loading && orders.length > 0 ? (
        <>
          <SectionHeader eyebrow="Compras" title="Rescue orders" />
          <div className="orders-stack">
            {orders.map((order) => (
              <article className="order-card" key={order.id}>
                <div>
                  <strong>{order.listingTitle}</strong>
                  <p>{formatPickupLabel(order.pickupStart, order.pickupEnd, order.city)}</p>
                  <p>
                    Codigo: {order.pickupCode} · Total: {formatMoney(order.totalPrice, order.currency)}
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
      {!loading && donationRequests.length > 0 ? (
        <>
          <SectionHeader eyebrow="Donaciones" title="Donation requests" />
          <div className="orders-stack">
            {donationRequests.map((request) => (
              <article className="order-card" key={request.id}>
                <div>
                  <strong>{request.listingTitle}</strong>
                  <p>{formatPickupLabel(request.pickupStart, request.pickupEnd, request.city)}</p>
                  <p>
                    Receptor: {request.receiverOrgId} · Cantidad: {request.quantity}
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
    </PageContainer>
  );
}

function ProfilePage({ market, orders, donationRequests, onToast }) {
  const [bootstrapping, setBootstrapping] = useState(false);
  const merchantListings = market.listings.filter(
    (listing) => listing.merchantId === "merchant-la-paz"
  );

  async function handleBootstrapRoles() {
    setBootstrapping(true);
    try {
      const response = await market.bootstrapRoles();
      onToast(`IAM listo: ${response.ensuredRoles} roles disponibles para demo-tenant.`);
    } catch {
      onToast("No pudimos bootstrapear los roles del marketplace en IAM.");
    } finally {
      setBootstrapping(false);
    }
  }

  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Perfil y panel"
        title="Vista rapida del negocio"
        subtitle="Aca mezclamos IAM, actividad comercial y solicitudes sociales reales."
      />
      <div className="metrics-grid">
        <MetricCard label="Publicaciones activas" value={merchantListings.length} />
        <MetricCard label="Reservas generadas" value={orders.length} />
        <MetricCard label="Solicitudes ONG" value={donationRequests.length} />
        <MetricCard
          label="Kg rescatados"
          value={merchantListings
            .reduce((total, listing) => total + Number(listing.kgRescued ?? 0), 0)
            .toFixed(1)}
        />
      </div>
      <div className="panel-card">
        <div className="panel-card__header">
          <div>
            <p className="eyebrow">Roles de negocio</p>
            <h3>{market.roleSource === "tenant" ? "Marketplace IAM en vivo" : "Marketplace IAM"}</h3>
          </div>
          <button
            type="button"
            className="ghost-button"
            disabled={bootstrapping}
            onClick={handleBootstrapRoles}
          >
            {bootstrapping ? "Sincronizando..." : "Bootstrap roles"}
          </button>
        </div>
        {market.roles.length === 0 ? (
          <p className="helper-text">
            No pudimos consultar IAM ahora mismo. Cuando el servicio este arriba vas a ver el
            estado vivo aca.
          </p>
        ) : (
          <div className="role-grid">
            {market.roles.map((role) => (
              <article className="role-card" key={role.code ?? role.id ?? role.name}>
                <strong>{role.displayName ?? role.name}</strong>
                <p>{role.description}</p>
                <small>
                  {Array.isArray(role.capabilities)
                    ? role.capabilities.slice(0, 2).join(" · ")
                    : `Tenant: ${role.tenantId}`}
                </small>
              </article>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function OfferDetailPage({ listings, onReserve, onToast }) {
  const { listingId } = useParams();
  const [listing, setListing] = useState(() =>
    listings.find((item) => item.id === listingId)
  );

  useEffect(() => {
    const currentListing = listings.find((item) => item.id === listingId);
    if (currentListing) {
      setListing(currentListing);
      return;
    }

    fetchListingById(listingId)
      .then(setListing)
      .catch(() => onToast("No pudimos cargar el detalle completo de esta oferta."));
  }, [listingId, listings, onToast]);

  if (!listing) {
    return (
      <PageContainer>
        <LoadingState />
      </PageContainer>
    );
  }

  const isDonation = listing.listingType === "DONATION";

  return (
    <PageContainer>
      <div className="detail-hero">
        <img src={listing.imageUrl || DEFAULT_IMAGE} alt={listing.title} />
      </div>
      <div className="detail-sheet">
        <span className={isDonation ? "badge badge-donation" : "badge badge-sale"}>
          {isDonation ? "Donacion" : "Venta economica"}
        </span>
        <h1>{listing.title}</h1>
        <p>{listing.description}</p>
        <div className="detail-meta">
          <strong>{formatMoney(listing.rescuePrice, listing.currency)}</strong>
          {Number(listing.originalPrice) > Number(listing.rescuePrice) ? (
            <span className="line-through">
              {formatMoney(listing.originalPrice, listing.currency)}
            </span>
          ) : null}
        </div>
        <ul className="detail-list">
          <li>Retiro: {new Date(listing.pickupEnd).toLocaleString("es-BO")}</li>
          <li>Ubicacion: {listing.address}, {listing.city}</li>
          <li>Impacto: {listing.mealsEquivalent} raciones · {listing.kgRescued} kg rescatados</li>
          <li>Estado: {statusLabel(listing.status)}</li>
        </ul>
        <div className="detail-actions">
          <button
            type="button"
            className="primary-button"
            disabled={listing.status !== "AVAILABLE" && listing.status !== "REQUESTED"}
            onClick={() => onReserve(listing)}
          >
            {isDonation ? "Solicitar donacion" : "Comprar pack"}
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => onToast("Mapa y compartir quedan listos para el siguiente sprint.")}
          >
            Compartir / Mapa
          </button>
        </div>
      </div>
    </PageContainer>
  );
}

function HeroHeader() {
  return (
    <section className="hero-card">
      <div>
        <p className="eyebrow">AlimentoZero Market</p>
        <h1>Compra con descuento y evita el desperdicio</h1>
        <p>Marketplace hibrido con ventas, donaciones y retiro trazable en una sola app.</p>
      </div>
      <div className="hero-chip">La Paz centro</div>
    </section>
  );
}

function QuickActions() {
  return (
    <div className="quick-actions">
      {QUICK_ACTIONS.map((action) => (
        <Link key={action.label} className={`quick-action ${action.accent}`} to={action.to}>
          {action.label}
        </Link>
      ))}
    </div>
  );
}

function CategoryRail() {
  return (
    <div className="chips">
      {CATEGORY_OPTIONS.slice(1).map((category) => (
        <span className="chip static" key={category}>
          {category}
        </span>
      ))}
    </div>
  );
}

function RecommendationStrip({ listings, onReserve }) {
  return (
    <div className="horizontal-scroll">
      {listings.map((listing) => (
        <OfferCard key={listing.id} listing={listing} compact onReserve={onReserve} />
      ))}
    </div>
  );
}

function CardGrid({ listings, onReserve }) {
  return (
    <div className="card-grid">
      {listings.map((listing) => (
        <OfferCard key={listing.id} listing={listing} onReserve={onReserve} />
      ))}
    </div>
  );
}

function OfferCard({ listing, onReserve, compact = false }) {
  const soldOut = listing.status === "SOLD_OUT";
  const expired = listing.status === "EXPIRED";
  const isDonation = listing.listingType === "DONATION";

  return (
    <article className={compact ? "offer-card compact" : "offer-card"}>
      <Link to={`/ofertas/${listing.id}`} className="offer-media">
        <img src={listing.imageUrl || DEFAULT_IMAGE} alt={listing.title} />
      </Link>
      <div className="offer-body">
        <div className="offer-badges">
          <span className={isDonation ? "badge badge-donation" : "badge badge-sale"}>
            {isDonation ? "Donacion" : "Venta economica"}
          </span>
          {Number(listing.quantityAvailable) - Number(listing.quantityReserved ?? 0) <= 3 ? (
            <span className="badge badge-warning">Vence pronto</span>
          ) : null}
        </div>
        <Link to={`/ofertas/${listing.id}`} className="offer-title">
          {listing.title}
        </Link>
        <p className="offer-copy">{listing.description}</p>
        <div className="offer-meta">
          <strong>{formatMoney(listing.rescuePrice, listing.currency)}</strong>
          {Number(listing.originalPrice) > Number(listing.rescuePrice) ? (
            <span className="line-through">{formatMoney(listing.originalPrice, listing.currency)}</span>
          ) : null}
        </div>
        <div className="offer-footer">
          <span>{listing.city}</span>
          <span>{formatHoursLabel(listing)}</span>
          <span>{statusLabel(listing.status)}</span>
        </div>
        <div className="offer-actions">
          <Link className="ghost-button" to={`/ofertas/${listing.id}`}>
            Ver detalle
          </Link>
          <button
            type="button"
            className="primary-button slim"
            disabled={soldOut || expired}
            onClick={() => onReserve(listing)}
          >
            {isDonation ? "Solicitar" : "Reservar"}
          </button>
        </div>
      </div>
    </article>
  );
}

function InfoBanner({ onToast }) {
  return (
    <button
      type="button"
      className="info-banner"
      onClick={() => onToast("Ahora ya hay pedidos y solicitudes reales conectadas al backend.")}
    >
      <div>
        <p className="eyebrow">Impacto generado</p>
        <strong>Compras, donaciones y retiro ya tienen estado real</strong>
      </div>
      <span>Ver actividad</span>
    </button>
  );
}

function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <header className="section-header">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      {subtitle ? <p className="section-copy">{subtitle}</p> : null}
    </header>
  );
}

function MetricCard({ label, value }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function BottomNav() {
  const navItems = [
    { to: "/", label: "Inicio" },
    { to: "/explorar", label: "Explorar" },
    { to: "/publicar", label: "Publicar" },
    { to: "/pedidos", label: "Pedidos" },
    { to: "/perfil", label: "Perfil" }
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) => (isActive ? "bottom-link active" : "bottom-link")}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function PageContainer({ children }) {
  return <div className="page-container">{children}</div>;
}

function LoadingState() {
  return <div className="state-card">Cargando marketplace...</div>;
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="state-card error">
      <p>{message}</p>
      <button type="button" className="ghost-button" onClick={onRetry}>
        Reintentar
      </button>
    </div>
  );
}

function EmptyState({ title, subtitle, actionLabel, onAction, to }) {
  return (
    <div className="state-card">
      <strong>{title}</strong>
      <p>{subtitle}</p>
      {to ? (
        <Link className="primary-button slim" to={to}>
          {actionLabel}
        </Link>
      ) : (
        <button type="button" className="primary-button slim" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default App;
