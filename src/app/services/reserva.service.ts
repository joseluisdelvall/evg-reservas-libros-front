import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { BaseService } from './base.service';
import { ReservaResponse as ModelReservaResponse } from '../models/reserva.model';

// Interfaces
export interface ReservaResponse {
  id: number;
  nombreAlumno: string;
  apellidosAlumno: string;
  correo: string;
  dni: string;
  telefono: string;
  justificante: string;
  fecha: string;
  verificado: number;
  totalPagado: number;
  curso: number;
  libros: any[];
}

export interface ReservaRequest {
  nombreAlumno: string;
  apellidosAlumno: string;
  nombreTutorLegal?: string;
  apellidosTutorLegal?: string;
  correo: string;
  dni: string;
  telefono: string;
  idCurso: string | number;
  libros: number[];
}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private endpoint = '/reservas';

  constructor(private http: BaseService) {}

  obtenerReservas(): Observable<ModelReservaResponse[]> {
    return this.http.get<any>(this.endpoint).pipe(
      map(response => {
        if (response && response.status === 'success' && response.data) {
          return response.data;
        }
        return [];
      }),
      catchError(error => {
        console.error('Error al obtener reservas:', error);
        return [];
      })
    );
  }

  crearReserva(reserva: ReservaRequest, justificante: File): Observable<ReservaResponse> {
    // Convertir el archivo a Base64 usando el método de BaseService
    return this.http.fileToBase64(justificante).pipe(
      switchMap(base64File => {
        // Crear el objeto en el formato exacto que espera el backend
        const datosPostman = {
          nombreAlumno: reserva.nombreAlumno,
          apellidosAlumno: reserva.apellidosAlumno,
          nombreTutor: reserva.nombreTutorLegal || null,
          apellidosTutor: reserva.apellidosTutorLegal || null,
          correo: reserva.correo,
          dni: reserva.dni,
          telefono: reserva.telefono,
          justificante: base64File,
          justificanteNombre: justificante.name,
          fecha: this.http.getCurrentDate(),
          verificado: 0,
          totalPagado: 0,
          curso: Number(reserva.idCurso),
          libro: reserva.libros
        };

        // Usar el método postWithTextResponse del BaseService con responseType text para manejar respuestas HTML
        return this.http.postWithTextResponse<string>(this.endpoint, datosPostman).pipe(
          map(responseText => this.http.handleApiResponse<ReservaResponse>(
            responseText, 
            this.createMockResponse(reserva)
          )),
          catchError(error => this.http.handleError<ReservaResponse>(
            error, 
            this.createMockResponse(reserva)
          ))
        );
      })
    );
  }

  // Respuesta simulada para fallback
  private createMockResponse(reserva: ReservaRequest): ReservaResponse {
    return {
      id: -1,
      nombreAlumno: reserva.nombreAlumno,
      apellidosAlumno: reserva.apellidosAlumno,
      correo: reserva.correo,
      dni: reserva.dni,
      telefono: reserva.telefono,
      justificante: 'archivo-simulado.pdf',
      fecha: this.http.getCurrentDate(),
      verificado: 0,
      totalPagado: 0,
      curso: Number(reserva.idCurso),
      libros: []
    };
  }
}
