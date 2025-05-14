import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Libro } from '../models/libro.model';
import { Response } from '../models/response.model';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class LibroService {
  private endpoint = '/libros';

  constructor(private http: BaseService) { }

  getLibrosByCurso(cursoId: string): Observable<Libro[]> {
    return this.http.get<Response>(`${this.endpoint}/curso/${cursoId}`)
      .pipe(
        map(response => response.data)
      );
  }
} 