import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  isLoggedIn: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.isLoggedIn = false; // Habrá que comprobar si esta iniciado sesion con el token y todo el rollo
  }

  login() {
    this.isLoggedIn = true;
  }

  logout() {
    this.isLoggedIn = false;
  }

}
