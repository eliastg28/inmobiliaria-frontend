// src/components/layout/AppSidebar.tsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu } from "antd";
import { DoubleRightOutlined, DoubleLeftOutlined } from "@ant-design/icons";
import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";
import { appRoutes, AppRoute } from "@/router/routes";

interface AppSidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Función recursiva para generar los items del menú, incluyendo submenús
  const renderMenuItems = (routes: AppRoute[]): any[] => {
    return routes
      .filter(route =>
        route.menuProps.allowedRoles.some(role => user?.roles?.includes(role))
      )
      .map(route => {
        // Si la ruta tiene hijos, crea un SubMenu
        if (route.children && route.children.length > 0) {
          return {
            key: route.menuProps.key,
            icon: route.menuProps.icon,
            label: route.menuProps.label,
            children: renderMenuItems(route.children), // Llama recursivamente
          };
        }
        // Si no tiene hijos, crea un Item de Menú
        return {
          key: route.menuProps.key,
          icon: route.menuProps.icon,
          label: route.menuProps.label,
        };
      });
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
          if (key === "logout") {
            handleLogout();
          } else {
            navigate(key);
          }
        }}
        items={menuItems}
      />
    </div>
  );
};

export default AppSidebar;
