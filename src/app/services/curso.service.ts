import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Curso } from '../models/curso.model';
import { Response } from '../models/response.model';
import { BaseService } from './base.service';
@Injectable({
    providedIn: 'root'
})
export class CursoService {
    private endpoint = '/cursos';

    constructor(private http: BaseService) { }

    getCursos(): Observable<Curso[]> {
    return this.http.get<Response>(this.endpoint)
        .pipe(
        map(response => response.data)
        );
    }
} 