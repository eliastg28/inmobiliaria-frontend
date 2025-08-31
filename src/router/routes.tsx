// src/router/routes.ts
import React, { lazy } from "react";
import { HomeOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import RolesPage from "@/features/usuarios/pages/RolesPage";
import { Navigate } from "react-router-dom";

// Componentes perezosos (Lazy-loaded components)
const HomePage = lazy(() => import("@/features/dashboard/pages/DashboardPage"));
const UsersPage = lazy(() => import("@/features/usuarios/pages/UsuariosPage"));

// Interfaz para la configuración de la ruta
export interface AppRoute {
  path: string;
  element?: React.FC;
  exact?: boolean;
  menuProps: {
    key: string;
    label: string;
    icon: React.ReactNode;
    allowedRoles: string[];
  };
  children?: AppRoute[]; // Agrega la propiedad de rutas anidadas
}

export const appRoutes: AppRoute[] = [
  {
    path: "/",
    element: HomePage,
    menuProps: {
      key: "/",
      label: "Dashboard",
      icon: <HomeOutlined />,
      allowedRoles: ["PROPIETARIO","ADMIN", "AGENTE VENTAS"],
    },
  },
  {
    path: "/users", // Esta es la ruta padre, sin componente
    menuProps: {
      key: "/users",
      label: "Usuarios",
      icon: <UserOutlined />,
      allowedRoles: ["PROPIETARIO","ADMIN"],
    },
    children: [
      {
        path: "", // Ruta de índice para redirigir si se accede a "/users" directamente
        element: () => <Navigate to="/" replace />, // Redirige a la raíz
        menuProps: {
          key: "index-redirect",
          label: "", // Sin etiqueta en el menú para esta redirección
          icon: null,
          allowedRoles: [],
        },
      },
      {
        path: "list", // La ruta completa será "/users/list"
        element: UsersPage,
        menuProps: {
          key: "/users/list",
          label: "Lista de Usuarios",
          icon: <UserOutlined />,
          allowedRoles: ["PROPIETARIO","ADMIN"],
        },
      },
      {
        path: "roles", // La ruta completa será "/users/roles"
        element: RolesPage,
        menuProps: {
          key: "/users/roles",
          label: "Roles",
          icon: <TeamOutlined />,
          allowedRoles: ["PROPIETARIO", "ADMIN"],
        },
      },
    ],
  }
];
