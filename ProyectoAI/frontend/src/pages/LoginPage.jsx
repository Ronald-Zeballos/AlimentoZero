import React, { useState } from "react";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email);
  };

  return (
    <div className="page active" id="loginPage">
      <div className="container py-5">
        <div className="auth-card card shadow p-4">
          <div className="card-body text-center">
            <div className="display-5 mb-3">🔐</div>
            <h3 className="fw-bold mb-1">Bienvenido</h3>
            <p className="text-muted mb-4">Inicia sesion para continuar</p>
            <form onSubmit={handleSubmit}>
              <div className="mb-3 text-start">
                <label className="form-label small fw-bold">Correo electronico</label>
                <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="rest@test.com" required />
              </div>
              <div className="mb-3 text-start">
                <label className="form-label small fw-bold">Contrasena</label>
                <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" required />
              </div>
              <button type="submit" className="btn btn-success w-100 mb-2">Ingresar</button>
            </form>
            <hr />
            <small className="text-muted">Demo: rest@test.com / buyer@test.com / driver@test.com / social@test.com</small>
          </div>
        </div>
      </div>
    </div>
  );
}
