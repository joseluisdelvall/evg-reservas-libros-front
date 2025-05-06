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
    return this.http.put<{ status: string; data: Editorial }>(this.endpoint + '/editoriales/' + id + '/estado', {}).pipe(
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
}
