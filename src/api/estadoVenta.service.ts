import http from './http'; // Asume una instancia de Axios personalizada ya configurada

// Define la interfaz para el modelo de EstadoVenta que viene del backend
export interface EstadoVenta {
  estadoVentaId: string;
  nombre: string;
  descripcion: string;
  fechaCreacion?: string;
  fechaModificacion?: string;
  fechaEliminacion?: string;
}

// Define el DTO (Objeto de Transferencia de Datos) para las peticiones de creación y actualización
export interface EstadoVentaDTO {
  nombre: string;
  descripcion: string;
}

// URL base de la API para los estados de venta
const ESTADO_VENTA_API_PATH = '/api/estados-venta';

/**
 * Obtiene la lista de todos los estados de venta activos.
 * @returns Una promesa que resuelve con un array de objetos EstadoVenta.
 */
export const getEstadosVenta = async (): Promise<EstadoVenta[]> => {
  try {
    const response = await http.get<EstadoVenta[]>(ESTADO_VENTA_API_PATH);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los estados de venta:", error);
    throw error;
  }
};

/**
 * Obtiene un estado de venta por su ID.
 * @param id El ID del estado de venta a obtener.
 * @returns Una promesa que resuelve con el objeto EstadoVenta.
 */
export const getEstadoVentaById = async (id: string): Promise<EstadoVenta> => {
  try {
    const response = await http.get<EstadoVenta>(`${ESTADO_VENTA_API_PATH}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el estado de venta con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo estado de venta.
 * @param data Los datos para el nuevo estado de venta.
 * @returns Una promesa que resuelve con el objeto EstadoVenta creado.
 */
export const createEstadoVenta = async (data: EstadoVentaDTO): Promise<EstadoVenta> => {
  try {
    const response = await http.post<EstadoVenta>(ESTADO_VENTA_API_PATH, data);
    return response.data;
  } catch (error) {
    console.error("Error al crear el estado de venta:", error);
    throw error;
  }
};

/**
 * Actualiza un estado de venta existente.
 * @param id El ID del estado de venta a actualizar.
 * @param data Los datos actualizados.
 * @returns Una promesa que resuelve con el objeto EstadoVenta actualizado.
 */
export const updateEstadoVenta = async (id: string, data: EstadoVentaDTO): Promise<EstadoVenta> => {
  try {
    const response = await http.put<EstadoVenta>(`${ESTADO_VENTA_API_PATH}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el estado de venta con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina lógicamente un estado de venta por su ID.
 * @param id El ID del estado de venta a eliminar.
 * @returns Una promesa que se resuelve al completar la petición.
 */
export const deleteEstadoVenta = async (id: string): Promise<void> => {
  try {
    await http.delete<void>(`${ESTADO_VENTA_API_PATH}/${id}`);
  } catch (error) {
    console.error(`Error al eliminar el estado de venta con ID ${id}:`, error);
    throw error;
  }
};
