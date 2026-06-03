import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Navbar } from "./components/Navbar";
import { CartSidebar } from "./components/CartSidebar";
import { AiPanel } from "./components/AiPanel";
import { Toast } from "./components/Toast";
import { useAuth } from "./hooks/useAuth";
import { useCart } from "./hooks/useCart";
import { useToast } from "./hooks/useToast";
import { DEFAULT_MAP_CENTER, MOCK_PRODUCTS, MOCK_ORDERS, MOCK_DONATION_REQUESTS, money } from "./constants";
import { useMap } from "./hooks/useMap";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import SocialDashboard from "./pages/SocialDashboard";

export default function App() {
  const { toasts, showToast } = useToast();
  const { currentRole, roleLabel, login, logout } = useAuth();
  const { cart, addToCart, removeFromCart, updateQty, clearCart, getCartTotals, setCartDirect } = useCart(showToast);

  const [page, setPage] = useState(() => localStorage.getItem("ds_role") ? "dashboard" : "landing");
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [donationRequests, setDonationRequests] = useState(MOCK_DONATION_REQUESTS);
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [trackingModal, setTrackingModal] = useState(false);
  const [assistantTarget, setAssistantTarget] = useState(null);
  useMap("trackingMap", trackingModal, DEFAULT_MAP_CENTER);

  useEffect(() => {
    if (currentRole) setPage("dashboard");
  }, [currentRole]);

  const handleLogin = useCallback((email) => {
    const role = login(email);
    if (role) {
      setPage("dashboard");
      showToast("Inicio de sesion exitoso.");
    } else {
      showToast("Credenciales invalidas. Usa: rest@test.com, buyer@test.com, driver@test.com o social@test.com");
    }
  }, [login, showToast]);

  const handleLogout = useCallback(() => {
    logout();
    setPage("landing");
    setCartDirect([]);
    showToast("Sesion cerrada.");
  }, [logout, setCartDirect, showToast]);

  const handleNavigate = useCallback((target) => {
    if (target === "landing") { handleLogout(); setPage("landing"); }
    else if (target === "login") setPage("login");
    else if (target === "register") setPage("register");
    else if (target === "dashboard") setPage("dashboard");
    else if (target === "tracking") setTrackingModal(true);
  }, [handleLogout]);

  const handleAiNavigate = useCallback((intent) => {
    if (!intent?.tab) return;
    if (intent.role && intent.role !== currentRole) {
      showToast("Esa accion no corresponde a tu rol actual.");
      return;
    }
    const nextTarget = { ...intent, nonce: Date.now() };
    setAssistantTarget(nextTarget);
    showToast("Navegando a " + intent.tab);

    if (intent.target) {
      const focusTarget = (attempt = 0) => {
        const element = document.getElementById(intent.target);
        if (!element) {
          if (attempt < 5) setTimeout(() => focusTarget(attempt + 1), 120);
          return;
        }
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("guided-highlight");
        setTimeout(() => element.classList.remove("guided-highlight"), 1800);
      };
      setTimeout(() => focusTarget(), 120);
    }
  }, [currentRole, showToast]);

  const handleCheckout = useCallback(() => {
    setCheckoutModal(true);
  }, []);

  const handlePlaceOrder = useCallback(() => {
    if (cart.length === 0) { showToast("Carrito vacio."); return; }
    const totals = getCartTotals();
    const newOrder = {
      id: "o" + Date.now(),
      items: cart.map((item) => ({ id: item.id, name: item.name, qty: item.qty, price: item.price, imageUrl: item.imageUrl })),
      total: totals.total,
      status: "confirmed",
      restaurant: cart[0]?.restaurant || "Restaurante",
      pickupCode: "PICK" + Math.random().toString(36).slice(2, 6).toUpperCase()
    };
    setOrders((prev) => [...prev, newOrder]);
    setCartDirect([]);
    setCheckoutModal(false);
    showToast("Pedido confirmado! Codigo: " + newOrder.pickupCode);
  }, [cart, getCartTotals, setCartDirect, showToast]);

  const handleAddToCart = useCallback((product) => {
    if (!currentRole) { showToast("Debes iniciar sesion para agregar productos."); return; }
    if (currentRole === "social" && !product.isDonation) { showToast("Como entidad social solo puedes solicitar donaciones."); return; }
    addToCart(product);
  }, [currentRole, addToCart, showToast]);

  const handleUpdateOrderStatus = useCallback((orderId, newStatus) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    const labels = { preparing: "Preparando", ready: "Listo para retirar", picked_up: "Retirado", delivered: "Entregado" };
    showToast("Pedido actualizado: " + (labels[newStatus] || newStatus));
  }, [showToast]);

  const handleAcceptDelivery = useCallback((deliveryId) => {
    showToast("Reparto #" + deliveryId + " aceptado!");
  }, [showToast]);

  const handleMarkDelivered = useCallback((deliveryId) => {
    showToast("Reparto #" + deliveryId + " marcado como entregado!");
  }, [showToast]);

  const handleDonationRequest = useCallback((product) => {
    const exist = donationRequests.find((r) => r.product === product.name);
    if (exist) { showToast("Ya solicitaste este producto."); return; }
    const newReq = { id: "dr" + Date.now(), product: product.name, qty: 1, status: "En revision", people: 3 };
    setDonationRequests((prev) => [...prev, newReq]);
    showToast("Solicitud de donacion enviada!");
  }, [donationRequests, showToast]);

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const totals = getCartTotals();

  const pageComponent = useMemo(() => {
    if (page === "login") return <LoginPage onLogin={handleLogin} />;
    if (page === "register") return <RegisterPage onNavigate={handleNavigate} />;
    if (!currentRole || page === "landing") return <LandingPage onNavigate={handleNavigate} />;

    switch (currentRole) {
      case "restaurant":
        return <RestaurantDashboard products={products} orders={orders} onUpdateOrderStatus={handleUpdateOrderStatus} currentRole={currentRole} assistantTarget={assistantTarget} />;
      case "buyer":
        return <BuyerDashboard products={products} orders={orders} addToCart={handleAddToCart} cart={cart} assistantTarget={assistantTarget} />;
      case "driver":
        return <DriverDashboard onAcceptDelivery={handleAcceptDelivery} onMarkDelivered={handleMarkDelivered} assistantTarget={assistantTarget} />;
      case "social":
        return <SocialDashboard donationRequests={donationRequests} onRequestDonation={handleDonationRequest} products={products} assistantTarget={assistantTarget} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  }, [currentRole, page, products, orders, donationRequests, cart, assistantTarget, handleAddToCart, handleNavigate, handleLogin, handleUpdateOrderStatus, handleAcceptDelivery, handleMarkDelivered, handleDonationRequest]);

  return (
    <div>
      <Navbar currentRole={currentRole} roleLabel={roleLabel} onLogout={handleLogout} onNavigate={handleNavigate} />

      {pageComponent}

      {currentRole === "buyer" && page === "dashboard" && (
        <>
          <button
            className={`cart-button ${currentRole === "buyer" ? "active" : ""}`}
            onClick={() => document.getElementById("cartSidebar")?.classList.toggle("active")}
          >
            🛒
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
          <CartSidebar
            cart={cart}
            getCartTotals={getCartTotals}
            removeFromCart={removeFromCart}
            updateQty={(id, delta) => updateQty(id, delta, products)}
            clearCart={clearCart}
            onCheckout={handleCheckout}
            products={products}
          />
        </>
      )}

      {/* Checkout Modal */}
      {checkoutModal && (
        <>
          <div className="cart-overlay active" onClick={() => setCheckoutModal(false)}></div>
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 10001, width: "90%", maxWidth: 440, background: "#fff", borderRadius: 24, boxShadow: "0 24px 80px rgba(0,0,0,0.25)", overflow: "hidden" }}>
            <div className="p-4">
              <h5 className="fw-bold mb-3">Confirmar pedido</h5>
              {cart.map((item) => (
                <div key={item.id} className="d-flex justify-content-between align-items-center mb-2">
                  <span className="d-flex align-items-center gap-2">
                    {item.imageUrl && <img className="order-thumb" src={item.imageUrl} alt={item.name} />}
                    <span><strong>{item.name}</strong> x{item.qty}</span>
                  </span>
                  <span className="fw-bold" style={{color:"var(--green)"}}>{money(item.price * item.qty)}</span>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between fs-5"><strong>Total</strong><strong style={{color:"var(--green)"}}>{money(totals.total)}</strong></div>
              <div className="d-grid gap-2 mt-3">
                <button className="btn btn-success" onClick={handlePlaceOrder}>Confirmar pedido</button>
                <button className="btn btn-outline-secondary" onClick={() => setCheckoutModal(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Tracking Modal */}
      {trackingModal && (
        <>
          <div className="cart-overlay active" onClick={() => setTrackingModal(false)}></div>
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 10001, width: "90%", maxWidth: 500, background: "#fff", borderRadius: 24, boxShadow: "0 24px 80px rgba(0,0,0,0.25)", overflow: "hidden" }}>
            <div className="p-4">
              <h5 className="fw-bold mb-3">📍 Seguimiento de pedidos</h5>
              <div className="map-box" style={{height:200}} id="trackingMap"></div>
              <div className="mt-3">
                <ul className="timeline">
                  {["confirmed", "preparing", "ready", "in_transit", "delivered"].map((key, idx) => {
                    const labels = { confirmed: "Confirmado", preparing: "Preparando", ready: "Listo", in_transit: "En transito", delivered: "Entregado" };
                    return <li key={key} className={idx <= 2 ? "completed" : idx === 3 ? "active" : ""}>{labels[key]}</li>;
                  })}
                </ul>
              </div>
              <button className="btn btn-outline-secondary w-100 mt-3" onClick={() => setTrackingModal(false)}>Cerrar</button>
            </div>
          </div>
        </>
      )}

      {currentRole === "restaurant" && (
        <AiPanel
          currentRole={currentRole}
          currentTab={assistantTarget?.tab || null}
          onNavigate={handleAiNavigate}
          restaurantContext={{ products, orders }}
        />
      )}
      <Toast toasts={toasts} />
    </div>
  );
}
