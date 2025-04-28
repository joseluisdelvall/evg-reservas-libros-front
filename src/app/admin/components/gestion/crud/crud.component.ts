import { Component, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalOptions } from '../../shared/modal-content/models/modal-options';
import { ToastrService } from 'ngx-toastr';
import { Libro } from 'src/app/models/libro.model';
import { Editorial } from 'src/app/models/editorial.model';
import { CrudService } from 'src/app/services/crud.service';

@Component({
  selector: 'app-crud',
  templateUrl: './crud.component.html',
  styleUrls: ['./crud.component.css']
})
export class CrudComponent implements OnInit {
  modo: 'libros' | 'editoriales' | null = null;

  // nuevoModalOptions
  nuevoModalOptions!: ModalOptions;

  libros: Libro[] = [];
  editorialesA: Editorial[] = [];

  constructor(private route: ActivatedRoute,
    private crudService: CrudService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    // Subscribe to the route parameters
    this.route.paramMap.subscribe(params => {
      const modoParam = params.get('modo');
      if (modoParam === 'libros' || modoParam === 'editoriales') {
        this.modo = modoParam;
        this.cargarTable();
      } else {
        this.modo = null; // Handle invalid mode if necessary
      }
    });
  }

  cargarTable(): void {
    if (this.modo === 'libros') {
      this.crudService.getLibros().subscribe({
        next: (data: Libro[]) => {
          this.libros = data;
          console.log('Editoriales:', this.libros);
        },
        error: (error) => {
          console.error('Error al cargar los libros:', error);
          this.toastr.error('Error al cargar los libros', 'Error');
        }
      });
    } else if (this.modo === 'editoriales') {
      this.crudService.getEditoriales().subscribe({
        next: (data: Editorial[]) => {
          this.editorialesA = data;
        },
        error: (error) => {
          console.error('Error al cargar las editoriales:', error);
          this.toastr.error('Error al cargar las editoriales', 'Error');
        }
      });
    }
  }

}
