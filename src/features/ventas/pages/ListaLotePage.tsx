// src/pages/Lotes/ListaLotePage.tsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
// 🌟 Importaciones CLAVE para manejar la navegación y parámetros
import { useParams, useLocation, useNavigate } from "react-router-dom";
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
  InputNumber,
  Select,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  // 🌟 Ícono para el botón de regreso
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { AxiosError } from "axios";
import { FormInstance } from "antd/lib/form"; // Importado para el tipo FormInstance

// 1. Importaciones de Lote Service
import {
  getLotesActivos,
  createLote,
  updateLote,
  deleteLote,
  Lote,
  LoteDTO,
} from "../../../api/lote.service";

// 2. Importaciones del EstadoLote Service
import { getEstadosLote, EstadoLote } from "../../../api/estadoLote.service";

// 3. Importaciones del Geografía Service
import {
  getDepartamentos,
  getProvinciasByDepartamentoId,
  getDistritosByProvinciaId,
  Departamento,
  Provincia,
  Distrito as GeoDistrito,
} from "../../../api/geografia.service";

// 4. Importaciones del Proyecto Service
import {
  getProyectosActivos,
  ProyectoResponse,
} from "../../../api/proyecto.service";

const { confirm } = Modal;
const { Title } = Typography;
const { Option } = Select;

interface LoteFormValues extends LoteDTO {
  departamentoId?: string;
  provinciaId?: string;
  distritoId?: string;
}

interface LoteConGeografia extends Lote {
  proyectoId: string;
  distritoId: string;
  provinciaId: string;
  departamentoId: string;
}

