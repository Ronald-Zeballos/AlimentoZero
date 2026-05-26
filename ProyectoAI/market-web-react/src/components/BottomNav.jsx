import { NavLink } from "react-router-dom";
import { ROLE_NAV_ITEMS } from "../constants";

export function BottomNav({ currentProfile, isAuthenticated }) {
  const navItems = isAuthenticated
    ? ROLE_NAV_ITEMS[currentProfile?.actorType] || ROLE_NAV_ITEMS.BUYER
    : [
        { to: "/comprador", label: "Inicio" },
        { to: "/explorar", label: "Promos" },
        { to: "/acceso", label: "Entrar" },
        { to: "/acceso", label: "Registro" }
      ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={`${item.to}-${item.label}`}
          to={item.to}
          end
          className={({ isActive }) => (isActive ? "bottom-link active" : "bottom-link")}
        >
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
