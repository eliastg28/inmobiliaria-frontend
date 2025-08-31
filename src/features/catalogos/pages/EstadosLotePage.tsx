import React, { useState, useEffect } from "react";
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
  getEstadosLote,
  createEstadoLote,
  updateEstadoLote,
  deleteEstadoLote,
  EstadoLote,
  EstadoLoteDTO,
} from "../../../api/estadoLote.service";

const { confirm } = Modal;
const { Title } = Typography;

interface EstadoLoteFormValues extends EstadoLoteDTO {}

const EstadosLotePage: React.FC = () => {
  const [estadosLote, setEstadosLote] = useState<EstadoLote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingEstadoLote, setEditingEstadoLote] = useState<EstadoLote | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getEstadosLote();
      setEstadosLote(data);
    } catch (error) {
      message.error("Error al cargar los datos. Por favor, intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (values: EstadoLoteFormValues) => {
    try {
      setLoading(true);
      if (editingEstadoLote) {
        await updateEstadoLote(editingEstadoLote.estadoLoteId, values);
        message.success("Estado de lote actualizado exitosamente.");
      } else {
        await createEstadoLote(values);
        message.success("Estado de lote creado exitosamente.");
      }
      setIsModalVisible(false);
      setEditingEstadoLote(null);
      form.resetFields();
      await fetchData();
    } catch (error: any) {
      const errorMessage =
        (error as AxiosError).response?.data ||
        "Error al guardar el estado de lote. Por favor, verifique los datos.";
      message.error(errorMessage as string);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (estadoLote: EstadoLote) => {
    setEditingEstadoLote(estadoLote);
    form.setFieldsValue({
      nombre: estadoLote.nombre,
      descripcion: estadoLote.descripcion,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    confirm({
      title: "¿Está seguro de que desea eliminar este estado de lote?",
      icon: <ExclamationCircleOutlined />,
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          setLoading(true);
          await deleteEstadoLote(id);
          message.success("Estado de lote eliminado exitosamente.");
          await fetchData();
        } catch (error: any) {
          const errorMessage =
            (error as AxiosError).response?.data ||
            "Error al eliminar el estado de lote. Intente de nuevo.";
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
      render: (text: any, record: EstadoLote, index: number) => index + 1,
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a: EstadoLote, b: EstadoLote) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: "Descripción",
      dataIndex: "descripcion",
      key: "descripcion",
    },
    {
      title: "Acciones",
      key: "actions",
      render: (text: any, record: EstadoLote) => (
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
            onClick={() => handleDelete(record.estadoLoteId)}
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <Title level={2} className="text-xl sm:text-2xl mb-4 sm:mb-0">
            Gestión de Estados de Lote
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingEstadoLote(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Crear Nuevo Estado
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={estadosLote}
          loading={loading}
          rowKey="estadoLoteId"
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
        />

        <Modal
          title={editingEstadoLote ? "Editar Estado de Lote" : "Crear Nuevo Estado de Lote"}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingEstadoLote(null);
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
                  {editingEstadoLote ? "Actualizar" : "Crear"}
                </Button>
                <Button
                  onClick={() => {
                    setIsModalVisible(false);
                    setEditingEstadoLote(null);
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

export default EstadosLotePage;
