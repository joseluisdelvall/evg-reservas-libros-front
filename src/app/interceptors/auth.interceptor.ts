import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private loginService: LoginService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // No modifiques las solicitudes al archivo login.php (el proceso de login)
    if (request.url.includes('login.php')) {
      return next.handle(request);
    }

    // Obtén el token JWT
    const token = this.loginService.getToken();

    // Si hay un token, añádelo a las cabeceras de la solicitud
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Manejo de errores de autenticación (401 Unauthorized)
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // En entorno de desarrollo, ignoramos los errores de autenticación
        if (error.status === 401 && environment.production) {
          // Token expirado o inválido, cerrar sesión y redirigir a login
          // Solo en producción
          this.loginService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}