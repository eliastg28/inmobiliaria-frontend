// src/features/usuarios/pages/RolesPage.tsx

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { AxiosError } from "axios";
import {
  getRoles,
  createRol,
  updateRol,
  eliminarRol,
  UsuarioRol,
} from "../../../api/rol.service";

const { confirm } = Modal;
const { Title } = Typography;

interface RolFormValues {
  nombre: string;
}

const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<UsuarioRol[]>([]);
  const [search, setSearch] = useState<string>("");
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingRol, setEditingRol] = useState<UsuarioRol | null>(null);
  const [form] = Form.useForm();

  // ✨ Nuevo estado para los roles del usuario autenticado
  const [authenticatedUserRoles, setAuthenticatedUserRoles] = useState<string[]>([]);
  const isPropietarioAuth = authenticatedUserRoles.includes('PROPIETARIO');

  useEffect(() => {
    // ✨ Lee el localStorage para obtener los roles del usuario
    const authData = JSON.parse(localStorage.getItem('user') || '{}');
    if (authData && authData.roles) {
      setAuthenticatedUserRoles(authData.roles);
    }
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRoles = async (searchValue?: string) => {
    setLoading(true);
    try {
      const data = await getRoles(searchValue);
      setRoles(data);
    } catch (error) {
      message.error("Error al cargar los roles. Por favor, intente de nuevo.");
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
      fetchRoles(search);
    }, 1000); // 1 segundo de espera tras dejar de escribir
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const sortedRoles = useMemo(() => {
    // ✨ Filtra la lista de roles si el usuario no es PROPIETARIO
    if (!isPropietarioAuth) {
      const filtered = roles.filter(rol => rol.nombre !== 'PROPIETARIO');
      return [...filtered].sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
    return [...roles].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [roles, isPropietarioAuth]);

  const handleFormSubmit = async (values: RolFormValues) => {
    try {
      setLoading(true);
      if (editingRol) {
        await updateRol(editingRol.usuarioRolId, {
          nombre: values.nombre,
          activo: editingRol.activo,
        });
        message.success("Rol actualizado exitosamente");
      } else {
        await createRol({ nombre: values.nombre });
        message.success("Rol creado exitosamente");
      }
      setIsModalVisible(false);
      setEditingRol(null);
      form.resetFields();
      await fetchRoles();
    } catch (error: any) {
      const errorMessage =
        (error as AxiosError).response?.data ||
        "Error al guardar el rol. Por favor, verifique los datos.";
      message.error(errorMessage as string);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rol: UsuarioRol) => {
    setEditingRol(rol);
    form.setFieldsValue({
      nombre: rol.nombre,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    confirm({
      title: "¿Está seguro de que desea eliminar este rol?",
      icon: <ExclamationCircleOutlined />,
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          setLoading(true);
          await eliminarRol(id);
          message.success("Rol eliminado exitosamente");
          await fetchRoles();
        } catch (error: any) {
          const errorMessage =
            (error as AxiosError).response?.data ||
            "Error al eliminar el rol. Intente de nuevo.";
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
      render: (text: any, record: UsuarioRol, index: number) => index + 1,
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
    },
    {
      title: "Acciones",
      key: "actions",
      render: (text: any, record: UsuarioRol) => {
        // ✨ Deshabilita los botones de acción para el rol PROPIETARIO
        const isPropietario = record.nombre === 'PROPIETARIO';
        const isActionDisabled = !isPropietarioAuth && isPropietario;
        return (
          <Space size="middle">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              disabled={isActionDisabled}
            >
              Editar
            </Button>
            <Button
              type="default"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.usuarioRolId)}
              disabled={isActionDisabled}
            >
              Eliminar
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card className="shadow-md rounded-lg max-w-full lg:max-w-4xl mx-auto">
        <div className="mb-6">
          <Title level={2} className="text-xl sm:text-2xl mb-4 sm:mb-0">
            Gestión de Roles
          </Title>
          <div className="flex flex-wrap flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-2 mt-2">
            <div className="flex-1 sm:flex-none">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingRol(null);
                  form.resetFields();
                  setIsModalVisible(true);
                }}
              >
                Crear Nuevo Rol
              </Button>
            </div>
            <br />
            <div className="flex-1 sm:flex-none sm:ml-auto" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Input
                placeholder="Buscar rol..."
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
          dataSource={sortedRoles}
          loading={loading}
          rowKey="usuarioRolId"
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
        />

        <Modal
          title={editingRol ? "Editar Rol" : "Crear Nuevo Rol"}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingRol(null);
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
                  message: "Por favor, ingrese el nombre del rol",
                },
              ]}
            >
              <Input
                // ✨ Deshabilita el input si el rol es PROPIETARIO y el usuario no es PROPIETARIO
                disabled={Boolean(editingRol) && editingRol?.nombre === 'PROPIETARIO' && !isPropietarioAuth}
              />
            </Form.Item>
            <Form.Item className="mt-4">
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingRol ? "Actualizar" : "Crear"}
                </Button>
                <Button
                  onClick={() => {
                    setIsModalVisible(false);
                    setEditingRol(null);
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

export default RolesPage;