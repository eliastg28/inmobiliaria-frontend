// src/api/geografia.service.ts

import http from './http';

// Interfaces de los modelos de backend
export interface Departamento {
  departamentoId: string;
  nombre: string;
  activo: boolean;
}

export interface Provincia {
  provinciaId: string;
  nombre: string;
  departamentoId: string;
  activo: boolean;
}

export interface Distrito {
  distritoId: string;
  nombre: string;
  provinciaId: string;
  activo: boolean;
}

// Rutas base de la API
const DEPARTAMENTOS_API_PATH = '/api/departamentos';
const PROVINCIAS_API_PATH = '/api/provincias';
const DISTRITOS_API_PATH = '/api/distritos';

/**
 * Obtiene la lista de todos los departamentos activos.
 * También puede filtrar por nombre.
 * @param nombre (Opcional) El texto a buscar en el nombre del departamento.
 * @returns Una promesa que resuelve con un array de objetos Departamento.
 */
export const getDepartamentos = async (nombre?: string): Promise<Departamento[]> => {
  try {
    const url = nombre ? `${DEPARTAMENTOS_API_PATH}?nombre=${encodeURIComponent(nombre)}` : DEPARTAMENTOS_API_PATH;
    const response = await http.get<Departamento[]>(url);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los departamentos:", error);
    throw error;
  }
};

/**
 * Obtiene un departamento activo por su ID.
 * @param id El ID del departamento a obtener.
 * @returns Una promesa que resuelve con el objeto Departamento.
 */
export const getDepartamentoById = async (id: string): Promise<Departamento> => {
  try {
    const response = await http.get<Departamento>(`${DEPARTAMENTOS_API_PATH}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el departamento con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene la lista de provincias activas.
 * También puede filtrar por nombre.
 * @param nombre (Opcional) El texto a buscar en el nombre de la provincia.
 * @returns Una promesa que resuelve con un array de objetos Provincia.
 */
export const getProvincias = async (nombre?: string): Promise<Provincia[]> => {
  try {
    const url = nombre ? `${PROVINCIAS_API_PATH}?nombre=${encodeURIComponent(nombre)}` : PROVINCIAS_API_PATH;
    const response = await http.get<Provincia[]>(url);
    return response.data;
  } catch (error) {
    console.error("Error al obtener las provincias:", error);
    throw error;
  }
};

/**
 * Obtiene la lista de provincias activas de un departamento por su ID.
 * @param departamentoId El ID del departamento.
 * @returns Una promesa que resuelve con un array de objetos Provincia.
 */
export const getProvinciasByDepartamentoId = async (departamentoId: string): Promise<Provincia[]> => {
  try {
    const response = await http.get<Provincia[]>(`${PROVINCIAS_API_PATH}/departamento/${departamentoId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener las provincias para el departamento con ID ${departamentoId}:`, error);
    throw error;
  }
};

/**
 * Obtiene una provincia activa por su ID.
 * @param id El ID de la provincia a obtener.
 * @returns Una promesa que resuelve con el objeto Provincia.
 */
export const getProvinciaById = async (id: string): Promise<Provincia> => {
  try {
    const response = await http.get<Provincia>(`${PROVINCIAS_API_PATH}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener la provincia con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene la lista de distritos activos.
 * También puede filtrar por nombre.
 * @param nombre (Opcional) El texto a buscar en el nombre del distrito.
 * @returns Una promesa que resuelve con un array de objetos Distrito.
 */
export const getDistritos = async (nombre?: string): Promise<Distrito[]> => {
  try {
    const url = nombre ? `${DISTRITOS_API_PATH}?nombre=${encodeURIComponent(nombre)}` : DISTRITOS_API_PATH;
    const response = await http.get<Distrito[]>(url);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los distritos:", error);
    throw error;
  }
};

/**
 * Obtiene la lista de distritos activos de una provincia por su ID.
 * @param provinciaId El ID de la provincia.
 * @returns Una promesa que resuelve con un array de objetos Distrito.
 */
export const getDistritosByProvinciaId = async (provinciaId: string): Promise<Distrito[]> => {
  try {
    const response = await http.get<Distrito[]>(`${DISTRITOS_API_PATH}/provincia/${provinciaId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener los distritos para la provincia con ID ${provinciaId}:`, error);
    throw error;
  }
};

/**
 * Obtiene un distrito activo por su ID.
 * @param id El ID del distrito a obtener.
 * @returns Una promesa que resuelve con el objeto Distrito.
 */
export const getDistritoById = async (id: string): Promise<Distrito> => {
  try {
    const response = await http.get<Distrito>(`${DISTRITOS_API_PATH}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el distrito con ID ${id}:`, error);
    throw error;
  }
};
