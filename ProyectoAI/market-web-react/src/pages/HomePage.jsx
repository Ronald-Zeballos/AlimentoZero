import { Link } from "react-router-dom";
import {
  BUYER_CATEGORY_SPOTLIGHTS,
  BUYER_PROMO_BANNERS
} from "../constants";
import { AppTopBar } from "../components/AppTopBar";
import { InsightsPanel } from "../components/InsightsPanel";
import { LocationMapPanel } from "../components/LocationMapPanel";
import { RecommendationStrip, CardGrid } from "../components/OfferCard";
import { OperationalListingCard } from "../components/OperationalListingCard";
import { SectionHeader } from "../components/SectionHeader";
import { ErrorState, LoadingState } from "../components/StateViews";
import {
  buildNearbyListingModel,
  categoryShare,
  formatMoney,
  isCriticalListing,
  quantityRemaining,
  resolveAudienceLabel,
  resolveProfileDisplayName,
  resolveRoleCopy,
  sortByUrgency
} from "../utils/market";

function SummaryRibbon({ items }) {
  return (
    <div className="summary-ribbon">
      {items.map((item) => (
        <article key={item.label} className="summary-pill">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </article>
      ))}
    </div>
  );
}

function BuyerHome({ market, currentProfile, onReserve, locationState }) {
  const nearbyModel = buildNearbyListingModel(market.listings, locationState.location, {
    limit: 8
  });
  const recommendations = market.recommendations
    .map((recommendation) =>
      market.listings.find((listing) => listing.id === recommendation.listingId)
    )
    .filter(Boolean)
    .filter((listing) => nearbyModel.listings.some((nearby) => nearby.id === listing.id));
  const recommendationDeck =
    recommendations.length > 0 ? recommendations.slice(0, 4) : nearbyModel.listings.slice(0, 4);

  return (
    <>
      <AppTopBar
        currentProfile={currentProfile}
        eyebrow="Modo comprador"
        title="Packs sorpresa, promos y rescate cercano"
        subtitle="Inspirado en una app de delivery: primero descubres, luego reservas y finalmente confirmas tu retiro."
        actionLabel="Explorar ahora"
        actionTo="/explorar"
        accent="buyer"
      />
      <Link to="/explorar" className="delivery-search">
        <div>
          <strong>Buscar restaurantes, packs o barrios</strong>
          <span>Santa Cruz, cafe, panaderias, almuerzos y donaciones</span>
        </div>
        <span>Buscar</span>
      </Link>
      <LocationMapPanel
        geo={locationState}
        title="Packs cerca de tu zona"
        listings={market.listings}
      />
      <div className="category-spotlights">
        {BUYER_CATEGORY_SPOTLIGHTS.map((category) => (
          <Link
            key={category.label}
            className="category-tile"
            to={`/explorar?category=${encodeURIComponent(category.category)}`}
          >
            <strong>{category.label}</strong>
            <span>{category.category}</span>
          </Link>
        ))}
      </div>
      <div className="promo-grid">
        {BUYER_PROMO_BANNERS.map((banner) => (
          <article key={banner.title} className={`promo-card promo-card-${banner.accent}`}>
            <strong>{banner.title}</strong>
            <p>{banner.body}</p>
          </article>
        ))}
      </div>
      <SummaryRibbon
        items={[
          { label: "Packs activos", value: market.summary?.activeListings ?? 0 },
          { label: "Retiros hechos", value: market.summary?.pickedUpOrders ?? 0 },
          { label: "Donaciones aprobadas", value: market.summary?.approvedDonations ?? 0 }
        ]}
      />
      <SectionHeader
        eyebrow="Recomendado para ti"
        title="Lo mejor del momento"
        subtitle="La IA mezcla cercania, urgencia y costo de entrega para sugerirte opciones convenientes."
      />
      <RecommendationStrip
        listings={recommendationDeck}
        onReserve={onReserve}
        viewerLocation={locationState.location}
      />
      <SectionHeader
        eyebrow="Cerca de ti"
        title="Retira hoy mismo"
        subtitle={`Locales dentro de ${nearbyModel.coverageKm} km para mantener bajo el costo de reparto.`}
      />
      <CardGrid
        listings={nearbyModel.listings.slice(0, 6)}
        onReserve={onReserve}
        viewerLocation={locationState.location}
      />
    </>
  );
}

