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
  getTiposLote,
  createTipoLote,
  updateTipoLote,
  deleteTipoLote,
  TipoLote,
  TipoLoteDTO,
} from "../../../api/tipoLote.service";

const { confirm } = Modal;
const { Title } = Typography;

interface TipoLoteFormValues extends TipoLoteDTO {}

const TiposLotePage: React.FC = () => {
  const [tiposLote, setTiposLote] = useState<TipoLote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingTipoLote, setEditingTipoLote] = useState<TipoLote | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getTiposLote();
      setTiposLote(data);
    } catch (error) {
      message.error("Error al cargar los datos. Por favor, intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (values: TipoLoteFormValues) => {
    try {
      setLoading(true);
      if (editingTipoLote) {
        await updateTipoLote(editingTipoLote.tipoLoteId, values);
        message.success("Tipo de lote actualizado exitosamente.");
      } else {
        await createTipoLote(values);
        message.success("Tipo de lote creado exitosamente.");
      }
      setIsModalVisible(false);
      setEditingTipoLote(null);
      form.resetFields();
      await fetchData();
    } catch (error: any) {
      const errorMessage =
        (error as AxiosError).response?.data ||
        "Error al guardar el tipo de lote. Por favor, verifique los datos.";
      message.error(errorMessage as string);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tipoLote: TipoLote) => {
    setEditingTipoLote(tipoLote);
    form.setFieldsValue({
      nombre: tipoLote.nombre,
      descripcion: tipoLote.descripcion,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    confirm({
      title: "¿Está seguro de que desea eliminar este tipo de lote?",
      icon: <ExclamationCircleOutlined />,
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          setLoading(true);
          await deleteTipoLote(id);
          message.success("Tipo de lote eliminado exitosamente.");
          await fetchData();
        } catch (error: any) {
          const errorMessage =
            (error as AxiosError).response?.data ||
            "Error al eliminar el tipo de lote. Intente de nuevo.";
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
      render: (text: any, record: TipoLote, index: number) => index + 1,
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a: TipoLote, b: TipoLote) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: "Descripción",
      dataIndex: "descripcion",
      key: "descripcion",
    },
    {
      title: "Acciones",
      key: "actions",
      render: (text: any, record: TipoLote) => (
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
            onClick={() => handleDelete(record.tipoLoteId)}
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
            Gestión de Tipos de Lote
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTipoLote(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Crear Nuevo Tipo
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={tiposLote}
          loading={loading}
          rowKey="tipoLoteId"
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
        />

        <Modal
          title={editingTipoLote ? "Editar Tipo de Lote" : "Crear Nuevo Tipo de Lote"}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingTipoLote(null);
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
                  {editingTipoLote ? "Actualizar" : "Crear"}
                </Button>
                <Button
                  onClick={() => {
                    setIsModalVisible(false);
                    setEditingTipoLote(null);
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

export default TiposLotePage;
