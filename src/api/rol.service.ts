// src/api/rol.service.ts

import http from './http'; // Importa tu instancia de Axios personalizada

// Define la interfaz para el modelo de rol de usuario, incluyendo campos de auditoría
export interface UsuarioRol {
  usuarioRolId: string;
  nombre: string;
  activo: boolean;
  fechaCreacion?: string; // Campo opcional porque no siempre se usa en peticiones de entrada
  fechaModificacion?: string; // Campo opcional
  fechaEliminacion?: string; // Campo opcional para borrado lógico
}

// URL base de la API de roles, relativa a la URL base de `http.ts`
const ROLES_API_PATH = '/api/roles';

/**
 * Obtiene la lista de todos los roles activos, con búsqueda opcional.
 * @param search (opcional) texto de búsqueda
 * @returns Una promesa que resuelve con un array de UsuarioRol.
 */
export const getRoles = async (search?: string): Promise<UsuarioRol[]> => {
  try {
    let url = ROLES_API_PATH;
    if (search && search.trim() !== "") {
      url += `?search=${encodeURIComponent(search.trim())}`;
    }
    const response = await http.get<UsuarioRol[]>(url);
    return response.data;
  } catch (error) {
    console.error("Error al obtener roles:", error);
    throw error;
  }
};

/**
 * Obtiene un rol por su ID.
 * @param id El ID del rol a obtener.
 * @returns Una promesa que resuelve con el objeto UsuarioRol.
 */
export const getRolById = async (id: string): Promise<UsuarioRol> => {
  try {
    const response = await http.get<UsuarioRol>(`${ROLES_API_PATH}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener rol por ID:", error);
    throw error;
  }
};

/**
 * Crea un nuevo rol.
 * @param data Los datos del nuevo rol.
 * @returns Una promesa que resuelve con el objeto UsuarioRol creado.
 */
export const createRol = async (data: {nombre: string }): Promise<UsuarioRol> => {
  try {
    const response = await http.post<UsuarioRol>(ROLES_API_PATH, data);
    return response.data;
  } catch (error) {
    console.error("Error al crear rol:", error);
    throw error;
  }
};

/**
 * Actualiza un rol existente.
 * @param id El ID del rol a actualizar.
 * @param data Los datos actualizados.
 * @returns Una promesa que resuelve con el objeto UsuarioRol actualizado.
 */
export const updateRol = async (id: string, data: {nombre: string, activo: boolean }): Promise<UsuarioRol> => {
  try {
    const response = await http.put<UsuarioRol>(`${ROLES_API_PATH}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar rol:", error);
    throw error;
  }
};

/**
 * Elimina lógicamente un rol por su ID.
 * @param id El ID del rol a eliminar.
 * @returns Una promesa que se resuelve al completar la petición.
 */
export const eliminarRol = async (id: string): Promise<void> => {
  try {
    await http.delete<void>(`${ROLES_API_PATH}/${id}`);
  } catch (error) {
    console.error("Error al eliminar el rol:", error);
    throw error;
  }
};