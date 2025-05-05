import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {

  isLoggedIn: boolean = false;
    authStatusSubscription: any = null;
  
    constructor(private loginService: LoginService,
                private authService: AuthService
    ) { }
  
    ngOnInit(): void {
      this.checkLoginStatus();
      
      // Suscribirse a cambios en el estado de login
      this.authStatusSubscription = this.loginService.authStatusChange.subscribe(() => {
        this.checkLoginStatus();
      });
    }
  
    checkLoginStatus(): void {
      this.isLoggedIn = this.loginService.isLoggedIn();
    }
  
    ngOnDestroy(): void {
      // Cancelar suscripciones para evitar pérdidas de memoria
      if (this.authStatusSubscription) {
        this.authStatusSubscription.unsubscribe();
      }
    }

}
