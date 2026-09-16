import axios from "axios";

const API = axios.create({
  baseURL: "https://skill-bridge-backend-839758923210.asia-south1.run.app/",
});

// Attach token automatically (after login)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;