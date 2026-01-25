// src/api/lote.service.ts

import http from './http';

// ----------------------------------------------------------------------
// 1. INTERFACES DE MODELO
// ----------------------------------------------------------------------

// Define la interfaz para el modelo de EstadoLote que viene del backend
export interface EstadoLote {
    estadoLoteId: string;
    nombre: string;
}

// Define la interfaz para el modelo de Proyecto (solo para referencia, puede venir de proyecto.service)
export interface Proyecto {
    proyectoId: string;
    nombre: string;
    descripcion: string;
    distritoId: string; // El proyecto incluye su distrito
}

// Define la interfaz para el modelo de Lote que viene del backend (LoteResponseDTO)
export interface Lote {
    loteId: string;
    nombre: string;
    descripcion: string;
    precio: number;
    area: number;
    estadoLoteNombre: string;

    // Información de ubicación (ahora a través del proyecto)
    distritoNombre: string;
    direccion: string;
    activo: boolean;

    // 🟢 NUEVOS CAMPOS: Información del Proyecto
    proyectoId: string;
    proyectoNombre: string;
    
    // Jerarquía geográfica completa para el frontend
    distritoId: string;
    provinciaId: string;
    departamentoId: string;
}

// ----------------------------------------------------------------------
// 2. DTO (Data Transfer Object)
// ----------------------------------------------------------------------

// Define el DTO (LoteRequestDTO)
export interface LoteDTO {
    nombre: string;
    descripcion: string;
    precio: number;
    area: number;
    estadoLoteId: string;
    
    // 🟢 Referenciamos el Proyecto
    proyectoId: string;
    
    direccion: string;
}

// URL base de la API para los lotes
const LOTES_API_PATH = '/api/lotes';

// ----------------------------------------------------------------------
// 3. SERVICIOS CRUD Y LISTADO
// ----------------------------------------------------------------------

/**
 * Crea un nuevo lote.
 */
export const createLote = async (data: LoteDTO): Promise<Lote> => {
    try {
        const response = await http.post<Lote>(LOTES_API_PATH, data);
        return response.data;
    } catch (error) {
        console.error("Error al crear el lote:", error);
        throw error;
    }
};

/**
 * Actualiza un lote existente.
 */
export const updateLote = async (id: string, data: LoteDTO): Promise<Lote> => {
    try {
        const response = await http.put<Lote>(`${LOTES_API_PATH}/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar el lote con ID ${id}:`, error);
        throw error;
    }
};

/**
 * Obtiene un lote por su ID.
 */
export const getLoteById = async (id: string): Promise<Lote> => {
    try {
        const response = await http.get<Lote>(`${LOTES_API_PATH}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener el lote con ID ${id}:`, error);
        throw error;
    }
};

/**
 * Obtiene la lista de todos los lotes disponibles.
 * 🟢 MODIFICADO: Ahora acepta un proyectoId opcional para filtrar.
 * @param proyectoId (Opcional) El ID del proyecto para filtrar los lotes.
 */
export const getLotesDisponibles = async (proyectoId?: string): Promise<Lote[]> => {
    try {
        // Lógica para construir la URL con el parámetro de consulta
        const url = proyectoId 
            ? `${LOTES_API_PATH}/disponibles?proyectoId=${proyectoId}`
            : `${LOTES_API_PATH}/disponibles`; // Si no hay ID, obtiene todos los disponibles
            
        const response = await http.get<Lote[]>(url);
        return response.data;
    } catch (error) {
        console.error("Error al obtener los lotes disponibles:", error);
        throw error;
    }
};

/**
 * Obtiene la lista de todos los lotes activos, con búsqueda opcional.
 * @param search (opcional) texto de búsqueda
 */
export const getLotesActivos = async (search?: string): Promise<Lote[]> => {
    try {
        let url = `${LOTES_API_PATH}/activos`;
        if (search && search.trim() !== "") {
            url += `?search=${encodeURIComponent(search.trim())}`;
        }
        const response = await http.get<Lote[]>(url);
        return response.data;
    } catch (error) {
        console.error("Error al obtener los lotes activos:", error);
        throw error;
    }
};


// ----------------------------------------------------------------------
// 4. SERVICIOS DE BÚSQUEDA ACTUALIZADOS
// ----------------------------------------------------------------------

/**
 * Busca lotes activos por el ID del proyecto.
 * NOTA: Esta función es similar a getLotesDisponibles si tu backend maneja 'activos' como 'disponibles'.
 */
export const searchLotesByProyectoId = async (proyectoId: string): Promise<Lote[]> => {
    try {
        // Usamos el endpoint: /api/lotes/buscar/proyecto/{proyectoId}
        const response = await http.get<Lote[]>(`${LOTES_API_PATH}/buscar/proyecto/${proyectoId}`);
        return response.data;
    } catch (error) {
        console.error(`Error al buscar lotes por ID de proyecto ${proyectoId}:`, error);
        throw error;
    }
};

/**
 * Busca lotes activos por el estado.
 */
export const searchLotesByEstado = async (estado: string): Promise<Lote[]> => {
    try {
        const response = await http.get<Lote[]>(`${LOTES_API_PATH}/buscar/estado?estado=${estado}`);
        return response.data;
    } catch (error) {
        console.error(`Error al buscar lotes por estado ${estado}:`, error);
        throw error;
    }
};

/**
 * Obtiene los lotes activos con paginación.
 */
export const getLotesPaginados = async (page: number, size: number): Promise<any> => {
    try {
        const response = await http.get<any>(`${LOTES_API_PATH}?page=${page}&size=${size}`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener los lotes paginados:", error);
        throw error;
    }
};

/**
 * Elimina lógicamente un lote por su ID. (Se mantiene)
 */
export const deleteLote = async (id: string): Promise<void> => {
    try {
        await http.delete<void>(`${LOTES_API_PATH}/${id}`);
    } catch (error) {
        console.error(`Error al eliminar el lote con ID ${id}:`, error);
        throw error;
    }
};