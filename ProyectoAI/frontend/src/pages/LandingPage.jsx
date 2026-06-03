import React from "react";

export default function LandingPage({ onNavigate }) {
  return (
    <>
      <section className="hero" id="heroSection">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <h1 className="mb-4">Rescata alimentos, alimenta el futuro.</h1>
              <p className="mb-4 lead">Conectamos restaurantes, comercios, repartidores y organizaciones sociales para reducir el desperdicio de alimentos.</p>
              <div className="d-flex gap-3 flex-wrap">
                <button className="btn btn-light btn-lg fw-bold px-5" onClick={() => onNavigate("register")}>Sumarme</button>
                <button className="btn btn-outline-light btn-lg fw-bold px-4" onClick={() => onNavigate("login")}>Ya tengo cuenta</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-band section-soft">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-3 text-center">
              <div className="display-4 mb-2">🍽️</div>
              <h5 className="fw-bold">Restaurantes</h5>
              <p className="text-muted small mb-0">Publica excedentes, recibe deducciones fiscales y contribui al ambiente.</p>
            </div>
            <div className="col-md-3 text-center">
              <div className="display-4 mb-2">🛒</div>
              <h5 className="fw-bold">Compradores</h5>
              <p className="text-muted small mb-0">Comprá comida de calidad a precios reducidos cerca de ti.</p>
            </div>
            <div className="col-md-3 text-center">
              <div className="display-4 mb-2">🚚</div>
              <h5 className="fw-bold">Repartidores</h5>
              <p className="text-muted small mb-0">Recogé y entregá pedidos, contribuyendo a la economía circular.</p>
            </div>
            <div className="col-md-3 text-center">
              <div className="display-4 mb-2">🤝</div>
              <h5 className="fw-bold">Entidades Sociales</h5>
              <p className="text-muted small mb-0">Solicitá donaciones de alimentos para quienes más lo necesitan.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-band landing-extra">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-md-6">
              <h2 className="fw-bold mb-3">¿Como funciona?</h2>
              <div className="d-flex gap-3 mb-3"><div className="fw-bold fs-4" style={{color:"var(--green)"}}>1</div><div><strong>Registrate</strong> como restaurante, comprador, repartidor u organizacion social.</div></div>
              <div className="d-flex gap-3 mb-3"><div className="fw-bold fs-4" style={{color:"var(--green)"}}>2</div><div><strong>Publica o descubre</strong> ofertas de alimentos cerca de ti.</div></div>
              <div className="d-flex gap-3 mb-3"><div className="fw-bold fs-4" style={{color:"var(--green)"}}>3</div><div><strong>Reserva, paga y recoge</strong> de forma segura.</div></div>
              <div className="d-flex gap-3"><div className="fw-bold fs-4" style={{color:"var(--green)"}}>4</div><div><strong>Recibe certificados</strong> fiscales por donaciones y contribui al ODS 12.3.</div></div>
            </div>
            <div className="col-md-6">
              <div style={{background:"var(--soft-green)", borderRadius:24,padding:"32px",textAlign:"center"}}>
                <div className="display-1 mb-3">🌱</div>
                <h4 className="fw-bold">Impacto Colectivo</h4>
                <p className="text-muted">Cada alimento rescatado es un paso hacia un futuro sin desperdicio. En 2025 rescatamos juntos mas de 12 toneladas de alimentos.</p>
                <div className="row g-3 mt-3">
                  <div className="col-4"><div className="fw-bold fs-3" style={{color:"var(--green)"}}>12t+</div><small className="text-muted">Rescatadas</small></div>
                  <div className="col-4"><div className="fw-bold fs-3" style={{color:"var(--green)"}}>8k+</div><small className="text-muted">Comidas</small></div>
                  <div className="col-4"><div className="fw-bold fs-3" style={{color:"var(--green)"}}>32t</div><small className="text-muted">CO₂ evitado</small></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
