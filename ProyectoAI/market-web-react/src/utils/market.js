export function estimateDistance(listing) {
  return listing.city?.toLowerCase().includes("la paz") ? 1.6 : 3.2;
}

export function hoursToExpire(listing) {
  return Math.max(
    0,
    Math.round((new Date(listing.expirationDate).getTime() - Date.now()) / 36e5)
  );
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
    return "Sin perfil operativo";
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
      return "Audita el tenant y monitorea capacidad general.";
    default:
      return "Perfil cargado desde IAM.";
  }
}
