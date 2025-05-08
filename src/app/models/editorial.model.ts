/**
 * Falta poner que la editorial tenga varias direcciones de correo electronico y telefonos
 */

export interface Editorial {
    idEditorial: number;
    nombre: string;
    correo?: string;
    telefono?: string;
    estado?: boolean;
}