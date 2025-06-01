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
  getLibrosByCurso(cursoId: string): Observable<{ status: string; data: any[] }> {
    return this.http.get<{ status: string; data: any[] }>(`/libros/curso/${cursoId}`);
  }

  /**
   * Asigna un libro a un curso
   */
  asignarLibroACurso(idLibro: number, idCurso: number): Observable<any> {
    // Convertir idCurso a number si viene como string
    const cursoId = typeof idCurso === 'string' ? parseInt(idCurso, 10) : idCurso;
    
    // Usar POST a /crud/libros-cursos/add con los parámetros en el body
    return this.http.post<{ status: string; data: any }>(
      '/crud/libros-cursos/add',
      { 
        idLibro: idLibro, 
        idCurso: cursoId  // Asegurar que sea number
      }
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Elimina una asignación libro-curso
   */
  eliminarAsignacionLibroCurso(idLibro: number, idCurso: number): Observable<any> {
    // Convertir idCurso a number si viene como string
    const cursoId = typeof idCurso === 'string' ? parseInt(idCurso, 10) : idCurso;
    
    // Usar POST a /crud/libros-cursos/delete con los parámetros en el body
    return this.http.post<{ status: string; message: string }>(
      '/crud/libros-cursos/delete',
      { 
        idLibro: idLibro, 
        idCurso: idCurso  // Asegurar que sea number
      }
    );
  }

  /**
   * Obtiene las editoriales que tienen libros reservados pendientes de pedir
   */
  getEditorialesConLibrosPendientes(): Observable<Editorial[]> {
    return this.http.get<{ status: string; message: string; data: Editorial[] }>(
      '/pedidos/editoriales-con-libros-pendientes'
    ).pipe(
      map(response => {
        if (response.status === 'error') {
          throw new Error(response.message);
        }
        return response.data || [];
      })
    );
  }

  /**
   * Obtiene los libros pendientes de pedir para una editorial específica
   */
  getLibrosPendientesPorEditorial(idEditorial: string): Observable<Libro[]> {
    return this.http.get<{ status: string; message: string; data: Libro[] }>(
      `/pedidos/editoriales/${idEditorial}/libros-pendientes`
    ).pipe(
      map(response => {
        if (response.status === 'error') {
          throw new Error(response.message);
        }
        return response.data || [];
      })
    );
  }

  /**
   * Obtiene los libros de una etapa específica
   */
  getLibrosByEtapa(etapaId: string): Observable<{ status: string; data: any[] }> {
    return this.http.get<{ status: string; data: any[] }>(`/libros/etapa/${etapaId}`);
  }
}