import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Libro } from '../models/libro.model';
import { Editorial } from '../models/editorial.model';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  constructor() { }

  getLibros(): Observable<Libro[]> {
    // Simulate an API call to get libros
    return of([
      { id: 1, nombre: 'Libro 1', isbn: '1234567890', precio: 10.99, stock: 5, estado: 'activo' },
      { id: 2, nombre: 'Libro 2', isbn: '0987654321', precio: 15.99, stock: 3, estado: 'activo' },
      { id: 3, nombre: 'Libro 3', isbn: '1122334455', precio: 20.99, stock: 8, estado: 'inactivo' }
    ]);
  }

  getEditoriales(): Observable<Editorial[]> {

    return of([
      { id: 1, nombre: 'Editorial 1', telefono: ['123456789', '987654321'], estado: 'activo' },
      { id: 2, nombre: 'Editorial 2', correo: ['correo@ejemplo.com'], estado: 'activo' },
      { id: 3, nombre: 'Editorial 3', telefono: [], estado: 'inactivo' }
    ]);
  }
}
