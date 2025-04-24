import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.api.baseUrl;
  private loginUrl = environment.api.loginUrl;
  
  // Evento para notificar cambios en los datos de usuario
  userDataChange = new EventEmitter<any>();

  constructor(private http: HttpClient) {}

  sendTokenToBackend(token: string): Observable<any> {
    // Usar la URL de login específica del entorno en lugar de construirla manualmente
    return this.http.post<any>(this.loginUrl, { id_token: token });
  }

  // Almacenar el token JWT recibido del backend
  setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  // Almacenar información del usuario
  setUserData(user: any): void {
    localStorage.setItem('user_data', JSON.stringify(user));
  }
  
  // Notificar cambios en los datos del usuario
  notifyUserDataChange(user: any): void {
    this.userDataChange.emit(user);
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }

  // Obtener el token JWT
  getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Obtener datos del usuario
  getUserData(): any {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }
}
