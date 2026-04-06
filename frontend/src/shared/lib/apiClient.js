import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Network error";

    // Handle auth expiry
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }

    return Promise.reject(new Error(message));
  }
);