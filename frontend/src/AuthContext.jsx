import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest, getToken, setToken } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  // On page load, if a token is saved, ask the backend who it belongs to.
  useEffect(() => {
    if (!getToken()) return;
    apiRequest("/auth/me/")
      .then(setUser)
      .catch(() => setToken(null)) // token expired or invalid
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    const data = await apiRequest("/auth/login/", {
      method: "POST",
      body: { username, password },
      auth: false,
    });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(details) {
    const data = await apiRequest("/auth/register/", {
      method: "POST",
      body: details,
      auth: false,
    });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    try {
      await apiRequest("/auth/logout/", { method: "POST" });
    } catch {
      // Even if the server call fails, still log out on this device.
    }
    setToken(null);
    setUser(null);
  }

  const value = { user, loading, login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}