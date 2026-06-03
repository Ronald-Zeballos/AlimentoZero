import React from "react";

export function CartSidebar({ cart, getCartTotals, removeFromCart, updateQty, clearCart, onCheckout, products }) {
  const totals = getCartTotals();

  return (
    <>
      <div className="cart-sidebar" id="cartSidebar">
        <div className="card-body border-bottom px-4 py-3 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0">Tu Carrito</h5>
          <button className="btn btn-sm btn-outline-danger" id="cartCloseBtn" onClick={() => document.getElementById("cartSidebar")?.classList.remove("active")}>✕</button>
        </div>
        <div className="cart-body px-4 py-3">
          {cart.length === 0 && <p className="text-muted text-center my-4">Carrito vacio</p>}
          {cart.map((item) => (
            <div key={item.id} className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
              {item.imageUrl ? (
                <img className="order-thumb" src={item.imageUrl} alt={item.name} />
              ) : (
                <div className="product-emoji flex-shrink-0">{item.img || "🍽️"}</div>
              )}
              <div className="flex-grow-1 min-w-0">
                <h6 className="fw-bold mb-0 text-truncate">{item.name}</h6>
                <div className="text-muted small">${Number(item.price).toFixed(2)} c/u</div>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <button className="btn btn-sm btn-outline-secondary px-2" onClick={() => updateQty(item.id, -1, products)} disabled={item.qty <= 1}>−</button>
                  <span className="fw-bold">{item.qty}</span>
                  <button className="btn btn-sm btn-outline-secondary px-2" onClick={() => updateQty(item.id, 1, products)}>+</button>
                </div>
              </div>
              <div className="text-end flex-shrink-0">
                <div className="fw-bold" style={{ color: "var(--green)" }}>${(item.price * item.qty).toFixed(2)}</div>
                <button className="btn btn-sm btn-link text-danger p-0" onClick={() => removeFromCart(item.id)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
        <div className="card-body border-top px-4 py-3 mt-auto">
          <div className="d-flex justify-content-between mb-2">
            <span>Subtotal ({totals.items} items)</span>
            <span className="fw-bold">${totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="cart-meter mb-3"><span style={{ width: Math.min(100, (totals.items / 10) * 100) + "%" }}></span></div>
          {cart.length > 0 && (
            <div className="d-grid gap-2">
              <button className="btn btn-success" id="checkoutBtn" onClick={() => { document.getElementById("cartSidebar")?.classList.remove("active"); onCheckout?.(); }}>Pagar ${totals.total.toFixed(2)}</button>
              <button className="btn btn-outline-danger btn-sm" onClick={clearCart}>Vaciar carrito</button>
            </div>
          )}
        </div>
      </div>
      <div className="cart-overlay" id="cartOverlay" onClick={() => document.getElementById("cartSidebar")?.classList.remove("active")}></div>
    </>
  );
}
