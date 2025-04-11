import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/admin/services/login.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  enviroment = environment;

  constructor(private loginService: LoginService,
              private router: Router
  ) { }

  ngOnInit(): void {
      if (this.loginService.isLoggedIn()) {
        this.router.navigate(['/reservas']);
      }
  }

}
