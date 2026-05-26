import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CATEGORY_OPTIONS } from "../constants";
import { AppTopBar } from "../components/AppTopBar";
import { LocationMapPanel } from "../components/LocationMapPanel";
import { CardGrid } from "../components/OfferCard";
import { OperationalListingCard } from "../components/OperationalListingCard";
import { SectionHeader } from "../components/SectionHeader";
import { EmptyState, LoadingState } from "../components/StateViews";
import {
  buildNearbyListingModel,
  isCriticalListing,
  quantityRemaining,
  resolveRoleCopy,
  sortByUrgency
} from "../utils/market";

function BuyerExplore({
  market,
  currentProfile,
  onReserve,
  onToast,
  query,
  setQuery,
  category,
  setCategory,
  isAuthenticated,
  onOpenAuth,
  locationState
}) {
  const deferredQuery = useDeferredValue(query);
  const filteredBySearch = market.listings.filter((listing) => {
    const matchesQuery =
      !deferredQuery ||
      [listing.title, listing.category, listing.description, listing.city, listing.address]
        .join(" ")
        .toLowerCase()
        .includes(deferredQuery.toLowerCase());
    const matchesCategory =
      category === "Todo" ||
      (category === "Donaciones" ? listing.listingType === "DONATION" : listing.category === category);
    return matchesQuery && matchesCategory;
  });
  const nearbyModel = buildNearbyListingModel(filteredBySearch, locationState.location);
  const filteredListings = nearbyModel.listings;

  return (
    <>
      <AppTopBar
        currentProfile={currentProfile}
        eyebrow={isAuthenticated ? "Explorar packs" : "Explora sin cuenta"}
        title={
          isAuthenticated
            ? "Busca como en una app de delivery"
            : "Mira promociones y productos antes de entrar"
        }
        subtitle={
          isAuthenticated
            ? "Filtra por categoria o comida y te mostramos primero lo que conviene por cercania."
            : "Puedes navegar libremente. Cuando quieras reservar o pedir una donacion, te pediremos iniciar sesion."
        }
        accent="buyer"
      />
      {!isAuthenticated ? (
        <div className="auth-cta-strip">
          <button type="button" className="primary-button" onClick={onOpenAuth}>
            Iniciar sesion
          </button>
          <button type="button" className="ghost-button" onClick={onOpenAuth}>
            Crear cuenta
          </button>
        </div>
      ) : null}
      <LocationMapPanel
        geo={locationState}
        title="Tu zona y comercios cercanos"
        listings={filteredListings}
      />
      <div className="search-panel delivery-panel">
        <input
          className="search-input"
          placeholder="Buscar comida, comercios o antojos"
          value={query}
          onChange={(event) => {
            const nextValue = event.target.value;
            startTransition(() => setQuery(nextValue));
          }}
        />
        <p className="helper-text">
          Mostrando opciones dentro de {nearbyModel.coverageKm} km para evitar que el reparto
          salga demasiado caro.
        </p>
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
      {!market.loading && filteredListings.length === 0 ? (
        <EmptyState
          title="No encontramos packs con esos filtros"
          subtitle="Prueba otra categoria o borra la busqueda para ampliar la cobertura."
          actionLabel="Limpiar filtros"
          onAction={() => {
            setQuery("");
            setCategory("Todo");
            onToast("Filtros reiniciados.");
          }}
        />
      ) : null}
      {!market.loading && filteredListings.length > 0 ? (
        <CardGrid
          listings={filteredListings}
          onReserve={onReserve}
          viewerLocation={locationState.location}
        />
      ) : null}
    </>
  );
}

function MerchantExplore({ market, currentProfile }) {
  return (
    <>
      <AppTopBar
        currentProfile={currentProfile}
        eyebrow="Inventario propio"
        title="Tus publicaciones activas y vencimientos"
        subtitle="Esta vista ya no es un catalogo general: es el inventario operativo del comercio."
        accent="merchant"
      />
      <SectionHeader
        eyebrow="Inventario"
        title="Todos tus packs"
        subtitle="Vista orientada a gestion y no a compra."
      />
      <div className="ops-grid">
        {sortByUrgency(market.listings).map((listing) => (
          <OperationalListingCard
            key={listing.id}
            listing={listing}
            eyebrow={isCriticalListing(listing) ? "Critico" : "Programado"}
            body={`${quantityRemaining(listing)} unidades restantes en ${listing.city}.`}
            actionLabel="Ver ficha"
          />
        ))}
      </div>
    </>
  );
}

function NgoExplore({ market, currentProfile }) {
  return (
    <>
      <AppTopBar
        currentProfile={currentProfile}
        eyebrow="Pool solidario"
        title="Lotes disponibles para donacion"
        subtitle="Filtrado para organizaciones: solo donaciones y prioridad por impacto."
        accent="ngo"
      />
      <div className="ops-grid">
        {sortByUrgency(market.listings).map((listing) => (
          <OperationalListingCard
            key={listing.id}
            listing={listing}
            eyebrow="Lote social"
            body={`${listing.mealsEquivalent} raciones estimadas para distribucion.`}
            actionLabel="Revisar donacion"
          />
        ))}
      </div>
    </>
  );
}

