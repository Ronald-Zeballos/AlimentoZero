import { Link } from "react-router-dom";
import { CATEGORY_OPTIONS, QUICK_ACTIONS } from "../constants";
import { InsightsPanel } from "../components/InsightsPanel";
import { RecommendationStrip, CardGrid } from "../components/OfferCard";
import { SectionHeader } from "../components/SectionHeader";
import { ErrorState, LoadingState } from "../components/StateViews";

function HeroHeader({ currentProfile }) {
  return (
    <section className="hero-card">
      <div>
        <p className="eyebrow">AlimentoZero Market</p>
        <h1>{currentProfile ? `Modo ${currentProfile.actorType.toLowerCase()}` : "Marketplace vivo"}</h1>
        <p>
          Marketplace hibrido con ventas, donaciones, retiro trazable y decisiones guiadas por
          perfil.
        </p>
      </div>
      <div className="hero-chip">{currentProfile?.displayName || "demo-tenant"}</div>
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

function InfoBanner({ onToast, currentProfile }) {
  return (
    <button
      type="button"
      className="info-banner"
      onClick={() =>
        onToast(`Dashboard actualizado para ${currentProfile?.displayName || "el perfil actual"}.`)
      }
    >
      <div>
        <p className="eyebrow">Impacto generado</p>
        <strong>Compras, donaciones y retiros ya dependen del perfil activo</strong>
      </div>
      <span>Ver panel</span>
    </button>
  );
}

export function HomePage({ market, currentProfile, onReserve, onToast }) {
  const featuredListings = market.listings.slice(0, 4);
  const recommendationCards = market.recommendations
    .map((recommendation) =>
      market.listings.find((listing) => listing.id === recommendation.listingId)
    )
    .filter(Boolean);

  return (
    <div className="page-container">
      <HeroHeader currentProfile={currentProfile} />
      <QuickActions />
      <InsightsPanel aiMode={market.aiMode} briefing={market.briefing} summary={market.summary} />
      <SectionHeader
        eyebrow="Recomendado"
        title="Las mejores opciones del momento"
        subtitle={
          market.aiMode === "live"
            ? "La IA ya ajusto el ranking e insights segun el perfil seleccionado."
            : "Estamos usando un fallback local mientras AI termina de responder."
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
          <InfoBanner onToast={onToast} currentProfile={currentProfile} />
        </>
      ) : null}
    </div>
  );
}
