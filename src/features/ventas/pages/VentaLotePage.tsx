import React, { useState, useEffect, useMemo, useCallback } from "react"; // Añadido useCallback
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
  DatePicker,
  Tag,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  HistoryOutlined,
  WalletOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { AxiosError } from "axios";
import dayjs, { Dayjs } from "dayjs";

// Importaciones del Servicio de Venta de Lotes
import {
  getVentas,
  createVenta,
  updateVenta,
  Venta,
  VentaDTO,
  deleteVenta,
} from "../../../api/ventaLote.service";

// Servicios de Selects
import { getLotesDisponibles, Lote } from "../../../api/lote.service";
import { getClientes, Cliente } from "../../../api/cliente.service";
import { getEstadosVenta, EstadoVenta } from "../../../api/estadoVenta.service";
import { getMonedas, Moneda } from "../../../api/moneda.service";
import { getProyectos, Proyecto } from "../../../api/proyecto.service";

import AbonoHistoryModal from "../components/AbonoHistoryModal";

const { confirm } = Modal;
const { Title } = Typography;
const { Option } = Select;

// INTERFAZ DEL FORMULARIO
interface VentaFormValues
  extends Omit<VentaDTO, "fechaContrato" | "montoTotal" | "monedaId"> {
  fechaContrato?: Dayjs;
  nroCuotas?: number;
}

