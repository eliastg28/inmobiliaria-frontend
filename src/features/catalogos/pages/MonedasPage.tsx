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
  getMonedas,
  createMoneda,
  updateMoneda,
  deleteMoneda,
  Moneda,
  MonedaDTO,
} from "../../../api/moneda.service";

const { confirm } = Modal;
const { Title } = Typography;

interface MonedaFormValues extends MonedaDTO {}

const MonedasPage: React.FC = () => {
  const [monedas, setMonedas] = useState<Moneda[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingMoneda, setEditingMoneda] = useState<Moneda | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getMonedas();
      setMonedas(data);
    } catch (error) {
      message.error("Error al cargar los datos. Por favor, intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (values: MonedaFormValues) => {
    try {
      setLoading(true);
      if (editingMoneda) {
        await updateMoneda(editingMoneda.monedaId, values);
        message.success("Moneda actualizada exitosamente.");
      } else {
        await createMoneda(values);
        message.success("Moneda creada exitosamente.");
      }
      setIsModalVisible(false);
      setEditingMoneda(null);
      form.resetFields();
      await fetchData();
    } catch (error: any) {
      const errorMessage =
        (error as AxiosError).response?.data ||
        "Error al guardar la moneda. Por favor, verifique los datos.";
      message.error(errorMessage as string);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (moneda: Moneda) => {
    setEditingMoneda(moneda);
    form.setFieldsValue({
      nombre: moneda.nombre,
      simbolo: moneda.simbolo,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    confirm({
      title: "¿Está seguro de que desea eliminar esta moneda?",
      icon: <ExclamationCircleOutlined />,
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          setLoading(true);
          await deleteMoneda(id);
          message.success("Moneda eliminada exitosamente.");
          await fetchData();
        } catch (error: any) {
          const errorMessage =
            (error as AxiosError).response?.data ||
            "Error al eliminar la moneda. Intente de nuevo.";
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
      render: (text: any, record: Moneda, index: number) => index + 1,
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a: Moneda, b: Moneda) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: "Símbolo",
      dataIndex: "simbolo",
      key: "simbolo",
    },
    {
      title: "Acciones",
      key: "actions",
      render: (text: any, record: Moneda) => (
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
            onClick={() => handleDelete(record.monedaId)}
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
            Gestión de Monedas
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingMoneda(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Crear Nueva Moneda
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={monedas}
          loading={loading}
          rowKey="monedaId"
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
        />

        <Modal
          title={editingMoneda ? "Editar Moneda" : "Crear Nueva Moneda"}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingMoneda(null);
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
                  message: "Por favor, ingrese el nombre de la moneda",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="simbolo"
              label="Símbolo"
              rules={[
                {
                  required: true,
                  message: "Por favor, ingrese el símbolo de la moneda",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item className="mt-4">
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingMoneda ? "Actualizar" : "Crear"}
                </Button>
                <Button
                  onClick={() => {
                    setIsModalVisible(false);
                    setEditingMoneda(null);
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

export default MonedasPage;
