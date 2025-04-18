import { Injectable, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  cookieTokenName = environment.auth.cookieTokenName;
  // Evento para notificar cambios en el estado de autenticación
  authStatusChange = new EventEmitter<boolean>();

  constructor() { }

  // Comprobar si hay un token válido almacenado
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    // Verificar si el token ha expirado
    try {
      // El token JWT está compuesto por 3 partes separadas por puntos
      // La segunda parte contiene los datos (payload) que podemos decodificar
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Verificar si el token ha expirado
      if (payload.exp && payload.exp < Date.now() / 1000) {
        // El token ha expirado, eliminarlo
        this.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      // Error al decodificar el token, eliminarlo
      console.error('Error decodificando el token JWT:', error);
      this.logout();
      return false;
    }
  }
  
  login(token: string): void {
    localStorage.setItem(this.cookieTokenName, token);
    // Emitir evento de cambio de estado a true
    this.authStatusChange.emit(true);
  }

  logout(): void {
    localStorage.removeItem(this.cookieTokenName);
    // Emitir evento de cambio de estado a false
    this.authStatusChange.emit(false);
  }
  
  getToken(): string | null {
    return localStorage.getItem(this.cookieTokenName);
  }
}
