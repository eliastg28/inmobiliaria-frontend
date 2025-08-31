// src/components/layout/AppHeader.tsx
import React from "react";
import { UserOutlined } from "@ant-design/icons";
import { Dropdown, Menu } from "antd";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // Importa el hook de autenticación

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Obtén el usuario y la función de logout del contexto

  const handleLogout = () => {
    logout(); // Llama a la función de logout del contexto
    navigate("/login");
  };

  const menu = (
    <Menu>
      <Menu.Item key="logout" onClick={handleLogout} icon={<LogOut size={16} />}>
        Cerrar sesión
      </Menu.Item>
    </Menu>
  );

  return (
    <div style={{ padding: '0 16px', background: '#FAFAFA', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: 64 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Dropdown overlay={menu} trigger={['click']}>
          <a onClick={e => e.preventDefault()} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#333' }}>
            <UserOutlined style={{ fontSize: '20px' }} />
            {/* Muestra el nombre de usuario del contexto */}
            <span>{user?.username || "Usuario"}</span>
          </a>
        </Dropdown>
      </div>
    </div>
  );
};

export default AppHeader;
