import { useState, useCallback } from "react";
import { ROLE_BY_EMAIL, ROLE_LABELS } from "../constants";

export function useAuth() {
  const [currentRole, setCurrentRole] = useState(() => localStorage.getItem("ds_role") || null);

  const login = useCallback((email) => {
    const role = ROLE_BY_EMAIL[email.trim().toLowerCase()];
    if (!role) return null;
    localStorage.setItem("ds_role", role);
    setCurrentRole(role);
    return role;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("ds_role");
    setCurrentRole(null);
  }, []);

  const roleLabel = currentRole ? ROLE_LABELS[currentRole] : "";

  return { currentRole, roleLabel, login, logout };
}
