// src/components/layout/AppSidebar.tsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu } from "antd";
import { DoubleRightOutlined, DoubleLeftOutlined } from "@ant-design/icons";
import { useAuth } from "@/context/AuthContext";
// import { LogOut } from "lucide-react"; // ⬅️ ELIMINADO
import { appRoutes, AppRoute } from "@/router/routes";

interface AppSidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth(); // Mantengo 'logout' por si lo usas en otro lado

  // Obtenemos los roles del usuario de manera segura
  const userRoles = user?.roles || []; 

  // Función de ayuda para verificar si el usuario tiene acceso
  const hasAccess = (allowedRoles: string[]): boolean => {
    return allowedRoles.some(role => userRoles.includes(role));
  };


  // Función recursiva para generar los items del menú, incluyendo submenús
  const renderMenuItems = (routes: AppRoute[]): any[] => {
    return routes
      // 🌟🌟🌟 FILTRO CLAVE: Asegurarse que menuProps exista y el usuario tenga acceso 🌟🌟🌟
      .filter(route => 
          route.menuProps && hasAccess(route.menuProps.allowedRoles)
      )
      .map(route => {
        
        // El filtro anterior garantiza que menuProps exista
        const { key, icon, label } = route.menuProps!; 

        // Si la ruta tiene hijos, gestiona el SubMenu
        if (route.children && route.children.length > 0) {
          
          // Renderiza recursivamente a los hijos
          const childrenItems = renderMenuItems(route.children); 
          
          // Oculta el menú padre si ninguno de sus hijos es visible
          if (childrenItems.length === 0) {
            return null; 
          }

          return {
            key: key,
            icon: icon,
            label: label,
            children: childrenItems, 
          };
        }
        
        // Si no tiene hijos, crea un Item de Menú (Hoja)
        return {
          key: key,
          icon: icon,
          label: label,
        };
      })
      .filter(item => item !== null); // Eliminar entradas nulas (padres sin hijos visibles)
  };

  const menuItems = renderMenuItems(appRoutes);
  
  return (
    <div style={{ height: '100vh', backgroundColor: '#001529' }}>
      <div
        onClick={toggleSidebar}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '16px 32px',
          marginBottom: '16px',
          cursor: 'pointer',
          color: 'white',
          overflow: 'hidden',
          transition: 'all 0.2s',
          whiteSpace: 'nowrap'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '18px',
          fontWeight: 'bold',
          transition: 'all 0.2s',
          opacity: collapsed ? 0 : 1,
          width: collapsed ? 0 : 'auto',
          overflow: 'hidden'
        }}>
          Averco
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '18px',
          color: 'white',
          marginLeft: collapsed ? '0' : 'auto',
        }}>
          {collapsed ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
        </div>
      </div>
      
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        inlineCollapsed={collapsed}
        onClick={({ key }) => {
          navigate(key); 
        }}
        items={menuItems}
      />
    </div>
  );
};

export default AppSidebar;