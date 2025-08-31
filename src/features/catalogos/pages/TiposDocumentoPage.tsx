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
  getTiposDocumento,
  createTipoDocumento,
  updateTipoDocumento,
  deleteTipoDocumento,
  TipoDocumento,
  TipoDocumentoDTO,
} from "../../../api/tipoDocumento.service";

const { confirm } = Modal;
const { Title } = Typography;

interface TipoDocumentoFormValues extends TipoDocumentoDTO {}

const TiposDocumentoPage: React.FC = () => {
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingTipoDocumento, setEditingTipoDocumento] = useState<TipoDocumento | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getTiposDocumento();
      setTiposDocumento(data);
    } catch (error) {
      message.error("Error al cargar los datos. Por favor, intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (values: TipoDocumentoFormValues) => {
    try {
      setLoading(true);
      if (editingTipoDocumento) {
        await updateTipoDocumento(editingTipoDocumento.tipoDocumentoId, values);
        message.success("Tipo de documento actualizado exitosamente.");
      } else {
        await createTipoDocumento(values);
        message.success("Tipo de documento creado exitosamente.");
      }
      setIsModalVisible(false);
      setEditingTipoDocumento(null);
      form.resetFields();
      await fetchData();
    } catch (error: any) {
      const errorMessage =
        (error as AxiosError).response?.data ||
        "Error al guardar el tipo de documento. Por favor, verifique los datos.";
      message.error(errorMessage as string);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tipoDocumento: TipoDocumento) => {
    setEditingTipoDocumento(tipoDocumento);
    form.setFieldsValue({
      nombre: tipoDocumento.nombre,
      descripcion: tipoDocumento.descripcion,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    confirm({
      title: "¿Está seguro de que desea eliminar este tipo de documento?",
      icon: <ExclamationCircleOutlined />,
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          setLoading(true);
          await deleteTipoDocumento(id);
          message.success("Tipo de documento eliminado exitosamente.");
          await fetchData();
        } catch (error: any) {
          const errorMessage =
            (error as AxiosError).response?.data ||
            "Error al eliminar el tipo de documento. Intente de nuevo.";
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
      render: (text: any, record: TipoDocumento, index: number) => index + 1,
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a: TipoDocumento, b: TipoDocumento) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: "Descripción",
      dataIndex: "descripcion",
      key: "descripcion",
    },
    {
      title: "Acciones",
      key: "actions",
      render: (text: any, record: TipoDocumento) => (
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
            onClick={() => handleDelete(record.tipoDocumentoId)}
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
            Gestión de Tipos de Documento
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTipoDocumento(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Crear Nuevo Tipo
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={tiposDocumento}
          loading={loading}
          rowKey="tipoDocumentoId"
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
        />

        <Modal
          title={editingTipoDocumento ? "Editar Tipo de Documento" : "Crear Nuevo Tipo de Documento"}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingTipoDocumento(null);
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
                  message: "Por favor, ingrese el nombre del tipo",
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
                  {editingTipoDocumento ? "Actualizar" : "Crear"}
                </Button>
                <Button
                  onClick={() => {
                    setIsModalVisible(false);
                    setEditingTipoDocumento(null);
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

export default TiposDocumentoPage;
