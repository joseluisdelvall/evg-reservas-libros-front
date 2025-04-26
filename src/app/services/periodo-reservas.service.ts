import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

export interface PeriodoReservas {
  fechaInicio: string;
  fechaFin: string;
}

export interface PeriodoReservasResponse {
  status: string;
  data: PeriodoReservas;
}

@Injectable({
  providedIn: 'root'
})
export class PeriodoReservasService extends BaseService {
  private endpoint = '/periodo-reservas';

  constructor(http: HttpClient) {
    super(http);
  }

  getPeriodoReservas(): Observable<PeriodoReservasResponse> {
    return this.get<PeriodoReservasResponse>(this.endpoint);
  }

  updatePeriodoReservas(periodo: PeriodoReservas): Observable<PeriodoReservasResponse> {
    return this.put<PeriodoReservasResponse>(this.endpoint, periodo);
  }
} 