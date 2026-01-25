// src/pages/DashboardPage.tsx

import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Typography, Statistic, Table, Spin, message, Button } from 'antd';
import { ArrowUpOutlined, DownloadOutlined } from '@ant-design/icons';
import * as Recharts from 'recharts';
import { getLotesActivos, searchLotesByEstado } from '../../../api/lote.service';
import { getVentas } from '../../../api/ventaLote.service';
import { getClientes } from '../../../api/cliente.service';
import { getProyectos } from '../../../api/proyecto.service';
import { getEstadosLote } from '../../../api/estadoLote.service';

const { Title, Text } = Typography;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFE', '#FF6699', '#33CC99', '#FF4444'];

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    lotesActivos: 0,
    ventasMes: 0,
    clientesMes: 0,
    proyectosActivos: 0,
  });
  const [ventasMensuales, setVentasMensuales] = useState<any[]>([]);
  const [distribucionEstados, setDistribucionEstados] = useState<any[]>([]);
  const [ventasRecientes, setVentasRecientes] = useState<any[]>([]);

  // 📌 FUNCIÓN PARA DESCARGAR EL PDF
  const handleDownloadPDF = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/reportes/mensual/pdf", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Error al descargar el PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = "reporte-mensual.pdf";
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error("No se pudo descargar el informe PDF");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const lotesActivos = await getLotesActivos();
        const ventas = await getVentas();
        const clientes = await getClientes();
        const proyectos = await getProyectos();
        const estados = await getEstadosLote();

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const ventasMes = ventas.filter(v => {
          if (!v.fechaContrato) return false;
          const fecha = new Date(v.fechaContrato);
          return fecha.getUTCMonth() === currentMonth && fecha.getUTCFullYear() === currentYear;
        }).length;

        const clientesMes = clientes.filter(c => {
          if (!c.fechaCreacion) return false;
          const fecha = new Date(c.fechaCreacion);
          return fecha.getMonth() === now.getMonth() && fecha.getFullYear() === now.getFullYear();
        }).length;

        const ventasPorMes: { [key: string]: number } = {};
        ventas.forEach(v => {
          if (!v.fechaContrato) return;
          const fecha = new Date(v.fechaContrato);
          const year = fecha.getUTCFullYear();
          const month = (fecha.getUTCMonth() + 1).toString().padStart(2, '0');
          const key = `${year}-${month}`;
          ventasPorMes[key] = (ventasPorMes[key] || 0) + 1;
        });

        const meses = Array.from({ length: 12 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
          return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        });

        const ventasMensualesData = meses.map(m => ({ mes: m, ventas: ventasPorMes[m] || 0 }));

        const distribucion: any[] = [];
        for (let estado of estados) {
          const lotesPorEstado = await searchLotesByEstado(estado.nombre);
          distribucion.push({ name: estado.nombre, value: lotesPorEstado.length });
        }

        const ventasRecientesData = ventas
          .sort((a, b) => (b.fechaContrato && a.fechaContrato ? new Date(b.fechaContrato).getTime() - new Date(a.fechaContrato).getTime() : 0))
          .slice(0, 5)
          .map(v => ({
            key: v.ventaId,
            propiedad: v.loteNombre,
            cliente: v.clienteNombreCompleto,
            estado: v.estadoVentaNombre,
            fecha: v.fechaContrato ? v.fechaContrato.split('-').reverse().join('/') : '-',
            monto: v.montoTotal,
          }));

        setStats({
          lotesActivos: lotesActivos.length,
          ventasMes,
          clientesMes,
          proyectosActivos: proyectos.length,
        });

        setVentasMensuales(ventasMensualesData);
        setDistribucionEstados(distribucion);
        setVentasRecientes(ventasRecientesData);

      } catch (err) {
        message.error('Error al cargar datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { title: 'Propiedad', dataIndex: 'propiedad', key: 'propiedad' },
    { title: 'Cliente', dataIndex: 'cliente', key: 'cliente' },
    { title: 'Estado', dataIndex: 'estado', key: 'estado' },
    { title: 'Fecha Contrato', dataIndex: 'fecha', key: 'fecha' },
    { title: 'Monto', dataIndex: 'monto', key: 'monto', render: (m: number) => `S/.${m.toLocaleString()}` },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle">
        <Title level={2} style={{ color: '#001529' }}>¡Bienvenido!</Title>

        {/* BOTÓN DE DESCARGA PDF */}
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleDownloadPDF}
          style={{ borderRadius: 8 }}
        >
          Descargar Informe Mensual
        </Button>
      </Row>

      {loading ? (
        <div style={{ textAlign: 'center', margin: '48px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Tarjetas de estadísticas */}
          <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Statistic title="Lotes Totales" value={stats.lotesActivos} valueStyle={{ color: '#52c41a' }} prefix={<ArrowUpOutlined />} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Statistic title="Ventas este mes" value={stats.ventasMes} valueStyle={{ color: '#1890ff' }} prefix={<ArrowUpOutlined />} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Statistic title="Nuevos Clientes" value={stats.clientesMes} valueStyle={{ color: '#faad14' }} prefix={<ArrowUpOutlined />} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Statistic title="Proyectos Activos" value={stats.proyectosActivos} valueStyle={{ color: '#722ed1' }} prefix={<ArrowUpOutlined />} />
              </Card>
            </Col>
          </Row>

          {/* Gráficos */}
          <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
            <Col xs={24} md={12}>
              <Card title="Ventas mensuales (últimos 12 meses)" style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ height: 250 }}>
                  <Recharts.ResponsiveContainer width="100%" height="100%">
                    <Recharts.BarChart data={ventasMensuales} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                      <Recharts.XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                      <Recharts.YAxis allowDecimals={false} />
                      <Recharts.Tooltip />
                      <Recharts.Legend />
                      <Recharts.Bar dataKey="ventas" fill="#1890ff" />
                    </Recharts.BarChart>
                  </Recharts.ResponsiveContainer>
                </div>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card title="Distribución de estados de lotes" style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Recharts.ResponsiveContainer width="100%" height="100%">
                    <Recharts.PieChart>
                      <Recharts.Pie
                        data={distribucionEstados}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {distribucionEstados.map((entry, idx) => (
                          <Recharts.Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Recharts.Pie>
                      <Recharts.Tooltip />
                      <Recharts.Legend />
                    </Recharts.PieChart>
                  </Recharts.ResponsiveContainer>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Ventas recientes */}
          <Row style={{ marginTop: '24px' }}>
            <Col span={24}>
              <Card title="Ventas recientes" style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ overflowX: 'auto' }} className="w-full">
                  <Table
                    dataSource={ventasRecientes}
                    columns={columns}
                    pagination={false}
                    scroll={{ x: 'max-content' }}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
