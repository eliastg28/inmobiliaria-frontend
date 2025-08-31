// src/components/router/AppRouter.tsx
import React, { JSX, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Spin } from "antd";
import { appRoutes } from "@/router/routes";
import { AppRoute } from "@/router/routes";

// Layouts
import AppLayout from "@/components/layout/AppLayout";

// Paginas principales
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

// Componente para proteger las rutas por rol
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isAuthReady, user } = useAuth();

  // Muestra un indicador de carga mientras se verifica la autenticación
  if (!isAuthReady) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Si no está autenticado, redirige a la página de login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verifica si el usuario tiene al menos uno de los roles permitidos
  const hasRequiredRole = user?.roles?.some(role => allowedRoles.includes(role));

  if (user && hasRequiredRole) {
    return <>{children}</>;
  }

  // Si no tiene el rol, redirige a la página de inicio
  return <Navigate to="/" replace />;
};

// Función recursiva para generar las rutas. 
// Ahora cada ruta con un componente se envuelve en ProtectedRoute.
const renderRoutes = (routes: AppRoute[]): JSX.Element[] => {
  return routes.flatMap((route) => {
    if (route.children) {
      // No se necesita redirección aquí, ya que el Outlet se encargará de renderizar la sub-ruta.
      return (
        <Route
          key={route.path}
          path={route.path}
          element={route.element ? <ProtectedRoute allowedRoles={route.menuProps.allowedRoles}><route.element /></ProtectedRoute> : null}
        >
          {renderRoutes(route.children)}
        </Route>
      );
    }
    // Si la ruta tiene un componente, la renderiza como una página
    else if (route.element) {
      return (
        <Route
          key={route.path}
          path={route.path}
          // Envuelve el componente con ProtectedRoute y pasa los roles permitidos
          element={<ProtectedRoute allowedRoles={route.menuProps.allowedRoles}>
                    <route.element />
                   </ProtectedRoute>}
        />
      );
    }
    return [];
  });
};

const AppRouter: React.FC = () => {
  const { isAuthenticated, isAuthReady } = useAuth();
  
  if (!isAuthReady) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    }>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
        
        {/*
          Ahora, la ruta principal que renderiza AppLayout también está protegida.
          Esto previene que usuarios no autenticados accedan a cualquier ruta anidada
          sin pasar por el login.
        */}
        <Route
          path="/"
          element={<ProtectedRoute allowedRoles={appRoutes.flatMap(route => route.menuProps.allowedRoles)}><AppLayout /></ProtectedRoute>}
        >
          {renderRoutes(appRoutes)}
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
