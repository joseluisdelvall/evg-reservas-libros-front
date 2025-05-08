import { Editorial } from "./editorial.model";

export interface Libro {
    id?: number;
    nombre?: string;
    isbn?: string;
    editorial?: Editorial;
    estado?: boolean;
    precio?: number;
}