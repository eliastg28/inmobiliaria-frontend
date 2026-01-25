import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Card,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { AxiosError } from "axios";
import {
  getEstadosVenta,
  createEstadoVenta,
  updateEstadoVenta,
  deleteEstadoVenta,
  EstadoVenta,
  EstadoVentaDTO,
} from "../../../api/estadoVenta.service";

const { confirm } = Modal;
const { Title } = Typography;

interface EstadoVentaFormValues extends EstadoVentaDTO {}

const EstadosVentaLotePage: React.FC = () => {
  const [estadosVenta, setEstadosVenta] = useState<EstadoVenta[]>([]);
  const [search, setSearch] = useState<string>("");
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingEstadoVenta, setEditingEstadoVenta] = useState<EstadoVenta | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async (searchValue?: string) => {
    setLoading(true);
    try {
      const data = await getEstadosVenta(searchValue);
      setEstadosVenta(data);
    } catch (error) {
      message.error("Error al cargar los datos. Por favor, intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Efecto para manejar el debounce de búsqueda
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      fetchData(search);
    }, 1000); // 1 segundo de espera tras dejar de escribir
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleFormSubmit = async (values: EstadoVentaFormValues) => {
    try {
      setLoading(true);
      if (editingEstadoVenta) {
        await updateEstadoVenta(editingEstadoVenta.estadoVentaId, values);
        message.success("Estado de venta actualizado exitosamente.");
      } else {
        await createEstadoVenta(values);
        message.success("Estado de venta creado exitosamente.");
      }
      setIsModalVisible(false);
      setEditingEstadoVenta(null);
      form.resetFields();
      await fetchData();
    } catch (error: any) {
      const errorMessage =
        (error as AxiosError).response?.data ||
        "Error al guardar el estado de venta. Por favor, verifique los datos.";
      message.error(errorMessage as string);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (estadoVenta: EstadoVenta) => {
    setEditingEstadoVenta(estadoVenta);
    form.setFieldsValue({
      nombre: estadoVenta.nombre,
      descripcion: estadoVenta.descripcion,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    confirm({
      title: "¿Está seguro de que desea eliminar este estado de venta?",
      icon: <ExclamationCircleOutlined />,
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          setLoading(true);
          await deleteEstadoVenta(id);
          message.success("Estado de venta eliminado exitosamente.");
          await fetchData();
        } catch (error: any) {
          console.error("Error al eliminar el estado de venta:", error);
          const errorMessage =
            (error as AxiosError).response?.data ||
            "Error al eliminar el estado de venta. Intente de nuevo.";
          message.error(errorMessage as string);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const columns = [
    {
      title: "N°",
      key: "index",
      render: (text: any, record: EstadoVenta, index: number) => index + 1,
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a: EstadoVenta, b: EstadoVenta) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: "Descripción",
      dataIndex: "descripcion",
      key: "descripcion",
    },
    {
      title: "Acciones",
      key: "actions",
      render: (text: any, record: EstadoVenta) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Editar
          </Button>
          <Button
            type="default"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.estadoVentaId)}
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card className="shadow-md rounded-lg max-w-full lg:max-w-4xl mx-auto">
        <div className="mb-6">
          <Title level={2} className="text-xl sm:text-2xl mb-4 sm:mb-0">
            Gestión de Estados de Venta
          </Title>
          <div className="flex flex-wrap flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-2 mt-2">
            <div className="flex-1 sm:flex-none">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingEstadoVenta(null);
                  form.resetFields();
                  setIsModalVisible(true);
                }}
              >
                Crear Nuevo Estado
              </Button>
            </div>
            <br />
            <div className="flex-1 sm:flex-none sm:ml-auto" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Input
                placeholder="Buscar estado de venta..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                allowClear
                style={{ maxWidth: 250, borderRadius: 8, borderColor: '#1890ff', width: '100%' }}
                className="shadow-sm"
              />
            </div>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={estadosVenta}
          loading={loading}
          rowKey="estadoVentaId"
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
        />

        <Modal
          title={editingEstadoVenta ? "Editar Estado de Venta" : "Crear Nuevo Estado de Venta"}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingEstadoVenta(null);
            form.resetFields();
          }}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
            <Form.Item
              name="nombre"
              label="Nombre"
              rules={[
                {
                  required: true,
                  message: "Por favor, ingrese el nombre del estado",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="descripcion"
              label="Descripción"
              rules={[
                {
                  required: true,
                  message: "Por favor, ingrese la descripción",
                },
              ]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item className="mt-4">
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingEstadoVenta ? "Actualizar" : "Crear"}
                </Button>
                <Button
                  onClick={() => {
                    setIsModalVisible(false);
                    setEditingEstadoVenta(null);
                    form.resetFields();
                  }}
                >
                  Cancelar
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default EstadosVentaLotePage;
