import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { Libro } from '../models/libro.model';
import { Editorial } from '../models/editorial.model';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Response } from '../models/response.model';
import { ReservaResponse } from '../models/reserva.model';

@Injectable({
  providedIn: 'root'
})
export class CrudService {
  private endpoint = '/crud';

  constructor(private http: BaseService) {}

  // Método para agregar un libro
  addLibro(libro: Libro): Observable<Libro> {
    return this.http.post<{ status: string; data: Libro }>(this.endpoint + '/libros/add', libro).pipe(
      map(response => response.data)
    );
  }

  // Método para obtener todos los libros
  getLibros(): Observable<Libro[]> {
    return this.http.get<{ status: string; data: Libro[] }>(this.endpoint + '/libros').pipe(
      map(response => {
        return response.data.map(libro => ({
          ...libro,
          estado: typeof libro.estado === 'string' ? libro.estado === '1' : libro.estado
        }));
      })
    );
  }

  // Método para obtener un libro por su ID
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

  // Método para actualizar un libro
  updateLibro(id: string, libro: Libro): Observable<Libro> {
    console.log(`Sending book update to endpoint: ${this.endpoint}/libros/${id}`);
    console.log('Book data:', JSON.stringify(libro, null, 2));
    return this.http.put<{ status: string; data: Libro }>(this.endpoint + '/libros/' + id, libro).pipe(
      map(response => response.data)
    );
  }

  // Método para obtener un libro por su ID de reserva
  getLibroByReservaId(id: string): Observable<Libro> {
    return this.http.get<{ status: string; data: Libro }>(this.endpoint + `/reservas/${id}/libros`).pipe(
      map(response => response.data)
    );
  }

  // Método para agregar una editorial
  addEditorial(editorial: Editorial): Observable<Editorial> {
    return this.http.post<{ status: string; data: Editorial }>(this.endpoint + '/editoriales/add', editorial).pipe(
      map(response => response.data) // Extraer la editorial creada
    );
  }

  // Método para obtener todas las editoriales
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

  // Método para obtener una editorial por su ID
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

  // Método para actualizar una editorial
  updateEditorial(id: string, editorial: Editorial): Observable<Editorial> {
    return this.http.put<{ status: string; data: Editorial }>(this.endpoint + '/editoriales/' + id, editorial).pipe(
      map(response => response.data)
    );
  }

  // Método para obtener todas las reservas
  getReservas(): Observable<ReservaResponse[]> {
    console.log(`${this.endpoint}/reservas`);
    
    return this.http.get<Response>(`${this.endpoint}/reservas`).pipe(
      map(response => response.data)
    );
  }

  // Método para actualizar una reserva
  updateReserva(id: string, reserva: ReservaResponse): Observable<ReservaResponse> {
    console.log('✅ | 1 - crud.service.ts | updateReserva');
    console.log(reserva);
    console.log(this.endpoint + '/reservas/' + id);
    return this.http.put<{ status: string; data: ReservaResponse }>(this.endpoint + '/reservas/' + id, reserva).pipe(
      map(response => response.data)
    );
  }

  // Obtener reserva por id
  getReservaById(id: string): Observable<ReservaResponse> {
    console.log('✅ | 1 - crud.service.ts | getReservaById');
    console.log(this.endpoint + '/reservas/' + id);
    return this.http.get<{ status: string; data: ReservaResponse }>(this.endpoint + '/reservas/' + id).pipe(
      map(response => response.data)
    );
  }

  // Método para anular una reserva
  anularReserva(id: string): Observable<ReservaResponse> {
    return this.http.put<{ status: string; data: ReservaResponse }>(this.endpoint + '/reservas/' + id + '/anular', {}).pipe(
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

  // Método para cambiar el estado de una reserva
  toggleReservaEstado(id: string): Observable<ReservaResponse> {
    console.log(`Toggling reserva estado for ID: ${id}`);
    console.log('✅ | 1 - crud.service.ts | toggleReservaEstado');
    console.log(this.endpoint + '/reservas/' + id + '/estado');
    return this.http.put<{ status: string; data: ReservaResponse }>(this.endpoint + '/reservas/' + id + '/estado', {}).pipe(
      map(response => response.data)
    );
  }
}
