// src/components/layout/AppLayout.tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/layout/AppSidebar";
import AppHeader from "@/components/layout/AppHeader";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Layout } from "antd";

const { Sider, Content } = Layout;

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={toggleSidebar}
        trigger={null}
      >
        <AppSidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />
      </Sider>
      <Layout>
        <AppHeader />
        <Content style={{ margin: '16px 16px', overflowY: 'auto' }}>
          <div style={{ padding: '24px', background: '#fff', borderRadius: "10px", minHeight: '100%' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
