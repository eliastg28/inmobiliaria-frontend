import http from './http'; // Asume una instancia de Axios personalizada ya configurada

// Define la interfaz para el modelo de TipoLote que viene del backend
export interface TipoLote {
  tipoLoteId: string;
  nombre: string;
  descripcion: string;
  fechaCreacion?: string;
  fechaModificacion?: string;
  fechaEliminacion?: string;
}

// Define el DTO (Objeto de Transferencia de Datos) para las peticiones de creación y actualización
export interface TipoLoteDTO {
  nombre: string;
  descripcion: string;
}

// URL base de la API para los tipos de lote
const TIPO_LOTE_API_PATH = '/api/tipos-lote';

/**
 * Obtiene la lista de todos los tipos de lote activos.
 * @returns Una promesa que resuelve con un array de objetos TipoLote.
 */
export const getTiposLote = async (): Promise<TipoLote[]> => {
  try {
    const response = await http.get<TipoLote[]>(TIPO_LOTE_API_PATH);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los tipos de lote:", error);
    throw error;
  }
};

/**
 * Obtiene un tipo de lote por su ID.
 * @param id El ID del tipo de lote a obtener.
 * @returns Una promesa que resuelve con el objeto TipoLote.
 */
export const getTipoLoteById = async (id: string): Promise<TipoLote> => {
  try {
    const response = await http.get<TipoLote>(`${TIPO_LOTE_API_PATH}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el tipo de lote con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo tipo de lote.
 * @param data Los datos para el nuevo tipo de lote.
 * @returns Una promesa que resuelve con el objeto TipoLote creado.
 */
export const createTipoLote = async (data: TipoLoteDTO): Promise<TipoLote> => {
  try {
    const response = await http.post<TipoLote>(TIPO_LOTE_API_PATH, data);
    return response.data;
  } catch (error) {
    console.error("Error al crear el tipo de lote:", error);
    throw error;
  }
};

/**
 * Actualiza un tipo de lote existente.
 * @param id El ID del tipo de lote a actualizar.
 * @param data Los datos actualizados.
 * @returns Una promesa que resuelve con el objeto TipoLote actualizado.
 */
export const updateTipoLote = async (id: string, data: TipoLoteDTO): Promise<TipoLote> => {
  try {
    const response = await http.put<TipoLote>(`${TIPO_LOTE_API_PATH}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el tipo de lote con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina lógicamente un tipo de lote por su ID.
 * @param id El ID del tipo de lote a eliminar.
 * @returns Una promesa que se resuelve al completar la petición.
 */
export const deleteTipoLote = async (id: string): Promise<void> => {
  try {
    await http.delete<void>(`${TIPO_LOTE_API_PATH}/${id}`);
  } catch (error) {
    console.error(`Error al lógicamente el tipo de lote con ID ${id}:`, error);
    throw error;
  }
};
