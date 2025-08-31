import { useState, useEffect } from "react";
import http from "@/api/http";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    http
      .get("/auth/validate-token")
      .then(() => setIsAuthenticated(true))
      .catch(() => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      });
  }, []);

  return isAuthenticated;
};
