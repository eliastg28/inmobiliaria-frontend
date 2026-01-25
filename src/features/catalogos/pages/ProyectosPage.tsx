// src/pages/Proyectos/ProyectosPage.tsx

import React, { useState, useEffect, useCallback, useRef } from "react";
// 🌟 Importación NECESARIA para la navegación
import { useNavigate } from "react-router-dom";
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
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  // 🌟 Ícono para el botón de Lotes
  LayoutOutlined,
} from "@ant-design/icons";
import { AxiosError } from "axios";
import { FormInstance } from "antd/lib/form";

// 1. Importaciones del Proyecto Service (ASUME que están en la ruta correcta)
import {
  getProyectosActivos,
  createProyecto,
  updateProyecto,
  deleteProyecto,
  ProyectoResponse,
  ProyectoDTO,
} from "../../../api/proyecto.service";

// 2. Importaciones del Geografía Service (ASUME que están en la ruta correcta)
import {
  getDepartamentos,
  getProvinciasByDepartamentoId,
  getDistritosByProvinciaId,
  Departamento,
  Provincia,
  Distrito as GeoDistrito,
} from "../../../api/geografia.service";

const { confirm } = Modal;
const { Title } = Typography;
const { Option } = Select;

/**
 * Interfaz para los valores del formulario, que incluye el DTO de Proyecto
 * más los campos auxiliares para la cascada geográfica.
 */
interface ProyectoFormValues extends ProyectoDTO {
  departamentoId?: string;
  provinciaId?: string;
}

