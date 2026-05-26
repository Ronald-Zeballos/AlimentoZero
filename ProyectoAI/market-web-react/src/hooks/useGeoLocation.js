import { useEffect, useState } from "react";
import { resolveLocationLabel } from "../utils/market";

const LOCATION_KEY = "market.viewer.location";
const DEFAULT_LOCATION = {
  latitude: -17.7833,
  longitude: -63.1821,
  label: "Santa Cruz de la Sierra"
};

function loadStoredLocation() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(LOCATION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function useGeoLocation() {
  const [location, setLocation] = useState(() => loadStoredLocation());
  const [status, setStatus] = useState(location ? "granted" : "idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && location) {
      window.localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
    }
  }, [location]);

  function requestLocation() {
    if (!navigator.geolocation) {
      setStatus("denied");
      setError("Tu navegador no soporta ubicacion.");
      return;
    }

    setStatus("loading");
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = Number(position.coords.latitude.toFixed(5));
        const longitude = Number(position.coords.longitude.toFixed(5));
        setLocation({
          latitude,
          longitude,
          label: resolveLocationLabel({ latitude, longitude })
        });
        setStatus("granted");
      },
      () => {
        setStatus("denied");
        setError("No pudimos acceder a tu ubicacion. Puedes seguir con el mapa de referencia.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }

  return {
    location: location || DEFAULT_LOCATION,
    hasRealLocation: Boolean(location),
    status,
    error,
    requestLocation
  };
}
