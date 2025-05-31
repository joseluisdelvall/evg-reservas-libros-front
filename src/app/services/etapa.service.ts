import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Etapa } from '../models/etapa.model';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class EtapaService {
  private endpoint = '/etapas'; // Asumiendo que BaseService concatena esto con la URL base

  constructor(private http: BaseService) {} // Cambiado HttpClient por BaseService

  getEtapas(): Observable<Etapa[]> {
    // Usar la URL completa directamente ya que BaseService podría no estar configurado para este endpoint específico
    return this.http.get<{ status: string; message: string; data: Etapa[] }>(this.endpoint).pipe(
      map(response => response.data || []) // Devolver array vacío si no hay datos
    );
  }
} 