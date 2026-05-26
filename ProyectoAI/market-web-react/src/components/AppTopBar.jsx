import { Link } from "react-router-dom";
import { resolveAudienceLabel, resolveProfileDisplayName } from "../utils/market";

export function AppTopBar({
  currentProfile,
  eyebrow,
  title,
  subtitle,
  actionLabel,
  actionTo,
  accent = "default"
}) {
  return (
    <section className={`role-hero role-hero-${accent}`}>
      <div className="role-hero__top">
        <div className="brand-lockup">
          <span className="brand-pill">AlimentoZero Market</span>
          <small>Santa Cruz · rescate inteligente de comida</small>
        </div>
        <div className="hero-presence">
          <strong>{resolveProfileDisplayName(currentProfile)}</strong>
          <span>{resolveAudienceLabel(currentProfile)}</span>
        </div>
      </div>
      <div className="role-hero__body">
        <div>
          <p className="eyebrow eyebrow-inverted">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {actionLabel && actionTo ? (
          <Link className="hero-action" to={actionTo}>
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
