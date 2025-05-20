import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-aside',
  templateUrl: './aside.component.html',
  styleUrls: ['./aside.component.css']
})
export class AsideComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Expandir el menú de gestión automáticamente cuando estamos en rutas bajo ese menú
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.url;
      if (url.includes('crud/') || url.includes('asignar-libros-cursos')) {
        setTimeout(() => {
          const gestionSubmenu = document.getElementById('gestionSubmenu');
          if (gestionSubmenu && !gestionSubmenu.classList.contains('show')) {
            const gestionLink = document.querySelector('[href="#gestionSubmenu"]');
            (gestionLink as HTMLElement)?.click();
          }
        }, 100);
      }
    });
  }

}
