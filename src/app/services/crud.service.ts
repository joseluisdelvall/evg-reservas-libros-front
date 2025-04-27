import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  constructor() { }

  getLibros(): Observable<Libros[]> {
    // Simulate an API call to get libros
    return of([
      { id: 1, title: 'Libro 1', author: 'Autor 1' },
      { id: 2, title: 'Libro 2', author: 'Autor 2' }
    ]);
  }
}
