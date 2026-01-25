// src/api/ventaLote.service.ts

import http from './http';

// =================================================================
// 💰 ABONO INTERFACES
// =================================================================

// Define la interfaz para el modelo de Abono que viene del backend (Abono Response)
export interface Abono {
    abonoId: string;
    montoAbonado: number;
    fechaAbono: string; 
}

// Define el DTO para registrar un nuevo abono (AbonoRequestDTO)
export interface AbonoDTO {
    ventaId: string;
    montoAbonado: number;
    fechaAbono: string;
}

// =================================================================
// 🏠 VENTA INTERFACES
// =================================================================

// Define la interfaz para el modelo de Venta que viene del backend (VentaResponseDTO)
export interface Venta {
    ventaId: string;
    clienteId: string;
    clienteNombreCompleto: string;
    loteId: string;
    loteNombre: string;
    estadoVentaId: string;
    estadoVentaNombre: string;
    monedaId: string;
    monedaNombre: string;
    
    // 🟢 REEMPLAZA 'fechaVenta'
    fechaContrato: string | null; // Se permite null o string
    
    // 🟢 NUEVO CAMPO
    nroCuotas: number | null; // Puede ser null si es venta al contado

    // 🟢 CORRECCIÓN TS2339: Añadimos propiedades de Proyecto
    proyectoId: string; 
    proyectoNombre: string;
    
    montoTotal: number;
    
    // 🟢 NUEVOS CAMPOS CALCULADOS
    montoAbonado: number;
    fechaAbono: string;
    saldoPendiente: number; 
    
    activo: boolean;
}

// Define el DTO (Objeto de Transferencia de Datos) para las peticiones de creación y actualización (VentaRequestDTO)
export interface VentaDTO {
    clienteId: string;
    loteId: string;
    proyectoId: string;
    estadoVentaId: string;
    monedaId: string;
    
    // 🟢 CORREGIDO: Usamos 'string' para garantizar el formato ISO al backend
    fechaContrato: string | null;
    
    // 🟢 NUEVO CAMPO
    nroCuotas?: number; // Opcional
    
    montoTotal: number;
}


// =================================================================
// 🔗 URL BASE
// =================================================================

const VENTAS_API_PATH = '/api/ventas';
const ABONOS_API_PATH = '/api/abonos';


// =================================================================
// 🏠 VENTA SERVICE FUNCTIONS
// =================================================================

/**
 * Obtiene la lista de todas las ventas activas, con búsqueda opcional.
 * @param search (opcional) texto de búsqueda
 * @returns Una promesa que resuelve con un array de objetos Venta.
 */
export const getVentas = async (search?: string): Promise<Venta[]> => {
    try {
        let url = VENTAS_API_PATH;
        if (search && search.trim() !== "") {
            url += `?search=${encodeURIComponent(search.trim())}`;
        }
        const response = await http.get<Venta[]>(url);
        return response.data;
    } catch (error) {
        console.error("Error al obtener las ventas:", error);
        throw error;
    }
};

/**
 * Obtiene una venta por su ID.
 * @param id El ID de la venta a obtener.
 * @returns Una promesa que resuelve con el objeto Venta.
 */
export const getVentaById = async (id: string): Promise<Venta> => {
    try {
        const response = await http.get<Venta>(`${VENTAS_API_PATH}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener la venta con ID ${id}:`, error);
        throw error;
    }
};

/**
 * Crea una nueva venta.
 * @param data Los datos para la nueva venta.
 * @returns Una promesa que resuelve con el objeto Venta creado.
 */
export const createVenta = async (data: VentaDTO): Promise<Venta> => {
    try {
        const response = await http.post<Venta>(VENTAS_API_PATH, data);
        return response.data;
    } catch (error) {
        console.error("Error al crear la venta:", error);
        throw error;
    }
};

/**
 * Actualiza una venta existente.
 * @param id El ID de la venta a actualizar.
 * @param data Los datos actualizados.
 * @returns Una promesa que resuelve con el objeto Venta actualizado.
 */
export const updateVenta = async (id: string, data: VentaDTO): Promise<Venta> => {
    try {
        const response = await http.put<Venta>(`${VENTAS_API_PATH}/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar la venta con ID ${id}:`, error);
        throw error;
    }
};

/**
 * Elimina lógicamente una venta por su ID.
 * @param id El ID de la venta a eliminar.
 * @returns Una promesa que se resuelve al completar la petición.
 */
export const deleteVenta = async (id: string): Promise<void> => {
    try {
        await http.delete<void>(`${VENTAS_API_PATH}/${id}`);
    } catch (error) {
        console.error(`Error al eliminar la venta con ID ${id}:`, error);
        throw error;
    }
};

// =================================================================
// 💰 ABONO SERVICE FUNCTIONS
// =================================================================

/**
 * Registra un nuevo abono para una venta específica.
 * @param data Los datos del abono (ventaId y montoAbonado).
 * @returns Una promesa que resuelve con el objeto Abono creado.
 */
export const createAbono = async (data: AbonoDTO): Promise<Abono> => {
    try {
        const response = await http.post<Abono>(ABONOS_API_PATH, data);
        return response.data;
    } catch (error) {
        console.error("Error al registrar el abono:", error);
        throw error;
    }
};

/**
 * Obtiene el historial de abonos para una venta específica.
 * @param ventaId El ID de la venta.
 * @returns Una promesa que resuelve con un array de objetos Abono.
 */
export const getAbonosByVentaId = async (ventaId: string): Promise<Abono[]> => {
    try {
        // Asumimos que el endpoint es /api/abonos/venta/{ventaId}
        const response = await http.get<Abono[]>(`${ABONOS_API_PATH}/venta/${ventaId}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener abonos para la venta ${ventaId}:`, error);
        throw error;
    }
};