/**
 * Falta poner que la editorial tenga varias direcciones de correo electronico y telefonos
 */

export interface Editorial {
    id?: number; // Identificador único de la editorial
    nombre?: string; // Nombre de la editorial
    telefono?: string[]; // Teléfono de contacto
    correo?: string[]; // Correo electrónico de contacto
    estado?: string; // Estado de la editorial (activo o inactivo)
}