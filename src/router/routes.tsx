// src/router/routes.ts
import React, { lazy } from "react";
import {
  HomeOutlined,
  TeamOutlined,
  UserOutlined,
  BookOutlined,
} from "@ant-design/icons";
import RolesPage from "@/features/usuarios/pages/RolesPage";
import { Navigate } from "react-router-dom";

// Componentes perezosos (Lazy-loaded components)
const HomePage = lazy(() => import("@/features/dashboard/pages/DashboardPage"));
const UsersPage = lazy(() => import("@/features/usuarios/pages/UsuariosPage"));

// ✨ Nuevos componentes perezosos para los catálogos
const EstadosLotePage = lazy(
  () => import("@/features/catalogos/pages/EstadosLotePage")
);
const MonedasPage = lazy(
  () => import("@/features/catalogos/pages/MonedasPage")
);
const TiposDocumentoPage = lazy(
  () => import("@/features/catalogos/pages/TiposDocumentoPage")
);
const TiposLotePage = lazy(
  () => import("@/features/catalogos/pages/TiposLotePage")
);

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
      allowedRoles: ["PROPIETARIO", "ADMIN", "AGENTE VENTAS"],
    },
  },
  {
    path: "/users", // Esta es la ruta padre, sin componente
    menuProps: {
      key: "/users",
      label: "Usuarios",
      icon: <UserOutlined />,
      allowedRoles: ["PROPIETARIO", "ADMIN"],
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
          allowedRoles: ["PROPIETARIO", "ADMIN"],
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
  },
  // ---
  // ✨ Nuevo menú para Catálogos
  {
    path: "/catalogs",
    menuProps: {
      key: "/catalogs",
      label: "Catálogos",
      icon: <BookOutlined />, // Usamos un ícono de libro para el grupo
      allowedRoles: ["PROPIETARIO", "ADMIN", "AGENTE VENTAS"],
    },
    children: [
      {
        path: "estados-lote",
        element: EstadosLotePage,
        menuProps: {
          key: "/catalogs/estados-lote",
          label: "Estados de Lote",
          icon: null,
          allowedRoles: ["PROPIETARIO", "ADMIN", "AGENTE VENTAS"],
        },
      },
      {
        path: "monedas",
        element: MonedasPage,
        menuProps: {
          key: "/catalogs/monedas",
          label: "Monedas",
          icon: null,
          allowedRoles: ["PROPIETARIO", "ADMIN", "AGENTE VENTAS"],
        },
      },
      {
        path: "tipos-documento",
        element: TiposDocumentoPage,
        menuProps: {
          key: "/catalogs/tipos-documento",
          label: "Tipos de Documento",
          icon: null,
          allowedRoles: ["PROPIETARIO", "ADMIN", "AGENTE VENTAS"],
        },
      },
      {
        path: "tipos-lote",
        element: TiposLotePage,
        menuProps: {
          key: "/catalogs/tipos-lote",
          label: "Tipos de Lote",
          icon: null,
          allowedRoles: ["PROPIETARIO", "ADMIN", "AGENTE VENTAS"],
        },
      },
    ],
  },
];
