const state = {
    listings: [],
    filtered: [],
    activeFilter: "all",
    activeCategory: "all",
    activeView: "home",
    query: "",
    detailListing: null
};

const els = {
    searchInput: document.getElementById("searchInput"),
    categoryChips: document.getElementById("categoryChips"),
    nearbyGrid: document.getElementById("nearbyGrid"),
    surpriseGrid: document.getElementById("surpriseGrid"),
    donationGrid: document.getElementById("donationGrid"),
    exploreGrid: document.getElementById("exploreGrid"),
    toast: document.getElementById("toast"),
    publishForm: document.getElementById("publishForm"),
    fillDemoButton: document.getElementById("fillDemoButton"),
    statusButton: document.getElementById("statusButton"),
    showHowReserve: document.getElementById("showHowReserve"),
    showRoadmap: document.getElementById("showRoadmap"),
    detailDialog: document.getElementById("detailDialog"),
    detailMedia: document.getElementById("detailMedia"),
    detailType: document.getElementById("detailType"),
    detailTitle: document.getElementById("detailTitle"),
    detailDescription: document.getElementById("detailDescription"),
    detailStats: document.getElementById("detailStats"),
    detailImpact: document.getElementById("detailImpact"),
    detailActionButton: document.getElementById("detailActionButton"),
    closeDialogButton: document.getElementById("closeDialogButton"),
    metricListings: document.getElementById("metricListings"),
    metricMeals: document.getElementById("metricMeals"),
    metricKg: document.getElementById("metricKg")
};

document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.navTarget));
});

document.querySelectorAll(".filter-chip").forEach((button) => {
    button.addEventListener("click", () => {
        state.activeFilter = button.dataset.filter;
        document.querySelectorAll(".filter-chip").forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
        applyFilters();
    });
});

els.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value.trim().toLowerCase();
    applyFilters();
});

els.publishForm.addEventListener("submit", submitListing);
els.fillDemoButton.addEventListener("click", fillPublishExample);
els.statusButton.addEventListener("click", showSystemStatus);
els.showHowReserve.addEventListener("click", () => showToast("Abrí cualquier oferta y usá el botón principal para reservar o solicitar."));
els.showRoadmap.addEventListener("click", () => showToast("Siguiente paso sugerido: órdenes, QR de retiro y paneles por rol."));
els.closeDialogButton.addEventListener("click", () => els.detailDialog.close());
els.detailActionButton.addEventListener("click", reserveCurrentListing);

loadListings();

async function loadListings() {
    renderLoading();
    try {
        const response = await fetch("/api/v1/market/listings");
        if (!response.ok) {
            throw new Error("No se pudieron cargar las ofertas.");
        }
        state.listings = await response.json();
        applyFilters();
        renderCategoryChips();
        renderMetrics();
    } catch (error) {
        renderError(error.message);
    }
}

function renderLoading() {
    const loading = '<div class="loading">Cargando ofertas del marketplace...</div>';
    [els.nearbyGrid, els.surpriseGrid, els.donationGrid, els.exploreGrid].forEach((grid) => {
        grid.innerHTML = loading;
    });
}

function renderError(message) {
    const html = `<div class="empty-state">${message}</div>`;
    [els.nearbyGrid, els.surpriseGrid, els.donationGrid, els.exploreGrid].forEach((grid) => {
        grid.innerHTML = html;
    });
}

function renderCategoryChips() {
    const categories = ["all", ...new Set(state.listings.map((listing) => listing.category))];
    els.categoryChips.innerHTML = categories.map((category) => {
        const active = category === state.activeCategory ? "is-active" : "";
        const label = category === "all" ? "Todas las categorías" : category;
        return `<button class="category-chip ${active}" data-category="${category}" type="button">${label}</button>`;
    }).join("");

    els.categoryChips.querySelectorAll(".category-chip").forEach((button) => {
        button.addEventListener("click", () => {
            state.activeCategory = button.dataset.category;
            renderCategoryChips();
            applyFilters();
        });
    });
}

function applyFilters() {
    state.filtered = state.listings.filter((listing) => {
        const matchesQuery = [listing.title, listing.description, listing.category, listing.city]
            .join(" ")
            .toLowerCase()
            .includes(state.query);
        const matchesCategory = state.activeCategory === "all" || listing.category === state.activeCategory;
        const matchesFilter =
            state.activeFilter === "all"
            || (state.activeFilter === "discount" && listing.listingType === "DISCOUNTED_SALE")
            || (state.activeFilter === "donation" && listing.listingType === "DONATION")
            || (state.activeFilter === "urgent" && isUrgent(listing));
        return matchesQuery && matchesCategory && matchesFilter;
    });

    renderSections();
    renderMetrics();
}

