import http from './http'; // Asume una instancia de Axios personalizada ya configurada

// Define la interfaz para el modelo de Moneda que viene del backend
export interface Moneda {
  monedaId: string;
  nombre: string;
  simbolo: string;
  descripcion: string;
  fechaCreacion?: string;
  fechaModificacion?: string;
  fechaEliminacion?: string;
}

// Define el DTO (Objeto de Transferencia de Datos) para las peticiones de creación y actualización
export interface MonedaDTO {
  nombre: string;
  simbolo: string;
  descripcion: string;
}

// URL base de la API para las monedas
const MONEDA_API_PATH = '/api/monedas';

/**
 * Obtiene la lista de todas las monedas activas.
 * @returns Una promesa que resuelve con un array de objetos Moneda.
 */
export const getMonedas = async (): Promise<Moneda[]> => {
  try {
    const response = await http.get<Moneda[]>(MONEDA_API_PATH);
    return response.data;
  } catch (error) {
    console.error("Error al obtener las monedas:", error);
    throw error;
  }
};

/**
 * Obtiene una moneda por su ID.
 * @param id El ID de la moneda a obtener.
 * @returns Una promesa que resuelve con el objeto Moneda.
 */
export const getMonedaById = async (id: string): Promise<Moneda> => {
  try {
    const response = await http.get<Moneda>(`${MONEDA_API_PATH}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener la moneda con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea una nueva moneda.
 * @param data Los datos para la nueva moneda.
 * @returns Una promesa que resuelve con el objeto Moneda creado.
 */
export const createMoneda = async (data: MonedaDTO): Promise<Moneda> => {
  try {
    const response = await http.post<Moneda>(MONEDA_API_PATH, data);
    return response.data;
  } catch (error) {
    console.error("Error al crear la moneda:", error);
    throw error;
  }
};

/**
 * Actualiza una moneda existente.
 * @param id El ID de la moneda a actualizar.
 * @param data Los datos actualizados.
 * @returns Una promesa que resuelve con el objeto Moneda actualizado.
 */
export const updateMoneda = async (id: string, data: MonedaDTO): Promise<Moneda> => {
  try {
    const response = await http.put<Moneda>(`${MONEDA_API_PATH}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar la moneda con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina lógicamente una moneda por su ID.
 * @param id El ID de la moneda a eliminar.
 * @returns Una promesa que se resuelve al completar la petición.
 */
export const deleteMoneda = async (id: string): Promise<void> => {
  try {
    await http.delete<void>(`${MONEDA_API_PATH}/${id}`);
  } catch (error) {
    console.error(`Error al eliminar la moneda con ID ${id}:`, error);
    throw error;
  }
};
