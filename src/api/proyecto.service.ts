// src/api/proyecto.service.ts

import http from './http';

// ----------------------------------------------------------------------
// 1. INTERFACES
// ----------------------------------------------------------------------

// Interfaz para la respuesta de Proyecto (ProyectoResponseDTO)
export interface ProyectoResponse {
    proyectoId: string;
    nombre: string;
    descripcion: string;
    
    // Jerarquía geográfica COMPLETA (necesaria para la tabla)
    distritoId: string;
    distritoNombre: string;
    provinciaId: string;
    provinciaNombre: string;
    departamentoId: string;
    departamentoNombre: string;
    totalLotes: number;
    activo: boolean;
}
// Interfaz para la solicitud de Proyecto (ProyectoRequestDTO)
export interface ProyectoDTO {
    nombre: string;
    descripcion: string;
    distritoId: string; // Se requiere el ID del distrito para crear/actualizar el proyecto
}

// ----------------------------------------------------------------------
// 2. SERVICIOS API
// ----------------------------------------------------------------------

const PROYECTOS_API_PATH = '/api/proyectos';

/**
 * Obtiene la lista de todos los proyectos activos.
 * @returns Una promesa que resuelve con un array de objetos ProyectoResponse.
 */
export const getProyectosActivos = async (): Promise<ProyectoResponse[]> => {
    try {
        const response = await http.get<ProyectoResponse[]>(PROYECTOS_API_PATH);
        return response.data;
    } catch (error) {
        console.error("Error al obtener la lista de proyectos:", error);
        throw error;
    }
};

/**
 * Obtiene un proyecto por su ID.
 * @param id El ID del proyecto a obtener.
 * @returns Una promesa que resuelve con el objeto ProyectoResponse.
 */
export const getProyectoById = async (id: string): Promise<ProyectoResponse> => {
    try {
        const response = await http.get<ProyectoResponse>(`${PROYECTOS_API_PATH}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener el proyecto con ID ${id}:`, error);
        throw error;
    }
};

/**
 * Crea un nuevo proyecto.
 * @param data Los datos para el nuevo proyecto (nombre, descripcion, distritoId).
 * @returns Una promesa que resuelve con el objeto ProyectoResponse creado.
 */
export const createProyecto = async (data: ProyectoDTO): Promise<ProyectoResponse> => {
    try {
        const response = await http.post<ProyectoResponse>(PROYECTOS_API_PATH, data);
        return response.data;
    } catch (error) {
        console.error("Error al crear el proyecto:", error);
        throw error;
    }
};

/**
 * Actualiza un proyecto existente.
 * @param id El ID del proyecto a actualizar.
 * @param data Los datos actualizados.
 * @returns Una promesa que resuelve con el objeto ProyectoResponse actualizado.
 */
export const updateProyecto = async (id: string, data: ProyectoDTO): Promise<ProyectoResponse> => {
    try {
        const response = await http.put<ProyectoResponse>(`${PROYECTOS_API_PATH}/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar el proyecto con ID ${id}:`, error);
        throw error;
    }
};

/**
 * Elimina lógicamente un proyecto por su ID.
 * @param id El ID del proyecto a eliminar.
 * @returns Una promesa que se resuelve al completar la petición.
 */
export const deleteProyecto = async (id: string): Promise<void> => {
    try {
        await http.delete<void>(`${PROYECTOS_API_PATH}/${id}`);
    } catch (error) {
        console.error(`Error al eliminar el proyecto con ID ${id}:`, error);
        throw error;
    }
};

// ----------------------------------------------------------------------
// 3. EXPORTACIONES SIMPLIFICADAS (RESOLUCIÓN DE ERRORES TS2305)
// ----------------------------------------------------------------------

// 🟢 RENOMBRA/REEXPORTA la interfaz ProyectoResponse como Proyecto
export type Proyecto = ProyectoResponse;

// 🟢 RENOMBRA/REEXPORTA la función getProyectosActivos como getProyectos
export const getProyectos = getProyectosActivos;