export interface ReservaRequest {
    nombreAlumno: string;
    apellidosAlumno: string;
    nombreTutorLegal?: string;
    apellidosTutorLegal?: string;
    correo: string;
    dni: string;
    telefono: string;
    idCurso: string | number;
    libros: number[];
}

export interface LibroReserva {
    id: number;
    nombre: string;
    precio: string;
    estado: string;
}

export interface ReservaResponse {
    id: number;
    nombreAlumno: string;
    apellidosAlumno: string;
    correo: string;
    dni?: string;
    fecha: string;
    verificado: number;
    curso: number;
    libros: LibroReserva[];
} 