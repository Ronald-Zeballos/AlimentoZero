import React from "react";

export function Navbar({ currentRole, roleLabel, onLogout, onNavigate }) {
  const showRole = currentRole && currentRole !== "landing";

  return (
    <nav className="navbar navbar-expand app-navbar sticky-top">
      <div className="container">
        <a className="navbar-brand fw-bold" href="#" onClick={() => onNavigate?.("landing")} style={{ letterSpacing: "-0.5px", fontSize: "1.4rem" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2" style={{ verticalAlign: "middle" }}>
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          AlimentoZero
        </a>
        <div className="navbar-nav ms-auto align-items-center gap-1">
          {showRole ? (
            <>
              <span className="nav-link text-white-50 small d-none d-md-inline">{roleLabel}</span>
              <button className="nav-link btn btn-link text-decoration-none" onClick={() => onNavigate?.("dashboard")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-1" style={{ verticalAlign: "middle" }}>
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
                Dashboard
              </button>
              <button className="nav-link btn btn-link text-decoration-none" onClick={() => onNavigate?.("tracking")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-1" style={{ verticalAlign: "middle" }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Mapa
              </button>
              <button className="nav-link btn btn-link text-decoration-none" onClick={onLogout}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-1" style={{ verticalAlign: "middle" }}>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Salir
              </button>
            </>
          ) : (
            <>
              <button className="nav-link btn btn-link text-decoration-none" onClick={() => onNavigate?.("login")}>Ingresar</button>
              <button className="nav-link btn btn-link text-decoration-none" onClick={() => onNavigate?.("register")}>Registrarse</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
