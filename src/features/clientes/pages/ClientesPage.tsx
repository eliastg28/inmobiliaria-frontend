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
  Select,
  InputNumber,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

// Importa las interfaces y servicios directamente desde tus archivos originales
import {
  TipoDocumento as APITipoDocumento,
  getTiposDocumento as getApiTiposDocumento,
} from "../../../api/tipoDocumento.service";
import {
  Cliente as APICliente,
  ClienteDTO,
  getClientes as getApiClientes,
  createCliente as createApiCliente,
  updateCliente as updateApiCliente,
  deleteCliente as deleteApiCliente,
} from "../../../api/cliente.service";
import { AxiosError } from "axios";

const { Title } = Typography;
const { Option } = Select;

// Las interfaces locales coinciden con las del servicio para evitar errores de tipo
interface ClienteFormValues extends ClienteDTO {}

const ClientesPage: React.FC = () => {
  const [clientes, setClientes] = useState<APICliente[]>([]);
  const [search, setSearch] = useState<string>("");
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tiposDocumento, setTiposDocumento] = useState<APITipoDocumento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] =
    useState<boolean>(false);
  const [editingCliente, setEditingCliente] = useState<APICliente | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Función para obtener los datos de la API
  const fetchData = async (searchValue?: string) => {
    setLoading(true);
    try {
      const clientesData = await getApiClientes(searchValue);
      const tiposDocumentoData = await getApiTiposDocumento();
      setClientes(clientesData);
      setTiposDocumento(tiposDocumentoData);
    } catch (error) {
      console.error("Error al cargar los datos:", error);
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

  const handleFormSubmit = async (values: ClienteFormValues) => {
    try {
      setLoading(true);
      if (editingCliente) {
        await updateApiCliente(editingCliente.clienteId, values);
        message.success("Cliente actualizado exitosamente.");
      } else {
        await createApiCliente(values);
        message.success("Cliente creado exitosamente.");
      }
      setIsModalVisible(false);
      setEditingCliente(null);
      form.resetFields();
      await fetchData();
    } catch (error: any) {
      console.error("Error al guardar el cliente:", error);
      // Corrección: Manejo de errores más robusto para mostrar el mensaje del backend.
      const errorMessage =
        (error as AxiosError).response?.data ||
        "Error al guardar el cliente. Por favor, verifique los datos.";
      message.error(errorMessage as string);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cliente: APICliente) => {
    try {
      setEditingCliente(cliente);
      form.setFieldsValue({
        primerNombre: cliente.primerNombre,
        segundoNombre: cliente.segundoNombre,
        apellidoPaterno: cliente.apellidoPaterno,
        apellidoMaterno: cliente.apellidoMaterno,
        tipoDocumentoId: cliente.tipoDocumento.tipoDocumentoId,
        numeroDocumento: cliente.numeroDocumento,
        correo: cliente.correo,
        telefono: cliente.telefono,
        ingresosMensuales: cliente.ingresosMensuales,
      });
      setIsModalVisible(true);
    } catch (error: any) {
      console.error("Error al editar el cliente:", error);
      const errorMessage =
        (error as AxiosError).response?.data ||
        "Error al cargar los datos del cliente. Intente de nuevo.";
      message.error(errorMessage as string);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      setLoading(true);
      await deleteApiCliente(deletingId);
      message.success("Cliente eliminado exitosamente.");
      await fetchData();
    } catch (error: any) {
      console.error("Error al eliminar el cliente:", error);
      const errorMessage =
        (error as AxiosError).response?.data ||
        "Error al eliminar el cliente. Intente de nuevo.";
      message.error(errorMessage as string);
    } finally {
      setLoading(false);
      setIsDeleteModalVisible(false);
      setDeletingId(null);
    }
  };

  const columns = [
    {
      title: "N°",
      key: "index",
      render: (text: any, record: APICliente, index: number) => index + 1,
    },
    {
      title: "Nombre Completo",
      key: "nombreCompleto",
      render: (text: any, record: APICliente) =>
        `${record.primerNombre} ${record.segundoNombre || ""} ${
          record.apellidoPaterno
        } ${record.apellidoMaterno}`,
    },
    {
      title: "Tipo Documento",
      key: "tipoDocumento",
      render: (text: any, record: APICliente) => record.tipoDocumento.nombre,
    },
    {
      title: "N° Documento",
      dataIndex: "numeroDocumento",
      key: "numeroDocumento",
    },
    {
      title: "Correo",
      dataIndex: "correo",
      key: "correo",
    },
    {
      title: "Teléfono",
      dataIndex: "telefono",
      key: "telefono",
    },
    {
      title: "Ingresos Mensuales",
      dataIndex: "ingresosMensuales",
      key: "ingresosMensuales",
    },
    {
      title: "Acciones",
      key: "actions",
      render: (text: any, record: APICliente) => (
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
            onClick={() => handleDeleteClick(record.clienteId)}
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card className="shadow-md rounded-lg max-w-full lg:max-w-7xl mx-auto">
        <div className="mb-6">
          <Title level={2} className="text-xl sm:text-2xl mb-4 sm:mb-0">
            Gestión de Clientes
          </Title>
          <div className="flex flex-wrap flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-2 mt-2">
            <div className="flex-1 sm:flex-none">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingCliente(null);
                  form.resetFields();
                  setIsModalVisible(true);
                }}
              >
                Crear Nuevo Cliente
              </Button>
            </div>
            <br />
            <div className="flex-1 sm:flex-none sm:ml-auto" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Input
                placeholder="Buscar cliente..."
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
          dataSource={clientes}
          loading={loading}
          rowKey="clienteId"
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
        />

        <Modal
          title={editingCliente ? "Editar Cliente" : "Crear Nuevo Cliente"}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingCliente(null);
            form.resetFields();
          }}
          footer={null}
          width={700}
        >
          <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="primerNombre"
                  label="Primer Nombre"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="segundoNombre" label="Segundo Nombre">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="apellidoPaterno"
                  label="Apellido Paterno"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="apellidoMaterno"
                  label="Apellido Materno"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="tipoDocumentoId"
                  label="Tipo de Documento"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Seleccione un tipo de documento">
                    {tiposDocumento.map((tipo) => (
                      <Option
                        key={tipo.tipoDocumentoId}
                        value={tipo.tipoDocumentoId}
                      >
                        {tipo.nombre}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="numeroDocumento"
                  label="Número de Documento"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="correo"
                  label="Correo"
                  rules={[{ required: true, type: "email" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="telefono"
                  label="Teléfono"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="ingresosMensuales"
                  label="Ingresos Mensuales"
                  rules={[{ required: true }]}
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item className="mt-4">
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingCliente ? "Actualizar" : "Crear"}
                </Button>
                <Button
                  onClick={() => {
                    setIsModalVisible(false);
                    setEditingCliente(null);
                    form.resetFields();
                  }}
                >
                  Cancelar
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Confirmación de Eliminación"
          open={isDeleteModalVisible}
          onOk={handleDeleteConfirm}
          onCancel={() => setIsDeleteModalVisible(false)}
          okText="Sí, eliminar"
          cancelText="Cancelar"
          okType="danger"
          closeIcon={false}
        >
          <div className="flex items-center">
            <span>¿Está seguro de que desea eliminar este cliente?</span>
          </div>
        </Modal>
      </Card>
    </div>
  );
};

export default ClientesPage;
