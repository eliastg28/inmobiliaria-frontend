import http from './http'; // Asume una instancia de Axios personalizada ya configurada

// Define la interfaz para el modelo de TipoDocumento que viene del backend
export interface TipoDocumento {
  tipoDocumentoId: string;
  nombre: string;
  descripcion: string;
  fechaCreacion?: string;
  fechaModificacion?: string;
  fechaEliminacion?: string;
}

// Define el DTO (Objeto de Transferencia de Datos) para las peticiones de creación y actualización
export interface TipoDocumentoDTO {
  nombre: string;
  descripcion: string;
}

// URL base de la API para los tipos de documento
const TIPO_DOCUMENTO_API_PATH = '/api/tipos-documento';

/**
 * Obtiene la lista de todos los tipos de documento activos.
 * @returns Una promesa que resuelve con un array de objetos TipoDocumento.
 */
export const getTiposDocumento = async (): Promise<TipoDocumento[]> => {
  try {
    const response = await http.get<TipoDocumento[]>(TIPO_DOCUMENTO_API_PATH);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los tipos de documento:", error);
    throw error;
  }
};

/**
 * Obtiene un tipo de documento por su ID.
 * @param id El ID del tipo de documento a obtener.
 * @returns Una promesa que resuelve con el objeto TipoDocumento.
 */
export const getTipoDocumentoById = async (id: string): Promise<TipoDocumento> => {
  try {
    const response = await http.get<TipoDocumento>(`${TIPO_DOCUMENTO_API_PATH}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el tipo de documento con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo tipo de documento.
 * @param data Los datos para el nuevo tipo de documento.
 * @returns Una promesa que resuelve con el objeto TipoDocumento creado.
 */
export const createTipoDocumento = async (data: TipoDocumentoDTO): Promise<TipoDocumento> => {
  try {
    const response = await http.post<TipoDocumento>(TIPO_DOCUMENTO_API_PATH, data);
    return response.data;
  } catch (error) {
    console.error("Error al crear el tipo de documento:", error);
    throw error;
  }
};

/**
 * Actualiza un tipo de documento existente.
 * @param id El ID del tipo de documento a actualizar.
 * @param data Los datos actualizados.
 * @returns Una promesa que resuelve con el objeto TipoDocumento actualizado.
 */
export const updateTipoDocumento = async (id: string, data: TipoDocumentoDTO): Promise<TipoDocumento> => {
  try {
    const response = await http.put<TipoDocumento>(`${TIPO_DOCUMENTO_API_PATH}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el tipo de documento con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina lógicamente un tipo de documento por su ID.
 * @param id El ID del tipo de documento a eliminar.
 * @returns Una promesa que se resuelve al completar la petición.
 */
export const deleteTipoDocumento = async (id: string): Promise<void> => {
  try {
    await http.delete<void>(`${TIPO_DOCUMENTO_API_PATH}/${id}`);
  } catch (error) {
    console.error(`Error al eliminar el tipo de documento con ID ${id}:`, error);
    throw error;
  }
};
