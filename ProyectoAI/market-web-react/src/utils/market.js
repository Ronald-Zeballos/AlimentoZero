import { ROLE_COPY, ROLE_HOME_PATHS } from "../constants";

export function estimateDistance(listing) {
  return listing.city?.toLowerCase().includes("santa cruz") ? 1.8 : 3.2;
}

export function extractZoneLabel(listing) {
  const address = listing?.address || "";
  if (address.toLowerCase().startsWith("zona ")) {
    return address.split(",")[0].replace(/^zona\s+/i, "");
  }

  return address.split(",")[0] || "Centro";
}

export function distanceBetween(origin, destination) {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLatitude = toRadians(destination.latitude - origin.latitude);
  const deltaLongitude = toRadians(destination.longitude - origin.longitude);
  const latitudeOne = toRadians(origin.latitude);
  const latitudeTwo = toRadians(destination.latitude);

  const a =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
    Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2) *
      Math.cos(latitudeOne) *
      Math.cos(latitudeTwo);

  return Number((earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))).toFixed(1));
}

export function hoursToExpire(listing) {
  return Math.max(
    0,
    Math.round((new Date(listing.expirationDate).getTime() - Date.now()) / 36e5)
  );
}

export function quantityRemaining(listing) {
  return Math.max(
    0,
    Number(listing.quantityAvailable ?? 0) - Number(listing.quantityReserved ?? 0)
  );
}

export function isCriticalListing(listing) {
  return hoursToExpire(listing) <= 4 || quantityRemaining(listing) <= 2;
}

export function sortByUrgency(listings = []) {
  return [...listings].sort((left, right) => {
    const rightScore = Number(isCriticalListing(right)) * 100 - hoursToExpire(right);
    const leftScore = Number(isCriticalListing(left)) * 100 - hoursToExpire(left);
    return rightScore - leftScore;
  });
}

