import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Curso {
    id: string;
    nombre: string;
    etapa: string;
}

export interface CursoResponse {
    status: string;
    message: string;
    data: Curso[];
}

@Injectable({
    providedIn: 'root'
})
export class CursoService {
    private apiUrl = 'http://localhost:80/evg-reservas-libros-back/api';

    constructor(private http: HttpClient) { }

    getCursos(): Observable<Curso[]> {
    return this.http.get<CursoResponse>(`${this.apiUrl}/cursos`)
        .pipe(
        map(response => response.data)
        );
    }
} 