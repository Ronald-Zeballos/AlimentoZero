import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createListing, publishListing } from "../api";
import { CATEGORY_OPTIONS, DEFAULT_IMAGE } from "../constants";
import { AppTopBar } from "../components/AppTopBar";
import { SectionHeader } from "../components/SectionHeader";
import { EmptyState } from "../components/StateViews";

function MerchantPublishPage({ currentProfile, tenantId, market, onToast }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [listingType, setListingType] = useState("DISCOUNTED_SALE");
  const [form, setForm] = useState({
    title: "Pack sorpresa de almuerzo",
    description: "Platos del dia listos para retiro rapido.",
    category: "Ready Meals",
    imageUrl: DEFAULT_IMAGE,
    originalPrice: "48",
    rescuePrice: "22",
    quantityAvailable: "5",
    city: "La Paz",
    address: "Av. 16 de Julio 1200",
    pickupStart: "2026-05-26T15:00",
    pickupEnd: "2026-05-26T20:00",
    expirationDate: "2026-05-26T21:00",
    foodCondition: "READY_TO_EAT",
    requiresTransport: false,
    kgRescued: "6.5",
    mealsEquivalent: "8",
    co2KgAvoided: "4.2"
  });

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const created = await createListing(
        {
          ...form,
          listingType,
          currency: "BOB",
          originalPrice: Number(form.originalPrice),
          rescuePrice: listingType === "DONATION" ? 0 : Number(form.rescuePrice),
          quantityAvailable: Number(form.quantityAvailable),
          latitude: -16.5,
          longitude: -68.15,
          requiresTransport: form.requiresTransport,
          kgRescued: Number(form.kgRescued),
          mealsEquivalent: Number(form.mealsEquivalent),
          co2KgAvoided: Number(form.co2KgAvoided)
        },
        {
          tenantId,
          merchantId: currentProfile?.actorId
        }
      );
      await publishListing(created.id);
      await market.reload();
      onToast("Oferta publicada y disponible en el marketplace.");
      navigate(`/ofertas/${created.id}`);
    } catch {
      onToast("No pudimos publicar la oferta. Revisa los datos e intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <AppTopBar
        currentProfile={currentProfile}
        eyebrow="Publicacion de comercio"
        title="Crea un pack como lo haria un partner comercial"
        subtitle="Este formulario queda solo para el rol de comercio y ya usa el merchant real cargado desde IAM."
        accent="merchant"
      />
      <form className="publish-form" onSubmit={handleSubmit}>
        <label>
          Nombre del pack
          <input
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
          />
        </label>
        <label>
          Descripcion
          <textarea
            rows="3"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
        </label>
        <div className="form-row">
          <label>
            Categoria
            <select
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
            >
              {CATEGORY_OPTIONS.filter((item) => item !== "Todo").map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tipo de publicacion
            <select value={listingType} onChange={(event) => setListingType(event.target.value)}>
              <option value="DISCOUNTED_SALE">Venta con descuento</option>
              <option value="DONATION">Donacion gratuita</option>
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Precio original
            <input
              type="number"
              min="0"
              value={form.originalPrice}
              onChange={(event) => setForm({ ...form, originalPrice: event.target.value })}
            />
          </label>
          <label>
            Precio de rescate
            <input
              type="number"
              min="0"
              disabled={listingType === "DONATION"}
              value={listingType === "DONATION" ? 0 : form.rescuePrice}
              onChange={(event) => setForm({ ...form, rescuePrice: event.target.value })}
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Cantidad disponible
            <input
              type="number"
              min="1"
              value={form.quantityAvailable}
              onChange={(event) => setForm({ ...form, quantityAvailable: event.target.value })}
            />
          </label>
          <label>
            Ciudad
            <input
              value={form.city}
              onChange={(event) => setForm({ ...form, city: event.target.value })}
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Retiro desde
            <input
              type="datetime-local"
              value={form.pickupStart}
              onChange={(event) => setForm({ ...form, pickupStart: event.target.value })}
            />
          </label>
          <label>
            Retiro hasta
            <input
              type="datetime-local"
              value={form.pickupEnd}
              onChange={(event) => setForm({ ...form, pickupEnd: event.target.value })}
            />
          </label>
        </div>
        <label>
          Direccion
          <input
            value={form.address}
            onChange={(event) => setForm({ ...form, address: event.target.value })}
          />
        </label>
        <div className="form-row">
          <label>
            Kg rescatados
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.kgRescued}
              onChange={(event) => setForm({ ...form, kgRescued: event.target.value })}
            />
          </label>
          <label>
            Raciones
            <input
              type="number"
              min="0"
              value={form.mealsEquivalent}
              onChange={(event) => setForm({ ...form, mealsEquivalent: event.target.value })}
            />
          </label>
        </div>
        <button className="primary-button" type="submit" disabled={submitting || !currentProfile}>
          {submitting ? "Publicando..." : "Publicar oferta"}
        </button>
      </form>
    </>
  );
}