function GuestHome({ market, currentProfile, onReserve, locationState, onOpenAuth }) {
  const nearbyModel = buildNearbyListingModel(market.listings, locationState.location, {
    limit: 8
  });
  const recommendations = market.recommendations
    .map((recommendation) =>
      market.listings.find((listing) => listing.id === recommendation.listingId)
    )
    .filter(Boolean)
    .filter((listing) => nearbyModel.listings.some((nearby) => nearby.id === listing.id));
  const recommendationDeck =
    recommendations.length > 0 ? recommendations.slice(0, 4) : nearbyModel.listings.slice(0, 4);

  return (
    <>
      <AppTopBar
        currentProfile={currentProfile}
        eyebrow="Explora sin cuenta"
        title="Descubre promociones antes de iniciar sesion"
        subtitle="Como cualquier marketplace real, puedes mirar productos, promos y zonas cercanas antes de crear tu cuenta."
        actionLabel="Entrar ahora"
        actionTo="/acceso"
        accent="buyer"
      />
      <div className="auth-cta-strip">
        <button type="button" className="primary-button" onClick={onOpenAuth}>
          Iniciar sesion
        </button>
        <button type="button" className="ghost-button" onClick={onOpenAuth}>
          Crear cuenta
        </button>
      </div>
      <LocationMapPanel
        geo={locationState}
        listings={market.listings}
      />
      <Link to="/explorar" className="delivery-search">
        <div>
          <strong>Explora promociones, packs y zonas cercanas</strong>
          <span>Abre el mapa, revisa categorias y luego entra para reservar</span>
        </div>
        <span>Ver todo</span>
      </Link>
      <div className="promo-grid">
        {BUYER_PROMO_BANNERS.map((banner) => (
          <article key={banner.title} className={`promo-card promo-card-${banner.accent}`}>
            <strong>{banner.title}</strong>
            <p>{banner.body}</p>
          </article>
        ))}
      </div>
      <SectionHeader
        eyebrow="Te puede interesar"
        title="Packs y donaciones destacadas"
        subtitle={`Opciones cercanas dentro de ${nearbyModel.coverageKm} km para que la entrega siga siendo razonable.`}
      />
      <RecommendationStrip
        listings={recommendationDeck}
        onReserve={onReserve}
        viewerLocation={locationState.location}
      />
      <CardGrid
        listings={nearbyModel.listings.slice(0, 6)}
        onReserve={onReserve}
        viewerLocation={locationState.location}
      />
    </>
  );
}

function MerchantHome({ market, currentProfile }) {
  const urgentListings = sortByUrgency(market.listings).slice(0, 3);

  return (
    <>
      <AppTopBar
        currentProfile={currentProfile}
        eyebrow="Modo comercio"
        title="Tu tablero de recuperacion comercial"
        subtitle="Monitorea publicaciones propias, detecta vencimientos y publica nuevos packs cuando haya excedentes."
        actionLabel="Publicar pack"
        actionTo="/publicar"
        accent="merchant"
      />
      <SummaryRibbon
        items={[
          { label: "Packs activos", value: market.summary?.activeListings ?? 0 },
          {
            label: "Ingresos recuperados",
            value: formatMoney(market.summary?.rescueRevenue ?? 0)
          },
          { label: "Raciones salvadas", value: market.summary?.mealsEquivalent ?? 0 },
          { label: "Casos criticos", value: market.summary?.criticalListings ?? 0 }
        ]}
      />
      <InsightsPanel aiMode={market.aiMode} briefing={market.briefing} summary={market.summary} />
      <SectionHeader
        eyebrow="Atencion inmediata"
        title="Publicaciones que debes mover primero"
        subtitle="Se priorizan las que vencen antes o tienen pocas unidades disponibles."
      />
      <div className="ops-grid">
        {urgentListings.map((listing) => (
          <OperationalListingCard
            key={listing.id}
            listing={listing}
            eyebrow={isCriticalListing(listing) ? "Critico" : "Activo"}
            body={`${quantityRemaining(listing)} unidades por rescatar antes del cierre.`}
            actionLabel="Gestionar publicacion"
          />
        ))}
      </div>
    </>
  );
}

