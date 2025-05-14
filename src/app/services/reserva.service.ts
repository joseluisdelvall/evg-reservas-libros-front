import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { BaseService } from './base.service';

// Definir las interfaces necesarias dentro del mismo archivo
interface ReservaResponse {
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

interface ReservaRequest {
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
export class ReservaService extends BaseService {
  private endpoint = '/reservas';

  constructor(http: HttpClient) { 
    super(http);
  }

  crearReserva(reserva: ReservaRequest, justificante: File): Observable<ReservaResponse> {
    // Log para depuración
    console.log('Datos originales:', reserva);
    console.log('Archivo original:', justificante);
    
    // Convertir el archivo a Base64 usando el método del BaseService
    return this.fileToBase64(justificante).pipe(
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
          fecha: this.getCurrentDate(), // Usando método del BaseService
          verificado: 0,
          totalPagado: 0,
          curso: Number(reserva.idCurso), // Convertir a número
          libro: reserva.libros
        };
        
        // Log para depuración
        console.log('Datos enviados al servidor (formato Postman):', JSON.stringify(datosPostman));
        
        // Configurar cabeceras para JSON
        const headers = new HttpHeaders({
          'Content-Type': 'application/json'
        });
        
        // Enviar como JSON puro
        return this.http.post(`${this.apiBaseUrl}${this.endpoint}`, datosPostman, { 
          headers, 
          responseType: 'text' 
        })
        .pipe(
          map(responseText => this.handleApiResponse<ReservaResponse>(
            responseText, 
            this.createMockResponse(reserva)
          )),
          catchError(error => this.handleError<ReservaResponse>(
            error, 
            this.createMockResponse(reserva)
          ))
        );
      })
    );
  }
  
  // Crear una respuesta simulada cuando no podemos obtener la real pero sabemos que el status fue 200
  private createMockResponse(reserva: ReservaRequest): ReservaResponse {
    return {
      id: -1, // ID temporal negativo para indicar que es una respuesta simulada
      nombreAlumno: reserva.nombreAlumno,
      apellidosAlumno: reserva.apellidosAlumno,
      correo: reserva.correo,
      dni: reserva.dni,
      telefono: reserva.telefono,
      justificante: 'archivo-simulado.pdf',
      fecha: this.getCurrentDate(),
      verificado: 0,
      totalPagado: 0,
      curso: Number(reserva.idCurso),
      libros: []
    };
  }
} 