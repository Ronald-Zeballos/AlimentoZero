import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CATEGORY_OPTIONS } from "../constants";
import { CardGrid } from "../components/OfferCard";
import { SectionHeader } from "../components/SectionHeader";
import { EmptyState, LoadingState } from "../components/StateViews";

export function ExplorePage({ market, onReserve, onToast }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todo");
  const deferredQuery = useDeferredValue(query);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("type") === "DONATION") {
      setCategory("Todo");
      setQuery("donacion");
    }
  }, [location.search]);

  const filteredListings = market.listings.filter((listing) => {
    const matchesQuery =
      !deferredQuery ||
      [listing.title, listing.category, listing.description, listing.city]
        .join(" ")
        .toLowerCase()
        .includes(deferredQuery.toLowerCase());
    const matchesCategory = category === "Todo" || listing.category === category;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="page-container">
      <SectionHeader
        eyebrow="Explorar"
        title="Busca packs, donaciones y rescates"
        subtitle="Filtra por categoria o busca por barrio, comercio o urgencia."
      />
      <div className="search-panel">
        <input
          className="search-input"
          placeholder="Buscar comida, negocios o packs cercanos"
          value={query}
          onChange={(event) => {
            const nextValue = event.target.value;
            startTransition(() => setQuery(nextValue));
          }}
        />
        <div className="chips">
          {CATEGORY_OPTIONS.map((item) => (
            <button
              key={item}
              type="button"
              className={item === category ? "chip active" : "chip"}
              onClick={() => startTransition(() => setCategory(item))}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      {market.loading ? <LoadingState /> : null}
      {!market.loading && filteredListings.length === 0 ? (
        <EmptyState
          title="No encontramos ofertas con esos filtros"
          subtitle="Prueba limpiar la busqueda o volver a Todo para ver mas rescates."
          actionLabel="Limpiar filtros"
          onAction={() => {
            setQuery("");
            setCategory("Todo");
            onToast("Filtros reiniciados.");
          }}
        />
      ) : null}
      {!market.loading && filteredListings.length > 0 ? (
        <CardGrid listings={filteredListings} onReserve={onReserve} />
      ) : null}
    </div>
  );
}
