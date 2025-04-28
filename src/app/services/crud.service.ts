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
    return this.http.post<{ status: string; data: Libro }>(this.endpoint + '/libros', libro).pipe(
      map(response => response.data) // Extraer el libro creado
    );
  }

  getLibros(): Observable<Libro[]> {
    return this.http.get<{ status: string; data: Libro[] }>(this.endpoint + '/libros').pipe(
      map(response => response.data) // Extraer el array de libros
    );
  }

  getEditoriales(): Observable<Editorial[]> {

    return this.http.get<{ status: string; data: Editorial[] }>(this.endpoint + '/editoriales').pipe(
      map(response => response.data) // Extraer el array de libros
    );
  }
}
