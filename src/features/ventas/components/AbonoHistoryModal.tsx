import React, { useState, useEffect } from "react";
import {
    Modal,
    Table,
    Button,
    message,
    Card,
    Typography,
    Form,
    InputNumber,
    DatePicker,
    Space,
    Alert,
    Descriptions,
    Tag
} from "antd";
import { AxiosError } from "axios";
import dayjs from "dayjs";
import { HistoryOutlined, PlusOutlined, RollbackOutlined } from "@ant-design/icons";

// Importamos todas las dependencias desde tu servicio único
import { 
    Venta,
    Abono, 
    AbonoDTO,
    getAbonosByVentaId, 
    createAbono,
    getVentaById, // 👈 NECESARIO: Función para obtener la venta por su ID
} from "../../../api/ventaLote.service"; 

const { Title, Text } = Typography;

interface AbonoHistoryModalProps {
    venta: Venta;
    isVisible: boolean;
    onClose: () => void;
    showAbonoForm: boolean; 
}

interface AbonoFormValues {
    monto: number;
    fechaPago: any; // Puede ser dayjs.Dayjs o string, depende de cómo lo maneje el DatePicker
}

const AbonoHistoryModal: React.FC<AbonoHistoryModalProps> = ({ venta, isVisible, onClose, showAbonoForm }) => {
    const [abonos, setAbonos] = useState<Abono[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<'history' | 'form'>(showAbonoForm ? 'form' : 'history'); 
    const [form] = Form.useForm<AbonoFormValues>();
    
    // 🟢 ESTADO LOCAL para la venta. Inicializado con la prop, pero se actualizará internamente.
    const [currentVenta, setCurrentVenta] = useState<Venta>(venta);

    // Actualiza el estado local de la venta cuando la prop externa cambie (al abrirse)
    useEffect(() => {
        if (isVisible) {
             setCurrentVenta(venta);
        }
    }, [venta, isVisible]);
    
    // Recalcula saldos usando el ESTADO LOCAL
    const totalAbonado = currentVenta.montoAbonado;
    const saldoRestante = currentVenta.saldoPendiente;

    // 🟢 FUNCIÓN PARA RECARGAR LA VENTA COMPLETA
    const fetchCurrentVenta = async () => {
         try {
            // Asegúrate de que tu servicio exporte 'getVentaById'
            const updatedVenta = await getVentaById(venta.ventaId); 
            setCurrentVenta(updatedVenta);
            return updatedVenta;
        } catch (error) {
            console.error("Error al cargar la venta actualizada:", error);
            message.error("Error al actualizar la información de la venta.");
            return currentVenta; // Devuelve la versión anterior en caso de fallo
        }
    }
    
    // Efecto para cargar abonos y preparar la vista
    useEffect(() => {
        if (isVisible) {
            const newViewMode = showAbonoForm ? 'form' : 'history';
            setViewMode(newViewMode);
            if (newViewMode === 'history') {
                fetchAbonos();
            } else {
                // Si el saldo es cero, no permitimos el formulario, volvemos a historia
                if (saldoRestante <= 0.01) {
                    setViewMode('history');
                    fetchAbonos();
                } else {
                    // Pre-rellenar el formulario
                    form.setFieldsValue({
                        fechaPago: undefined,
                        monto: Math.max(0, saldoRestante)
                    });
                }
            }
        }
    }, [isVisible, showAbonoForm, currentVenta.ventaId]); // Usamos currentVenta para el ID en caso de necesidad


    const fetchAbonos = async () => {
        setLoading(true);
        try {
            const data = await getAbonosByVentaId(currentVenta.ventaId);
            setAbonos(data.sort((a, b) => dayjs(b.fechaAbono).valueOf() - dayjs(a.fechaAbono).valueOf())); 
        } catch (error) {
            console.error("Error al cargar el historial de abonos:", error);
            message.error("Error al cargar el historial de abonos.");
            setAbonos([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (values: AbonoFormValues) => {
        if (values.monto <= 0) {
            message.error("El monto del abono debe ser mayor a cero.");
            return;
        }

        // Advertencia si excede el saldo pendiente (mantenemos la lógica comentada si no es un requisito estricto)
        /* if (values.monto > saldoRestante + 0.01) {
             message.warning(`El monto de ${currentVenta.monedaNombre} ${values.monto.toLocaleString("es-PE", { minimumFractionDigits: 2 })} excede el saldo pendiente...`);
        } */

        // Tomar la fecha desde values.fechaPago y formatear a string LocalDateTime (YYYY-MM-DDTHH:mm:ss)
        const abonoDto: AbonoDTO = {
            ventaId: currentVenta.ventaId,
            montoAbonado: values.monto,
            fechaAbono: dayjs(values.fechaPago).format('YYYY-MM-DDTHH:mm:ss')
        };

        try {
            setLoading(true);
            await createAbono(abonoDto); 
            message.success("Abono registrado exitosamente.");
            
            // 🟢 CRÍTICO: Recargar la Venta antes de recargar Abonos
            const updatedVenta = await fetchCurrentVenta(); 

            // Recargar el historial y volver a la vista de historial
            await fetchAbonos(); 
            setViewMode('history');
            form.resetFields();
            
            // 🟢 Opcional: Si el saldo es 0, puedes cerrar automáticamente el modal.
            if (updatedVenta.saldoPendiente <= 0.01) {
                setTimeout(() => {
                    message.info("La venta ha sido saldada completamente.");
                    onClose(); // Cierra el modal para forzar el fetchData en el padre
                }, 1000);
            }

        } catch (error: any) {
            const errorData = (error as AxiosError).response?.data as any;
            const errorMessage =
                (typeof errorData === 'string' ? errorData : errorData?.message || "Error al registrar el abono. Verifique los datos.");
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Columnas de la tabla (usa currentVenta.monedaNombre)
    const abonoColumns = [
        {
            title: "Fecha de Pago",
            dataIndex: "fechaAbono",
            key: "fechaAbono",
            render: (fechaAbono: string) =>
                fechaAbono
                    ? dayjs(fechaAbono).format("DD/MM/YYYY")
                    : "-"
        },
        {
            title: "Monto Abonado",
            dataIndex: "montoAbonado",
            key: "montoAbonado",
            render: (monto: number) => `${currentVenta.monedaNombre} ${monto.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`,
        },
    ];
    
    // ... (El resto del código se mantiene)
    
    const historyView = (
        <>
            <div className="flex justify-between items-center mb-4">
                <Title level={4}>Historial de Abonos</Title>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => setViewMode('form')}
                    disabled={saldoRestante <= 0.01 || currentVenta.estadoVentaNombre == 'Cancelada'}
                >
                    Registrar Nuevo Abono
                </Button>
            </div>
            <br />
            
            {/* Mensaje de Saldo Pagado */}
            {saldoRestante <= 0.01 && (
                <Alert 
                    message="Venta Pagada Completamente" 
                    description={`El monto total ha sido cubierto. Saldo pendiente: ${currentVenta.monedaNombre} ${Math.max(0, saldoRestante).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`}
                    type="success"
                    showIcon
                    className="mb-4"
                />
            )}
            
            <Table
                columns={abonoColumns}
                dataSource={abonos}
                loading={loading}
                rowKey="abonoId"
                pagination={{ pageSize: 5 }}
                scroll={{ y: 240 }}
                locale={{ emptyText: "Aún no se han registrado abonos para esta venta." }}
            />
        </>
    );

    const formView = (
        <>
            <br />
            <div className="flex justify-start items-center mb-4">
                <Button 
                    icon={<RollbackOutlined />} 
                    onClick={() => {
                        setViewMode('history');
                        fetchAbonos(); 
                    }}
                    className="mr-3"
                >
                    Volver al Historial
                </Button>
                <Title level={4} className="m-0">Registrar Abono</Title>
            </div>
            
            {/* Resumen del Saldo */}
            <Card className="mb-4 bg-yellow-50 border-yellow-200">
                <Descriptions column={2} size="small">
                    <Descriptions.Item label="Monto Total">
                        <Text strong>{currentVenta.monedaNombre} {currentVenta.montoTotal.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Abonado">
                        <Text type="success" strong>{currentVenta.monedaNombre} {totalAbonado.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Saldo Pendiente">
                        <Tag color={saldoRestante > 0.01 ? "red" : "green"} style={{ fontSize: '14px' }}>
                            {currentVenta.monedaNombre} {Math.max(0, saldoRestante).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="N° Cuotas Planif.">
                        <Text>{currentVenta.nroCuotas || 'Contado'}</Text>
                    </Descriptions.Item>
                </Descriptions>
            </Card>


            <Form
                form={form}
                layout="vertical"
                onFinish={handleFormSubmit}
                // Los initialValues se configuran en el useEffect para asegurar la última actualización
            >
                <Form.Item
                    name="monto"
                    label="Monto del Abono"
                    rules={[{ required: true, message: "Ingrese el monto del abono" }]}
                >
                    <InputNumber
                        min={0.01}
                        max={currentVenta.montoTotal + 1}
                        step={100}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => parseFloat(value?.replace(/[^0-9.]/g, '') || '0')}
                        placeholder="Monto a abonar"
                        style={{ width: '100%' }}
                    />
                </Form.Item>

                <Form.Item
                    name="fechaPago"
                    label="Fecha de Pago (Registro de Pago)"
                    rules={[{ required: true, message: "Seleccione la fecha de pago" }]}
                >
                    <DatePicker 
                        style={{ width: '100%' }} 
                        format="DD/MM/YYYY"
                        disabledDate={(current) => current && current > dayjs().endOf('day')}
                    />
                </Form.Item>

                <Form.Item className="mt-6">
                    <Space>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            loading={loading}
                            className="bg-green-600 hover:bg-green-700 border-green-600"
                            disabled={saldoRestante <= 0.01}
                        >
                            Confirmar Abono
                        </Button>
                        <Button onClick={() => setViewMode('history')}>
                            Cancelar
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </>
    );
    
    return (
        <Modal
            title={
                <Space>
                    <HistoryOutlined />
                    {viewMode === 'history' ? `Historial de Pagos - Venta ${currentVenta.loteNombre}` : `Registrar Abono - Venta ${currentVenta.loteNombre}`}
                </Space>
            }
            open={isVisible}
            onCancel={onClose}
            footer={null}
            width={750}
            style={{marginTop:-50}}
        >
            <Card style={{ marginTop: 16 }}>
                {/* Información de la Venta (Encabezado) */}
                <Descriptions bordered size="small" column={2} className="mb-4">
                    <Descriptions.Item label="Cliente">{currentVenta.clienteNombreCompleto}</Descriptions.Item>
                    <Descriptions.Item label="Lote">{currentVenta.loteNombre}</Descriptions.Item>
                    <Descriptions.Item label="Total Venta">
                        <Text strong>{currentVenta.monedaNombre} {currentVenta.montoTotal.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Saldo Pendiente">
                         <Tag color={saldoRestante > 0.01 ? "red" : "green"} style={{ fontSize: '14px' }}>
                            {currentVenta.monedaNombre} {Math.max(0, saldoRestante).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                        </Tag>
                    </Descriptions.Item>
                </Descriptions>
                
                {/* Contenido Dinámico: Historial o Formulario */}
                {viewMode === 'history' ? historyView : formView}
            </Card>
        </Modal>
    );
};

export default AbonoHistoryModal;