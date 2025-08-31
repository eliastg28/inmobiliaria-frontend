// src/api/http.ts
import axios from "axios";

const API_URL = "http://localhost:8080"; // Cambia al URL de tu backend

const http = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para añadir el token a cada request
http.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default http;
