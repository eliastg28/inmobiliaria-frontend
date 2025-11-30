// src/pages/DashboardPage.tsx

import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Typography, Statistic, Table, Spin, message } from 'antd';
import { ArrowUpOutlined } from '@ant-design/icons';
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
  const [estadosLote, setEstadosLote] = useState<any[]>([]);
  const [distribucionEstados, setDistribucionEstados] = useState<any[]>([]);
  const [ventasRecientes, setVentasRecientes] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Lotes activos
        const lotesActivos = await getLotesActivos();
        // 2. Ventas
        const ventas = await getVentas();
        // 3. Clientes
        const clientes = await getClientes();
        // 4. Proyectos
        const proyectos = await getProyectos();
        // 5. Estados de lote
        const estados = await getEstadosLote();

        // Métricas principales
        // Ventas este mes
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const ventasMes = ventas.filter(v => {
          if (!v.fechaContrato) return false;
          const fecha = new Date(v.fechaContrato);
          // ⭐ CORRECCIÓN 1: Usamos getUTCMonth y getUTCFullYear para evitar el desplazamiento
          return fecha.getUTCMonth() === currentMonth && fecha.getUTCFullYear() === currentYear;
        }).length;

        // Nuevos clientes este mes
        const clientesMes = clientes.filter(c => {
          if (!c.fechaCreacion) return false;
          const fecha = new Date(c.fechaCreacion);
          return fecha.getMonth() === now.getMonth() && fecha.getFullYear() === now.getFullYear();
        }).length;

        // Ventas por mes (últimos 12 meses)
        const ventasPorMes: { [key: string]: number } = {};
        ventas.forEach(v => {
          if (!v.fechaContrato) return;
          const fecha = new Date(v.fechaContrato);
          // ⭐ CORRECCIÓN 2: Usamos getUTCFullYear y getUTCMonth
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

        // Distribución de estados de lotes
        const distribucion: any[] = [];
        for (let i = 0; i < estados.length; i++) {
          const estado = estados[i];
          // Buscar lotes por estado
          // eslint-disable-next-line no-await-in-loop
          const lotesPorEstado = await searchLotesByEstado(estado.nombre);
          distribucion.push({ name: estado.nombre, value: lotesPorEstado.length });
        }

        // Ventas recientes (últimas 5)
        const ventasRecientesData = ventas
          .sort((a, b) => (b.fechaContrato && a.fechaContrato ? new Date(b.fechaContrato).getTime() - new Date(a.fechaContrato).getTime() : 0))
          .slice(0, 5)
          .map(v => ({
            key: v.ventaId,
            propiedad: v.loteNombre,
            cliente: v.clienteNombreCompleto,
            estado: v.estadoVentaNombre,
            // ⭐ CORRECCIÓN 3: Formateamos la cadena YYYY-MM-DD a DD/MM/YYYY sin usar la zona horaria local.
            // Si v.fechaContrato es '2025-11-21', esto resulta en '21/11/2025'
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
        setEstadosLote(estados);
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
      <Title level={2} style={{ color: '#001529' }}>¡Bienvenido!</Title>

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
                      <Recharts.Pie data={distribucionEstados} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
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

          {/* Tabla de ventas recientes */}
          <Row style={{ marginTop: '24px' }}>
            <Col span={24}>
              <Card title="Ventas recientes" style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Table dataSource={ventasRecientes} columns={columns} pagination={false} />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default DashboardPage;