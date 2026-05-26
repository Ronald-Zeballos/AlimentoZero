import { useEffect, useMemo, useState } from "react";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  buildNearbyListingModel,
  formatDeliveryFee,
  formatMoney,
  resolveLocationLabel
} from "../utils/market";

function MapViewportController({ geo, selectedListing }) {
  const map = useMap();

  useEffect(() => {
    if (selectedListing) {
      map.flyTo([selectedListing.latitude, selectedListing.longitude], 14, {
        animate: true,
        duration: 0.8
      });
      return;
    }

    map.setView([geo.latitude, geo.longitude], 13);
  }, [geo.latitude, geo.longitude, map, selectedListing]);

  return null;
}

export function LocationMapPanel({
  geo,
  title = "Encuentra packs cerca de ti",
  listings = []
}) {
  const [selectedId, setSelectedId] = useState("");
  const nearbyModel = useMemo(
    () => buildNearbyListingModel(listings, geo.location, { limit: 12 }),
    [geo.location, listings]
  );
  const selectedListing =
    nearbyModel.listings.find((listing) => listing.id === selectedId) ||
    nearbyModel.listings[0] ||
    null;

  return (
    <section className="location-card">
      <div className="panel-card__header">
        <div>
          <p className="eyebrow">Mapa real</p>
          <h3>{title}</h3>
        </div>
        <button
          type="button"
          className="ghost-button"
          onClick={geo.requestLocation}
          disabled={geo.status === "loading"}
        >
          {geo.status === "loading"
            ? "Buscando..."
            : geo.hasRealLocation
              ? "Actualizar ubicacion"
              : "Usar mi ubicacion"}
        </button>
      </div>
      <p className="helper-text">
        {geo.hasRealLocation
          ? `Mostrando restaurantes y locales cerca de ${resolveLocationLabel(geo.location)}.`
          : "Tomamos Santa Cruz como referencia inicial. Si compartes tu ubicacion, la app prioriza opciones cercanas y con reparto mas conveniente."}
      </p>
      {geo.error ? <p className="helper-text">{geo.error}</p> : null}
      <div className="delivery-summary">
        <article className="delivery-stat">
          <strong>{nearbyModel.coverageKm} km</strong>
          <span>radio recomendado</span>
        </article>
        <article className="delivery-stat">
          <strong>{nearbyModel.listings.length}</strong>
          <span>locales cercanos</span>
        </article>
        <article className="delivery-stat">
          <strong>{selectedListing ? formatDeliveryFee(selectedListing.deliveryFee) : "BOB 0"}</strong>
          <span>entrega estimada</span>
        </article>
      </div>
      <div className="map-layout">
        <div className="map-frame map-frame-live">
          <MapContainer
            center={[geo.location.latitude, geo.location.longitude]}
            zoom={13}
            scrollWheelZoom
            className="leaflet-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Circle
              center={[geo.location.latitude, geo.location.longitude]}
              radius={nearbyModel.coverageKm * 1000}
              pathOptions={{
                color: "#ff5f4a",
                fillColor: "#ff7b1a",
                fillOpacity: 0.1,
                weight: 2
              }}
            />
            <CircleMarker
              center={[geo.location.latitude, geo.location.longitude]}
              radius={10}
              pathOptions={{
                color: "#1d4ed8",
                fillColor: "#2563eb",
                fillOpacity: 0.95,
                weight: 2
              }}
            >
              <Popup>Tu ubicacion</Popup>
            </CircleMarker>
            {nearbyModel.listings.map((listing) => (
              <CircleMarker
                key={listing.id}
                center={[listing.latitude, listing.longitude]}
                radius={listing.id === selectedListing?.id ? 10 : 8}
                eventHandlers={{
                  click: () => setSelectedId(listing.id)
                }}
                pathOptions={{
                  color: listing.id === selectedListing?.id ? "#df1f4d" : "#ff7b1a",
                  fillColor: listing.id === selectedListing?.id ? "#ff2f5e" : "#ff9a3c",
                  fillOpacity: 0.95,
                  weight: 2
                }}
              >
                <Popup>
                  <strong>{listing.title}</strong>
                  <br />
                  {listing.distanceKm} km · {formatDeliveryFee(listing.deliveryFee)}
                </Popup>
              </CircleMarker>
            ))}
            <MapViewportController geo={geo.location} selectedListing={selectedListing} />
          </MapContainer>
        </div>
        <div className="map-sidepanel">
          {selectedListing ? (
            <article className="map-spotlight">
              <strong>{selectedListing.title}</strong>
              <p>{selectedListing.city} · {selectedListing.address}</p>
              <p>
                {selectedListing.category} · {selectedListing.distanceKm} km ·{" "}
                {formatMoney(selectedListing.rescuePrice, selectedListing.currency)}
              </p>
              <p>Entrega estimada: {formatDeliveryFee(selectedListing.deliveryFee)}</p>
            </article>
          ) : null}
          <p className="map-sidepanel__hint">
            Priorizamos opciones dentro de una cobertura corta para no inflar el costo del
            repartidor.
          </p>
          <div className="map-list">
            {nearbyModel.listings.slice(0, 6).map((listing) => (
              <button
                type="button"
                className={
                  listing.id === selectedListing?.id ? "map-listing active" : "map-listing"
                }
                key={listing.id}
                onClick={() => setSelectedId(listing.id)}
              >
                <strong>{listing.title}</strong>
                <span>
                  {listing.distanceKm} km · {formatDeliveryFee(listing.deliveryFee)} ·{" "}
                  {listing.category}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
