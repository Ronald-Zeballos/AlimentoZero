import React, { useState } from "react";

export default function RegisterPage({ onNavigate }) {
  const [userType, setUserType] = useState("");
  return (
    <div className="page active" id="registerPage">
      <div className="container py-5">
        <div className="auth-card card shadow p-4">
          <div className="card-body text-center">
            <div className="display-5 mb-3">📝</div>
            <h3 className="fw-bold mb-1">Crear cuenta</h3>
            <p className="text-muted mb-3">Selecciona tu tipo de usuario</p>
            <div className="mb-3 text-start">
              {["restaurant", "buyer", "driver", "social"].map((type) => (
                <div key={type} className={`border rounded-3 p-3 mb-2 ${userType === type ? "border-success bg-soft-green" : ""}`} style={{cursor:"pointer"}} onClick={() => setUserType(type)}>
                  <div className="d-flex align-items-center gap-3">
                    <input type="radio" name="userType" className="form-check-input mt-0" checked={userType === type} readOnly />
                    <div className="text-start">
                      <div className="fw-bold">{type === "restaurant" ? "🍽️ Restaurante / Comercio" : type === "buyer" ? "🛒 Comprador" : type === "driver" ? "🚚 Repartidor" : "🤝 Organizacion Social"}</div>
                      <small className="text-muted">{type === "restaurant" ? "Publica excedentes y obten certificados fiscales" : type === "buyer" ? "Compra comida a precios reducidos" : type === "driver" ? "Realiza entregas y genera ingresos" : "Solicita donaciones para tu comunidad"}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <hr />
            <button className="btn btn-success w-100 mb-2">Crear cuenta</button>
            <small className="text-muted">¿Ya tienes cuenta? <a href="#" className="text-success fw-bold" onClick={() => onNavigate("login")}>Inicia sesion</a></small>
          </div>
        </div>
      </div>
    </div>
  );
}
