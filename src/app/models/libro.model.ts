import { Editorial } from "./editorial.model";

export interface Libro {
  id?: number; // Identificador único del libro
  nombre?: string; // Título del libro
  isbn?: string; // Autor del libro
  precio?: number; // Precio del libro
  stock?: number; // Año de publicación
  editorial?: Editorial; // Editorial del libro
  estado?: boolean; // Estado del libro (disponible o no)
}