const VentaLotePage: React.FC = () => {
  // --- Estados y Hooks de Roles ---
  const [authenticatedUserRoles, setAuthenticatedUserRoles] = useState<
    string[]
  >([]);
  const userRole = useMemo(() => {
    if (authenticatedUserRoles.includes("PROPIETARIO")) return "PROPIETARIO";
    if (authenticatedUserRoles.includes("ADMIN")) return "ADMIN";
    if (authenticatedUserRoles.includes("VENDEDOR")) return "VENDEDOR";
    return "VENDEDOR";
  }, [authenticatedUserRoles]);

  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientesOptions, setClientesOptions] = useState<Cliente[]>([]);
  const [proyectosOptions, setProyectosOptions] = useState<Proyecto[]>([]);
  const [lotesOptions, setLotesOptions] = useState<Lote[]>([]);
  const [estadosVentaOptions, setEstadosVentaOptions] = useState<EstadoVenta[]>(
    []
  );
  const [monedasOptions, setMonedasOptions] = useState<Moneda[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingVenta, setEditingVenta] = useState<Venta | null>(null);
  const [form] = Form.useForm<VentaFormValues>();

  const [isAbonoModalVisible, setIsAbonoModalVisible] =
    useState<boolean>(false);
  const [selectedVentaForAbono, setSelectedVentaForAbono] =
    useState<Venta | null>(null);
  const [showAbonoForm, setShowAbonoForm] = useState<boolean>(false);

  // Watch para los IDs seleccionados
  const proyectoIdSeleccionado = Form.useWatch("proyectoId", form);
  const loteIdSeleccionado = Form.useWatch("loteId", form);

  // --- Lógica de IDs y Cálculos ---
  const estadoVentaPendienteId = useMemo(() => {
    const estado = estadosVentaOptions.find(
      (e) => e.nombre.toLowerCase() === "pendiente"
    );
    return estado ? estado.estadoVentaId : undefined;
  }, [estadosVentaOptions]);

  const solMonedaId = useMemo(() => {
    const sol = monedasOptions.find((m) => m.nombre.toUpperCase() === "SOL");
    return sol ? sol.monedaId : undefined;
  }, [monedasOptions]);

  // 1. Opciones de Proyecto (incluye el de la venta en edición)
  const proyectosOptionsForForm = useMemo(() => {
    if (
      editingVenta &&
      !proyectosOptions.some((p) => p.proyectoId === editingVenta.proyectoId)
    ) {
      const editedProyecto: Proyecto = {
        proyectoId: editingVenta.proyectoId,
        nombre: (editingVenta as any).proyectoNombre || "Proyecto Desconocido",
      } as Proyecto;

      return [editedProyecto, ...proyectosOptions];
    }
    return proyectosOptions;
  }, [editingVenta, proyectosOptions]);

  // 2. Opciones de Lote para el formulario (disponibles + lote en edición)
  const lotesOptionsForForm = useMemo(() => {
    if (
      editingVenta &&
      !lotesOptions.some((l) => l.loteId === editingVenta.loteId)
    ) {
      const editedLote: Lote = {
        loteId: editingVenta.loteId,
        nombre: editingVenta.loteNombre,
        precio: editingVenta.montoTotal,
        proyectoId: editingVenta.proyectoId,
        descripcion: "",
        area: 0,
        estadoLoteNombre: "",
        distritoNombre: "",
        direccion: "",
        activo: true,
        proyectoNombre: (editingVenta as any).proyectoNombre || "",
        distritoId: "",
        provinciaId: "",
        departamentoId: "",
      } as Lote;

      return [editedLote, ...lotesOptions];
    }
    return lotesOptions;
  }, [editingVenta, lotesOptions]);

  const montoTotalCalculado = useMemo(() => {
    if (!loteIdSeleccionado) return 0;
    const lote = lotesOptionsForForm.find(
      (l) => l.loteId === loteIdSeleccionado
    );
    return lote ? lote.precio : 0;
  }, [loteIdSeleccionado, lotesOptionsForForm]);

  // 🟢 NUEVO: Determinar si la fecha de contrato puede ser editada
  const isContractDateEditable = useMemo(() => {
    if (!editingVenta) return false;
    // Solo es editable si NO tiene fecha de contrato Y el saldo pendiente es CERO
    return (
      !editingVenta.fechaContrato &&
      editingVenta.saldoPendiente <= 0.01 &&
      editingVenta.estadoVentaNombre !== "Cancelada"
    );
  }, [editingVenta]);
  // --- Fin de Lógica de IDs y Cálculos ---

  // Lógica de carga de datos iniciales
  const fetchSelectOptions = useCallback(async () => {
    try {
      const [clientes, estados, monedas, proyectos] = await Promise.all([
        getClientes(),
        getEstadosVenta(),
        getMonedas(),
        getProyectos(),
      ]);
      setClientesOptions(clientes);
      setEstadosVentaOptions(estados);
      setMonedasOptions(monedas);
      setProyectosOptions(proyectos);
    } catch (error) {
      console.error("Error al cargar las opciones de select:", error);
      message.warning(
        "No se pudieron cargar todas las opciones de select. (Clientes, Estados, Monedas, Proyectos)."
      );
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getVentas();
      setVentas(data);
    } catch (error) {
      message.error("Error al cargar las ventas. Por favor, intente de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem("user") || "{}");
    if (authData && authData.roles) {
      setAuthenticatedUserRoles(authData.roles);
    }
    fetchData();
    fetchSelectOptions();
  }, [fetchData, fetchSelectOptions]);
  // --- Fin de Estados y Hooks de Roles ---

  // useEffect para la carga de lotes (ignora modo edición)
  useEffect(() => {
    // 🛑 Si estamos editando, handleEdit maneja la carga. Salimos.
    if (editingVenta) return;

    // Lógica solo para CREACIÓN
    if (isModalVisible && proyectoIdSeleccionado) {
      setLoading(true);
      getLotesDisponibles(proyectoIdSeleccionado)
        .then((lotes) => {
          setLotesOptions(lotes);
          // Limpiar el lote si se cambia de proyecto
          if (!lotes.some((l) => l.loteId === loteIdSeleccionado)) {
            form.setFieldsValue({ loteId: undefined });
          }
        })
        .catch((error) => {
          console.error("Error al cargar lotes por proyecto:", error);
          message.warning(
            "No se pudieron cargar los lotes para el proyecto seleccionado."
          );
        })
        .finally(() => setLoading(false));
    } else if (isModalVisible && !proyectoIdSeleccionado) {
      setLotesOptions([]);
      form.setFieldsValue({ loteId: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proyectoIdSeleccionado, isModalVisible, editingVenta]);

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingVenta(null);
    form.resetFields();
    setLotesOptions([]); // Limpiar opciones de lote al cerrar el modal
  };

  // Función auxiliar para ejecutar el submit real
  const executeSubmission = async (
    values: VentaFormValues,
    fechaContratoString: string | null
  ) => {
    const estadoIdToSubmit = editingVenta
      ? editingVenta.estadoVentaId
      : estadoVentaPendienteId;

    const ventaDto: VentaDTO = {
      clienteId: values.clienteId,
      loteId: values.loteId,
      proyectoId: values.proyectoId,
      estadoVentaId: estadoIdToSubmit || values.estadoVentaId,
      fechaContrato: fechaContratoString,
      nroCuotas: values.nroCuotas,
      montoTotal: montoTotalCalculado,
      monedaId: solMonedaId!,
    };

    if (ventaDto.montoTotal === 0 && !editingVenta) {
      message.error(
        "No se puede registrar una venta con Monto Total 0. Verifique el lote seleccionado."
      );
      throw new Error("Monto total es cero.");
    }

    try {
      setLoading(true);
      if (editingVenta) {
        await updateVenta(editingVenta.ventaId, ventaDto);
        message.success("Venta actualizada exitosamente.");
      } else {
        await createVenta(ventaDto);
        message.success("Venta creada exitosamente.");
      }
      handleCloseModal();
      await fetchData();
    } catch (error: any) {
      const errorData = (error as AxiosError).response?.data as any;
      const errorMessage =
        typeof errorData === "string"
          ? errorData
          : errorData?.message ||
            "Error al guardar la venta. Por favor, verifique los datos.";
      message.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Función principal de submit
  const handleFormSubmit = async (values: VentaFormValues) => {
    if (!solMonedaId) {
      message.error("El ID de la moneda 'Sol' no pudo ser determinado.");
      return;
    }

    const fechaContratoString = values.fechaContrato
      ? values.fechaContrato.format("YYYY-MM-DD")
      : null;

    // Lógica de confirmación para la fecha de contrato (SOLO en EDICIÓN)
    if (editingVenta && fechaContratoString) {
      // Condición: Si está pagado (o saldo 0) Y la venta AÚN NO tiene fecha de contrato
      if (editingVenta.saldoPendiente <= 0.01 && !editingVenta.fechaContrato) {
        // Usamos una promesa para manejar la confirmación de Modal
        return new Promise<void>((resolve, reject) => {
          confirm({
            title: "¿Confirmar la Fecha de Contrato?",
            icon: <ExclamationCircleOutlined />,
            content:
              "El pago está completo. Una vez que se guarde esta fecha de contrato, no se podrá modificar. ¿Desea continuar?",
            okText: "Sí, guardar fecha",
            okType: "primary",
            cancelText: "No, revisar",
            onOk: async () => {
              try {
                await executeSubmission(values, fechaContratoString);
                resolve();
              } catch (e) {
                reject(e);
              }
            },
            onCancel: () =>
              reject(new Error("Cambio cancelado por el usuario")),
          });
        }).catch((e) => {
          if (e.message !== "Cambio cancelado por el usuario") {
            message.error("Error al guardar la venta: " + e.message);
          }
          // El finally de executeSubmission se encarga de setLoading(false)
          return; // Detener la ejecución de handleFormSubmit
        });
      }
    }

    // Ejecución normal si no es edición o si no se cumplen las condiciones de confirmación
    try {
      await executeSubmission(values, fechaContratoString);
    } catch (e) {
      // El error ya fue manejado dentro de executeSubmission.
    }
  };

  const handleCancelVenta = (venta: Venta) => {
    const estadoVentaCanceladaId = estadosVentaOptions.find(
      (e) => e.nombre.toLowerCase() === "cancelada"
    )?.estadoVentaId;

    if (!estadoVentaCanceladaId) {
      message.error("No se pudo encontrar el ID para el estado 'Cancelada'.");
      return;
    }

    confirm({
      title: `¿Está seguro de CANCELAR la venta del lote ${venta.loteNombre}?`,
      icon: <CloseCircleOutlined />,
      content:
        "Esto cambiará el estado de la venta a 'Cancelada' y liberará el lote.",
      okText: "Sí, Cancelar Venta",
      okType: "danger",
      cancelText: "No, mantener activa",
      onOk: async () => {
        try {
          setLoading(true);

          const ventaDto: VentaDTO = {
            clienteId: venta.clienteId,
            loteId: venta.loteId,
            proyectoId: venta.proyectoId,
            estadoVentaId: estadoVentaCanceladaId,
            fechaContrato: venta.fechaContrato,
            nroCuotas: venta.nroCuotas === null ? undefined : venta.nroCuotas,
            montoTotal: venta.montoTotal,
            monedaId: venta.monedaId,
          };

          await updateVenta(venta.ventaId, ventaDto);
          message.success(
            `Venta del lote ${venta.loteNombre} ha sido cancelada.`
          );
          await fetchData();
        } catch (error: any) {
          const errorMessage =
            (error as AxiosError).response?.data ||
            "Error al cancelar la venta. Intente de nuevo.";
          message.error(errorMessage as string);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleOpenAbonoModal = (venta: Venta, view: "history" | "form") => {
    setSelectedVentaForAbono(venta);
    setShowAbonoForm(view === "form");
    setIsAbonoModalVisible(true);
  };

  const handleCloseAbonoModal = () => {
    setIsAbonoModalVisible(false);
    setSelectedVentaForAbono(null);
    setShowAbonoForm(false);
    fetchData();
  };

  const handleDelete = (id: string) => {
    confirm({
      title: "¿Está seguro de que desea ELIMINAR LÓGICAMENTE esta venta?",
      icon: <ExclamationCircleOutlined />,
      content:
        "Solo usuarios autorizados (PROPIETARIO/ADMIN) deben usar esta función.",
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          setLoading(true);
          await deleteVenta(id);
          message.success("Venta eliminada exitosamente.");
          await fetchData();
        } catch (error: any) {
          const errorMessage =
            (error as AxiosError).response?.data ||
            "Error al eliminar la venta. Intente de nuevo.";
          message.error(errorMessage as string);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // handleEdit (Inicialización de Proyecto y Lote)
  const handleEdit = async (venta: Venta) => {
    setEditingVenta(venta);
    setIsModalVisible(true);
    setLoading(true);

    const fechaContratoDayjs = venta.fechaContrato
      ? dayjs(venta.fechaContrato)
      : undefined;

    const proyectoId = venta.proyectoId || "";
    let lotesActualizados: Lote[] = [];

    try {
      if (proyectoId) {
        // 1. Cargamos los lotes disponibles SÓLO si tenemos el proyectoId
        lotesActualizados = await getLotesDisponibles(proyectoId);
      } else {
        message.warning("El campo 'proyectoId' no fue encontrado en la venta.");
      }

      // 2. Agregar el lote de la venta a la lista (si no es un lote disponible)
      if (!lotesActualizados.some((l) => l.loteId === venta.loteId)) {
        const editedLote: Lote = {
          loteId: venta.loteId,
          nombre: venta.loteNombre,
          precio: venta.montoTotal,
          proyectoId: venta.proyectoId,
          descripcion: "",
          area: 0,
          estadoLoteNombre: "",
          distritoNombre: "",
          direccion: "",
          activo: true,
          proyectoNombre: (venta as any).proyectoNombre || "",
          distritoId: "",
          provinciaId: "",
          departamentoId: "",
        } as Lote;
        lotesActualizados = [editedLote, ...lotesActualizados];
      }

      // Establecer las opciones de lote
      setLotesOptions(lotesActualizados);

      // 3. Establecer todos los valores en el formulario de una sola vez
      form.setFieldsValue({
        clienteId: venta.clienteId,
        proyectoId: proyectoId || undefined,
        loteId: venta.loteId,
        estadoVentaId: venta.estadoVentaId,
        // Usar la fecha de contrato existente para precargar el campo.
        fechaContrato: fechaContratoDayjs,
        nroCuotas: venta.nroCuotas || undefined,
      });
    } catch (error) {
      console.error("Error al preparar la edición de la venta:", error);
      message.error("Error al cargar los datos del proyecto/lote para editar.");
      handleCloseModal();
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "N°",
      key: "index",
      render: (text: any, record: Venta, index: number) => index + 1,
    },
    {
      title: "Cliente",
      dataIndex: "clienteNombreCompleto",
      key: "clienteNombreCompleto",
      sorter: (a: Venta, b: Venta) =>
        a.clienteNombreCompleto.localeCompare(b.clienteNombreCompleto),
    },
    {
      title: "Lote",
      dataIndex: "loteNombre",
      key: "loteNombre",
      sorter: (a: Venta, b: Venta) => a.loteNombre.localeCompare(b.loteNombre),
    },
    {
      title: "Cuotas",
      dataIndex: "nroCuotas",
      key: "nroCuotas",
      align: "center" as const,
      render: (nro: number | null) => (nro == 1 ? "Contado" : nro),
    },
    {
      title: "Fecha Contrato",
      dataIndex: "fechaContrato",
      key: "fechaContrato",
      render: (date: string | null) =>
        date ? dayjs(date).format("DD/MM/YYYY") : "-",
    },
    {
      title: "Total",
      dataIndex: "montoTotal",
      key: "montoTotal",
      sorter: (a: Venta, b: Venta) => a.montoTotal - b.montoTotal,
      render: (monto: number, record: Venta) =>
        `${record.monedaNombre} ${monto.toLocaleString("es-PE", {
          minimumFractionDigits: 2,
        })}`,
    },
    {
      title: "Saldo Pendiente",
      dataIndex: "saldoPendiente",
      key: "saldoPendiente",
      sorter: (a: Venta, b: Venta) => a.saldoPendiente - b.saldoPendiente,
      render: (saldo: number, record: Venta) => {
        const isZero = saldo <= 0.01;
        return (
          <Tag color={isZero ? "green" : "red"}>
            {record.monedaNombre}{" "}
            {Math.max(0, saldo).toLocaleString("es-PE", {
              minimumFractionDigits: 2,
            })}
          </Tag>
        );
      },
    },
    {
      title: "Estado",
      dataIndex: "estadoVentaNombre",
      key: "estadoVentaNombre",
      sorter: (a: Venta, b: Venta) =>
        a.estadoVentaNombre.localeCompare(b.estadoVentaNombre),
      render: (estado: string) => (
        <span
          style={{
            color:
              estado === "Confirmada"
                ? "green"
                : estado === "Pendiente"
                ? "orange"
                : estado === "Cancelada"
                ? "gray"
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
      render: (text: any, record: Venta) => {
        const isConfirmed = record.estadoVentaNombre === "Confirmada";
        const isCanceled = record.estadoVentaNombre === "Cancelada";
        const canDelete = userRole === "PROPIETARIO" || userRole === "ADMIN";

        return (
          <Space size="small">
            <Button
              type="primary"
              icon={<WalletOutlined />}
              onClick={() => handleOpenAbonoModal(record, "form")}
              title="Registrar Abono"
              disabled={
                record.saldoPendiente <= 0.01 || isConfirmed || isCanceled
              }
            ></Button>
            <Button
              icon={<HistoryOutlined />}
              onClick={() => handleOpenAbonoModal(record, "history")}
              title="Ver Historial de Pagos"
            />

            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              // 🛑 CAMBIO: Deshabilitar si está Cancelada O Confirmada
              disabled={isCanceled || isConfirmed}
              title={
                isCanceled
                  ? "La venta no puede editarse una vez Cancelada."
                  : isConfirmed
                  ? "La venta no puede editarse una vez Confirmada."
                  : "Editar Venta"
              }
            >
              Editar
            </Button>

            <Button
              type="default"
              danger
              disabled={isConfirmed || isCanceled}
              icon={<CloseCircleOutlined />}
              onClick={() => handleCancelVenta(record)}
              title="Cancelar Venta"
            ></Button>

            {canDelete && (
              <Button
                type="default"
                danger
                disabled={isConfirmed || isCanceled}
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.ventaId)}
                title="Eliminar Venta"
              ></Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card className="shadow-md rounded-lg max-w-full lg:max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <Title level={2} className="text-xl sm:text-2xl mb-4 sm:mb-0">
            Venta de Lotes
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingVenta(null);
              form.resetFields();
              setLotesOptions([]);
              setIsModalVisible(true);
            }}
            className="bg-green-600 hover:bg-green-700 border-green-600"
          >
            Registrar Nueva Venta
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={ventas}
          loading={loading}
          rowKey="ventaId"
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
        />

        {/* Modal de Registro/Edición de Venta */}
        <Modal
          title={editingVenta ? "Editar Venta" : "Registrar Nueva Venta"}
          open={isModalVisible}
          onCancel={handleCloseModal}
          footer={null}
          width={700}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFormSubmit}
            initialValues={{
              estadoVentaId: estadoVentaPendienteId,
            }}
          >
            {/* 1RA FILA: Cliente y Proyecto */}
            <Row gutter={16}>
              {/* Cliente */}
              <Col span={12}>
                <Form.Item
                  name="clienteId"
                  label="Cliente"
                  rules={[{ required: true, message: "Seleccione un cliente" }]}
                >
                  <Select
                    placeholder="Seleccione un cliente"
                    showSearch
                    optionFilterProp="children"
                    disabled={!!editingVenta}
                  >
                    {clientesOptions.map((c) => (
                      <Option key={c.clienteId} value={c.clienteId}>
                        {`${(c as any).primerNombre || ""} ${
                          (c as any).segundoNombre || ""
                        } ${(c as any).apellidoPaterno || ""} ${
                          (c as any).apellidoMaterno || ""
                        }`.trim()}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* Campo Proyecto */}
              <Col span={12}>
                <Form.Item
                  name="proyectoId"
                  label="Proyecto"
                  rules={[
                    { required: true, message: "Seleccione un proyecto" },
                  ]}
                >
                  <Select
                    placeholder="Seleccione un proyecto"
                    showSearch
                    optionFilterProp="children"
                    disabled={!!editingVenta}
                  >
                    {proyectosOptionsForForm.map((p) => (
                      <Option key={p.proyectoId} value={p.proyectoId}>
                        {p.nombre}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* 2DA FILA: Lote y Fecha de Contrato */}
            <Row gutter={16}>
              {/* Lote */}
              <Col span={12}>
                <Form.Item
                  name="loteId"
                  label="Lote"
                  rules={[{ required: true, message: "Seleccione un lote" }]}
                >
                  <Select
                    placeholder={
                      proyectoIdSeleccionado
                        ? "Seleccione un lote"
                        : "Primero seleccione un proyecto"
                    }
                    showSearch
                    optionFilterProp="children"
                    disabled={!!editingVenta || !proyectoIdSeleccionado}
                    loading={loading}
                  >
                    {lotesOptionsForForm.map((l) => (
                      <Option key={l.loteId} value={l.loteId}>
                        {l.nombre}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* 🟢 Fecha de Contrato (Condicional) */}
              <Col span={12}>
                {editingVenta ? (
                  <Form.Item
                    name="fechaContrato"
                    label="Fecha de Contrato (Pagar todo primero)"
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      allowClear
                      disabledDate={(current) =>
                        current && current > dayjs().endOf("day")
                      }
                      // Desactivar si ya tiene fecha O si no está completamente pagado
                      disabled={
                        !!editingVenta.fechaContrato || !isContractDateEditable
                      }
                    />
                    {!isContractDateEditable &&
                      editingVenta.saldoPendiente > 0.01 && (
                        <Typography.Text type="warning">
                          Se habilitará cuando el Saldo Pendiente sea S/ 0.00.
                        </Typography.Text>
                      )}
                    {!!editingVenta.fechaContrato && (
                      <Typography.Text type="secondary">
                        La fecha de contrato ya fue establecida y no puede ser
                        modificada.
                      </Typography.Text>
                    )}
                  </Form.Item>
                ) : (
                  // OCULTAR EN CREACIÓN
                  <div style={{ minHeight: "68px" }}>
                    <Form.Item label="Fecha de Contrato">
                      <Typography.Text type="secondary">
                        La fecha de contrato se registrará una vez que el lote
                        esté completamente pagado.
                      </Typography.Text>
                    </Form.Item>
                  </div>
                )}
              </Col>
            </Row>

            {/* 3RA FILA: Nro Cuotas y Monto Total */}
            <Row gutter={16}>
              {/* Nro Cuotas */}
              <Col span={12}>
                <Form.Item
                  name="nroCuotas"
                  label="N° de Cuotas"
                  rules={[
                    {
                      required: true,
                      type: "number",
                      min: 1,
                      message: "Debe ser un número (1 para contado)",
                      transform: (value) => (value === null ? 1 : value),
                    },
                  ]}
                  initialValue={1}
                >
                  <InputNumber
                    min={1}
                    placeholder="N° de cuotas (1 para contado)"
                    style={{ width: "100%" }}
                    disabled={!!editingVenta}
                  />
                </Form.Item>
              </Col>

              {/* Monto Total (Solo visualización) */}
              <Col span={12}>
                <Form.Item label="Monto Total">
                  <Input
                    value={montoTotalCalculado.toLocaleString("es-PE", {
                      minimumFractionDigits: 2,
                    })}
                    addonBefore={
                      monedasOptions.find((m) => m.monedaId === solMonedaId)
                        ?.nombre || "Sol"
                    }
                    readOnly
                    style={{ fontWeight: "bold" }}
                    disabled={!!editingVenta}
                  />
                  {montoTotalCalculado === 0 && loteIdSeleccionado && (
                    <Typography.Text type="warning">
                      El lote seleccionado tiene un precio de S/ 0.00.
                    </Typography.Text>
                  )}
                </Form.Item>
              </Col>
            </Row>

            {/* Botones */}
            <Form.Item className="mt-6">
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="bg-green-600 hover:bg-green-700 border-green-600"
                  disabled={montoTotalCalculado === 0 && !!loteIdSeleccionado}
                >
                  {editingVenta ? "Actualizar Datos" : "Registrar Venta"}
                </Button>
                <Button onClick={handleCloseModal}>Cancelar</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal del Historial de Abonos */}
        {selectedVentaForAbono && (
          <AbonoHistoryModal
            venta={selectedVentaForAbono}
            isVisible={isAbonoModalVisible}
            onClose={handleCloseAbonoModal}
            showAbonoForm={showAbonoForm}
          />
        )}
      </Card>
    </div>
  );
};

export default VentaLotePage;
