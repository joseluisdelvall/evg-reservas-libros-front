/**
 * Interfaz para las editoriales con múltiples contactos
 */

export interface Editorial {
    idEditorial?: string;
    nombre?: string;
    correos?: string[];
    telefonos?: string[];
    estado?: boolean;
    librosPendientes?: number;
}