function renderSections() {
    const nearby = state.filtered.slice(0, 4);
    const surprise = state.filtered.filter((listing) => listing.listingType === "DISCOUNTED_SALE").slice(0, 4);
    const donation = state.filtered.filter((listing) => listing.listingType === "DONATION").slice(0, 4);

    renderGrid(els.nearbyGrid, nearby, "Todavía no hay ofertas para esa búsqueda.");
    renderGrid(els.surpriseGrid, surprise, "No encontramos packs económicos con esos filtros.");
    renderGrid(els.donationGrid, donation, "No hay donaciones visibles en este momento.");
    renderGrid(els.exploreGrid, state.filtered, "No hay resultados para esos filtros.");
}

function renderGrid(container, listings, emptyMessage) {
    if (!listings.length) {
        container.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
        return;
    }

    container.innerHTML = listings.map(renderCard).join("");
    container.querySelectorAll("[data-open-detail]").forEach((button) => {
        button.addEventListener("click", () => openDetail(button.dataset.openDetail));
    });
    container.querySelectorAll("[data-direct-reserve]").forEach((button) => {
        button.addEventListener("click", () => reserveListing(button.dataset.directReserve));
    });
}

function renderCard(listing) {
    const actionLabel = listing.listingType === "DONATION" ? "Solicitar donación" : "Comprar pack";
    const saleBadge = listing.listingType === "DONATION" ? "donation" : "sale";
    const saleText = listing.listingType === "DONATION" ? "Donación" : "Venta económica";
    const urgent = isUrgent(listing) ? '<span class="badge urgent">Vence pronto</span>' : "";
    const original = listing.originalPrice > 0 ? `<s>BOB ${formatMoney(listing.originalPrice)}</s>` : "";
    return `
        <article class="listing-card">
            <div class="listing-media" style="background-image:url('${listing.imageUrl || ""}')">
                <div class="listing-badge-row">
                    <span class="badge ${saleBadge}">${saleText}</span>
                    ${urgent}
                </div>
            </div>
            <div class="listing-content">
                <div class="listing-meta">
                    <span>${listing.category}</span>
                    <span>${listing.city}</span>
                </div>
                <h3>${listing.title}</h3>
                <p>${listing.description}</p>
                <div class="listing-price">
                    <strong>${listing.listingType === "DONATION" ? "Gratis" : `BOB ${formatMoney(listing.rescuePrice)}`}</strong>
                    ${original}
                </div>
                <div class="listing-meta">
                    <span>${listing.quantityAvailable - listing.quantityReserved} disponibles</span>
                    <span>${hoursUntil(listing.expirationDate)} h</span>
                </div>
                <div class="listing-footer">
                    <button class="ghost-button" data-open-detail="${listing.id}" type="button">Ver detalle</button>
                    <button class="primary-button" data-direct-reserve="${listing.id}" type="button">${actionLabel}</button>
                </div>
            </div>
        </article>
    `;
}

function renderMetrics() {
    const source = state.filtered.length ? state.filtered : state.listings;
    const meals = source.reduce((sum, listing) => sum + listing.mealsEquivalent, 0);
    const kg = source.reduce((sum, listing) => sum + Number(listing.kgRescued), 0);
    els.metricListings.textContent = String(source.length);
    els.metricMeals.textContent = String(meals);
    els.metricKg.textContent = `${kg.toFixed(1)} kg`;
}

function switchView(target) {
    state.activeView = target;
    document.querySelectorAll(".nav-item").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.navTarget === target);
    });
    document.querySelectorAll(".view").forEach((view) => {
        view.classList.toggle("is-active", view.id === `view-${target}`);
    });
}

async function openDetail(id) {
    try {
        const response = await fetch(`/api/v1/market/listings/${id}`);
        if (!response.ok) {
            throw new Error("No se pudo abrir el detalle.");
        }
        const listing = await response.json();
        state.detailListing = listing;
        els.detailMedia.style.backgroundImage = `url('${listing.imageUrl || ""}')`;
        els.detailType.textContent = listing.listingType === "DONATION" ? "Donación disponible" : "Comprá con descuento";
        els.detailTitle.textContent = listing.title;
        els.detailDescription.textContent = listing.description;
        els.detailStats.innerHTML = `
            <article><strong>${listing.quantityAvailable - listing.quantityReserved}</strong><span>Quedan packs</span></article>
            <article><strong>${listing.address}</strong><span>Retiro</span></article>
            <article><strong>${hoursUntil(listing.expirationDate)} h</strong><span>Hasta vencer</span></article>
        `;
        els.detailImpact.innerHTML = `
            <article><strong>${listing.kgRescued} kg</strong><span>rescatados</span></article>
            <article><strong>${listing.mealsEquivalent}</strong><span>raciones</span></article>
            <article><strong>${listing.co2KgAvoided} kg</strong><span>CO2 evitado</span></article>
        `;
        els.detailActionButton.textContent = listing.listingType === "DONATION" ? "Solicitar donación" : "Reservar retiro";
        els.detailDialog.showModal();
    } catch (error) {
        showToast(error.message);
    }
}

