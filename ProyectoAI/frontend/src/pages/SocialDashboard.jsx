import React, { useEffect, useState } from "react";
import { MetricCard } from "../components/MetricCard";
import { StatusBadge } from "../components/StatusBadge";
import { imageForFood, money } from "../constants";

export default function SocialDashboard({ donationRequests = [], onRequestDonation, products = [], assistantTarget = null }) {
  const [tab, setTab] = useState("available");

  const donationProducts = products.filter((p) => p.isDonation);

  const tabs = [
    { key: "available", label: "Disponibles", icon: "🎁" },
    { key: "requests", label: "Solicitudes", icon: "📋" },
    { key: "impact", label: "Impacto", icon: "🌱" },
    { key: "profile", label: "Perfil", icon: "👤" }
  ];

  useEffect(() => {
    if (assistantTarget?.tab && tabs.some((item) => item.key === assistantTarget.tab)) {
      setTab(assistantTarget.tab);
    }
  }, [assistantTarget]);

  return (
    <div className="page active" id="socialDashboard">
      <div className="container">
        <div className="d-flex align-items-center gap-2 mb-3 flex-wrap" style={{ overflowX: "auto" }}>
          {tabs.map((t) => (
            <button key={t.key} className={`btn btn-sm ${tab === t.key ? "btn-success" : "btn-outline-success"}`} onClick={() => setTab(t.key)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === "available" && (
          <div id="socialAvailable">
            <h5 className="fw-bold mb-3">Donaciones disponibles para solicitar</h5>
            <div className="row g-3">
              {donationProducts.map((p) => (
                <div key={p.id} className="col-md-6">
                  <div className="card border-0 shadow-sm hover-card">
                    <div className="card-body">
                      <div className="d-flex gap-3">
                        <img className="order-thumb" src={p.imageUrl || imageForFood(p.name)} alt={p.name} />
                        <div className="flex-grow-1 min-w-0">
                          <h6 className="fw-bold mb-1 text-truncate">{p.name}</h6>
                          <small className="text-muted d-block">{p.restaurant || "Restaurante"}</small>
                          <div className="d-flex gap-2 mt-1">
                            <span className="donation-badge">Donacion</span>
                            {p.stock > 0 && <small className="text-muted">{p.stock} disponibles</small>}
                          </div>
                          {p.donationValue > 0 && <small className="text-muted d-block">Valor estimado: {money(p.donationValue)}</small>}
                          <button className="btn btn-success btn-sm mt-2" onClick={() => onRequestDonation?.(p)}>Solicitar donacion</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {donationProducts.length === 0 && (
                <div className="col-12 text-center py-5">
                  <p className="text-muted">No hay donaciones disponibles en este momento.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "requests" && (
          <div id="socialRequests">
            <h5 className="fw-bold mb-3">Solicitudes realizadas</h5>
            {donationRequests.map((r) => (
              <div key={r.id} className="card border-0 shadow-sm mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="fw-bold mb-1">{r.product || "Producto"} x{r.qty}</h6>
                      <small className="text-muted d-block">{r.people} personas beneficiadas</small>
                    </div>
                    <StatusBadge status={r.status} labels={{ "En revision": "En revision", Aprobada: "Aprobada" }} />
                  </div>
                  {r.status === "En revision" && <button className="btn btn-sm btn-success mt-2">Ver detalle</button>}
                  {r.status === "Aprobada" && <button className="btn btn-sm btn-outline-success mt-2">Coordinacion</button>}
                </div>
              </div>
            ))}
            {donationRequests.length === 0 && <p className="text-muted text-center py-4">No has realizado solicitudes aun.</p>}
          </div>
        )}

        {tab === "impact" && (
          <div>
            <div className="row g-3 mb-4">
              <div className="col-6 col-md-3"><MetricCard label="Alimentos Rescatados" value="4,500 kg" icon="🌱" /></div>
              <div className="col-6 col-md-3"><MetricCard label="Personas Beneficiadas" value="2,340" icon="👥" color="var(--soft-blue)" /></div>
              <div className="col-6 col-md-3"><MetricCard label="Comidas Distribuidas" value="8,200" icon="🍽️" color="var(--soft-amber)" /></div>
              <div className="col-6 col-md-3"><MetricCard label="CO2 Evitado" value="1,780 kg" icon="🌍" color="#f0fdf4" /></div>
            </div>
            <div className="card shadow-sm p-4">
              <h5 className="fw-bold mb-3">Impacto mensual</h5>
              <div className="table-responsive">
                <table className="table table-hover small">
                  <thead><tr><th>Mes</th><th>Alimentos (kg)</th><th>Comidas</th><th>Personas</th><th>CO2 evitado</th></tr></thead>
                  <tbody>
                    <tr><td>Enero 2026</td><td>520</td><td>1,040</td><td>280</td><td>205 kg</td></tr>
                    <tr><td>Febrero 2026</td><td>480</td><td>960</td><td>260</td><td>190 kg</td></tr>
                    <tr><td>Marzo 2026</td><td>610</td><td>1,220</td><td>340</td><td>240 kg</td></tr>
                    <tr className="fw-bold"><td>Total</td><td>4,500</td><td>8,200</td><td>2,340</td><td>1,780 kg</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "profile" && (
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card shadow-sm p-4 text-center">
                <div className="display-4 mb-2">🤝</div>
                <h5 className="fw-bold">Banco de Alimentos Santa Cruz</h5>
                <p className="text-muted small">social@test.com</p>
                <span className="donation-badge mx-auto">🤝 Entidad Social</span>
                <hr />
                <div className="small text-muted">Personas asistidas: 2,340</div>
                <div className="small text-muted">Voluntarios activos: 45</div>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="card shadow-sm p-4">
                <h5 className="fw-bold mb-3">Informacion de la organizacion</h5>
                <form onSubmit={(e) => { e.preventDefault(); alert("Datos guardados (simulado)"); }}>
                  <div className="row g-3">
                    <div className="col-md-6"><label className="form-label small fw-bold">Nombre de la organizacion</label><input className="form-control" value="Banco de Alimentos Santa Cruz" /></div>
                    <div className="col-md-6"><label className="form-label small fw-bold">NIT</label><input className="form-control" value="987654321012" /></div>
                    <div className="col-md-6"><label className="form-label small fw-bold">Email</label><input className="form-control" value="social@test.com" /></div>
                    <div className="col-md-6"><label className="form-label small fw-bold">Telefono</label><input className="form-control" value="+591 2 333 4444" /></div>
                    <div className="col-12"><label className="form-label small fw-bold">Direccion</label><input className="form-control" value="Calle Solidaridad 789" /></div>
                    <div className="col-12"><button className="btn btn-success">Guardar cambios</button></div>
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
