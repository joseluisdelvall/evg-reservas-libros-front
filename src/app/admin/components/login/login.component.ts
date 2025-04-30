import { AfterViewInit, Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';

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
    private ngZone: NgZone
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
      client_id: '660176374148-klpm52u3brlqsmpjvqci3ruk5qk1ofnl.apps.googleusercontent.com', // Replace with your client ID
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
    google.accounts.id.prompt(); // also display the One Tap sign-in prompt
  }

  handleCredentialResponse(response: any) {
    console.log("Encoded JWT ID token: " + response.credential);
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
        console.log('Login successful:', response);
        if (response.success) {
          // Guardar información del usuario ANTES del token
          // para que esté disponible cuando se emita el evento de cambio de estado
          console.log('User data:', response.user);
          this.authService.setUserData(response.user);
          this.authService.notifyUserDataChange(response.user);
          
          // Guardar el token JWT en localStorage y emitir evento de cambio de estado
          console.log('Token:', response.token);
          this.loginService.login(response.token);
          
          // Emitir evento de actualización de datos de usuario
          //this.authService.notifyUserDataChange(response.user);
          
          // Redirigir a la página de reservas
          this.ngZone.run(() => {
            this.router.navigate(['admin/reservas']);
          });
        } else {
          this.errorMessage = response.message || 'Error de inicio de sesión';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Login error:', error);
        
        if (error.error && error.error.error_code === 'unauthorized_email') {
          this.errorMessage = 'El correo electrónico no está autorizado para acceder al sistema.';
        } else {
          this.errorMessage = 'Error al conectar con el servidor. Inténtalo de nuevo.';
        }
        
        this.isLoading = false;
      }
    });
  }
}
