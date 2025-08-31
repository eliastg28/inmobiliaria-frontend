// src/pages/DashboardPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Col, Row, Typography, Statistic, Table, Button } from 'antd';
import { ArrowUpOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const DashboardPage = () => {
  // Datos de ejemplo para las estadísticas
  const stats = [
    { title: "Propiedades Activas", value: 124, trend: "up", color: '#52c41a' },
    { title: "Visitas este mes", value: 356, trend: "up", color: '#52c41a' },
    { title: "Nuevos Clientes", value: 45, trend: "up", color: '#52c41a' },
  ];

  // Datos de ejemplo para la tabla
  const recentData = [
    { key: '1', name: 'Apartamento en Polanco', visits: 12, status: 'Activo' },
    { key: '2', name: 'Casa en Santa Fe', visits: 8, status: 'Pendiente' },
    { key: '3', name: 'Local Comercial', visits: 5, status: 'Vendido' },
  ];

  const columns = [
    { title: 'Propiedad', dataIndex: 'name', key: 'name' },
    { title: 'Visitas', dataIndex: 'visits', key: 'visits' },
    { title: 'Estado', dataIndex: 'status', key: 'status' },
  ];

  return (
    <div>
      <Title level={2} style={{ color: '#001529' }}>Dashboard</Title>
      <Text style={{ color: '#555' }}>Bienvenido de vuelta.</Text>

      {/* Tarjetas de estadísticas */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} md={8} key={index}>
            <Card style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Statistic 
                title={stat.title} 
                value={stat.value} 
                valueStyle={{ color: stat.color }}
                prefix={stat.trend === "up" ? <ArrowUpOutlined /> : null}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Gráficos o visualizaciones */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} md={12}>
          <Card 
            title="Gráfico de Visitas Mensuales"
            style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          >
            {/* Espacio para un gráfico real, podrías usar una librería como Recharts o Chart.js */}
            <div style={{ height: 200, backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Text type="secondary">Aquí irá un gráfico</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card 
            title="Gráfico de Estados de Propiedades"
            style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          >
            {/* Espacio para un gráfico de pastel, por ejemplo */}
            <div style={{ height: 200, backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Text type="secondary">Aquí irá otro gráfico</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Tabla de datos recientes */}
      <Row style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card 
            title="Propiedades Recientes"
            style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          >
            <Table dataSource={recentData} columns={columns} pagination={false} />
          </Card>
        </Col>
      </Row>

    </div>
  );
};

export default DashboardPage;