function TransporterExplore({ market, currentProfile }) {
  const candidates = sortByUrgency(
    market.listings.filter((listing) => listing.requiresTransport)
  );

  return (
    <>
      <AppTopBar
        currentProfile={currentProfile}
        eyebrow="Rutas"
        title="Retiros que necesitan movilidad"
        subtitle="Se muestran solo las publicaciones que piden transporte o tienen urgencia logistica."
        accent="transporter"
      />
      <div className="ops-grid">
        {candidates.map((listing) => (
          <OperationalListingCard
            key={listing.id}
            listing={listing}
            eyebrow="Ruta sugerida"
            body={`Ventana corta y ${quantityRemaining(listing)} paquetes pendientes.`}
            actionLabel="Abrir lote"
          />
        ))}
      </div>
    </>
  );
}

function CoordinatorExplore({ market, currentProfile }) {
  return (
    <>
      <AppTopBar
        currentProfile={currentProfile}
        eyebrow="Monitoreo"
        title="Todo el pulso operativo"
        subtitle="Vista completa de ciudad para detectar sobrecarga, urgencia y concentracion por categoria."
        accent="coordinator"
      />
      <div className="ops-grid">
        {sortByUrgency(market.listings).map((listing) => (
          <OperationalListingCard
            key={listing.id}
            listing={listing}
            eyebrow={listing.listingType === "DONATION" ? "Donacion" : "Venta"}
            body={`${listing.category} · ${quantityRemaining(listing)} unidades visibles.`}
            actionLabel="Auditar caso"
          />
        ))}
      </div>
    </>
  );
}

function AdminExplore({ market, currentProfile, session }) {
  return (
    <>
      <AppTopBar
        currentProfile={currentProfile}
        eyebrow="Cobertura del marketplace"
        title="Cobertura activa del marketplace"
        subtitle="Cruza actores y publicaciones para validar el alcance real del ecosistema."
        accent="admin"
      />
      <section className="panel-card">
        <SectionHeader
          eyebrow="Actores disponibles"
          title="Perfiles cargados"
          subtitle="Inventario rapido de actores activos dentro de la demo."
        />
        <div className="compact-stack">
          {session.profiles.map((profile) => (
            <article className="mini-row" key={profile.profileKey}>
              <strong>{profile.displayName}</strong>
              <span>{profile.actorType}</span>
            </article>
          ))}
        </div>
      </section>
      <div className="ops-grid">
        {sortByUrgency(market.listings).map((listing) => (
          <OperationalListingCard
            key={listing.id}
            listing={listing}
            eyebrow="Oferta viva"
            body={`${listing.category} · ${listing.city} · ${quantityRemaining(listing)} pendientes.`}
            actionLabel="Ver detalle"
          />
        ))}
      </div>
    </>
  );
}

export function ExplorePage({
  market,
  currentProfile,
  onReserve,
  onToast,
  session,
  isAuthenticated,
  onOpenAuth,
  locationState
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todo");
  const location = useLocation();
  const roleCopy = resolveRoleCopy(currentProfile);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("type") === "DONATION") {
      setCategory("Todo");
      setQuery("donacion");
    }
    if (params.get("category")) {
      setCategory(params.get("category"));
    }
  }, [location.search]);

  if (market.loading) {
    return (
      <div className="page-container">
        <LoadingState message="Preparando la vista de exploracion..." />
      </div>
    );
  }

  return (
    <div className="page-container">
      {currentProfile?.actorType === "BUYER" ? (
        <BuyerExplore
          market={market}
          currentProfile={currentProfile}
          onReserve={onReserve}
          onToast={onToast}
          query={query}
          setQuery={setQuery}
          category={category}
          setCategory={setCategory}
          isAuthenticated={isAuthenticated}
          onOpenAuth={onOpenAuth}
          locationState={locationState}
        />
      ) : null}
      {isAuthenticated && currentProfile?.actorType === "MERCHANT" ? (
        <MerchantExplore market={market} currentProfile={currentProfile} />
      ) : null}
      {isAuthenticated && currentProfile?.actorType === "NGO" ? (
        <NgoExplore market={market} currentProfile={currentProfile} />
      ) : null}
      {isAuthenticated && currentProfile?.actorType === "TRANSPORTER" ? (
        <TransporterExplore market={market} currentProfile={currentProfile} />
      ) : null}
      {isAuthenticated && currentProfile?.actorType === "COORDINATOR" ? (
        <CoordinatorExplore market={market} currentProfile={currentProfile} />
      ) : null}
      {isAuthenticated && currentProfile?.actorType === "ADMIN" ? (
        <AdminExplore
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
    </div>
  );
}
