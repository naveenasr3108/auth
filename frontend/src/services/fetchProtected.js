import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "../utils/auth";

const API_URL = "http://localhost:5000/api";

export const fetchProtected = async (endpoint, options = {}) => {
  let accessToken = getAccessToken();

  // attach access token
  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {})
    }
  });

  // if token expired → refresh token flow
  if (response.status === 403 || response.status === 401) {
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
      return;
    }

    // save new access token
    setTokens(data.accessToken, refreshToken);

    // retry original request
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.accessToken}`,
        ...(options.headers || {})
      }
    });
  }

  return response.json();
};