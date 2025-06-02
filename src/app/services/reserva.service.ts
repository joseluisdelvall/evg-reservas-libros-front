import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { BaseService } from './base.service';
import { ReservaResponse as ModelReservaResponse } from '../models/reserva.model';
import { Response } from '../models/response.model';

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

interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}

interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
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
    return this.http.get<any>(this.endpoint + '/entregas').pipe(
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

  entregarLibros(idReserva: number, librosIds: number[]): Observable<any> {
    const url = `/reserva/${idReserva}/entregar-libros`;
    const body = { libros: librosIds };
    
    return this.http.post<any>(url, body).pipe(
      map(response => {
        if (response && response.status === 'success') {
          return response;
        }
        return response;
      }),
      catchError(error => {
        console.error('Error al entregar libros:', error);
        throw error;
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

  /**
   * Obtiene el justificante de una reserva específica
   * @param idReserva ID de la reserva
   * @returns Observable con los datos del justificante en formato Base64
   */
  obtenerJustificante(idReserva: number): Observable<any> {
  return this.http.get(`${this.apiBaseUrl}${this.endpoint}/${idReserva}/justificante`, { 
    responseType: 'text' 
  }).pipe(
    map(responseText => {
      try {
        const response = JSON.parse(responseText) as ApiResponse<string>;
        if (response.status === 'success' && response.data) {
          return response.data; // Devuelve el justificante en Base64
        }
        throw new Error('No se pudo obtener el justificante');
      } catch (error) {
        console.error('Error al procesar la respuesta del justificante:', error);
        throw error;
      }
    }),
    catchError(error => {
      console.error('Error al obtener el justificante:', error);
      return this.handleError('obtenerJustificante', '');
    })
  );
}

  /**
   * Muestra el justificante en una nueva ventana del navegador
   * @param base64Data Datos del justificante en Base64
   * @param nombreArchivo Nombre opcional para el archivo
   */
  visualizarJustificante(base64Data: string, nombreArchivo: string = 'justificante'): void {
    // Determinar el tipo de archivo basado en la extensión o en los datos
    let tipoArchivo = 'application/pdf'; // Valor predeterminado
    if (nombreArchivo.toLowerCase().endsWith('.jpg') || nombreArchivo.toLowerCase().endsWith('.jpeg')) {
      tipoArchivo = 'image/jpeg';
    } else if (nombreArchivo.toLowerCase().endsWith('.png')) {
      tipoArchivo = 'image/png';
    }

    // Si base64Data ya incluye el prefijo data:, usamos directamente
    const dataUrl = base64Data.startsWith('data:') 
      ? base64Data 
      : `data:${tipoArchivo};base64,${base64Data}`;
    
    // Abrir en una nueva ventana
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Justificante: ${nombreArchivo}</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f0f0f0; }
              .container { max-width: 100%; max-height: 100%; }
              img { max-width: 100%; max-height: 90vh; object-fit: contain; }
              iframe { width: 100%; height: 90vh; border: none; }
            </style>
          </head>
          <body>
            <div class="container">
              ${tipoArchivo.startsWith('image/') 
                ? `<img src="${dataUrl}" alt="Justificante" />`
                : `<iframe src="${dataUrl}" type="${tipoArchivo}"></iframe>`}
            </div>
          </body>
        </html>
      `);
      newWindow.document.close();
    } else {
      console.error('No se pudo abrir una nueva ventana. Verifique la configuración del bloqueador de ventanas emergentes.');
      // Alternativa: Descargar el archivo
      this.descargarJustificante(base64Data, nombreArchivo, tipoArchivo);
    }
  }

  /**
   * Descarga el justificante como archivo
   * @param base64Data Datos del justificante en Base64
   * @param nombreArchivo Nombre del archivo
   * @param tipoArchivo Tipo MIME del archivo
   */
  private descargarJustificante(base64Data: string, nombreArchivo: string, tipoArchivo: string): void {
    // Quitar el prefijo data: si existe
    const base64Clean = base64Data.includes('base64,') ? 
      base64Data.split('base64,')[1] : base64Data;
    
    // Crear un enlace de descarga
    const blob = this.b64toBlob(base64Clean, tipoArchivo);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  /**
   * Convierte una cadena Base64 a un objeto Blob
   */
  private b64toBlob(b64Data: string, contentType: string = '', sliceSize: number = 512): Blob {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }

}
