import { useEffect, useMemo, useState } from "react";

const ACCOUNTS_KEY = "market.auth.accounts";
const ACTIVE_ACCOUNT_KEY = "market.auth.activeAccountId";

const SEEDED_ACCOUNTS = [
  {
    id: "seed-buyer",
    fullName: "Camila Rojas",
    email: "cliente@demo.bo",
    password: "123456",
    role: "BUYER",
    profileKey: "BUYER_NEIGHBOR"
  },
  {
    id: "seed-merchant",
    fullName: "Panaderia Aliada",
    email: "tienda@demo.bo",
    password: "123456",
    role: "MERCHANT",
    profileKey: "MERCHANT_BAKERY"
  },
  {
    id: "seed-ngo",
    fullName: "Banco de Alimentos",
    email: "ong@demo.bo",
    password: "123456",
    role: "NGO",
    profileKey: "NGO_FOOD_BANK"
  },
  {
    id: "seed-transporter",
    fullName: "Ruta Express",
    email: "reparto@demo.bo",
    password: "123456",
    role: "TRANSPORTER",
    profileKey: "TRANSPORT_LAST_MILE"
  }
];

const ROLE_TO_PROFILE_KEY = {
  BUYER: "BUYER_NEIGHBOR",
  MERCHANT: "MERCHANT_BAKERY",
  NGO: "NGO_FOOD_BANK",
  TRANSPORTER: "TRANSPORT_LAST_MILE",
  COORDINATOR: "COORDINATOR_CITY",
  ADMIN: "ADMIN_TENANT"
};

function loadStoredAccounts() {
  if (typeof window === "undefined") {
    return SEEDED_ACCOUNTS;
  }

  const raw = window.localStorage.getItem(ACCOUNTS_KEY);
  if (!raw) {
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(SEEDED_ACCOUNTS));
    return SEEDED_ACCOUNTS;
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEEDED_ACCOUNTS;
  } catch {
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(SEEDED_ACCOUNTS));
    return SEEDED_ACCOUNTS;
  }
}

function persistAccounts(accounts) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }
}

function persistActiveAccount(accountId) {
  if (typeof window !== "undefined") {
    if (accountId) {
      window.localStorage.setItem(ACTIVE_ACCOUNT_KEY, accountId);
    } else {
      window.localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
    }
  }
}

export function useAuthSession() {
  const [accounts, setAccounts] = useState(() => loadStoredAccounts());
  const [activeAccountId, setActiveAccountId] = useState(() =>
    typeof window !== "undefined" ? window.localStorage.getItem(ACTIVE_ACCOUNT_KEY) || "" : ""
  );

  useEffect(() => {
    persistAccounts(accounts);
  }, [accounts]);

  useEffect(() => {
    persistActiveAccount(activeAccountId);
  }, [activeAccountId]);

  const activeAccount = useMemo(
    () => accounts.find((account) => account.id === activeAccountId) || null,
    [accounts, activeAccountId]
  );

  function login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const account = accounts.find(
      (item) => item.email.toLowerCase() === normalizedEmail && item.password === password
    );

    if (!account) {
      throw new Error("Correo o contrasena incorrectos.");
    }

    setActiveAccountId(account.id);
    return account;
  }

  function register({ fullName, email, password, role }) {
    const normalizedEmail = email.trim().toLowerCase();
    if (accounts.some((account) => account.email.toLowerCase() === normalizedEmail)) {
      throw new Error("Ese correo ya esta registrado.");
    }

    const nextAccount = {
      id: `account-${Date.now()}`,
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      role,
      profileKey: ROLE_TO_PROFILE_KEY[role] || ROLE_TO_PROFILE_KEY.BUYER
    };

    const nextAccounts = [...accounts, nextAccount];
    setAccounts(nextAccounts);
    setActiveAccountId(nextAccount.id);
    return nextAccount;
  }

  function logout() {
    setActiveAccountId("");
  }

  return {
    accounts,
    activeAccount,
    isAuthenticated: Boolean(activeAccount),
    login,
    register,
    logout
  };
}
