// src/components/layout/AuthLayout.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext"; // Importa el hook de autenticación
import { Spin } from "antd";

const AuthLayout = () => {
  const { isAuthenticated, isAuthReady } = useAuth(); // Obtén isAuthReady del contexto

  // Muestra un indicador de carga mientras la autenticación se verifica
  if (!isAuthReady) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Si ya está autenticado, redirige a la página principal
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
