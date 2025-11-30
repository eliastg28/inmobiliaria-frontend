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
  // Cambiamos el tipo para que acepte un array, incluso si está vacío (por si acaso)
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

  // Si no se especifican roles permitidos (ej: la ruta principal), se permite el acceso.
  // Esto es un fallback, la lógica debe asegurar que el usuario autenticado tiene al menos un rol.
  if (allowedRoles.length === 0) {
      return <>{children}</>;
  }

  // Verifica si el usuario tiene al menos uno de los roles permitidos
  const hasRequiredRole = user?.roles?.some(role => allowedRoles.includes(role));

  if (user && hasRequiredRole) {
    return <>{children}</>;
  }

  // Si no tiene el rol, redirige a la página de inicio (o a un 403)
  return <Navigate to="/" replace />;
};

// Función recursiva para generar las rutas.
const renderRoutes = (routes: AppRoute[]): JSX.Element[] => {
  return routes.flatMap((route) => {
    // 🌟 CORRECCIÓN CLAVE: Usamos encadenamiento opcional y un fallback a array vacío 🌟
    const allowedRoles = route.menuProps?.allowedRoles || [];

    if (route.children) {
      const element = route.element ? (
        <ProtectedRoute allowedRoles={allowedRoles}>
          <route.element />
        </ProtectedRoute>
      ) : null;
      
      return (
        <Route
          key={route.path}
          path={route.path}
          element={element}
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
          element={
            <ProtectedRoute allowedRoles={allowedRoles}>
              <route.element />
            </ProtectedRoute>
          }
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

  // 🌟 CORRECCIÓN CLAVE: Fallback a array vacío si menuProps no existe 🌟
  // Esto genera una lista con TODOS los roles permitidos en la aplicación.
  const allAllowedRoles = appRoutes.flatMap(route => 
      route.menuProps?.allowedRoles || []
  );

  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    }>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
        
        {/*
          La ruta principal que renderiza AppLayout está protegida. 
          Usamos 'allAllowedRoles' para permitir el acceso si el usuario tiene *cualquier* rol definido.
        */}
        <Route
          path="/"
          element={<ProtectedRoute allowedRoles={allAllowedRoles}><AppLayout /></ProtectedRoute>}
        >
          {renderRoutes(appRoutes)}
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;