function NgoHome({ market, currentProfile }) {
  const urgentDonations = sortByUrgency(market.listings).slice(0, 4);

  return (
    <>
      <AppTopBar
        currentProfile={currentProfile}
        eyebrow="Modo ONG"
        title="Centro solidario de abastecimiento"
        subtitle="El foco aqui no es comprar: es detectar lotes utiles, pedirlos y coordinar recepcion social."
        actionLabel="Ver donaciones"
        actionTo="/explorar"
        accent="ngo"
      />
      <SummaryRibbon
        items={[
          { label: "Lotes activos", value: market.summary?.activeListings ?? 0 },
          { label: "Solicitudes", value: market.summary?.requestedDonations ?? 0 },
          { label: "Aprobadas", value: market.summary?.approvedDonations ?? 0 },
          { label: "Raciones", value: market.summary?.mealsEquivalent ?? 0 }
        ]}
      />
      <InsightsPanel aiMode={market.aiMode} briefing={market.briefing} summary={market.summary} />
      <SectionHeader
        eyebrow="Urgentes"
        title="Donaciones listas para asignacion"
        subtitle="Ventanas de recojo cortas y volumen alimentario alto."
      />
      <div className="ops-grid">
        {urgentDonations.map((listing) => (
          <OperationalListingCard
            key={listing.id}
            listing={listing}
            eyebrow="Donacion prioritaria"
            body={`${listing.mealsEquivalent} raciones estimadas para recepcion social.`}
            actionLabel="Abrir lote"
          />
        ))}
      </div>
    </>
  );
}

function TransporterHome({ market, currentProfile }) {
  const routeCandidates = sortByUrgency(
    market.listings.filter((listing) => listing.requiresTransport)
  ).slice(0, 4);

  return (
    <>
      <AppTopBar
        currentProfile={currentProfile}
        eyebrow="Modo logistica"
        title="Base de rutas urgentes"
        subtitle="Aqui la prioridad es mover paquetes antes del vencimiento y asegurar trazabilidad del recojo."
        actionLabel="Revisar operacion"
        actionTo="/pedidos"
        accent="transporter"
      />
      <SummaryRibbon
        items={[
          { label: "Rutas requeridas", value: market.summary?.transportRequiredListings ?? 0 },
          { label: "Casos criticos", value: market.summary?.criticalListings ?? 0 },
          { label: "Retiros cerrados", value: market.summary?.pickedUpOrders ?? 0 }
        ]}
      />
      <InsightsPanel aiMode={market.aiMode} briefing={market.briefing} summary={market.summary} />
      <SectionHeader
        eyebrow="Ventanas activas"
        title="Tareas que requieren movilidad"
        subtitle="Los listados con transporte obligatorio se agrupan aqui como cola operativa."
      />
      <div className="ops-grid">
        {routeCandidates.map((listing) => (
          <OperationalListingCard
            key={listing.id}
            listing={listing}
            eyebrow="Ruta sugerida"
            body={`Recojo en ${listing.city}. ${quantityRemaining(listing)} paquetes pendientes.`}
            actionLabel="Ver ruta"
          />
        ))}
      </div>
    </>
  );
}

function CoordinatorHome({ market, currentProfile }) {
  const criticalListings = sortByUrgency(market.listings).slice(0, 4);
  const categories = categoryShare(market.listings);

  return (
    <>
      <AppTopBar
        currentProfile={currentProfile}
        eyebrow="Modo coordinacion"
        title="Centro de mando de la ciudad"
        subtitle="Cruza rescate comercial, donacion y logistica para decidir donde actuar primero."
        actionLabel="Abrir monitoreo"
        actionTo="/explorar"
        accent="coordinator"
      />
      <SummaryRibbon
        items={[
          { label: "Casos criticos", value: market.summary?.criticalListings ?? 0 },
          { label: "Packs activos", value: market.summary?.activeListings ?? 0 },
          { label: "Donaciones", value: market.summary?.approvedDonations ?? 0 },
          { label: "Transporte", value: market.summary?.transportRequiredListings ?? 0 }
        ]}
      />
      <div className="split-grid">
        <InsightsPanel aiMode={market.aiMode} briefing={market.briefing} summary={market.summary} />
        <section className="panel-card">
          <SectionHeader
            eyebrow="Categorias calientes"
            title="Donde se concentra la presion"
            subtitle="Lectura rapida para decidir campanas o reasignacion."
          />
          <div className="compact-stack">
            {categories.map((item) => (
              <article key={item.category} className="mini-row">
                <strong>{item.category}</strong>
                <span>{item.total} listados</span>
              </article>
            ))}
          </div>
        </section>
      </div>
      <SectionHeader eyebrow="Casos" title="Incidencias visibles ahora" />
      <div className="ops-grid">
        {criticalListings.map((listing) => (
          <OperationalListingCard
            key={listing.id}
            listing={listing}
            eyebrow="Seguimiento"
            body="Caso visible para priorizacion transversal."
          />
        ))}
      </div>
    </>
  );
}

