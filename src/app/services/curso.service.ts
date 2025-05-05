import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Curso } from '../models/curso.model';
import { Response } from '../models/response.model';
@Injectable({
    providedIn: 'root'
})
export class CursoService {
    private apiUrl = 'http://localhost:80/evg-reservas-libros-back/api';

    constructor(private http: HttpClient) { }

    getCursos(): Observable<Curso[]> {
    return this.http.get<Response>(`${this.apiUrl}/cursos`)
        .pipe(
        map(response => response.data)
        );
    }
} 