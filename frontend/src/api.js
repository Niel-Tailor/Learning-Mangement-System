const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";
const TOKEN_KEY = "token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export class ApiError extends Error {
  constructor(status, data) {
    super(errorMessage(data) || `Request failed (${status})`);
    this.status = status;
    this.data = data;
  }
}

function errorMessage(data) {
  if (!data) return "";
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  // DRF field errors look like { username: ["This field is required."] }
  return Object.entries(data)
    .map(([field, messages]) => `${field}: ${[].concat(messages).join(" ")}`)
    .join(" ");
}

export async function apiRequest(path, { method = "GET", body, auth = true } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const token = getToken();
  if (auth && token) headers.Authorization = `Token ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, data);
  return data;
}