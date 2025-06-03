import { AfterViewInit, Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {
  enviroment = environment;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private loginService: LoginService,
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
      if (this.loginService.isLoggedIn()) {
        this.ngZone.run(() => {
          this.router.navigate(['/admin/reservas']);
        });
      }
  }

  ngAfterViewInit(): void {
    // @ts-ignore
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: this.handleCredentialResponse.bind(this),
      ux_mode: 'popup',
      login_uri: environment.api.loginUrl // Usar la URL completa ya definida
    });
    // @ts-ignore
    google.accounts.id.renderButton(
      document.querySelector(".g_id_signin"),
      { theme: "outline", size: "large" }  // customization attributes
    );
    // @ts-ignore
    google.accounts.id.prompt();
  }

  handleCredentialResponse(response: any) {
    // Ejecutar en la zona de Angular
    this.ngZone.run(() => {
      this.sendTokenToBackend(response.credential);
    });
  }

  sendTokenToBackend(token: string) {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.sendTokenToBackend(token).subscribe({
      next: (response) => {
        if (response.success) {
          // Guardar información del usuario ANTES del token
          // para que esté disponible cuando se emita el evento de cambio de estado
          this.authService.setUserData(response.user);
          this.authService.notifyUserDataChange(response.user);
          
          // Guardar el token JWT en localStorage y emitir evento de cambio de estado
          this.loginService.login(response.token);
          
          // Toastr success 
          this.toastr.success('Inicio de sesión exitoso', 'Éxito', {
            timeOut: 3000,
            positionClass: 'toast-top-right'
          });
          
          // Redirigir a la página de reservas
          this.ngZone.run(() => {
            this.router.navigate(['admin/crud/reservas']);
          });
        } else {
          this.errorMessage = response.message || 'Error de inicio de sesión';
          this.showError(this.errorMessage);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Login error:', error);
        
        if (error.error && error.error.error_code === 'unauthorized_email') {
          this.showError('El correo electrónico no está autorizado para acceder al sistema.');
        } else {
          this.showError('Error al conectar con el servidor. Inténtalo de nuevo.');
        }
        
        this.isLoading = false;
      }
    });
  }

  // Toast Error
  showError(message: string) {
    this.toastr.error(message, 'Error', {
      timeOut: 3000,
      positionClass: 'toast-top-right'
    });
  }

}

