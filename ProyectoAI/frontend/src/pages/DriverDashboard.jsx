import React, { useEffect, useState } from "react";
import { StatusBadge } from "../components/StatusBadge";
import { DEFAULT_MAP_CENTER, MOCK_DRIVER_DELIVERIES, MOCK_DRIVER_ACTIVE } from "../constants";
import { useMap } from "../hooks/useMap";

export default function DriverDashboard({ onAcceptDelivery, onMarkDelivered, assistantTarget = null }) {
  const [tab, setTab] = useState("available");
  const [availableDeliveries, setAvailableDeliveries] = useState(MOCK_DRIVER_DELIVERIES);
  const [activeDeliveries, setActiveDeliveries] = useState(MOCK_DRIVER_ACTIVE);
  const [deliveryHistory] = useState([
    { id: "h1", code: "PED-301", restaurant: "Restaurante El Sabor", status: "delivered", fee: 5 },
    { id: "h2", code: "PED-302", restaurant: "Pizzeria Napoli", status: "delivered", fee: 6 },
    { id: "h3", code: "PED-303", restaurant: "Panaderia Artesanal", status: "delivered", fee: 4.5 },
    { id: "h4", code: "PED-304", restaurant: "Restaurante El Sabor", status: "delivered", fee: 5 }
  ]);

  useMap("driverMap", tab === "map", DEFAULT_MAP_CENTER);

  const handleAccept = (id) => {
    const delivery = availableDeliveries.find((d) => d.id === id);
    if (!delivery) return;
    setAvailableDeliveries((prev) => prev.filter((d) => d.id !== id));
    setActiveDeliveries((prev) => [...prev, { ...delivery, status: "in_transit", pickupCode: "PICK" + Math.random().toString(36).slice(2, 6).toUpperCase() }]);
    onAcceptDelivery?.(id);
  };

  const handleDeliver = (id) => {
    setActiveDeliveries((prev) => prev.filter((d) => d.id !== id));
    onMarkDelivered?.(id);
  };

  const tabs = [
    { key: "available", label: "Disponibles", icon: "📦" },
    { key: "mine", label: "Mis Repartos", icon: "🚚" },
    { key: "map", label: "Mapa", icon: "🗺️" },
    { key: "history", label: "Historial", icon: "📋" },
    { key: "profile", label: "Perfil", icon: "👤" }
  ];

  useEffect(() => {
    if (assistantTarget?.tab && tabs.some((item) => item.key === assistantTarget.tab)) {
      setTab(assistantTarget.tab);
    }
  }, [assistantTarget]);

  return (
    <div className="page active" id="driverDashboard">
      <div className="container">
        <div className="d-flex align-items-center gap-2 mb-3 flex-wrap" style={{ overflowX: "auto" }}>
          {tabs.map((t) => (
            <button key={t.key} className={`btn btn-sm ${tab === t.key ? "btn-success" : "btn-outline-success"}`} onClick={() => setTab(t.key)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === "available" && (
          <div id="driverAvailable">
            <h5 className="fw-bold mb-3">Repartos disponibles</h5>
            <div className="row g-3">
              {availableDeliveries.map((d) => (
                <div key={d.id} className="col-md-6">
                  <div className="card border-0 shadow-sm hover-card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between">
                        <div>
                          <h6 className="fw-bold mb-1">{d.code}</h6>
                          <small className="text-muted d-block">{d.restaurant}</small>
                          <small className="text-muted d-block">→ {d.destination}</small>
                          <small className="text-muted">Distancia: {d.distance}</small>
                        </div>
                        <div className="text-end">
                          <StatusBadge status="ready" labels={{ ready: "Listo" }} />
                          <div className="fw-bold mt-1" style={{color:"var(--green)"}}>${d.fee.toFixed(2)}</div>
                        </div>
                      </div>
                      <button className="btn btn-success w-100 mt-3" onClick={() => handleAccept(d.id)}>Aceptar reparto</button>
                    </div>
                  </div>
                </div>
              ))}
              {availableDeliveries.length === 0 && <div className="col-12 text-center py-4"><p className="text-muted">No hay mas repartos disponibles.</p></div>}
            </div>
          </div>
        )}

        {tab === "mine" && (
          <div id="driverMine">
            <h5 className="fw-bold mb-3">Mis repartos activos</h5>
            {activeDeliveries.map((d) => (
              <div key={d.id} className="card border-0 shadow-sm mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="fw-bold mb-1">{d.code}</h6>
                      <small className="text-muted d-block">{d.restaurant}</small>
                      <small className="text-muted d-block">Destino: {d.destination}</small>
                      {d.pickupCode && <small className="text-muted">Codigo recogida: <strong>{d.pickupCode}</strong></small>}
                    </div>
                    <span className="status-badge bg-primary">En transito</span>
                  </div>
                  <div className="d-flex gap-2 mt-3">
                    <button className="btn btn-success btn-sm flex-grow-1" onClick={() => handleDeliver(d.id)}>Marcar entregado</button>
                  </div>
                </div>
              </div>
            ))}
            {activeDeliveries.length === 0 && <p className="text-muted text-center py-4">No tienes repartos activos.</p>}
          </div>
        )}

        {tab === "map" && (
          <div id="driverMapPane">
            <div className="card shadow-sm p-4">
              <h5 className="fw-bold mb-3">🗺️ Mapa de ruta</h5>
              <div className="d-flex gap-3 mb-3 flex-wrap">
                <div className="map-stat"><span>📍</span> Origen: Restaurante El Sabor</div>
                <div className="map-stat"><span>🎯</span> Destino: Equipetrol Norte</div>
                <div className="map-stat"><span>🕐</span> 15 min</div>
              </div>
              <div className="map-box" id="driverMap"></div>
            </div>
          </div>
        )}

        {tab === "history" && (
          <div>
            <h5 className="fw-bold mb-3">Historial de repartos</h5>
            {deliveryHistory.map((d) => (
              <div key={d.id} className="card border-0 shadow-sm mb-2">
                <div className="card-body py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{d.code}</strong>
                      <small className="text-muted ms-2">{d.restaurant}</small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <StatusBadge status="delivered" labels={{ delivered: "Entregado" }} />
                      <small className="text-muted">${d.fee.toFixed(2)}</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "profile" && (
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card shadow-sm p-4 text-center">
                <div className="display-4 mb-2">🚚</div>
                <h5 className="fw-bold">Pedro Rodriguez</h5>
                <p className="text-muted small">driver@test.com</p>
                <span className="donation-badge mx-auto">🚚 Repartidor</span>
                <hr />
                <div className="small text-muted">Calificacion: ⭐ 4.8</div>
                <div className="small text-muted">Repartos completados: 156</div>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="card shadow-sm p-4">
                <h5 className="fw-bold mb-3">Informacion del repartidor</h5>
                <form onSubmit={(e) => { e.preventDefault(); alert("Datos guardados (simulado)"); }}>
                  <div className="row g-3">
                    <div className="col-md-6"><label className="form-label small fw-bold">Nombre</label><input className="form-control" defaultValue="Pedro Rodriguez" /></div>
                    <div className="col-md-6"><label className="form-label small fw-bold">Email</label><input className="form-control" defaultValue="driver@test.com" /></div>
                    <div className="col-md-6"><label className="form-label small fw-bold">Telefono</label><input className="form-control" defaultValue="+591 7 456 7890" /></div>
                    <div className="col-md-6"><label className="form-label small fw-bold">Vehiculo</label><select className="form-select" defaultValue="Moto"><option>Moto</option><option>Bicicleta</option><option>Auto</option></select></div>
                    <div className="col-12"><button className="btn btn-success" type="submit">Guardar cambios</button></div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
