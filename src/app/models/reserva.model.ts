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
    idLibro: number;
    nombre: string;
    ISBN: string;
    precio: number;
    fechaRecogida: string | null;
    precioPagado: number;
    idEstado: number;
    nombreEstado: string;
    descripcionEstado: string;
}

export interface CursoReserva {
    idCurso: number;
    nombreCurso: string;
    nombreEtapa: string;
}

export interface ReservaResponse {
    idReserva: number;
    nombreAlumno: string;
    apellidosAlumno: string;
    nombreTutorLegal?: string;
    apellidosTutorLegal?: string;
    correo: string;
    dni: string;
    telefono: string;
    justificante: string;
    fecha: string;
    verificado: boolean;
    totalPagado: number;
    curso: CursoReserva;
    libros: LibroReserva[];
}

export interface ReservaResponseR {
    id: number;
    nombreAlumno: string;
    apellidosAlumno: string;
    correo: string;
    fecha: string;
    verificado: number;
    curso: number;
    nombreCurso ?: string;
    libros: LibroReserva[];
}