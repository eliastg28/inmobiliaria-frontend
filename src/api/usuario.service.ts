// src/api/usuario.service.ts

import http from './http'; // Importa tu instancia de Axios personalizada
import { UsuarioRol } from './rol.service'; // Importa la interfaz de roles

// Define la interfaz para el modelo de usuario, incluyendo campos de auditoría
export interface Usuario {
  usuarioId: string;
  username: string;
  activo: boolean;
  roles: UsuarioRol[];
  fechaCreacion?: string;
  fechaModificacion?: string;
  fechaEliminacion?: string;
}

// Define las interfaces DTO para la creación y actualización de usuarios
export interface UsuarioCreateDTO {
  username: string;
  password?: string; // La contraseña es opcional si el backend permite actualizar sin ella
  roles: string[]; // Se espera un array de nombres de roles
}

export interface UsuarioUpdateDTO {
  username?: string;
  password?: string;
  activo?: boolean;
  roles?: string[]; // Se espera un array de nombres de roles
}

// URL base de la API de usuarios
const USUARIOS_API_PATH = '/api/usuarios';

/**
 * Obtiene la lista de todos los usuarios activos.
 * @returns Una promesa que resuelve con un array de Usuario.
 */
export const getUsuarios = async (): Promise<Usuario[]> => {
  try {
    const response = await http.get<Usuario[]>(USUARIOS_API_PATH);
    return response.data;
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    throw error;
  }
};

/**
 * Obtiene un usuario por su ID.
 * @param id El ID del usuario a obtener.
 * @returns Una promesa que resuelve con el objeto Usuario.
 */
export const getUsuarioById = async (id: string): Promise<Usuario> => {
  try {
    const response = await http.get<Usuario>(`${USUARIOS_API_PATH}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener usuario por ID:", error);
    throw error;
  }
};

/**
 * Crea un nuevo usuario.
 * @param data Los datos del nuevo usuario.
 * @returns Una promesa que resuelve con el objeto Usuario creado.
 */
export const createUsuario = async (data: UsuarioCreateDTO): Promise<Usuario> => {
  try {
    const response = await http.post<Usuario>(USUARIOS_API_PATH, data);
    return response.data;
  } catch (error) {
    console.error("Error al crear usuario:", error);
    throw error;
  }
};

/**
 * Actualiza un usuario existente.
 * @param id El ID del usuario a actualizar.
 * @param data Los datos actualizados.
 * @returns Una promesa que resuelve con el objeto Usuario actualizado.
 */
export const updateUsuario = async (id: string, data: UsuarioUpdateDTO): Promise<Usuario> => {
  try {
    const response = await http.put<Usuario>(`${USUARIOS_API_PATH}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw error;
  }
};

/**
 * Elimina lógicamente un usuario por su ID.
 * @param id El ID del usuario a eliminar.
 * @returns Una promesa que se resuelve al completar la petición.
 */
export const eliminarUsuario = async (id: string): Promise<void> => {
  try {
    await http.delete<void>(`${USUARIOS_API_PATH}/${id}`);
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    throw error;
  }
};