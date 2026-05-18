import { Link } from "react-router-dom";
import { DEFAULT_IMAGE } from "../constants";
import { formatHoursLabel, formatMoney, statusLabel } from "../utils/market";

export function OfferCard({ listing, onReserve, compact = false }) {
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

export function CardGrid({ listings, onReserve }) {
  return (
    <div className="card-grid">
      {listings.map((listing) => (
        <OfferCard key={listing.id} listing={listing} onReserve={onReserve} />
      ))}
    </div>
  );
}

export function RecommendationStrip({ listings, onReserve }) {
  return (
    <div className="horizontal-scroll">
      {listings.map((listing) => (
        <OfferCard key={listing.id} listing={listing} compact onReserve={onReserve} />
      ))}
    </div>
  );
}
