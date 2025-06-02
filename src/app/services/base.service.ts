import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  protected apiBaseUrl = environment.api.baseUrl;

  constructor(protected http: HttpClient) { }

  /**
   * Convierte un archivo a base64
   */
  public fileToBase64(file: File): Observable<string> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let base64 = reader.result as string;
        // Remover el prefijo (ej: "data:application/pdf;base64,")
        if (base64.includes(',')) {
          base64 = base64.split(',')[1];
        }
        observer.next(base64);
        observer.complete();
      };
      reader.onerror = error => {
        observer.error('Error al convertir archivo a base64: ' + error);
      };
    });
  }

  /**
   * Obtiene la fecha actual en formato YYYY-MM-DD
   */
  public getCurrentDate(): string {
    const date = new Date();
    return date.toISOString().split('T')[0];
  }

  /**
   * Maneja las respuestas del servidor que pueden contener advertencias de PHP
   */
  public handleApiResponse<T>(responseText: string, fallbackResponse?: T): T {
    console.log('Respuesta recibida del servidor (texto):', responseText);
    
    // Verificar si la respuesta parece HTML (contiene tags)
    if (responseText.includes('<br />') || responseText.includes('<b>')) {
      console.warn('Respuesta HTML detectada, posiblemente advertencia de PHP');
      
      // Buscar el JSON incrustado en la respuesta HTML
      const jsonMatch = responseText.match(/\{.*\}/s);
      if (jsonMatch) {
        try {
          const jsonData = JSON.parse(jsonMatch[0]);
          console.log('JSON extraído de la respuesta HTML:', jsonData);
          
          if (jsonData && jsonData.status === 'success' && jsonData.data) {
            return jsonData.data as T;
          }
        } catch (e) {
          console.error('Error al intentar extraer JSON de la respuesta HTML:', e);
        }
      }
      
      // Si se proporcionó una respuesta de respaldo, úsela
      if (fallbackResponse) {
        return fallbackResponse;
      }
    }
    
    // Intentar parsear como JSON normal
    try {
      const response = JSON.parse(responseText);
      
      if (!response) {
        throw new Error('La respuesta del servidor es nula');
      }
      
      if (response.status !== 'success') {
        throw new Error(`Error del servidor: ${response.message || 'Error desconocido'}`);
      }
      
      if (!response.data) {
        throw new Error('La respuesta no contiene datos');
      }
      
      return response.data as T;
    } catch (error) {
      console.error('Error al parsear la respuesta JSON:', error);
      if (fallbackResponse) {
        return fallbackResponse;
      }
      throw error;
    }
  }

  /**
   * Maneja los errores de las peticiones HTTP
   */
  public handleError<T>(error: any, fallbackResponse?: T): Observable<T> {
    let errorMsg: string;
    
    if (error instanceof HttpErrorResponse) {
      // Si es un error HTTP pero con status 200, probablemente es una respuesta HTML con warning de PHP
      if (error.status === 200 && fallbackResponse) {
        console.warn('Error de parseo con status 200 - Asumiendo éxito con advertencia');
        return of(fallbackResponse);
      }
      
      errorMsg = `Error HTTP ${error.status}: ${error.statusText || 'Error desconocido'}`;
      console.error('Error HTTP completo:', error);
    } else if (error instanceof Error) {
      errorMsg = error.message;
      console.error('Error en la aplicación:', error);
    } else {
      errorMsg = 'Error desconocido';
      console.error('Error desconocido:', error);
    }
    
    return throwError(() => new Error(errorMsg));
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  public get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.apiBaseUrl}${endpoint}`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      catchError(error => this.handleError<T>(error))
    );
  }

  public post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiBaseUrl}${endpoint}`, body, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => this.handleError<T>(error))
    );
  }

  public postWithTextResponse<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post(`${this.apiBaseUrl}${endpoint}`, body, {
      headers: this.getHeaders(),
      responseType: 'text'
    }).pipe(
      map(response => response as unknown as T),
      catchError(error => this.handleError<T>(error))
    );
  }

  public put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.apiBaseUrl}${endpoint}`, body, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => this.handleError<T>(error))
    );
  }

  public delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiBaseUrl}${endpoint}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => this.handleError<T>(error))
    );
  }
}