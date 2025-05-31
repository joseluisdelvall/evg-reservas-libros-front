import { Editorial } from "./editorial.model";
import { Etapa } from "./etapa.model";

export interface Libro {
    id?: number;
    nombre?: string;
    isbn?: string;
    editorial?: Editorial;
    etapa?: Etapa;
    estado?: boolean;
    precio?: number;
    unidadesPendientes?: number;
}