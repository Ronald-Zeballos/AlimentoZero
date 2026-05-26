import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROLE_HOME_PATHS } from "../constants";

const ROLE_OPTIONS = [
  { value: "BUYER", label: "Cliente" },
  { value: "MERCHANT", label: "Tienda aliada" },
  { value: "NGO", label: "Organizacion social" },
  { value: "TRANSPORTER", label: "Reparto" }
];

function resolveNextPath(account) {
  return ROLE_HOME_PATHS[account?.role] || ROLE_HOME_PATHS.BUYER;
}

export function AuthPage({
  auth,
  onToast,
  initialMode = "login",
  intentMessage = "Inicia sesion para continuar con tu experiencia."
}) {
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [loginForm, setLoginForm] = useState({
    email: "cliente@demo.bo",
    password: "123456"
  });
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "BUYER"
  });

  function handleLogin(event) {
    event.preventDefault();
    try {
      const account = auth.login(loginForm);
      onToast(`Bienvenido, ${account.fullName}.`);
      navigate(resolveNextPath(account));
    } catch (error) {
      onToast(error.message);
    }
  }

  function handleRegister(event) {
    event.preventDefault();
    try {
      const account = auth.register(registerForm);
      onToast(`Cuenta creada para ${account.fullName}.`);
      navigate(resolveNextPath(account));
    } catch (error) {
      onToast(error.message);
    }
  }

  return (
    <div className="page-container auth-page">
      <section className="auth-hero">
        <p className="eyebrow">Acceso</p>
        <h1>Explora, entra o crea tu cuenta</h1>
        <p>{intentMessage}</p>
        <div className="auth-switch">
          <button
            type="button"
            className={mode === "login" ? "primary-button slim" : "ghost-button"}
            onClick={() => setMode("login")}
          >
            Iniciar sesion
          </button>
          <button
            type="button"
            className={mode === "register" ? "primary-button slim" : "ghost-button"}
            onClick={() => setMode("register")}
          >
            Crear cuenta
          </button>
        </div>
      </section>
      <div className="auth-layout">
        <section className="auth-card">
          {mode === "login" ? (
            <form className="publish-form" onSubmit={handleLogin}>
              <SectionTitle title="Bienvenido de nuevo" copy="Ingresa con una cuenta demo o con una cuenta creada por ti." />
              <label>
                Correo
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) =>
                    setLoginForm({ ...loginForm, email: event.target.value })
                  }
                />
              </label>
              <label>
                Contrasena
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm({ ...loginForm, password: event.target.value })
                  }
                />
              </label>
              <button type="submit" className="primary-button">
                Entrar
              </button>
            </form>
          ) : (
            <form className="publish-form" onSubmit={handleRegister}>
              <SectionTitle title="Crea tu cuenta" copy="Elige el tipo de experiencia que quieres usar." />
              <label>
                Nombre completo
                <input
                  value={registerForm.fullName}
                  onChange={(event) =>
                    setRegisterForm({ ...registerForm, fullName: event.target.value })
                  }
                />
              </label>
              <label>
                Correo
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(event) =>
                    setRegisterForm({ ...registerForm, email: event.target.value })
                  }
                />
              </label>
              <label>
                Contrasena
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(event) =>
                    setRegisterForm({ ...registerForm, password: event.target.value })
                  }
                />
              </label>
              <label>
                Quiero entrar como
                <select
                  value={registerForm.role}
                  onChange={(event) =>
                    setRegisterForm({ ...registerForm, role: event.target.value })
                  }
                >
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="primary-button">
                Crear cuenta
              </button>
            </form>
          )}
        </section>
        <section className="auth-card auth-card-soft">
          <SectionTitle
            title="Cuentas demo listas"
            copy="Puedes probar varias vistas sin registrar nada primero."
          />
          <div className="demo-account-list">
            {auth.accounts.map((account) => (
              <article className="demo-account" key={account.id}>
                <strong>{account.fullName}</strong>
                <span>{account.email}</span>
                <small>{ROLE_OPTIONS.find((option) => option.value === account.role)?.label || "Cuenta"}</small>
              </article>
            ))}
          </div>
          <p className="helper-text">Contrasena demo para las cuentas base: `123456`.</p>
        </section>
      </div>
    </div>
  );
}

function SectionTitle({ title, copy }) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      <p className="section-copy">{copy}</p>
    </div>
  );
}
