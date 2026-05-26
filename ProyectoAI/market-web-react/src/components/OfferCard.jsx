import { Link } from "react-router-dom";
import { DEFAULT_IMAGE } from "../constants";
import {
  enrichListingForViewer,
  formatDeliveryFee,
  formatHoursLabel,
  formatMoney,
  statusLabel
} from "../utils/market";

export function OfferCard({ listing, onReserve, compact = false, viewerLocation }) {
  const enrichedListing = viewerLocation
    ? enrichListingForViewer(listing, viewerLocation)
    : listing;
  const soldOut = enrichedListing.status === "SOLD_OUT";
  const expired = enrichedListing.status === "EXPIRED";
  const isDonation = enrichedListing.listingType === "DONATION";

  return (
    <article className={compact ? "offer-card compact" : "offer-card"}>
      <Link to={`/ofertas/${enrichedListing.id}`} className="offer-media">
        <img src={enrichedListing.imageUrl || DEFAULT_IMAGE} alt={enrichedListing.title} />
      </Link>
      <div className="offer-body">
        <div className="offer-badges">
          <span className={isDonation ? "badge badge-donation" : "badge badge-sale"}>
            {isDonation ? "Donacion" : "Venta economica"}
          </span>
          {Number(enrichedListing.quantityAvailable) - Number(enrichedListing.quantityReserved ?? 0) <= 3 ? (
            <span className="badge badge-warning">Vence pronto</span>
          ) : null}
        </div>
        <Link to={`/ofertas/${enrichedListing.id}`} className="offer-title">
          {enrichedListing.title}
        </Link>
        <p className="offer-copy">{enrichedListing.description}</p>
        <div className="offer-meta">
          <strong>{formatMoney(enrichedListing.rescuePrice, enrichedListing.currency)}</strong>
          {Number(enrichedListing.originalPrice) > Number(enrichedListing.rescuePrice) ? (
            <span className="line-through">
              {formatMoney(enrichedListing.originalPrice, enrichedListing.currency)}
            </span>
          ) : null}
        </div>
        <div className="offer-footer">
          <span>{enrichedListing.category}</span>
          {viewerLocation ? <span>{enrichedListing.distanceKm} km</span> : <span>{enrichedListing.city}</span>}
          {viewerLocation ? (
            <span>{formatDeliveryFee(enrichedListing.deliveryFee)} envio</span>
          ) : (
            <span>{formatHoursLabel(enrichedListing)}</span>
          )}
          <span>{statusLabel(enrichedListing.status)}</span>
        </div>
        <div className="offer-actions">
          <Link className="ghost-button" to={`/ofertas/${enrichedListing.id}`}>
            Ver detalle
          </Link>
          <button
            type="button"
            className="primary-button slim"
            disabled={soldOut || expired}
            onClick={() => onReserve(enrichedListing)}
          >
            {isDonation ? "Solicitar" : "Reservar"}
          </button>
        </div>
      </div>
    </article>
  );
}

export function CardGrid({ listings, onReserve, viewerLocation }) {
  return (
    <div className="card-grid">
      {listings.map((listing) => (
        <OfferCard
          key={listing.id}
          listing={listing}
          onReserve={onReserve}
          viewerLocation={viewerLocation}
        />
      ))}
    </div>
  );
}

export function RecommendationStrip({ listings, onReserve, viewerLocation }) {
  return (
    <div className="horizontal-scroll">
      {listings.map((listing) => (
        <OfferCard
          key={listing.id}
          listing={listing}
          compact
          onReserve={onReserve}
          viewerLocation={viewerLocation}
        />
      ))}
    </div>
  );
}
