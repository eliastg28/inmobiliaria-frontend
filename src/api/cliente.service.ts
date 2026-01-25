// src/api/cliente.service.ts

import http from './http';

// Define la interfaz para el modelo de TipoDocumento que viene del backend
export interface TipoDocumento {
  tipoDocumentoId: string;
  nombre: string;
  descripcion: string;
  fechaCreacion?: string;
  fechaModificacion?: string;
  fechaEliminacion?: string;
}

// Define la interfaz para el modelo de Cliente que viene del backend
export interface Cliente {
  clienteId: string;
  primerNombre: string;
  segundoNombre?: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  correo: string;
  telefono: string;
  ingresosMensuales: number;
  fechaCreacion: string;        // viene de Auditable
  fechaModificacion?: string;   // viene de Auditable
  fechaEliminacion?: string;    // viene de Auditable (null si está activo)
}

// Define el DTO (Objeto de Transferencia de Datos) para las peticiones de creación y actualización
export interface ClienteDTO {
  primerNombre: string;
  segundoNombre?: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  tipoDocumentoId: string;
  numeroDocumento: string;
  correo: string;
  telefono: string;
  ingresosMensuales: number;
}

// URL base de la API para los clientes y tipos de documento
const CLIENTES_API_PATH = '/api/clientes';
const TIPOS_DOCUMENTO_API_PATH = '/api/tipos-documento';

/**
 * Obtiene la lista de todos los tipos de documento activos.
 */
export const getTiposDocumento = async (): Promise<TipoDocumento[]> => {
  try {
    const response = await http.get<TipoDocumento[]>(TIPOS_DOCUMENTO_API_PATH);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los tipos de documento:", error);
    throw error;
  }
};

/**
 * Obtiene la lista de todos los clientes activos.
 */
export const getClientes = async (search?: string): Promise<Cliente[]> => {
  try {
    let url = CLIENTES_API_PATH;
    if (search && search.trim() !== "") {
      // Codifica el parámetro search para evitar problemas con caracteres especiales
      url += `?search=${encodeURIComponent(search.trim())}`;
    }
    const response = await http.get<Cliente[]>(url);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los clientes:", error);
    throw error;
  }
};

/**
 * Obtiene un cliente por su ID.
 */
export const getClienteById = async (id: string): Promise<Cliente> => {
  try {
    const response = await http.get<Cliente>(`${CLIENTES_API_PATH}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el cliente con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo cliente.
 */
export const createCliente = async (data: ClienteDTO): Promise<Cliente> => {
  try {
    const response = await http.post<Cliente>(CLIENTES_API_PATH, data);
    return response.data;
  } catch (error) {
    console.error("Error al crear el cliente:", error);
    throw error;
  }
};

/**
 * Actualiza un cliente existente.
 */
export const updateCliente = async (id: string, data: ClienteDTO): Promise<Cliente> => {
  try {
    const response = await http.put<Cliente>(`${CLIENTES_API_PATH}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el cliente con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina lógicamente un cliente por su ID.
 */
export const deleteCliente = async (id: string): Promise<void> => {
  try {
    await http.delete<void>(`${CLIENTES_API_PATH}/${id}`);
  } catch (error) {
    console.error(`Error al eliminar el cliente con ID ${id}:`, error);
    throw error;
  }
};
