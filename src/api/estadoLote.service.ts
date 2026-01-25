// src/api/estadoLote.service.ts

import http from './http'; // Asume una instancia de Axios personalizada ya configurada

// Define la interfaz para el modelo de EstadoLote que viene del backend
export interface EstadoLote {
  estadoLoteId: string;
  nombre: string;
  descripcion: string;
  fechaCreacion?: string;
  fechaModificacion?: string;
  fechaEliminacion?: string;
}

// Define el DTO (Objeto de Transferencia de Datos) para las peticiones de creación y actualización
export interface EstadoLoteDTO {
  nombre: string;
  descripcion: string;
}

// URL base de la API para los estados de lote
const ESTADO_LOTE_API_PATH = '/api/estados-lote';

/**
 * Obtiene la lista de todos los estados de lote activos, con búsqueda opcional.
 * @param search (opcional) texto de búsqueda
 * @returns Una promesa que resuelve con un array de objetos EstadoLote.
 */
export const getEstadosLote = async (search?: string): Promise<EstadoLote[]> => {
  try {
    let url = ESTADO_LOTE_API_PATH;
    if (search && search.trim() !== "") {
      url += `?search=${encodeURIComponent(search.trim())}`;
    }
    const response = await http.get<EstadoLote[]>(url);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los estados de lote:", error);
    throw error;
  }
};

/**
 * Obtiene un estado de lote por su ID.
 * @param id El ID del estado de lote a obtener.
 * @returns Una promesa que resuelve con el objeto EstadoLote.
 */
export const getEstadoLoteById = async (id: string): Promise<EstadoLote> => {
  try {
    const response = await http.get<EstadoLote>(`${ESTADO_LOTE_API_PATH}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el estado de lote con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo estado de lote.
 * @param data Los datos para el nuevo estado de lote.
 * @returns Una promesa que resuelve con el objeto EstadoLote creado.
 */
export const createEstadoLote = async (data: EstadoLoteDTO): Promise<EstadoLote> => {
  try {
    const response = await http.post<EstadoLote>(ESTADO_LOTE_API_PATH, data);
    return response.data;
  } catch (error) {
    console.error("Error al crear el estado de lote:", error);
    throw error;
  }
};

/**
 * Actualiza un estado de lote existente.
 * @param id El ID del estado de lote a actualizar.
 * @param data Los datos actualizados.
 * @returns Una promesa que resuelve con el objeto EstadoLote actualizado.
 */
export const updateEstadoLote = async (id: string, data: EstadoLoteDTO): Promise<EstadoLote> => {
  try {
    const response = await http.put<EstadoLote>(`${ESTADO_LOTE_API_PATH}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el estado de lote con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina lógicamente un estado de lote por su ID.
 * @param id El ID del estado de lote a eliminar.
 * @returns Una promesa que se resuelve al completar la petición.
 */
export const deleteEstadoLote = async (id: string): Promise<void> => {
  try {
    await http.delete<void>(`${ESTADO_LOTE_API_PATH}/${id}`);
  } catch (error) {
    console.error(`Error al eliminar el estado de lote con ID ${id}:`, error);
    throw error;
  }
};