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
  obtenerJustificante(idReserva: number): Observable<string> {
    const endpoint = `${this.endpoint}/${idReserva}/justificante`;
    
    return this.http.get<ApiResponse<string>>(endpoint).pipe(
      map(response => {
        if (response && response.status === 'success' && response.data) {
          return response.data;
        }
        return '';
      }),
      catchError(error => {
        console.error('Error al obtener el justificante:', error);
        return this.http.handleError<string>(error, '');
      })
    );
  }

  /**
   * Muestra el justificante en una nueva ventana del navegador
   * @param base64Data Datos del justificante en Base64
   * @param nombreArchivo Nombre opcional para el archivo
   * @param nombreAlumno Nombre del alumno para el título
   */
  visualizarJustificante(base64Data: string, nombreArchivo: string = 'justificante', nombreAlumno?: string): void {
    // Verificar si los datos base64 están vacíos
    if (!base64Data || base64Data.trim() === '') {
      console.error('No se recibieron datos para visualizar el justificante');
      return;
    }

    // Determinar el tipo de archivo basado en la cabecera del base64 si existe
    let tipoArchivo = 'application/pdf'; // Valor predeterminado
    
    // Intentar detectar el tipo de archivo desde el propio base64
    if (base64Data.startsWith('data:')) {
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,/);
      if (matches && matches.length > 1) {
        tipoArchivo = matches[1];
        // Ya tiene el prefijo data:, no necesitamos agregarlo después
      }
    } else {
      // Intentar detectar el tipo basado en los primeros bytes
      if (base64Data.startsWith('iVBOR')) {
        tipoArchivo = 'image/png';
      } else if (base64Data.startsWith('/9j/')) {
        tipoArchivo = 'image/jpeg';
      } else if (base64Data.startsWith('JVBERi')) {
        tipoArchivo = 'application/pdf';
      } else if (nombreArchivo.toLowerCase().endsWith('.jpg') || nombreArchivo.toLowerCase().endsWith('.jpeg')) {
        tipoArchivo = 'image/jpeg';
      } else if (nombreArchivo.toLowerCase().endsWith('.png')) {
        tipoArchivo = 'image/png';
      }
    }

    // Crear el URL de datos
    const dataUrl = base64Data.startsWith('data:') 
      ? base64Data 
      : `data:${tipoArchivo};base64,${base64Data}`;
    
    const width = 1000;
    const height = 800;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    const newWindow = window.open('', '_blank', `width=${width},height=${height},left=${left},top=${top}`);
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>${nombreAlumno ? `Justificante de ${nombreAlumno}` : 'Justificante'}</title>
            <style>
              body { 
                margin: 0; 
                padding: 0; 
                display: flex; 
                flex-direction: column;
                height: 100vh; 
                width: 100vw; 
                background-color: #f8f9fa; 
                overflow: hidden; 
                font-family: Arial, sans-serif;
              }
              .header {
                background-color: #0d6efd;
                color: white;
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .header h1 {
                margin: 0;
                font-size: 1.5rem;
                font-weight: 500;
              }
              .container { 
                flex: 1;
                display: flex;
                flex-direction: column;
                background-color: white;
                margin: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                overflow: hidden;
              }
              .toolbar {
                display: flex;
                padding: 12px;
                background-color: #f8f9fa;
                border-bottom: 1px solid #dee2e6;
                justify-content: center;
                gap: 10px;
              }
              .toolbar button {
                margin: 0;
                padding: 8px 16px;
                background-color: white;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.9rem;
                color: #495057;
                transition: all 0.2s;
              }
              .toolbar button:hover {
                background-color: #e9ecef;
                border-color: #ced4da;
              }
              .content {
                flex: 1;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: auto;
                padding: 20px;
                background-color: #f8f9fa;
              }
              img { 
                max-width: 100%; 
                max-height: 100%; 
                object-fit: contain;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              iframe { 
                width: 100%; 
                height: 100%; 
                border: none;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .pdf-container {
                width: 100%;
                height: 100%;
                overflow: auto;
                background-color: white;
                border-radius: 4px;
              }
              .error-message { 
                color: #dc3545; 
                font-weight: bold; 
                text-align: center; 
                padding: 20px;
                background-color: #f8d7da;
                border: 1px solid #f5c6cb;
                border-radius: 4px;
                margin: 20px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${nombreAlumno ? `Justificante de ${nombreAlumno}` : 'Justificante'}</h1>
              <button onclick="window.close();" style="background: none; border: none; color: white; cursor: pointer; font-size: 1.2rem;">×</button>
            </div>
            <div class="container">
              ${tipoArchivo === 'application/pdf' ? `
                <div class="toolbar">
                  <button onclick="document.getElementById('pdf-viewer').style.width = '100%';">
                    <i class="fas fa-expand"></i> Ajustar a ancho
                  </button>
                  <button onclick="document.getElementById('pdf-viewer').style.width = 'auto';">
                    <i class="fas fa-compress"></i> Tamaño original
                  </button>
                  <button onclick="window.print();">
                    <i class="fas fa-print"></i> Imprimir
                  </button>
                </div>
              ` : ''}
              <div class="content">
                ${tipoArchivo.startsWith('image/') 
                  ? `<img src="${dataUrl}" alt="Justificante" onerror="document.querySelector('.content').innerHTML = '<p class=\\'error-message\\'>Error al cargar la imagen. El archivo podría estar dañado o tener un formato incorrecto.</p>';" />`
                  : `
                    <div class="pdf-container">
                      <iframe id="pdf-viewer" src="${dataUrl}#view=FitH" type="${tipoArchivo}" onerror="document.querySelector('.content').innerHTML = '<p class=\\'error-message\\'>Error al cargar el documento. El archivo podría estar dañado o tener un formato incorrecto.</p>';" frameborder="0" width="100%" height="100%"></iframe>
                    </div>
                  `}
              </div>
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