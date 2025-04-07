import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  cookieTokenName = environment.auth.cookieTokenName;

  constructor() { }

  isLoggedIn(): boolean {
    return true;
  }
  
  // Me lo ha dado el chati, mejor lo hacemos con cookies
  login(token: string): void {
    localStorage.setItem(this.cookieTokenName, token);
  }

  logout(): void {
    localStorage.removeItem(this.cookieTokenName);
  }
  
  getToken(): string | null {
    return localStorage.getItem(this.cookieTokenName);
  }
}
