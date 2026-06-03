import React, { useState, useMemo, useCallback, useEffect } from "react";
import { MetricCard } from "../components/MetricCard";
import { StatusBadge } from "../components/StatusBadge";
import { DEFAULT_MAP_CENTER, imageForFood, normalizeText, money, STATUS_LABELS } from "../constants";
import { useMap } from "../hooks/useMap";

export default function BuyerDashboard({ products = [], orders = [], addToCart, cart = [], assistantTarget = null }) {
  const [tab, setTab] = useState("offers");
  const [searchTerm, setSearchTerm] = useState("");
  const [catFilter, setCatFilter] = useState("");

  useMap("buyerMap", tab === "restaurants", DEFAULT_MAP_CENTER);
  useMap("buyerTrackMap", tab === "track", DEFAULT_MAP_CENTER);
  useMap("buyerLocationMap", tab === "location", DEFAULT_MAP_CENTER);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.cat));
    return Array.from(cats).filter(Boolean);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = normalizeText(searchTerm);
    return products.filter((p) => {
      if (term && !normalizeText(p.name).includes(term)) return false;
      if (catFilter && p.cat !== catFilter) return false;
      return !p.isDonation;
    });
  }, [products, searchTerm, catFilter]);

  const handleAddToCart = useCallback((product) => {
    addToCart(product);
  }, [addToCart]);

  const tabs = [
    { key: "offers", label: "Ofertas", icon: "🔥" },
    { key: "search", label: "Buscar", icon: "🔍" },
    { key: "restaurants", label: "Restaurantes", icon: "🏪" },
    { key: "orders", label: "Mis Pedidos", icon: "📋" },
    { key: "track", label: "Seguimiento", icon: "📍" },
    { key: "location", label: "Ubicacion", icon: "📍" },
    { key: "profile", label: "Perfil", icon: "👤" }
  ];

  useEffect(() => {
    if (assistantTarget?.tab && tabs.some((item) => item.key === assistantTarget.tab)) {
      setTab(assistantTarget.tab);
    }
  }, [assistantTarget]);

  return (
    <div className="page active" id="buyerDashboard">
      <div className="container">
        <div className="d-flex align-items-center gap-2 mb-3 flex-wrap" style={{ overflowX: "auto" }}>
          {tabs.map((t) => (
            <button key={t.key} className={`btn btn-sm ${tab === t.key ? "btn-success" : "btn-outline-success"}`} onClick={() => setTab(t.key)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Offers */}
        {tab === "offers" && (
          <div id="buyerOffers">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <h5 className="fw-bold mb-0">🔥 Ofertas disponibles</h5>
              <div className="d-flex gap-2">
                <input className="form-control form-control-sm" style={{maxWidth:180}} placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <select className="form-select form-select-sm" style={{maxWidth:150}} value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
                  <option value="">Todas</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="row g-3">
              {filteredProducts.map((p) => (
                <ProductGridCard key={p.id} product={p} onAdd={() => handleAddToCart(p)} cart={cart} />
              ))}
              {filteredProducts.length === 0 && <div className="col-12 text-center py-5"><p className="text-muted">No hay ofertas disponibles.</p></div>}
            </div>
          </div>
        )}

        {/* Search */}
        {tab === "search" && (
          <div id="buyerSearch">
            <div className="row mb-4">
              <div className="col-md-8 mx-auto">
                <div className="input-group">
                  <input className="form-control form-control-lg" placeholder="Buscar comida cerca de ti..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  <button className="btn btn-success">🔍 Buscar</button>
                </div>
                <div className="d-flex gap-2 mt-2 flex-wrap">
                  <button className="btn btn-sm btn-outline-success" onClick={() => setCatFilter("Comida preparada")}>Comida preparada</button>
                  <button className="btn btn-sm btn-outline-success" onClick={() => setCatFilter("Panaderia")}>Panaderia</button>
                  <button className="btn btn-sm btn-outline-success" onClick={() => setCatFilter("Bebidas")}>Bebidas</button>
                  <button className="btn btn-sm btn-outline-success" onClick={() => setCatFilter("")}>Todos</button>
                </div>
              </div>
            </div>
            <div className="row g-3">
              {filteredProducts.map((p) => (
                <ProductGridCard key={p.id} product={p} onAdd={() => handleAddToCart(p)} cart={cart} />
              ))}
            </div>
          </div>
        )}

        {/* Restaurants */}
        {tab === "restaurants" && (
          <div id="buyerRestaurants">
            <h5 className="fw-bold mb-3">Restaurantes cerca de ti</h5>
            <div className="map-box" id="buyerMap"></div>
            <div className="row g-3 mt-3">
              {["Restaurante El Sabor", "Pizzeria Napoli", "Sushi House", "La Cocina de Marta", "Panaderia Artesanal"].map((name) => (
                <div key={name} className="col-md-4">
                  <div className="card border-0 shadow-sm hover-card p-3">
                    <h6 className="fw-bold mb-1">{name}</h6>
                    <small className="text-muted">⭐⭐⭐⭐ 4.5</small>
                    <small className="text-muted d-block">Santa Cruz de la Sierra, Bolivia</small>
                    <button className="btn btn-sm btn-outline-success mt-2">Ver ofertas</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders */}
        {tab === "orders" && (
          <div id="buyerOrders">
            <h5 className="fw-bold mb-3">Mis pedidos</h5>
            {orders.map((o) => (
              <div key={o.id} className="card border-0 shadow-sm mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex align-items-center gap-3 min-w-0">
                      <img className="order-thumb" src={o.items?.[0]?.imageUrl || imageForFood(o.items?.[0]?.name)} alt={o.items?.[0]?.name || "Pedido"} />
                      <div className="min-w-0">
                        <strong>{o.items?.[0]?.name || "Pedido"}</strong> x{o.items?.[0]?.qty || 1}
                        <div className="text-muted small">{o.restaurant}</div>
                      </div>
                    </div>
                    <div className="text-end">
                      <StatusBadge status={o.status} labels={STATUS_LABELS} />
                      <div className="fw-bold mt-1" style={{color:"var(--green)"}}>{money(o.total)}</div>
                    </div>
                  </div>
                  {o.driver && <div className="mt-2"><button className="btn btn-sm btn-success">Rastrear pedido</button></div>}
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-muted text-center py-4">No has realizado pedidos aun.</p>}
          </div>
        )}

        {/* Track */}
        {tab === "track" && (
          <div id="buyerTrack">
            <div className="card shadow-sm p-4">
              <h5 className="fw-bold mb-3">📍 Seguimiento de entrega</h5>
              <p className="text-muted">Tu pedido esta siendo preparado por el restaurante</p>
              <div className="d-flex gap-3 mb-4">
                <div className="map-stat"><span>🕐</span> Estimado: 25 min</div>
                <div className="map-stat"><span>🚚</span> Repartidor asignado</div>
              </div>
              <div className="map-box small" id="buyerTrackMap"></div>
              <div className="mt-3">
                <ul className="timeline">
                  {["confirmed", "preparing", "ready", "in_transit"].map((key, idx) => (
                    <li key={key} className={idx <= 1 ? "completed" : idx === 2 ? "active" : ""}>{STATUS_LABELS[key] || key}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Location */}
        {tab === "location" && (
          <div id="buyerLocation">
            <div className="card shadow-sm p-4">
              <h5 className="fw-bold mb-3">📍 Tu ubicacion</h5>
              <div className="map-box" id="buyerLocationMap"></div>
              <small className="text-muted mt-2 d-block">Actualmente estas en: Centro, Santa Cruz de la Sierra</small>
            </div>
          </div>
        )}

        {/* Profile */}
        {tab === "profile" && (
          <div id="buyerProfile" className="row g-4">
            <div className="col-lg-4">
              <div className="card shadow-sm p-4 text-center">
                <div className="display-4 mb-2">👤</div>
                <h5 className="fw-bold">Comprador Demo</h5>
                <p className="text-muted small">buyer@test.com</p>
                <span className="donation-badge mx-auto">🛒 Comprador</span>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="card shadow-sm p-4">
                <h5 className="fw-bold mb-3">Mis datos</h5>
                <form onSubmit={(e) => { e.preventDefault(); alert("Datos guardados (simulado)"); }}>
                  <div className="row g-3">
                    <div className="col-md-6"><label className="form-label small fw-bold">Nombre</label><input className="form-control" value="Comprador Demo" /></div>
                    <div className="col-md-6"><label className="form-label small fw-bold">Email</label><input className="form-control" value="buyer@test.com" /></div>
                    <div className="col-md-6"><label className="form-label small fw-bold">Telefono</label><input className="form-control" value="+591 7 123 4567" /></div>
                    <div className="col-md-6"><label className="form-label small fw-bold">Direccion</label><input className="form-control" value="Av. Principal 456" /></div>
                    <div className="col-12">
                      <label className="form-label small fw-bold">Preferencias alimenticias</label>
                      <div className="d-flex gap-3">
                        <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Vegetariano</label></div>
                        <div className="form-check"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Sin gluten</label></div>
                        <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Sin lactosa</label></div>
                      </div>
                    </div>
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

function ProductGridCard({ product, onAdd, cart }) {
  const qtyInCart = cart?.find((c) => c.id === product.id)?.qty || 0;
  const badges = [];
  if (product.listingType === "DONATION" || product.isDonation) badges.push(<span key="don" className="donation-badge">Donacion</span>);
  if (product.foodCondition === "EXPIRING_SOON" || product.foodCondition === "expiringSoon") badges.push(<span key="exp" className="badge bg-warning text-dark">Por vencer</span>);
  if (product.foodCondition === "GOOD") badges.push(<span key="good" className="badge bg-success">Buen estado</span>);

  const img = product.imageUrl || product.img || "🍽️";
  const isImg = /\.(jpg|jpeg|png|webp|svg)$/i.test(img) || img.startsWith("http");
  const btnLabel = product.stock <= 0 ? "Agotado" : qtyInCart > 0 ? `Agregado (${qtyInCart})` : "Agregar";

  return (
    <div className="col-6 col-md-4 col-lg-3 mb-3">
      <div className="card h-100 border-0 shadow-sm hover-card">
        {badges.length > 0 && <div className="position-absolute top-0 end-0 m-2 d-flex gap-1" style={{zIndex:2}}>{badges}</div>}
        {isImg ? <img src={img} className="food-thumb mb-2" alt={product.name} loading="lazy" style={{borderRadius:"14px 14px 0 0"}} /> : <div className="product-emoji mx-auto mt-3">{img}</div>}
        <div className="card-body pt-1 px-3 pb-3">
          <h6 className="fw-bold mb-1 text-truncate">{product.name}</h6>
          {product.restaurant && <small className="text-muted text-truncate d-block">{product.restaurant}</small>}
          <div className="d-flex justify-content-between align-items-center mt-2">
            <span className="fw-bold" style={{color:"var(--green-dark)",fontSize:"1.1rem"}}>{product.isDonation ? "Donacion" : money(product.price)}</span>
            {product.stock > 0 ? <small className="text-muted">{product.stock} restantes</small> : <small className="text-danger">Agotado</small>}
          </div>
          <button className="btn btn-success w-100 mt-2" onClick={onAdd} disabled={product.stock <= 0}>{btnLabel}</button>
        </div>
      </div>
    </div>
  );
}
