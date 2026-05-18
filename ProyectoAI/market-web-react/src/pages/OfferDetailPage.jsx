import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchListingById } from "../api";
import { DEFAULT_IMAGE } from "../constants";
import { LoadingState } from "../components/StateViews";
import { formatMoney, statusLabel } from "../utils/market";

export function OfferDetailPage({ listings, onReserve, onToast }) {
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
      <div className="page-container">
        <LoadingState />
      </div>
    );
  }

  const isDonation = listing.listingType === "DONATION";

  return (
    <div className="page-container">
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
          <li>
            Ubicacion: {listing.address}, {listing.city}
          </li>
          <li>
            Impacto: {listing.mealsEquivalent} raciones | {listing.kgRescued} kg rescatados
          </li>
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
            onClick={() => onToast("Mapa, QR y compartir quedan listos para el siguiente corte.")}
          >
            Compartir / Mapa
          </button>
        </div>
      </div>
    </div>
  );
}
