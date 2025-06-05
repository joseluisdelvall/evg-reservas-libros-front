import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CrudService } from '../../../../services/crud.service';
import { Libro } from '../../../../models/libro.model';

interface LibroStock {
  isbn: string;
  titulo: string;
  editorial: string;
  etapa: string;
  stock: number;
}

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class StockComponent implements OnInit {
  libros: LibroStock[] = [];
  librosFiltrados: LibroStock[] = [];
  filtroBusqueda: string = '';
  cargando: boolean = true;
  mostrarSoloConStock: boolean = true;

  constructor(
    private crudService: CrudService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.cargarLibros();
  }

  cargarLibros(): void {
    this.cargando = true;
    
    this.crudService.getLibros().subscribe({
      next: (libros: any[]) => {
        this.libros = libros.map(libro => ({
          isbn: libro.isbn || '',
          titulo: libro.nombre || '',
          editorial: libro.editorial?.nombre || '',
          etapa: libro.etapa?.nombre || 'Sin etapa',
          stock: libro.stock || 0
        }));
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error al cargar los libros:', error);
        this.toastr.error('Error al cargar los libros. Por favor, intente nuevamente.', 'Error');
        this.cargando = false;
      }
    });
  }

  toggleFiltroStock(): void {
    this.mostrarSoloConStock = !this.mostrarSoloConStock;
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let librosFiltrados = [...this.libros];

    // Aplicar filtro de stock
    if (this.mostrarSoloConStock) {
      librosFiltrados = librosFiltrados.filter(libro => libro.stock > 0);
    }
    // Si mostrarSoloConStock es false, no se filtra por stock (se muestran todos)

    // Aplicar filtro de búsqueda
    if (this.filtroBusqueda.trim()) {
      const busqueda = this.filtroBusqueda.toLowerCase().trim();
      if (busqueda === 'con stock') {
        librosFiltrados = librosFiltrados.filter(libro => libro.stock > 0);
      } else if (busqueda === 'sin stock') {
        librosFiltrados = librosFiltrados.filter(libro => libro.stock === 0);
      } else {
        librosFiltrados = librosFiltrados.filter(libro => 
          libro.isbn.toLowerCase().includes(busqueda) ||
          libro.titulo.toLowerCase().includes(busqueda) ||
          libro.editorial.toLowerCase().includes(busqueda) ||
          libro.etapa.toLowerCase().includes(busqueda) ||
          libro.stock.toString().includes(busqueda)
        );
      }
    }

    this.librosFiltrados = librosFiltrados;
  }

  filtrarLibros(): void {
    this.aplicarFiltros();
  }

  getStockClass(libro: LibroStock): string {
    if (libro.stock === 0) {
      return 'stock-bajo';
    } else if (libro.stock <= 2) {
      return 'stock-medio';
    }
    return 'stock-normal';
  }

  getStockIcon(libro: LibroStock): string {
    if (libro.stock === 0) {
      return 'fa-exclamation-circle';
    } else if (libro.stock <= 2) {
      return 'fa-exclamation-triangle';
    }
    return 'fa-check-circle';
  }
} 