export function mapRecommendationCandidate(listing) {
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

export function formatMoney(value, currency = "BOB") {
  if (Number(value) === 0) {
    return "Gratis";
  }

  return `${currency} ${Number(value).toFixed(0)}`;
}

export function formatHoursLabel(listing) {
  const hours = hoursToExpire(listing);
  return hours <= 1 ? "Retira hoy" : `${hours} h`;
}

export function statusLabel(status) {
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

export function formatPickupLabel(start, end, city) {
  return `${city} | ${new Date(start).toLocaleString("es-BO")} - ${new Date(end).toLocaleTimeString(
    "es-BO",
    {
      hour: "2-digit",
      minute: "2-digit"
    }
  )}`;
}

export function resolveProfileNarrative(profile) {
  if (!profile) {
    return "Elige una vista para recorrer la experiencia.";
  }

  switch (profile.actorType) {
    case "BUYER":
      return "Explora packs, reserva rapido y confirma retiros.";
    case "MERCHANT":
      return "Gestiona excedentes, margen y conversion comercial.";
    case "NGO":
      return "Solicita donaciones y coordina recepcion social.";
    case "TRANSPORTER":
      return "Toma rutas urgentes y confirma trazabilidad logistica.";
    case "COORDINATOR":
      return "Prioriza casos y supervisa la operacion transversal.";
    case "ADMIN":
      return "Audita la operacion y monitorea la capacidad general.";
    default:
      return "Vista disponible en la experiencia.";
  }
}

export function resolveAudienceLabel(profile) {
  switch (profile?.actorType) {
    case "BUYER":
      return "Cliente";
    case "MERCHANT":
      return "Tienda aliada";
    case "NGO":
      return "Organizacion social";
    case "TRANSPORTER":
      return "Reparto";
    case "COORDINATOR":
      return "Operaciones";
    case "ADMIN":
      return "Panel de control";
    default:
      return "Modo de prueba";
  }
}

export function resolveProfileDisplayName(profile) {
  switch (profile?.profileKey) {
    case "BUYER_NEIGHBOR":
      return "Vecina compradora";
    case "MERCHANT_BAKERY":
      return "Panaderia aliada";
    case "NGO_FOOD_BANK":
      return "Banco de alimentos";
    case "TRANSPORT_LAST_MILE":
      return "Operador de reparto";
    case "COORDINATOR_CITY":
      return "Centro de operaciones";
    case "ADMIN_TENANT":
      return "Panel de control";
    default:
      return profile?.displayName || "Vista demo";
  }
}

export function resolveRoleDisplayName(role) {
  const rawName = role?.displayName || role?.name || "";

  switch (rawName) {
    case "USER_BUYER":
    case "Comprador":
      return "Compra y retiro";
    case "MERCHANT":
    case "Negocio":
      return "Gestion de tienda";
    case "NGO_RECEIVER":
    case "Receptor social":
      return "Recepcion solidaria";
    case "TRANSPORTER":
    case "Transportista":
      return "Logistica";
    case "COORDINATOR":
    case "Coordinador":
      return "Supervision operativa";
    case "ADMIN":
      return "Configuracion avanzada";
    default:
      return rawName;
  }
}

export function resolveRoleHint(role) {
  if (Array.isArray(role?.capabilities) && role.capabilities.length > 0) {
    return role.capabilities.slice(0, 2).join(" | ");
  }

  switch (role?.name) {
    case "USER_BUYER":
      return "Reservas, pedidos y seguimiento";
    case "MERCHANT":
      return "Publicacion, inventario e impacto";
    case "NGO_RECEIVER":
      return "Solicitudes y aprobaciones";
    case "TRANSPORTER":
      return "Rutas, retiros e incidencias";
    case "COORDINATOR":
      return "Monitoreo y priorizacion";
    case "ADMIN":
      return "Control general de la demo";
    default:
      return "Acceso disponible";
  }
}

export function resolveRoleHomePath(profile) {
  return ROLE_HOME_PATHS[profile?.actorType] || ROLE_HOME_PATHS.BUYER;
}

export function resolveRoleCopy(profile) {
  return ROLE_COPY[profile?.actorType] || ROLE_COPY.BUYER;
}

export function categoryShare(listings = []) {
  const counts = listings.reduce((accumulator, listing) => {
    accumulator[listing.category] = (accumulator[listing.category] || 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(counts)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
    .map(([category, total]) => ({
      category,
      total
    }));
}

export function sortByDistance(listings = [], origin) {
  if (!origin) {
    return listings;
  }

  return [...listings].sort(
    (left, right) =>
      distanceBetween(origin, left) - distanceBetween(origin, right)
  );
}

export function estimateDeliveryFee(distanceKm) {
  if (!Number.isFinite(Number(distanceKm))) {
    return 0;
  }

  const normalizedDistance = Math.max(0, Number(distanceKm));
  if (normalizedDistance <= 1.5) {
    return 4;
  }
  if (normalizedDistance <= 3) {
    return 6;
  }

  return Math.round(6 + (normalizedDistance - 3) * 1.6);
}

export function formatDeliveryFee(fee) {
  return `BOB ${Number(fee || 0).toFixed(0)}`;
}

export function enrichListingForViewer(listing, origin) {
  const distanceKm = origin ? distanceBetween(origin, listing) : estimateDistance(listing);
  return {
    ...listing,
    distanceKm,
    deliveryFee: estimateDeliveryFee(distanceKm)
  };
}

export function buildNearbyListingModel(
  listings = [],
  origin,
  { limit = 18, minVisible = 8, radiusOptions = [3, 5, 7, 9] } = {}
) {
  const decorated = sortByDistance(listings, origin).map((listing) =>
    enrichListingForViewer(listing, origin)
  );

  if (decorated.length === 0) {
    return {
      coverageKm: radiusOptions[0] || 3,
      listings: []
    };
  }

  let coverageKm = radiusOptions[radiusOptions.length - 1] || 9;
  for (const candidate of radiusOptions) {
    const visibleCount = decorated.filter((listing) => listing.distanceKm <= candidate).length;
    if (visibleCount >= minVisible || candidate === radiusOptions[radiusOptions.length - 1]) {
      coverageKm = candidate;
      break;
    }
  }

  const nearbyListings = decorated.filter((listing) => listing.distanceKm <= coverageKm);
  return {
    coverageKm,
    listings: nearbyListings.slice(0, limit)
  };
}

export function resolveLocationLabel(location) {
  if (!location) {
    return "Santa Cruz de la Sierra";
  }

  const isSantaCruz =
    location.latitude >= -17.95 &&
    location.latitude <= -17.65 &&
    location.longitude >= -63.35 &&
    location.longitude <= -63.0;

  if (isSantaCruz) {
    return "Santa Cruz de la Sierra";
  }

  return `${location.latitude}, ${location.longitude}`;
}
