import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  protected baseUrl = environment.api.baseUrl;

  constructor(protected http: HttpClient) { }

  protected get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      catchError(this.handleError)
    );
  }

  protected post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  protected put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  protected delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  private getHeaders(): HttpHeaders {
    // Aquí puedes añadir headers comunes como tokens, content-type, etc.
    return new HttpHeaders({
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${this.getToken()}`
    });
  }

  private handleError(error: any) {
    // Aquí puedes manejar los errores de forma centralizada
    console.error('An error occurred:', error);
    return throwError(() => error);
  }
} 