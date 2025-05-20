import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { Libro } from '../models/libro.model';
import { Editorial } from '../models/editorial.model';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class CrudService {
  private endpoint = '/crud';

  constructor(private http: BaseService) {}

  addLibro(libro: Libro): Observable<Libro> {
    return this.http.post<{ status: string; data: Libro }>(this.endpoint + '/libros/add', libro).pipe(
      map(response => response.data) // Extraer el libro creado
    );
  }

  getLibros(): Observable<Libro[]> {
    return this.http.get<{ status: string; data: Libro[] }>(this.endpoint + '/libros').pipe(
      map(response => {
        // Convertir estado a boolean si es necesario
        return response.data.map(libro => ({
          ...libro,
          estado: typeof libro.estado === 'string' ? libro.estado === '1' : libro.estado
        }));
      })
    );
  }

  getLibroById(id: string): Observable<Libro> {
    return this.http.get<{ status: string; data: Libro }>(this.endpoint + '/libros/' + id).pipe(
      map(response => {
        // Convertir estado a boolean si es necesario
        const libro = response.data;
        return {
          ...libro,
          estado: typeof libro.estado === 'string' ? libro.estado === '1' : libro.estado
        };
      })
    );
  }

  updateLibro(id: string, libro: Libro): Observable<Libro> {
    console.log(`Sending book update to endpoint: ${this.endpoint}/libros/${id}`);
    console.log('Book data:', JSON.stringify(libro, null, 2));
    return this.http.put<{ status: string; data: Libro }>(this.endpoint + '/libros/' + id, libro).pipe(
      map(response => response.data)
    );
  }

  addEditorial(editorial: Editorial): Observable<Editorial> {
    return this.http.post<{ status: string; data: Editorial }>(this.endpoint + '/editoriales/add', editorial).pipe(
      map(response => response.data) // Extraer la editorial creada
    );
  }

  getEditoriales(): Observable<Editorial[]> {
    return this.http.get<{ status: string; data: Editorial[] }>(this.endpoint + '/editoriales').pipe(
      map(response => {
        // Convertir estado a boolean si es necesario
        return response.data.map(editorial => ({
          ...editorial,
          estado: typeof editorial.estado === 'string' ? editorial.estado === '1' : editorial.estado
        }));
      })
    );
  }

  getEditorialById(id: string): Observable<Editorial> {
    return this.http.get<{ status: string; data: Editorial }>(this.endpoint + '/editoriales/' + id).pipe(
      map(response => {
        // Convertir estado a boolean si es necesario
        const editorial = response.data;
        return {
          ...editorial,
          estado: typeof editorial.estado === 'string' ? editorial.estado === '1' : editorial.estado
        };
      })
    );
  }

  updateEditorial(id: string, editorial: Editorial): Observable<Editorial> {
    return this.http.put<{ status: string; data: Editorial }>(this.endpoint + '/editoriales/' + id, editorial).pipe(
      map(response => response.data)
    );
  }

  // Método para cambiar el estado de una editorial
  toggleEditorialEstado(id: string): Observable<Editorial> {
    console.log(`Toggling editorial estado for ID: ${id}`);
    return this.http.put<{ status: string; data: Editorial }>(this.endpoint + '/editoriales/' + id + '/estado', {}).pipe(
      map(response => {
        console.log('Response from toggleEditorialEstado:', response);
        
        // Check if response.data is null or undefined
        if (!response || !response.data) {
          console.error('Response or response.data is null:', response);
          throw new Error('No se pudo obtener la respuesta del servidor');
        }
        
        // Convertir estado a boolean si es necesario
        const editorial = response.data;
        return {
          ...editorial,
          estado: typeof editorial.estado === 'string' ? editorial.estado === '1' : editorial.estado
        };
      })
    );
  }

  // Método para cambiar el estado de un libro
  toggleLibroEstado(id: string): Observable<Libro> {
    console.log(`Toggling libro estado for ID: ${id}`);
    return this.http.put<{ status: string; data: Libro }>(this.endpoint + '/libros/' + id + '/estado', {}).pipe(
      map(response => {
        console.log('Response from toggleLibroEstado:', response);
        
        // Check if response.data is null or undefined
        if (!response || !response.data) {
          console.error('Response or response.data is null:', response);
          throw new Error('No se pudo obtener la respuesta del servidor');
        }
        
        // Convertir estado a boolean si es necesario
        const libro = response.data;
        return {
          ...libro,
          estado: typeof libro.estado === 'string' ? libro.estado === '1' : libro.estado
        };
      })
    );
  }

  // ========== Métodos para gestionar asignaciones de libros a cursos ==========

  /**
   * Obtiene todas las asignaciones libro-curso
   */
  getLibrosCursos(): Observable<any[]> {
    return this.http.get<{ status: string; data: any[] }>(this.endpoint + '/libros-cursos').pipe(
      map(response => {
        if (response.status === 'warning') {
          return []; // Si no hay asignaciones, devolver array vacío
        }
        return response.data || [];
      })
    );
  }

  /**
   * Obtiene los libros asignados a un curso específico
   */
  getLibrosByCurso(cursoId: string): Observable<any[]> {
    return this.http.get<{ status: string; data: any[] }>(`/libros-cursos/curso/${cursoId}`).pipe(
      map(response => {
        if (response.status === 'warning') {
          return []; // Si no hay libros asignados, devolver array vacío
        }
        return response.data || [];
      })
    );
  }

  /**
   * Asigna un libro a un curso
   */
  asignarLibroACurso(idLibro: number, idCurso: string): Observable<any> {
    return this.http.post<{ status: string; data: any }>(
      this.endpoint + '/libros-cursos/add', 
      { idLibro, idCurso }
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Elimina una asignación libro-curso2
   */
  eliminarAsignacionLibroCurso(idLibro: number, idCurso: string): Observable<any> {
    // Usar POST a /libros-cursos/delete en lugar de DELETE
    return this.http.post<{ status: string; message: string }>(
      this.endpoint + '/libros-cursos/delete',
      { idLibro, idCurso }
    );
  }
}