import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private loginService: LoginService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // No modificar las solicitudes al endpoint de login
    if (request.url.includes('login')) {
      return next.handle(request);
    }

    // Obtener el token JWT
    const token = this.loginService.getToken();

    // Si hay un token, añadirlo a las cabeceras de la solicitud
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Manejar la respuesta y los errores
    return next.handle(request).pipe(
      tap((event) => {
        // Si la respuesta es 201, significa que el token no es válido
        if (event instanceof HttpResponse && event.status === 201) {
          this.handleInvalidToken();
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expirado o inválido
          this.handleInvalidToken();
        }
        return throwError(() => error);
      })
    );
  }

  private handleInvalidToken(): void {
    // Cerrar sesión y redirigir al login
    this.loginService.logout();
    this.router.navigate(['/admin/login']);
  }
}