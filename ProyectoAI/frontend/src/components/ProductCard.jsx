import { normalizeText } from "../constants";

export function productCardHTML(product, addToCart, currentRole) {
  if (!product || product.isDonation && currentRole !== "social") return "";
  const normalName = normalizeText(product.name);
  const img = product.imageUrl || product.img || "🍽️";
  const isImg = /\.(jpg|jpeg|png|webp|svg)$/i.test(img) || img.startsWith("http");
  const priceStr = product.isDonation ? "Donacion" : "$" + Number(product.price).toFixed(2);
  const badges = [];
  if (product.listingType === "RESCUE_PENDING" || product.foodCondition === "expiringSoon") badges.push("<span class=\"badge bg-warning text-dark\">Por vencer</span>");
  if (product.listingType === "DONATION" || product.isDonation) badges.push("<span class=\"donation-badge\">Donacion</span>");
  if (product.foodCondition === "GOOD") badges.push("<span class=\"badge bg-success\">Buen estado</span>");
  const btnLabel = product.isDonation ? "Solicitar" : product.stock <= 0 ? "Agotado" : "Agregar";
  const disabled = product.stock <= 0 ? "disabled" : "";

  return `
<div class="col-6 col-md-4 col-lg-3 mb-3">
  <div class="card h-100 border-0 shadow-sm hover-card position-relative" data-id="${product.id}">
    ${badges.length ? `<div class="position-absolute top-0 end-0 m-2 d-flex gap-1" style="z-index:2">${badges.join(" ")}</div>` : ""}
    ${isImg ? `<img src="${img}" class="food-thumb mb-2" alt="${product.name}" loading="lazy" style="border-radius:14px 14px 0 0">` : `<div class="product-emoji mx-auto mt-3">${img}</div>`}
    <div class="card-body pt-1 px-3 pb-3">
      <h6 class="fw-bold mb-1 text-truncate">${product.name}</h6>
      ${product.restaurant ? `<small class="text-muted text-truncate d-block">${product.restaurant}</small>` : ""}
      <div class="d-flex justify-content-between align-items-center mt-2">
        <span class="fw-bold" style="color:var(--green-dark);font-size:1.1rem">${priceStr}</span>
        ${product.stock > 0 ? `<small class="text-muted">${product.stock} restantes</small>` : `<small class="text-danger">Agotado</small>`}
      </div>
      ${product.isDonation && product.donationValue > 0 ? `<small class="text-muted">Valor estimado: $${Number(product.donationValue).toFixed(2)}</small>` : ""}
      <button class="btn btn-success w-100 mt-2 add-to-cart ${disabled}" data-id="${product.id}" data-action="add">${btnLabel}</button>
    </div>
  </div>
</div>`;
}
