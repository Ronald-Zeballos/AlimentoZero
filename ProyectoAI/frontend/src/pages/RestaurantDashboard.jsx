import React, { useEffect, useState } from "react";
import { MetricCard } from "../components/MetricCard";
import { DEFAULT_MAP_CENTER, imageForFood } from "../constants";
import { useMap } from "../hooks/useMap";

export default function RestaurantDashboard({ products = [], orders = [], onUpdateOrderStatus, currentRole, assistantTarget = null }) {
  const [tab, setTab] = useState("summary");
  const [productForm, setProductForm] = useState({
    name: "",
    category: "Comida preparada",
    originalPrice: "",
    rescuePrice: "",
    stock: "1",
    description: "",
    foodCondition: "GOOD",
    listingType: "DISCOUNTED_SALE"
  });
  const [profileForm, setProfileForm] = useState({
    legalName: "Restaurante El Sabor S.R.L.",
    nit: "123456789012",
    phone: "+591 2 244 5678",
    address: "Plaza 24 de Septiembre"
  });
  useMap("restaurantMap", tab === "location", DEFAULT_MAP_CENTER);

  const activeOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status?.toLowerCase()));
  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + Number(p.stock || 0), 0);

  const tabs = [
    { key: "summary", label: "Resumen", icon: "📊" },
    { key: "publish", label: "Publicar", icon: "📦" },
    { key: "products", label: "Productos", icon: "🍽️" },
    { key: "orders", label: "Pedidos", icon: "📋" },
    { key: "fiscal", label: "Donaciones", icon: "📄" },
    { key: "profile", label: "Perfil", icon: "👤" },
    { key: "location", label: "Ubicacion", icon: "📍" }
  ];

  useEffect(() => {
    if (assistantTarget?.tab && tabs.some((item) => item.key === assistantTarget.tab)) {
      setTab(assistantTarget.tab);
    }
    if (assistantTarget?.fill?.form === "product") {
      setProductForm((prev) => ({ ...prev, ...assistantTarget.fill.fields }));
    }
    if (assistantTarget?.fill?.form === "profile") {
      setProfileForm((prev) => ({ ...prev, ...assistantTarget.fill.fields }));
    }
  }, [assistantTarget]);

  const updateProductField = (field, value) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateProfileField = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="page active" id="restaurantDashboard">
      <div className="container">
        <div className="d-flex align-items-center gap-2 mb-3 flex-wrap" style={{ overflowX: "auto" }}>
          {tabs.map((t) => (
            <button key={t.key} className={`btn btn-sm ${tab === t.key ? "btn-success" : "btn-outline-success"}`} onClick={() => setTab(t.key)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Summary */}
        {tab === "summary" && (
          <div id="restaurantSummary">
            <div className="row g-3 mb-4">
              <div className="col-6 col-md-3"><MetricCard label="Ofertas Activas" value={totalProducts} sub={`${totalStock} porciones disponibles`} icon="🍽️" /></div>
              <div className="col-6 col-md-3"><MetricCard label="Pedidos Pendientes" value={activeOrders.length} icon="📋" color="var(--soft-amber)" /></div>
              <div className="col-6 col-md-3"><MetricCard label="Alimentos Rescatados" value="3,210 kg" sub="Este mes" icon="🌱" color="var(--soft-blue)" /></div>
              <div className="col-6 col-md-3"><MetricCard label="CO2 Evitado" value="1,280 kg" icon="🌍" color="#f0fdf4" /></div>
            </div>
            <div className="card shadow-sm p-4 mb-4">
              <h5 className="fw-bold mb-3">Tu impacto</h5>
              <div className="row g-3">
                <div className="col-md-4 text-center"><div className="fw-bold fs-3" style={{color:"var(--green)"}}>1,240</div><small className="text-muted">Comidas Rescatadas</small></div>
                <div className="col-md-4 text-center"><div className="fw-bold fs-3" style={{color:"var(--green)"}}>$12,400</div><small className="text-muted">En deducciones fiscales</small></div>
                <div className="col-md-4 text-center"><div className="fw-bold fs-3" style={{color:"var(--green)"}}>85%</div><small className="text-muted">Tasa de exito</small></div>
              </div>
            </div>
          </div>
        )}

        {/* Publish */}
        {tab === "publish" && (
          <div className="row" id="restaurantProductFormCard">
            <div className="col-lg-8">
              <div className="card shadow-sm p-4">
                <h5 className="fw-bold mb-3">Publicar nueva oferta</h5>
                <form onSubmit={(e) => { e.preventDefault(); alert("Oferta publicada (simulado)"); }}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Nombre del producto</label>
                      <input className="form-control" placeholder="Ej: Pizza Margherita" value={productForm.name} onChange={(e) => updateProductField("name", e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Categoria</label>
                      <select className="form-select" value={productForm.category} onChange={(e) => updateProductField("category", e.target.value)}><option>Comida preparada</option><option>Panaderia</option><option>Bebidas</option><option>Frutas y verduras</option></select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Precio original</label>
                      <input className="form-control" placeholder="$0.00" value={productForm.originalPrice} onChange={(e) => updateProductField("originalPrice", e.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Precio rescate</label>
                      <input className="form-control" placeholder="$0.00" value={productForm.rescuePrice} onChange={(e) => updateProductField("rescuePrice", e.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Stock</label>
                      <input className="form-control" type="number" placeholder="1" min="1" value={productForm.stock} onChange={(e) => updateProductField("stock", e.target.value)} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold">Descripcion</label>
                      <textarea className="form-control" rows="2" placeholder="Describe el producto..." value={productForm.description} onChange={(e) => updateProductField("description", e.target.value)}></textarea>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Condicion del alimento</label>
                      <select className="form-select" value={productForm.foodCondition} onChange={(e) => updateProductField("foodCondition", e.target.value)}><option value="GOOD">Buen estado</option><option value="EXPIRING_SOON">Por vencer</option><option value="DAMAGED">Danado</option></select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Tipo de oferta</label>
                      <div className="d-flex gap-3 mt-2">
                        <div className="form-check"><input className="form-check-input" type="radio" name="listingType" id="typeSale" checked={productForm.listingType !== "DONATION"} onChange={() => updateProductField("listingType", "DISCOUNTED_SALE")} /><label className="form-check-label" htmlFor="typeSale">Venta con descuento</label></div>
                        <div className="form-check"><input className="form-check-input" type="radio" name="listingType" id="typeDonation" checked={productForm.listingType === "DONATION"} onChange={() => updateProductField("listingType", "DONATION")} /><label className="form-check-label" htmlFor="typeDonation">Donacion</label></div>
                      </div>
                    </div>
                    <div className="col-12">
                      <button className="btn btn-success w-100">Publicar oferta</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card shadow-sm p-4" style={{ background: "var(--soft-green)" }}>
                <h6 className="fw-bold mb-2">💡 Consejo</h6>
                <p className="small text-muted mb-0">Las ofertas con descuento del 30-50% tienen mayor tasa de exito. Las donaciones generan certificados fiscales deducibles de impuestos.</p>
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        {tab === "products" && (
          <div id="restaurantProductsCard">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Tus productos ({products.length})</h5>
              <input className="form-control form-control-sm" style={{maxWidth:220}} placeholder="Buscar producto..." />
            </div>
            <div className="row g-3">
              {products.map((p) => (
                <div key={p.id} className="col-6 col-md-4 col-lg-3">
                  <div className="card border-0 shadow-sm hover-card p-3">
                    <img className="food-thumb mb-2" src={p.imageUrl || imageForFood(p.name)} alt={p.name} />
                    <h6 className="fw-bold text-center text-truncate mb-0">{p.name}</h6>
                    <div className="text-center text-muted small">Stock: {p.stock} | ${Number(p.price).toFixed(2)}</div>
                    <div className="d-flex gap-1 mt-2">
                      <button className={`btn btn-sm ${p.status === "PUBLISHED" ? "btn-success" : "btn-outline-success"} flex-grow-1`}>{p.status === "PUBLISHED" ? "Activo" : "Inactivo"}</button>
                      <button className="btn btn-sm btn-outline-danger">🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
              {products.length === 0 && <div className="col-12 text-center py-5"><p className="text-muted">No tienes productos publicados aun.</p><button className="btn btn-success" onClick={() => setTab("publish")}>Publicar primer producto</button></div>}
            </div>
          </div>
        )}

        {/* Orders */}
        {tab === "orders" && (
          <div id="restaurantOrdersCard">
            <h5 className="fw-bold mb-3">Pedidos recientes</h5>
            {orders.map((o) => {
              const statusLabels = { confirmed: "CONFIRMADO", preparing: "PREPARANDO", ready: "LISTO", picked_up: "RETIRADO", delivered: "ENTREGADO" };
              const statusBadge = { confirmed: "bg-warning text-dark", preparing: "bg-info text-dark", ready: "bg-success", picked_up: "bg-primary", delivered: "bg-secondary" };
              const statusKey = o.status?.toLowerCase() || "confirmed";
              return (
                <div key={o.id} className="card border-0 shadow-sm mb-3">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-3 min-w-0">
                        <img className="order-thumb" src={o.items?.[0]?.imageUrl || imageForFood(o.items?.[0]?.name)} alt={o.items?.[0]?.name || "Pedido"} />
                        <div><strong>{o.items?.[0]?.name || "Pedido"}</strong> x{o.items?.[0]?.qty || 1}</div>
                      </div>
                      <span className={`status-badge ${statusBadge[statusKey]}`}>{statusLabels[statusKey] || o.status}</span>
                    </div>
                    <div className="d-flex gap-2 mt-2">
                      {statusKey === "confirmed" && <button className="btn btn-sm btn-success" onClick={() => onUpdateOrderStatus?.(o.id, "preparing")}>Marcar Preparando</button>}
                      {statusKey === "preparing" && <button className="btn btn-sm btn-success" onClick={() => onUpdateOrderStatus?.(o.id, "ready")}>Marcar Listo</button>}
                      {statusKey === "ready" && <button className="btn btn-sm btn-primary" onClick={() => onUpdateOrderStatus?.(o.id, "picked_up")}>Marcar Retirado</button>}
                      {o.pickupCode && <small className="text-muted">Codigo recogida: <strong>{o.pickupCode}</strong></small>}
                    </div>
                  </div>
                </div>
              );
            })}
            {orders.length === 0 && <p className="text-muted text-center py-4">No hay pedidos aun.</p>}
          </div>
        )}

        {/* Fiscal */}
        {tab === "fiscal" && (
          <div id="restaurantFiscalCard">
            <div className="row g-4">
              <div className="col-lg-8">
                <div className="card shadow-sm p-4">
                  <h5 className="fw-bold mb-3">Certificados de Donacion</h5>
                  <div className="table-responsive">
                    <table className="table table-hover small">
                      <thead><tr><th>Fecha</th><th>Producto</th><th>Cantidad</th><th>Valor</th><th>Certificado</th></tr></thead>
                      <tbody>
                        {products.filter((p) => p.isDonation).map((p) => (
                          <tr key={p.id}><td>—</td><td>{p.name}</td><td>{p.stock}</td><td>${Number(p.donationValue || p.price).toFixed(2)}</td><td><button className="btn btn-sm btn-outline-success">Descargar</button></td></tr>
                        ))}
                        {products.filter((p) => p.isDonation).length === 0 && <tr><td colSpan="5" className="text-center text-muted">No hay donaciones registradas aun.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="card shadow-sm p-4" style={{ background: "var(--soft-green)" }}>
                  <h6 className="fw-bold mb-2">💡 Beneficios Fiscales</h6>
                  <p className="small text-muted">Las donaciones de alimentos pueden ser deducibles de impuestos. Descarga tus certificados para presentarlos en tu declaracion anual.</p>
                  <hr />
                  <div className="text-center"><div className="fw-bold fs-4" style={{color:"var(--green)"}}>$12,400</div><small className="text-muted">Total deducible este ano</small></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile */}
        {tab === "profile" && (
          <div id="restaurantProfile" className="row g-4">
            <div className="col-lg-4">
              <div className="card shadow-sm p-4 text-center">
                <div className="display-4 mb-2">🏪</div>
                <h5 className="fw-bold">Restaurante El Sabor</h5>
                <p className="text-muted small">rest@test.com</p>
                <span className="donation-badge mx-auto">🍽️ Restaurante</span>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="card shadow-sm p-4">
                <h5 className="fw-bold mb-3">Datos fiscales</h5>
                <form onSubmit={(e) => { e.preventDefault(); alert("Datos guardados (simulado)"); }}>
                  <div className="row g-3">
                    <div className="col-md-6"><label className="form-label small fw-bold">Razon Social</label><input className="form-control" value={profileForm.legalName} onChange={(e) => updateProfileField("legalName", e.target.value)} /></div>
                    <div className="col-md-6"><label className="form-label small fw-bold">NIT</label><input className="form-control" value={profileForm.nit} onChange={(e) => updateProfileField("nit", e.target.value)} /></div>
                    <div className="col-md-6"><label className="form-label small fw-bold">Telefono</label><input className="form-control" value={profileForm.phone} onChange={(e) => updateProfileField("phone", e.target.value)} /></div>
                    <div className="col-md-6"><label className="form-label small fw-bold">Direccion</label><input className="form-control" value={profileForm.address} onChange={(e) => updateProfileField("address", e.target.value)} /></div>
                    <div className="col-12"><button className="btn btn-success">Guardar cambios</button></div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Location */}
        {tab === "location" && (
          <div id="restaurantLocation" className="card shadow-sm p-4">
            <h5 className="fw-bold mb-3">Ubicacion del restaurante</h5>
            <div className="map-box" id="restaurantMap"></div>
            <div className="mt-3">
              <small className="text-muted">Plaza 24 de Septiembre, Santa Cruz de la Sierra</small>
              <button className="btn btn-sm btn-outline-success ms-2">Actualizar ubicacion</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
