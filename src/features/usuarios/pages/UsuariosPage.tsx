// src/features/usuarios/pages/UsuariosPage.tsx

import React, { useState, useEffect, useMemo } from "react";
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
  Checkbox,
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
  getUsuarios,
  createUsuario,
  updateUsuario,
  eliminarUsuario,
  Usuario,
} from "../../../api/usuario.service";
import { getRoles, UsuarioRol } from "../../../api/rol.service";

const { confirm } = Modal;
const { Title } = Typography;
const { Option } = Select;

interface UserFormValues {
  username: string;
  password?: string;
  activo?: boolean;
  roles: string[];
}

const UsuariosPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<UsuarioRol[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [form] = Form.useForm();
  
  const [authenticatedUsername, setAuthenticatedUsername] = useState<string>('');
  const [authenticatedUserRoles, setAuthenticatedUserRoles] = useState<string[]>([]);
  
  const isPropietarioAuth = authenticatedUserRoles.includes('PROPIETARIO');
  const isAdminAuth = authenticatedUserRoles.includes('ADMIN');

  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem('user') || '{}');
    if (authData && authData.username && authData.roles) {
      setAuthenticatedUsername(authData.username);
      setAuthenticatedUserRoles(authData.roles);
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userData, rolesData] = await Promise.all([
        getUsuarios(),
        getRoles(),
      ]);
      setUsuarios(userData);
      setRoles(rolesData);
    } catch (error) {
      message.error("Error al cargar los datos. Por favor, intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const sortedUsuarios = useMemo(() => {
    return [...usuarios].sort((a, b) => a.username.localeCompare(b.username));
  }, [usuarios]);

  const handleFormSubmit = async (values: UserFormValues) => {
    try {
      setLoading(true);
      if (editingUser) {
        if (isPropietarioAuth && editingUser.username === authenticatedUsername) {
          values.roles = editingUser.roles.map(rol => rol.nombre);
          values.activo = editingUser.activo;
        }

        const isSelfEdit = editingUser.username === authenticatedUsername;
        const passwordChanged = values.password && values.password.length > 0;
        const usernameChanged = values.username !== editingUser.username;

        if (isSelfEdit && (passwordChanged || usernameChanged)) {
            confirm({
                title: 'Cambio de credenciales',
                content: 'Al actualizar su usuario o contraseña, su sesión se cerrará automáticamente.',
                okText: 'Confirmar y continuar',
                cancelText: 'Cancelar',
                onOk: async () => {
                    await updateUsuario(editingUser.usuarioId, values);
                    message.success("Usuario actualizado exitosamente. Redireccionando...");
                    setTimeout(() => {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                    }, 1000);
                },
                onCancel: () => {
                    setLoading(false);
                }
            });
            return;
        }

        await updateUsuario(editingUser.usuarioId, values);
        message.success("Usuario actualizado exitosamente");
      } else {
        await createUsuario(values);
        message.success("Usuario creado exitosamente");
      }
      setIsModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      await fetchData();
    } catch (error: any) {
      const errorMessage =
        (error as AxiosError).response?.data ||
        "Error al guardar el usuario. Por favor, verifique los datos.";
      message.error(errorMessage as string);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: Usuario) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      activo: user.activo,
      roles: user.roles.map((rol) => rol.nombre),
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    confirm({
      title: "¿Está seguro de que desea eliminar este usuario?",
      icon: <ExclamationCircleOutlined />,
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          setLoading(true);
          await eliminarUsuario(id);
          message.success("Usuario eliminado exitosamente");
          await fetchData();
        } catch (error: any) {
          const errorMessage =
            (error as AxiosError).response?.data ||
            "Error al eliminar el usuario. Intente de nuevo.";
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
      render: (text: any, record: Usuario, index: number) => index + 1,
    },
    {
      title: "Nombre de Usuario",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Roles",
      key: "roles",
      render: (text: any, record: Usuario) => (
        <span>{record.roles.map((rol) => rol.nombre).join(", ")}</span>
      ),
    },
    {
      title: "Estado",
      key: "activo",
      render: (text: any, record: Usuario) => (
        <Space size="small">
          {record.activo ? (
            <>
              <CheckCircleOutlined style={{ color: "green" }} />
              <span>Activo</span>
            </>
          ) : (
            <>
              <CloseCircleOutlined style={{ color: "red" }} />
              <span>Inactivo</span>
            </>
          )}
        </Space>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (text: any, record: Usuario) => {
        const isCurrentUser = record.username === authenticatedUsername;
        const isTargetUserAdmin = record.roles.some(rol => rol.nombre === 'ADMIN');
        const isTargetUserPropietario = record.roles.some(rol => rol.nombre === 'PROPIETARIO');
        
        if (isPropietarioAuth) {
          return (
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
                onClick={() => handleDelete(record.usuarioId)}
                disabled={isCurrentUser}
              >
                Eliminar
              </Button>
            </Space>
          );
        }

        if (isTargetUserPropietario || isTargetUserAdmin) {
          return null;
        }

        if (isCurrentUser) {
          return null;
        }

        return (
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
              onClick={() => handleDelete(record.usuarioId)}
            >
              Eliminar
            </Button>
          </Space>
        );
      },
    },
  ];

  // ✨ Lógica para filtrar los roles en el Select
  const filteredRoles = useMemo(() => {
    if (isAdminAuth || isPropietarioAuth) {
      return roles.filter(rol => rol.nombre !== 'PROPIETARIO');
    }
    return roles;
  }, [roles, isAdminAuth]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card className="shadow-md rounded-lg max-w-full lg:max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <Title level={2} className="text-xl sm:text-2xl mb-4 sm:mb-0">
            Gestión de Usuarios
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingUser(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Crear Nuevo Usuario
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={sortedUsuarios}
          loading={loading}
          rowKey="usuarioId"
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
        />

        <Modal
          title={editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingUser(null);
            form.resetFields();
          }}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
            <Form.Item
              name="username"
              label="Nombre de Usuario"
              rules={[
                {
                  required: true,
                  message: "Por favor, ingrese el nombre de usuario",
                },
              ]}
            >
              <Input
                disabled={Boolean(editingUser) && editingUser?.roles.some(rol => rol.nombre === 'PROPIETARIO') && !isPropietarioAuth}
              />
            </Form.Item>
            <Form.Item
              name="password"
              label="Contraseña"
              rules={[
                {
                  required: !editingUser,
                  message: "Por favor, ingrese la contraseña",
                },
              ]}
            >
              <Input.Password placeholder={editingUser ? "Dejar en blanco para no cambiar" : ""} />
            </Form.Item>
            <Form.Item
              name="roles"
              label="Roles"
              rules={[
                { required: true, message: "Por favor, seleccione al menos un rol" },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Seleccione los roles"
                disabled={Boolean(editingUser) && editingUser?.username === authenticatedUsername && isPropietarioAuth}
              >
                {/* ✨ Usa la lista de roles filtrada aquí */}
                {filteredRoles.map((rol) => (
                  <Option key={rol.nombre} value={rol.nombre}>
                    {rol.nombre}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            {editingUser && (
              <Form.Item name="activo" valuePropName="checked">
                <Checkbox
                  disabled={Boolean(editingUser) && editingUser?.username === authenticatedUsername && isPropietarioAuth}
                >
                  Activo
                </Checkbox>
              </Form.Item>
            )}
            <Form.Item className="mt-4">
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingUser ? "Actualizar" : "Crear"}
                </Button>
                <Button
                  onClick={() => {
                    setIsModalVisible(false);
                    setEditingUser(null);
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

export default UsuariosPage;