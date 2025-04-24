import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

export interface PeriodoReservas {
  fechaInicio: string;
  fechaFin: string;
}

@Injectable({
  providedIn: 'root'
})
export class PeriodoReservasService extends BaseService {
  private endpoint = '/periodo-reservas';

  constructor(http: HttpClient) {
    super(http);
  }

  getPeriodoReservas(): Observable<PeriodoReservas> {
    return this.get<PeriodoReservas>(this.endpoint);
  }

  updatePeriodoReservas(periodo: PeriodoReservas): Observable<PeriodoReservas> {
    return this.put<PeriodoReservas>(this.endpoint, periodo);
  }
} 