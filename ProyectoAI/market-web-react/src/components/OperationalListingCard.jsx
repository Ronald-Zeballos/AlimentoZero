import { Link } from "react-router-dom";
import {
  formatHoursLabel,
  formatMoney,
  quantityRemaining,
  statusLabel
} from "../utils/market";

export function OperationalListingCard({
  listing,
  eyebrow,
  headline,
  body,
  actionLabel = "Ver detalle",
  actionTo,
  badgeLabel
}) {
  return (
    <article className="ops-card">
      <div className="ops-card__top">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h3>{headline || listing.title}</h3>
        </div>
        <span className="pill">{badgeLabel || statusLabel(listing.status)}</span>
      </div>
      <p className="helper-text">{body || listing.description}</p>
      <div className="ops-card__meta">
        <span>{listing.city}</span>
        <span>{formatHoursLabel(listing)}</span>
        <span>{quantityRemaining(listing)} disponibles</span>
        <span>{formatMoney(listing.rescuePrice, listing.currency)}</span>
      </div>
      <Link className="ghost-button slim-inline" to={actionTo || `/ofertas/${listing.id}`}>
        {actionLabel}
      </Link>
    </article>
  );
}