const ListaLotePage: React.FC = () => {
  // 🌟 LECTURA DE PARÁMETROS DE LA RUTA Y NAVEGACIÓN
  const { proyectoId } = useParams<{ proyectoId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const proyectoNombre =
    (location.state as { proyectoNombre?: string })?.proyectoNombre ||
    "Cargando...";

  const [lotes, setLotes] = useState<Lote[]>([]);
  const [estadosLoteOptions, setEstadosLoteOptions] = useState<EstadoLote[]>(
    []
  );

  // ESTADO: Lista completa de proyectos
  const [allProyectos, setAllProyectos] = useState<ProyectoResponse[]>([]);
  const [proyectosOptions, setProyectosOptions] = useState<ProyectoResponse[]>(
    []
  );

  // Estados para los selectores geográficos en cascada
  const [departamentosOptions, setDepartamentosOptions] = useState<
    Departamento[]
  >([]);
  const [provinciasOptions, setProvinciasOptions] = useState<Provincia[]>([]);
  const [distritosOptions, setDistritosOptions] = useState<GeoDistrito[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingLote, setEditingLote] = useState<LoteConGeografia | null>(null);
  const [form] = Form.useForm<LoteFormValues>();

  // useWatch para controlar la deshabilitación de campos y el filtrado de Proyectos
  const departamentoIdValue = Form.useWatch("departamentoId", form);
  const provinciaIdValue = Form.useWatch("provinciaId", form);
  const distritoIdValue = Form.useWatch("distritoId", form);

  // Obtener el ID del estado "Disponible"
  const disponibleId = useMemo(() => {
    const disponible = estadosLoteOptions.find(
      (e) => e.nombre.toLowerCase() === "disponible"
    );
    return disponible ? disponible.estadoLoteId : undefined;
  }, [estadosLoteOptions]);

  // Obtener el proyecto actual (si existe)
  const currentProyecto = useMemo(() => {
    return allProyectos.find((p) => p.proyectoId === proyectoId);
  }, [allProyectos, proyectoId]);

  // 🌟 useEffect PRINCIPAL para cargar datos y manejar fallback
  useEffect(() => {
    if (!proyectoId) {
      message.error("ID de proyecto no encontrado. Volviendo a Proyectos.");
      // 🛑 CORRECCIÓN DE FALLBACK: Usar ruta ABSOLUTA
      navigate("/lots/projects");
      return;
    }
    fetchData(proyectoId);
    fetchSelectOptions();
  }, [proyectoId, navigate]);

  // FILTRADO DE PROYECTOS basado en el distrito seleccionado (Lógica sin cambios, sigue correcta)
  useEffect(() => {
    if (distritoIdValue) {
      const filteredProyectos = allProyectos.filter(
        (p) => p.distritoId === distritoIdValue
      );
      setProyectosOptions(filteredProyectos);
      const currentProjectId = form.getFieldValue("proyectoId");
      if (
        currentProjectId &&
        !filteredProyectos.some((p) => p.proyectoId === currentProjectId)
      ) {
        form.setFieldsValue({ proyectoId: undefined });
      }
    } else {
      setProyectosOptions([]);
      form.setFieldsValue({ proyectoId: undefined });
    }
  }, [distritoIdValue, allProyectos, form]);

  // Lista de opciones de estado filtrada
  const filteredEstadosLoteOptions = useMemo(() => {
    // 1. Encontramos el ID del estado "Vendido" (asumiendo que es un estado que existe)
    const vendidoEstado = estadosLoteOptions.find(
      (e) => e.nombre.toLowerCase() === "vendido"
    );

    // 2. Si no estamos editando (creación) o si no hay estados cargados, devolvemos la lista completa por defecto.
    // Aunque en la creación no se muestra, es bueno tener un fallback.
    if (!editingLote) {
      // En creación, no mostramos el campo de estadoLoteId
      return [];
    }

    // 3. Obtenemos el nombre del estado actual del lote que se está editando.
    const estadoActualNombre = editingLote.estadoLoteNombre;

    // Si el estado actual es 'Vendido', mostramos TODAS las opciones.
    if (estadoActualNombre.toLowerCase() === "vendido") {
      return estadosLoteOptions;
    }

    // Si el estado actual NO es 'Vendido', mostramos TODAS excepto 'Vendido'.
    // Usamos el ID de "Vendido" para el filtro, si lo encontramos.
    if (vendidoEstado) {
      return estadosLoteOptions.filter(
        (estado) => estado.estadoLoteId !== vendidoEstado.estadoLoteId
      );
    }

    // Fallback: si no se encuentra "Vendido" o por si acaso.
    return estadosLoteOptions;
  }, [estadosLoteOptions, editingLote]);

  // --- LÓGICA DE CARGA DE DATOS Y SELECTORES ---

  const fetchData = async (id: string) => {
    setLoading(true);
    try {
      const allData = await getLotesActivos();
      const filteredLotes = (allData as LoteConGeografia[]).filter(
        (lote) => lote.proyectoId === id
      );
      setLotes(filteredLotes);
    } catch (error) {
      message.error(
        "Error al cargar los lotes del proyecto. Por favor, intente de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectOptions = async () => {
    try {
      const [estadosData, departamentosData, proyectosData] = await Promise.all(
        [getEstadosLote(), getDepartamentos(), getProyectosActivos()]
      );

      setEstadosLoteOptions(estadosData);
      setDepartamentosOptions(departamentosData);
      setAllProyectos(proyectosData);
    } catch (error) {
      console.error("Error al cargar las opciones de select:", error);
      message.warning(
        "No se pudieron cargar todas las opciones de estado/geografía/proyectos."
      );
    }
  };

  const fetchProvincias = useCallback(
    async (
      departamentoId: string | undefined,
      formInstance: FormInstance<LoteFormValues> = form
    ) => {
      try {
        setProvinciasOptions([]);
        setDistritosOptions([]);
        setProyectosOptions([]);
        formInstance.setFieldsValue({
          provinciaId: undefined,
          distritoId: undefined,
          proyectoId: undefined,
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
    [form]
  );

  const fetchDistritos = useCallback(
    async (
      provinciaId: string | undefined,
      formInstance: FormInstance<LoteFormValues> = form
    ) => {
      try {
        setDistritosOptions([]);
        setProyectosOptions([]);
        formInstance.setFieldsValue({
          distritoId: undefined,
          proyectoId: undefined,
        });

        if (provinciaId) {
          const distritosData = await getDistritosByProvinciaId(provinciaId);
          setDistritosOptions(distritosData);
        }
      } catch (error) {
        message.error("Error al cargar los distritos.");
      }
    },
    [form]
  );

  const handleDepartamentoChange = (departamentoId: string | undefined) => {
    form.setFieldsValue({
      provinciaId: undefined,
      distritoId: undefined,
      proyectoId: undefined,
    });
    if (!departamentoId) {
      setProvinciasOptions([]);
      setDistritosOptions([]);
      setProyectosOptions([]);
      return;
    }
    fetchProvincias(departamentoId);
  };

  const handleProvinciaChange = (provinciaId: string | undefined) => {
    form.setFieldsValue({ distritoId: undefined, proyectoId: undefined });
    if (!provinciaId) {
      setDistritosOptions([]);
      setProyectosOptions([]);
      return;
    }
    fetchDistritos(provinciaId);
  };

  // --- LÓGICA CRUD ---

  const handleFormSubmit = async (values: LoteFormValues) => {
    // En el DTO final no necesitamos los campos geográficos que solo son auxiliares
    const { departamentoId, provinciaId, distritoId, ...loteDto } = values;

    if (!loteDto.proyectoId) {
      return message.error(
        "Debe seleccionar un Proyecto al cual pertenece el lote."
      );
    }

    // 🛑 CORRECCIÓN DE TIPADO: Aseguramos que disponibleId no sea undefined antes de asignarlo
    if (!editingLote) {
      if (!disponibleId) {
        // Si estamos creando, el ID del estado "Disponible" es crucial.
        message.error(
          "Error al crear el lote: No se encontró el ID del estado 'Disponible'."
        );
        return; // Detener la ejecución.
      }
      // ✅ Asignación segura
      loteDto.estadoLoteId = disponibleId;
    }

    try {
      setLoading(true);
      // El `loteDto` ahora es un objeto `LoteDTO` válido, ya que se le asignó `estadoLoteId`
      // si era un nuevo lote, o ya lo traía si era una edición.
      if (editingLote) {
        await updateLote(editingLote.loteId, loteDto as LoteDTO);
        message.success("Lote actualizado exitosamente.");
      } else {
        await createLote(loteDto as LoteDTO);
        message.success("Lote creado exitosamente.");
      }
      handleCloseModal();
      await fetchData(proyectoId!);
    } catch (error: any) {
      const errorMessage =
        (error as AxiosError).response?.data ||
        "Error al guardar el lote. Por favor, verifique los datos.";
      message.error(errorMessage as string);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingLote(null);
    form.resetFields();
    setProvinciasOptions([]);
    setDistritosOptions([]);
    setProyectosOptions([]);
  };

  const handleEdit = async (lote: LoteConGeografia) => {
    setEditingLote(lote);
    setIsModalVisible(true);
    setLoading(true);

    const dptoIdStr = String(lote.departamentoId);
    const provIdStr = String(lote.provinciaId);
    const distrIdStr = String(lote.distritoId);

    // 1. Cargar opciones en cascada ANTES de establecer el valor del distrito
    await fetchProvincias(dptoIdStr);
    await fetchDistritos(provIdStr);

    // 2. Establecer todos los valores al final
    form.setFieldsValue({
      nombre: lote.nombre,
      descripcion: lote.descripcion,
      precio: lote.precio,
      area: lote.area,
      direccion: lote.direccion,
      // Aquí el `find` podría ser `undefined`, pero el campo `estadoLoteId` es `string`
      // Dado que estamos editando un lote existente, asumimos que tiene un estado válido.
      // Usamos el operador de aserción `!` para indicarle a TypeScript que estamos seguros
      // de que el valor será un string válido en este contexto de edición.
      estadoLoteId: estadosLoteOptions.find(
        (e) => e.nombre === lote.estadoLoteNombre
      )?.estadoLoteId!,
      departamentoId: dptoIdStr,
      provinciaId: provIdStr,
      distritoId: distrIdStr,
      proyectoId: String(lote.proyectoId),
    });

    setLoading(false);
  };

  const handleDelete = (id: string) => {
    confirm({
      title: "¿Está seguro de que desea eliminar este lote?",
      icon: <ExclamationCircleOutlined />,
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          setLoading(true);
          await deleteLote(id);
          message.success("Lote eliminado exitosamente.");
          await fetchData(proyectoId!);
        } catch (error: any) {
          const errorMessage =
            (error as AxiosError).response?.data ||
            "Error al eliminar el lote. Intente de nuevo.";
          message.error(errorMessage as string);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 🌟 FUNCIÓN DE NAVEGACIÓN HACÍA ATRÁS - CORREGIDA
  const handleGoBack = () => {
    // ✅ CORRECCIÓN CLAVE: Usar -1 para ir a la entrada anterior del historial (ProyectosPage).
    navigate(-1);
  };

  // --- COLUMNAS DE LA TABLA ---
  const columns = [
    {
      title: "N°",
      key: "index",
      render: (text: any, record: Lote, index: number) => index + 1,
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a: Lote, b: Lote) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: "Distrito",
      dataIndex: "distritoNombre",
      key: "distritoNombre",
      sorter: (a: Lote, b: Lote) =>
        a.distritoNombre.localeCompare(b.distritoNombre),
    },
    {
      title: "Área (m²)",
      dataIndex: "area",
      key: "area",
      sorter: (a: Lote, b: Lote) => a.area - b.area,
      render: (area: number) => `${area} m²`,
    },
    {
      title: "Precio (S/)",
      dataIndex: "precio",
      key: "precio",
      sorter: (a: Lote, b: Lote) => a.precio - b.precio,
      render: (precio: number) =>
        `S/ ${precio.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`,
    },
    {
      title: "Estado",
      dataIndex: "estadoLoteNombre",
      key: "estadoLoteNombre",
      sorter: (a: Lote, b: Lote) =>
        a.estadoLoteNombre.localeCompare(b.estadoLoteNombre),
      render: (estado: string) => (
        <span
          style={{
            color:
              estado === "Disponible"
                ? "green"
                : estado === "Reservado"
                ? "orange"
                : "red",
            fontWeight: "bold",
          }}
        >
          {estado}
        </span>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (text: any, record: Lote) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record as LoteConGeografia)}
          >
            Editar
          </Button>
          <Button
            type="default"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.loteId)}
            disabled={record.estadoLoteNombre !== "Disponible"}
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  // ----------------------------------------------------------------------
  // RENDERIZADO DEL COMPONENTE
  // ----------------------------------------------------------------------
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card className="shadow-md rounded-lg max-w-full lg:max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex items-center space-x-4">
            {/* 🌟 BOTÓN DE REGRESO */}
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleGoBack}
              type="text"
              className="text-gray-600 hover:text-blue-500"
            >
              Volver
            </Button>
            {/* 🌟 TÍTULO DINÁMICO */}
            <Title level={2} className="text-xl sm:text-2xl mb-4 sm:mb-0">
              Lotes del Proyecto: {proyectoNombre}
            </Title>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={async () => {
              setEditingLote(null);
              handleCloseModal(); // Limpia campos y estados

              // 🚀 MEJORA: Precargar Geografía y Proyecto al crear
              const currentDptoId = currentProyecto?.departamentoId;
              const currentProvId = currentProyecto?.provinciaId;
              const currentDistrId = currentProyecto?.distritoId;

              if (
                currentProyecto &&
                currentDptoId &&
                currentProvId &&
                currentDistrId
              ) {
                // Cargar las opciones de provincia y distrito del proyecto actual
                await fetchProvincias(currentDptoId, form);
                await fetchDistritos(currentProvId, form);

                form.setFieldsValue({
                  estadoLoteId: disponibleId,
                  proyectoId: proyectoId,
                  departamentoId: currentDptoId,
                  provinciaId: currentProvId,
                  distritoId: currentDistrId,
                });

                // El filtro de proyectosOptions ya se activa con distritoIdValue
              } else if (proyectoId) {
                // Si no hay info geográfica, solo inicializamos el proyectoId y estado
                form.setFieldsValue({
                  estadoLoteId: disponibleId, // Se asigna internamente, pero el campo no se muestra
                  proyectoId: proyectoId,
                });
              }

              // 🚀 MEJORA: Asegurar que la lista de proyectosOptions solo contenga el proyecto actual (si estamos creando)
              // Esto evita que se pueda cambiar el proyecto al crear un lote desde la vista de un proyecto específico
              if (proyectoId) {
                setProyectosOptions(
                  allProyectos.filter((p) => p.proyectoId === proyectoId)
                );
              } else {
                setProyectosOptions([]);
              }

              setIsModalVisible(true);
            }}
          >
            Crear Nuevo Lote
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={lotes}
          loading={loading}
          rowKey="loteId"
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
        />

        <Modal
          title={editingLote ? "Editar Lote" : "Crear Nuevo Lote"}
          open={isModalVisible}
          onCancel={handleCloseModal}
          footer={null}
          width={700}
          style={{ marginTop: -55 }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFormSubmit}
            initialValues={{
              precio: null,
              area: null,
              // Si estamos creando, el estado se setea en el onClick y en el handleFormSubmit
              // Si estamos editando, el estado se setea en handleEdit
            }}
          >
            {/* ... (Campos Nombre, Descripción, Precio, Área) ... */}
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="nombre"
                  label="Nombre del Lote"
                  rules={[
                    { required: true, message: "Ingrese el nombre del lote" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="descripcion"
                  label="Descripción"
                  rules={[
                    { required: true, message: "Ingrese la descripción" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="precio"
                  label="Precio (S/)"
                  rules={[{ required: true, message: "Ingrese el precio" }]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="area"
                  label="Área (m²)"
                  rules={[{ required: true, message: "Ingrese el área" }]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    formatter={(value) => `${value}`}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                {/* 🛑 CAMBIO CLAVE: Muestra el campo ESTADO solo en modo EDICIÓN */}
                {editingLote && (
                  <Form.Item
                    name="estadoLoteId"
                    label="Estado"
                    rules={[
                      { required: true, message: "Seleccione el estado" },
                    ]}
                  >
                    <Select placeholder="Estado">
                      {/* ✅ USAMOS LA LISTA FILTRADA */}
                      {filteredEstadosLoteOptions.map((estado) => (
                        <Option
                          key={estado.estadoLoteId}
                          value={estado.estadoLoteId}
                        >
                          {estado.nombre}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}
              </Col>
            </Row>

            {/* --- SECCIÓN DE UBICACIÓN Y PROYECTO --- */}
            <Title level={5} className="mt-4 mb-2">
              Ubicación y Asignación de Proyecto
            </Title>

            {/* FILA 3: Departamento y Provincia */}
            <Row gutter={16}>
              <Col xs={24} sm={12}>
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
                    // 🛑 CAMBIO CLAVE: Deshabilitado en EDITAR o al CREAR (si el proyecto ya está fijado)
                    disabled={!!editingLote || (!editingLote && !!proyectoId)}
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
              <Col xs={24} sm={12}>
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
                    // 🛑 CAMBIO CLAVE: Deshabilitado en EDITAR o al CREAR (si el proyecto ya está fijado)
                    disabled={
                      !departamentoIdValue ||
                      !!editingLote ||
                      (!editingLote && !!proyectoId)
                    }
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
            </Row>

            {/* FILA 4: Distrito y Proyecto */}
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="distritoId"
                  label="Distrito"
                  rules={[
                    { required: true, message: "Seleccione el distrito" },
                  ]}
                >
                  <Select
                    placeholder="Distrito"
                    // 🛑 CAMBIO CLAVE: Deshabilitado en EDITAR o al CREAR (si el proyecto ya está fijado)
                    disabled={
                      !provinciaIdValue ||
                      !!editingLote ||
                      (!editingLote && !!proyectoId)
                    }
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
              <Col xs={24} sm={12}>
                <Form.Item
                  name="proyectoId"
                  label="Proyecto Asignado"
                  rules={[
                    { required: true, message: "Seleccione el proyecto" },
                  ]}
                >
                  <Select
                    placeholder="Seleccione un proyecto en el distrito"
                    // 🛑 CAMBIO CLAVE: Siempre deshabilitado si ya tenemos el proyectoId (CREAR) o si estamos EDITANDO
                    disabled={!!proyectoId}
                    allowClear
                  >
                    {proyectosOptions.map((proyecto) => (
                      <Option
                        key={proyecto.proyectoId}
                        value={proyecto.proyectoId}
                      >
                        {proyecto.nombre}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* FILA 5: Dirección */}
            <Row gutter={16}>
              <Col xs={24} sm={24}>
                <Form.Item
                  name="direccion"
                  label="Dirección (Detallada)"
                  rules={[
                    {
                      required: true,
                      message: "Por favor, ingrese la dirección exacta",
                    },
                  ]}
                >
                  <Input />
                  {/* ✅ Dirección se mantiene editable tanto en crear como en editar */}
                </Form.Item>
              </Col>
            </Row>

            {/* Botones */}
            <Form.Item className="mt-4">
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingLote ? "Actualizar Lote" : "Crear Lote"}
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

export default ListaLotePage;