function NonMerchantWorkspace({ currentProfile }) {
  const roleBoards = {
    BUYER: {
      title: "Tu flujo no publica",
      subtitle:
        "Como comprador, este espacio cambia a una guia del recorrido: descubrir, reservar y retirar."
    },
    NGO: {
      title: "Playbook de recepcion social",
      subtitle:
        "Tu trabajo se concentra en explorar donaciones y aprobar solicitudes, no en crear packs."
    },
    TRANSPORTER: {
      title: "Base de operaciones",
      subtitle:
        "La logistica usa rutas y ventanas de retiro. Las publicaciones nacen en comercio o coordinacion."
    },
    COORDINATOR: {
      title: "Centro de orquestacion",
      subtitle:
        "Coordinacion no publica como tienda; decide donde empujar rescate, transporte y ONG."
    },
    ADMIN: {
      title: "Control administrativo",
      subtitle:
        "Admin usa IAM y catalogos. La generacion de oferta la ejecuta el comercio aliado."
    }
  };

  const board = roleBoards[currentProfile?.actorType] || roleBoards.BUYER;

  return (
    <>
      <AppTopBar
        currentProfile={currentProfile}
        eyebrow="Espacio de trabajo"
        title={board.title}
        subtitle={board.subtitle}
        accent="default"
      />
      <section className="panel-card">
        <SectionHeader
          eyebrow="Separacion por rol"
          title="Esta pantalla cambia segun el actor"
          subtitle="Con esto ya no todos caen en el mismo formulario y cada perfil mantiene sentido operativo."
        />
        <div className="compact-stack">
          <article className="mini-row">
            <strong>Comprador</strong>
            <span>Explora, reserva y retira</span>
          </article>
          <article className="mini-row">
            <strong>ONG</strong>
            <span>Solicita y gestiona donaciones</span>
          </article>
          <article className="mini-row">
            <strong>Transportista</strong>
            <span>Toma rutas urgentes</span>
          </article>
          <article className="mini-row">
            <strong>Coordinador</strong>
            <span>Prioriza y supervisa</span>
          </article>
          <article className="mini-row">
            <strong>Admin</strong>
            <span>Audita perfiles y roles</span>
          </article>
        </div>
      </section>
      <EmptyState
        title="Solo comercio publica nuevos packs"
        subtitle="Cambiar de perfil desde IAM te llevara a una vista distinta del sistema."
        actionLabel="Ir a perfil"
        to="/perfil"
      />
    </>
  );
}

export function PublishPage({ currentProfile, tenantId, market, onToast }) {
  return (
    <div className="page-container">
      {currentProfile?.actorType === "MERCHANT" ? (
        <MerchantPublishPage
          currentProfile={currentProfile}
          tenantId={tenantId}
          market={market}
          onToast={onToast}
        />
      ) : (
        <NonMerchantWorkspace currentProfile={currentProfile} />
      )}
    </div>
  );
}