function AdminHome({ market, currentProfile, session }) {
  return (
    <>
      <AppTopBar
        currentProfile={currentProfile}
        eyebrow="Modo backoffice"
        title="Centro de control de la operacion"
        subtitle="Aqui se revisa el pulso general del marketplace, el equipo cargado y la cobertura de la experiencia, sin exponer lenguaje tecnico al usuario."
        actionLabel="Ver equipo"
        actionTo="/pedidos"
        accent="admin"
      />
      <SummaryRibbon
        items={[
          { label: "Vistas", value: session.profiles.length },
          { label: "Accesos", value: session.roles.length },
          { label: "Asistencias IA", value: session.objectives.length },
          { label: "Listados activos", value: market.summary?.activeListings ?? 0 }
        ]}
      />
      <div className="split-grid">
        <InsightsPanel aiMode={market.aiMode} briefing={market.briefing} summary={market.summary} />
        <section className="panel-card">
          <SectionHeader
            eyebrow="Equipo visible"
            title="Vistas disponibles en la demo"
            subtitle="Un resumen claro de las personas y paneles que hoy forman parte de la experiencia."
          />
          <div className="compact-stack">
            {session.profiles.map((profile) => (
              <article key={profile.profileKey} className="mini-row">
                <strong>{resolveProfileDisplayName(profile)}</strong>
                <span>{resolveAudienceLabel(profile)}</span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export function HomePage({
  market,
  currentProfile,
  onReserve,
  session,
  isAuthenticated,
  locationState,
  onOpenAuth
}) {
  const roleCopy = resolveRoleCopy(currentProfile);

  return (
    <div className="page-container">
      {market.loading ? <LoadingState message="Construyendo la vista del rol activo..." /> : null}
      {market.error ? <ErrorState message={market.error} onRetry={market.reload} /> : null}
      {!market.loading && !market.error ? (
        <>
          {!isAuthenticated ? (
            <GuestHome
              market={market}
              currentProfile={currentProfile}
              onReserve={onReserve}
              locationState={locationState}
              onOpenAuth={onOpenAuth}
            />
          ) : null}
          {isAuthenticated && currentProfile?.actorType === "BUYER" ? (
            <BuyerHome
              market={market}
              currentProfile={currentProfile}
              onReserve={onReserve}
              locationState={locationState}
            />
          ) : null}
          {isAuthenticated && currentProfile?.actorType === "MERCHANT" ? (
            <MerchantHome market={market} currentProfile={currentProfile} />
          ) : null}
          {isAuthenticated && currentProfile?.actorType === "NGO" ? (
            <NgoHome market={market} currentProfile={currentProfile} />
          ) : null}
          {isAuthenticated && currentProfile?.actorType === "TRANSPORTER" ? (
            <TransporterHome market={market} currentProfile={currentProfile} />
          ) : null}
          {isAuthenticated && currentProfile?.actorType === "COORDINATOR" ? (
            <CoordinatorHome market={market} currentProfile={currentProfile} />
          ) : null}
          {isAuthenticated && currentProfile?.actorType === "ADMIN" ? (
            <AdminHome
              market={market}
              currentProfile={currentProfile}
              session={session}
            />
          ) : null}
          {isAuthenticated && !currentProfile?.actorType ? (
            <AppTopBar
              currentProfile={currentProfile}
              eyebrow={roleCopy.eyebrow}
              title={roleCopy.title}
              subtitle={roleCopy.subtitle}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
