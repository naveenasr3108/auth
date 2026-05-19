import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "../utils/auth";

const API_URL = "http://localhost:5000/api";

export const fetchProtected = async (endpoint, options = {}) => {
  let accessToken = getAccessToken();

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {})
    }
  });

  if (response.status === 401 || response.status === 403) {
    const refreshToken = getRefreshToken();

    const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: refreshToken })
    });

    const data = await refreshRes.json();
    if (!data.accessToken) {
      clearTokens();
      window.location.href = "/login";
      throw new Error("Unauthorized");  
    }

    setTokens(data.accessToken, refreshToken);

    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.accessToken}`,
        ...(options.headers || {})
      }
    });
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "API request failed");  // ✅ IMPORTANT
  }

  return response.json();
};