async function reserveCurrentListing() {
    if (!state.detailListing) {
        return;
    }
    await reserveListing(state.detailListing.id, true);
}

async function reserveListing(id, keepDialogOpen = false) {
    try {
        const response = await fetch(`/api/v1/market/listings/${id}/reserve`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ quantity: 1 })
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "No se pudo reservar.");
        }

        const updated = await response.json();
        updateListingInState(updated);
        applyFilters();
        if (!keepDialogOpen) {
            showToast(updated.listingType === "DONATION" ? "Solicitud registrada." : "Reserva confirmada.");
        } else {
            state.detailListing = updated;
            els.detailDialog.close();
            showToast(updated.listingType === "DONATION" ? "Donación solicitada." : "Retiro reservado.");
        }
    } catch (error) {
        showToast(error.message.replaceAll("\"", ""));
    }
}

async function submitListing(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const listingType = form.get("listingType");
    const rescuePrice = listingType === "DONATION" ? 0 : Number(form.get("rescuePrice"));
    const now = new Date();
    const expiresInHours = Number(form.get("expiresInHours"));
    const expirationDate = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);
    const pickupStart = new Date(now.getTime() + 60 * 60 * 1000);
    const pickupEnd = new Date(now.getTime() + (expiresInHours + 2) * 60 * 60 * 1000);

    const payload = {
        title: form.get("title"),
        description: form.get("description"),
        category: form.get("category"),
        imageUrl: form.get("imageUrl"),
        listingType,
        originalPrice: Number(form.get("originalPrice")),
        rescuePrice,
        currency: "BOB",
        quantityAvailable: Number(form.get("quantityAvailable")),
        expirationDate: expirationDate.toISOString().slice(0, 19),
        pickupStart: pickupStart.toISOString().slice(0, 19),
        pickupEnd: pickupEnd.toISOString().slice(0, 19),
        address: form.get("address"),
        city: "La Paz",
        latitude: -16.5,
        longitude: -68.15,
        foodCondition: form.get("foodCondition"),
        requiresTransport: listingType === "DONATION",
        kgRescued: 2.5,
        mealsEquivalent: 6,
        co2KgAvoided: 3.2
    };

    try {
        const createResponse = await fetch("/api/v1/market/listings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Tenant-Id": "tenant-demo",
                "X-Merchant-Id": "merchant-demo-ui"
            },
            body: JSON.stringify(payload)
        });
        if (!createResponse.ok) {
            throw new Error("No se pudo crear la publicación.");
        }
        const draft = await createResponse.json();
        const publishResponse = await fetch(`/api/v1/market/listings/${draft.id}/publish`, { method: "POST" });
        if (!publishResponse.ok) {
            throw new Error("Se creó el borrador, pero no se pudo publicar.");
        }
        const published = await publishResponse.json();
        state.listings.unshift(published);
        state.activeView = "home";
        event.currentTarget.reset();
        fillPublishExample();
        switchView("home");
        applyFilters();
        renderCategoryChips();
        showToast("Oferta publicada y visible en Inicio.");
    } catch (error) {
        showToast(error.message);
    }
}

function fillPublishExample() {
    els.publishForm.querySelector("[name='title']").value = "Pack nocturno de cafetería";
    els.publishForm.querySelector("[name='category']").value = "Cafe";
    els.publishForm.querySelector("[name='description']").value = "Sandwiches, budines y bebidas listas para retiro hoy.";
    els.publishForm.querySelector("[name='listingType']").value = "DISCOUNTED_SALE";
    els.publishForm.querySelector("[name='foodCondition']").value = "PREPARED_TODAY";
    els.publishForm.querySelector("[name='originalPrice']").value = "28";
    els.publishForm.querySelector("[name='rescuePrice']").value = "12";
    els.publishForm.querySelector("[name='quantityAvailable']").value = "5";
    els.publishForm.querySelector("[name='expiresInHours']").value = "7";
    els.publishForm.querySelector("[name='address']").value = "Zona Sur, La Paz";
}

async function showSystemStatus() {
    try {
        const response = await fetch("/actuator/health");
        const payload = await response.json();
        showToast(`Backend ${payload.status === "UP" ? "activo" : "con incidencias"}.`);
    } catch (error) {
        showToast("No pude leer el estado del sistema.");
    }
}

function updateListingInState(updated) {
    state.listings = state.listings.map((listing) => listing.id === updated.id ? updated : listing);
}

function isUrgent(listing) {
    return hoursUntil(listing.expirationDate) <= 6;
}

function hoursUntil(dateText) {
    const expires = new Date(dateText);
    const diff = Math.max(0, expires.getTime() - Date.now());
    return Math.max(1, Math.round(diff / (1000 * 60 * 60)));
}

function formatMoney(amount) {
    return Number(amount).toFixed(0);
}

function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => {
        els.toast.classList.remove("is-visible");
    }, 2400);
}
