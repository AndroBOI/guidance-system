import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

// Simple interceptor - just redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expired - redirect to login
    if (error.response?.status === 401) {
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
