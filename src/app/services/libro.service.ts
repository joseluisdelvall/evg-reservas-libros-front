import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Libro } from '../models/libro.model';
import { Response } from '../models/response.model';

@Injectable({
  providedIn: 'root'
})
export class LibroService {
  private apiUrl = 'http://localhost:80/evg-reservas-libros-back/api';

  constructor(private http: HttpClient) { }

  getLibrosByCurso(cursoId: string): Observable<Libro[]> {
    return this.http.get<Response>(`${this.apiUrl}/libros/curso/${cursoId}`)
      .pipe(
        map(response => response.data)
      );
  }
} 