// src/api/auth.service.ts
import http from "./http";

interface LoginDTO {
  username: string;
  password: string;
}

export const login = async (data: LoginDTO) => {
  const response = await http.post("/auth/login", data);
  return response.data;
};

export const register = async (data: any) => {
  const response = await http.post("/auth/register", data);
  return response.data;
};
