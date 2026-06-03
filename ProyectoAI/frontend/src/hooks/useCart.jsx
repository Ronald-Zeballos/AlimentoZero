import { useState, useCallback } from "react";

export function useCart(showToast) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("ds_cart");
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.filter((item) => !item.isDonation);
  });

  const saveCart = useCallback((newCart) => {
    const filtered = newCart.filter((item) => !item.isDonation);
    setCart(filtered);
    localStorage.setItem("ds_cart", JSON.stringify(filtered));
  }, []);

  const addToCart = useCallback((product) => {
    if (!product || product.stock <= 0) { showToast("No hay stock disponible."); return; }
    if (product.isDonation) { showToast("Las donaciones solo pueden solicitarlas entidades sociales."); return; }
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      const qtyInCart = existing ? existing.qty : 0;
      if (qtyInCart >= product.stock) { showToast("Ya agregaste todo el stock disponible."); return prev; }
      const updated = existing
        ? prev.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
        : [...prev, { id: product.id, name: product.name, price: product.price, qty: 1, isDonation: !!product.isDonation, donationValue: product.donationValue || 0, restaurant: product.restaurant, img: product.img, imageUrl: product.imageUrl }];
      saveCart(updated);
      showToast("Producto agregado al carrito.");
      return updated;
    });
  }, [showToast, saveCart]);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.id !== productId);
      saveCart(updated);
      return updated;
    });
  }, [saveCart]);

  const updateQty = useCallback((productId, delta, products) => {
    setCart((prev) => {
      const item = prev.find((entry) => entry.id === productId);
      const product = products.find((entry) => entry.id === productId);
      if (!item || !product) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) {
        const updated = prev.filter((i) => i.id !== productId);
        saveCart(updated);
        return updated;
      }
      const updated = prev.map((i) => i.id === productId ? { ...i, qty: Math.min(newQty, product.stock) } : i);
      saveCart(updated);
      return updated;
    });
  }, [saveCart]);

  const clearCart = useCallback(() => {
    saveCart([]);
    showToast("Carrito vaciado.");
  }, [saveCart, showToast]);

  const getCartTotals = useCallback(() => {
    return cart.reduce((totals, item) => {
      totals.items += item.qty;
      totals.subtotal += item.price * item.qty;
      totals.total = totals.subtotal;
      return totals;
    }, { subtotal: 0, donation: 0, total: 0, items: 0 });
  }, [cart]);

  const setCartDirect = useCallback((newCart) => {
    saveCart(newCart);
  }, [saveCart]);

  return { cart, addToCart, removeFromCart, updateQty, clearCart, getCartTotals, setCartDirect };
}
