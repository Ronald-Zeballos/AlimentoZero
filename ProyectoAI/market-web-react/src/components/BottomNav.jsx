import { NavLink } from "react-router-dom";

export function BottomNav() {
  const navItems = [
    { to: "/", label: "Inicio" },
    { to: "/explorar", label: "Explorar" },
    { to: "/publicar", label: "Publicar" },
    { to: "/pedidos", label: "Pedidos" },
    { to: "/perfil", label: "Perfil" }
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) => (isActive ? "bottom-link active" : "bottom-link")}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
