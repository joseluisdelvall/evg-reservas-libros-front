/**
 * Interfaz para las editoriales con múltiples contactos
 */

export interface Editorial {
    idEditorial?: string; // Identificador único de la editorial
    nombre?: string; // Nombre de la editorial
    telefonos?: string[]; // Múltiples teléfonos de contacto (3)
    correos?: string[]; // Múltiples correos electrónicos de contacto (3)
    estado?: string; // Estado de la editorial (activo o inactivo)
    
    // Propiedades antiguas para mantener compatibilidad
    telefono?: string;
    correo?: string | null;
}