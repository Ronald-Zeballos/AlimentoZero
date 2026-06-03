import { useEffect, useRef } from "react";
import L from "leaflet";
import { DEFAULT_MAP_CENTER } from "../constants";

export function useMap(containerId, visible, center = DEFAULT_MAP_CENTER, zoom = 14) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!visible) return;

    const el = document.getElementById(containerId);
    if (!el || el._leaflet_map) return;

    const map = L.map(el).setView(center, zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19
    }).addTo(map);

    L.marker(center).addTo(map).bindPopup("AlimentoZero");

    mapRef.current = map;
    el._leaflet_map = true;

    return () => {
      map.remove();
      delete el._leaflet_map;
      mapRef.current = null;
    };
  }, [visible, containerId, JSON.stringify(center), zoom]);

  return mapRef;
}
