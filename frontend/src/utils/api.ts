import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("evocareer-auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      const token = parsed?.state?.accessToken;
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
  } catch {}

  // Let browser set Content-Type for FormData (includes boundary)
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const raw = localStorage.getItem("evocareer-auth");
        const refreshToken = JSON.parse(raw || "{}")?.state?.refreshToken;
        if (!refreshToken) throw new Error("No refresh token");
        const res = await axios.post(`${BASE_URL}/api/auth/refresh`, {
          refresh_token: refreshToken,
        });
        const { access_token, refresh_token: new_refresh } = res.data;
        const stored = JSON.parse(raw || "{}");
        stored.state = {
          ...stored.state,
          accessToken: access_token,
          refreshToken: new_refresh,
        };
        localStorage.setItem("evocareer-auth", JSON.stringify(stored));
        original.headers["Authorization"] = `Bearer ${access_token}`;
        return api(original);
      } catch {
        localStorage.removeItem("evocareer-auth");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;