const ProyectosPage: React.FC = () => {
  // 🌟 Inicializar el hook de navegación
  const navigate = useNavigate();

  const [proyectos, setProyectos] = useState<ProyectoResponse[]>([]);
  const [search, setSearch] = useState<string>("");
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingProyecto, setEditingProyecto] =
    useState<ProyectoResponse | null>(null);
  const [form] = Form.useForm<ProyectoFormValues>();

  // Estados para los selectores geográficos en cascada
  const [departamentosOptions, setDepartamentosOptions] = useState<
    Departamento[]
  >([]);
  const [provinciasOptions, setProvinciasOptions] = useState<Provincia[]>([]);
  const [distritosOptions, setDistritosOptions] = useState<GeoDistrito[]>([]);

  // useWatch para el control de la cascada
  const departamentoIdValue = Form.useWatch("departamentoId", form);
  const provinciaIdValue = Form.useWatch("provinciaId", form);

  useEffect(() => {
    fetchData();
    fetchInitialGeoOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async (searchValue?: string) => {
    setLoading(true);
    try {
      const data = await getProyectosActivos(searchValue);
      setProyectos(data);
    } catch (error) {
      message.error(
        "Error al cargar los proyectos. Por favor, intente de nuevo."
      );
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

  const fetchInitialGeoOptions = async () => {
    try {
      const departamentosData = await getDepartamentos();
      setDepartamentosOptions(departamentosData);
    } catch (error) {
      console.error(
        "Error al cargar las opciones de geografía inicial:",
        error
      );
      message.warning("No se pudieron cargar las opciones de departamento.");
    }
  };

  // --- LÓGICA DE CARGA EN CASCADA ---

  const fetchProvincias = useCallback(
    async (
      departamentoId: string | undefined,
      formInstance: FormInstance<ProyectoFormValues>
    ) => {
      try {
        setProvinciasOptions([]);
        setDistritosOptions([]);
        formInstance.setFieldsValue({
          provinciaId: undefined,
          distritoId: undefined,
        });

        if (departamentoId) {
          const provinciasData = await getProvinciasByDepartamentoId(
            departamentoId
          );
          setProvinciasOptions(provinciasData);
        }
      } catch (error) {
        message.error("Error al cargar las provincias.");
      }
    },
    []
  );

  const fetchDistritos = useCallback(
    async (
      provinciaId: string | undefined,
      formInstance: FormInstance<ProyectoFormValues>
    ) => {
      try {
        setDistritosOptions([]);
        formInstance.setFieldsValue({ distritoId: undefined });

        if (provinciaId) {
          const distritosData = await getDistritosByProvinciaId(provinciaId);
          setDistritosOptions(distritosData);
        }
      } catch (error) {
        message.error("Error al cargar los distritos.");
      }
    },
    []
  );

  // Manejador de cambio de Departamento
  const handleDepartamentoChange = (departamentoId: string | undefined) => {
    if (!departamentoId) {
      setProvinciasOptions([]);
      setDistritosOptions([]);
      form.setFieldsValue({
        departamentoId: undefined,
        provinciaId: undefined,
        distritoId: undefined,
      });
      return;
    }
    fetchProvincias(departamentoId, form);
  };

  // Manejador de cambio de Provincia
  const handleProvinciaChange = (provinciaId: string | undefined) => {
    if (!provinciaId) {
      setDistritosOptions([]);
      form.setFieldsValue({ provinciaId: undefined, distritoId: undefined });
      return;
    }
    fetchDistritos(provinciaId, form);
  };

  // --- LÓGICA CRUD ---

  const handleFormSubmit = async (values: ProyectoFormValues) => {
    // Excluimos los IDs geográficos auxiliares (departamentoId y provinciaId)
    const { departamentoId, provinciaId, ...proyectoDto } = values;

    try {
      setLoading(true);
      if (editingProyecto) {
        await updateProyecto(
          editingProyecto.proyectoId,
          proyectoDto as ProyectoDTO
        );
        message.success("Proyecto actualizado exitosamente.");
      } else {
        await createProyecto(proyectoDto as ProyectoDTO);
        message.success("Proyecto creado exitosamente.");
      }
      handleCloseModal();
      await fetchData();
    } catch (error: any) {
      const errorMessage =
        (error as AxiosError).response?.data ||
        "Error al guardar el proyecto. Por favor, verifique los datos.";
      message.error(errorMessage as string);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (proyecto: ProyectoResponse) => {
    setEditingProyecto(proyecto);
    setIsModalVisible(true);
    setLoading(true);

    // 1. Asignar valores geográficos y campos base
    const dptoIdStr = String(proyecto.departamentoId);
    const provIdStr = String(proyecto.provinciaId);
    const distrIdStr = String(proyecto.distritoId);

    form.setFieldsValue({
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion,
      departamentoId: dptoIdStr,
    });

    // 2. Cargar y preseleccionar opciones en cascada
    if (dptoIdStr) {
      await fetchProvincias(dptoIdStr, form);
    }
    if (provIdStr) {
      await fetchDistritos(provIdStr, form);
    }

    // 3. Asignar los IDs de provincia y distrito después de cargar sus listas
    form.setFieldsValue({
      provinciaId: provIdStr,
      distritoId: distrIdStr,
    });

    setLoading(false);
  };

  const handleDelete = (id: string) => {
    confirm({
      title: "¿Está seguro de que desea eliminar lógicamente este proyecto?",
      content: "Los lotes asociados ya no estarán disponibles.",
      icon: <ExclamationCircleOutlined />,
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          setLoading(true);
          await deleteProyecto(id);
          message.success("Proyecto eliminado exitosamente.");
          await fetchData();
        } catch (error: any) {
          const errorMessage =
            (error as AxiosError).response?.data ||
            "Error al eliminar el proyecto. Intente de nuevo.";
          message.error(errorMessage as string);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingProyecto(null);
    form.resetFields();
    setProvinciasOptions([]);
    setDistritosOptions([]);
  };

  // 🌟 FUNCIÓN PARA NAVEGAR A LA VISTA DE LOTES POR PROYECTO
  const handleViewLotes = (proyectoId: string, nombreProyecto: string) => {
    // Navegación a la ruta dinámica: /lots/project/UUID
    navigate(`/lots/projects/${proyectoId}`, {
      state: {
        proyectoNombre: nombreProyecto,
        proyectoId: proyectoId,
      },
    });
  };

  // --- COLUMNAS DE LA TABLA MODIFICADAS ---
  const columns = [
    {
      title: "N°",
      key: "index",
      render: (text: any, record: ProyectoResponse, index: number) => index + 1,
      width: 50,
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a: ProyectoResponse, b: ProyectoResponse) =>
        a.nombre.localeCompare(b.nombre),
    },
    {
      title: "Descripción",
      dataIndex: "descripcion",
      key: "descripcion",
      ellipsis: true,
      width: 250,
    },
    {
      title: "Cantidad de Lotes",
      dataIndex: "totalLotes",
      key: "totalLotes",
      width: 130,
    },
    {
      title: "Departamento",
      dataIndex: "departamentoNombre",
      key: "departamentoNombre",
      sorter: (a: ProyectoResponse, b: ProyectoResponse) =>
        a.departamentoNombre.localeCompare(b.departamentoNombre),
    },
    {
      title: "Provincia",
      dataIndex: "provinciaNombre",
      key: "provinciaNombre",
      sorter: (a: ProyectoResponse, b: ProyectoResponse) =>
        a.provinciaNombre.localeCompare(b.provinciaNombre),
    },
    {
      title: "Distrito",
      dataIndex: "distritoNombre",
      key: "distritoNombre",
      sorter: (a: ProyectoResponse, b: ProyectoResponse) =>
        a.distritoNombre.localeCompare(b.distritoNombre),
    },
    {
      title: "Acciones",
      key: "actions",
      width: 220,
      render: (text: any, record: ProyectoResponse) => (
        <Space size="middle">
          <Button
            type="default"
            icon={<LayoutOutlined />}
            onClick={() => handleViewLotes(record.proyectoId, record.nombre)}
            disabled={!record.activo}
          >
            Ver Lotes
          </Button>
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
            onClick={() => handleDelete(record.proyectoId)}
            disabled={record.totalLotes > 0}
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card className="shadow-md rounded-lg max-w-full xl:max-w-7xl mx-auto">
        <div className="mb-6">
          <Title level={2} className="text-xl sm:text-2xl mb-4 sm:mb-0">
            Gestión de Proyectos Inmobiliarios
          </Title>
          <div className="flex flex-wrap flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-2 mt-2">
            <div className="flex-1 sm:flex-none">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingProyecto(null);
                  handleCloseModal();
                  setIsModalVisible(true);
                }}
              >
                Crear Nuevo Proyecto
              </Button>
            </div>
            <br />
            <div className="flex-1 sm:flex-none sm:ml-auto" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Input
                placeholder="Buscar proyecto..."
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
          dataSource={proyectos.filter((p) => p.activo)}
          loading={loading}
          rowKey="proyectoId"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1320 }} // Ajustamos el scroll por el nuevo botón
        />

        <Modal
          title={editingProyecto ? "Editar Proyecto" : "Crear Nuevo Proyecto"}
          open={isModalVisible}
          onCancel={handleCloseModal}
          footer={null}
          width={700}
        >
          <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
            <Row gutter={16}>
              {/* Nombre y Descripción */}
              <Col xs={24} sm={24}>
                <Form.Item
                  name="nombre"
                  label="Nombre del Proyecto"
                  rules={[
                    {
                      required: true,
                      message: "Ingrese el nombre del proyecto",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24}>
                <Form.Item
                  name="descripcion"
                  label="Descripción"
                  rules={[
                    { required: true, message: "Ingrese la descripción" },
                  ]}
                >
                  <Input.TextArea rows={3} />
                </Form.Item>
              </Col>
            </Row>

            <Title level={5} className="mt-4 mb-2">
              Ubicación Geográfica
            </Title>

            {/* Cascada Geográfica */}
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="departamentoId"
                  label="Departamento"
                  rules={[
                    { required: true, message: "Seleccione el departamento" },
                  ]}
                >
                  <Select
                    placeholder="Departamento"
                    onChange={handleDepartamentoChange}
                    allowClear
                  >
                    {departamentosOptions.map((dep) => (
                      <Option
                        key={dep.departamentoId}
                        value={dep.departamentoId}
                      >
                        {dep.nombre}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="provinciaId"
                  label="Provincia"
                  rules={[
                    { required: true, message: "Seleccione la provincia" },
                  ]}
                >
                  <Select
                    placeholder="Provincia"
                    onChange={handleProvinciaChange}
                    disabled={!departamentoIdValue}
                    allowClear
                  >
                    {provinciasOptions.map((prov) => (
                      <Option key={prov.provinciaId} value={prov.provinciaId}>
                        {prov.nombre}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                {/* El campo distritoId es el que se envía en ProyectoDTO */}
                <Form.Item
                  name="distritoId"
                  label="Distrito"
                  rules={[
                    { required: true, message: "Seleccione el distrito" },
                  ]}
                >
                  <Select
                    placeholder="Distrito"
                    disabled={!provinciaIdValue}
                    allowClear
                  >
                    {distritosOptions.map((dist) => (
                      <Option key={dist.distritoId} value={dist.distritoId}>
                        {dist.nombre}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item className="mt-4">
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingProyecto ? "Actualizar Proyecto" : "Crear Proyecto"}
                </Button>
                <Button onClick={handleCloseModal}>Cancelar</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default ProyectosPage;
