import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoginService } from 'src/app/services/login.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  isLoggedIn: boolean = false;
  userName: string = '';
  private authStatusSubscription: Subscription | null = null;
  private userDataSubscription: Subscription | null = null;

  constructor(
    private loginService: LoginService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.checkLoginStatus();
    
    // Suscribirse a cambios en el estado de login
    this.authStatusSubscription = this.loginService.authStatusChange.subscribe(() => {
      this.checkLoginStatus();
    });
    
    // Suscribirse a cambios en los datos de usuario
    this.userDataSubscription = this.authService.userDataChange.subscribe((userData) => {
      if (userData) {
        this.userName = userData.nombre || 'Usuario';
      }
    });
  }
  
  ngOnDestroy(): void {
    // Cancelar suscripciones para evitar pérdidas de memoria
    if (this.authStatusSubscription) {
      this.authStatusSubscription.unsubscribe();
    }
    if (this.userDataSubscription) {
      this.userDataSubscription.unsubscribe();
    }
  }

  checkLoginStatus(): void {
    this.isLoggedIn = this.loginService.isLoggedIn();
    
    if (this.isLoggedIn) {
      const userData = this.authService.getUserData();
      this.userName = userData ? userData.nombre : 'Usuario';
    }
  }

  login() {
    this.router.navigate(['/admin/login']);
  }

  logout() {
    this.loginService.logout();
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/admin/login']);
  }
}
