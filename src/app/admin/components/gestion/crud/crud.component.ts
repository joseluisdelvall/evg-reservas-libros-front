import { Component, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalOptions } from '../../shared/modal-content/models/modal-options';
import { ToastrService } from 'ngx-toastr';
import { Libro } from 'src/app/models/libro.model';
import { Editorial } from 'src/app/models/editorial.model';
import { CrudService } from 'src/app/services/crud.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crud',
  templateUrl: './crud.component.html',
  styleUrls: ['./crud.component.css']
})
export class CrudComponent implements OnInit {
  modo: 'libros' | 'editoriales' | null = null;
  editorialSeleccionadaId: string | null = null;
  libroSeleccionadoId: string | null = null;

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
          console.log('Libros:', this.libros);
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
          console.log('Editoriales:', this.editorialesA);
        },
        error: (error) => {
          console.error('Error al cargar las editoriales:', error);
          this.toastr.error('Error al cargar las editoriales', 'Error');
        }
      });
    }
  }

  seleccionarEditorial(editorial: Editorial): void {
    this.editorialSeleccionadaId = editorial.idEditorial || null;
  }

  seleccionarLibro(libro: Libro): void {
    if (libro.id !== undefined) {
      this.libroSeleccionadoId = libro.id.toString();
      console.log('Libro seleccionado ID:', this.libroSeleccionadoId);
    } else {
      this.libroSeleccionadoId = null;
      console.error('El libro seleccionado no tiene ID');
    }
  }

  getIdEntidadSeleccionada(): string | null {
    return this.modo === 'libros' ? this.libroSeleccionadoId : this.editorialSeleccionadaId;
  }

  reloadTable(): void {
    this.cargarTable();
    console.log(this.editorialesA);
  }

  toggleEditorialEstado(editorial: Editorial, event: Event): void {
    event.stopPropagation(); // Previene que se activen otros eventos de clic
    
    if (!editorial.idEditorial) {
      this.toastr.error('No se pudo cambiar el estado: ID no encontrado', 'Error');
      return;
    }
    
    // Determinar el nuevo estado (inverso al actual)
    const nuevoEstado = !editorial.estado;
    
    // Mostrar confirmación con SweetAlert2
    Swal.fire({
      title: 'Confirmar cambio de estado',
      html: `¿Estás seguro de cambiar el estado de <strong>${editorial.nombre}</strong> a <strong>${nuevoEstado ? 'ACTIVO' : 'INACTIVO'}</strong>?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Realizar el cambio solo si se confirma
        this.crudService.toggleEditorialEstado(editorial.idEditorial!).subscribe({
          next: (editorialActualizada) => {
            // Actualizar la editorial en la lista local
            const index = this.editorialesA.findIndex(e => e.idEditorial === editorial.idEditorial);
            if (index !== -1) {
              this.editorialesA[index] = editorialActualizada;
            }
            
            this.toastr.success(
              `Estado cambiado a ${editorialActualizada.estado ? 'Activo' : 'Inactivo'}`, 
              'Éxito'
            );
          },
          error: (error) => {
            console.error('Error al cambiar el estado:', error);
            let errorMsg = 'Error al cambiar el estado';
            
            // Extraer mensaje de error más específico si está disponible
            if (error.error && error.error.message) {
              errorMsg = error.error.message;
            } else if (error.message) {
              errorMsg = error.message;
            }
            
            this.toastr.error(errorMsg, 'Error');
            
            // Recargar datos para asegurar que tenemos el estado correcto
            this.cargarTable();
          }
        });
      }
    });
  }

  toggleLibroEstado(libro: Libro, event: Event): void {
    event.stopPropagation(); // Previene que se activen otros eventos de clic
    
    if (libro.id === undefined) {
      this.toastr.error('No se pudo cambiar el estado: ID no encontrado', 'Error');
      return;
    }
    
    // Determinar el nuevo estado (inverso al actual)
    const nuevoEstado = !libro.estado;
    const libroId = libro.id; // Store the ID so TypeScript knows it's not undefined in the closure
    
    // Mostrar confirmación con SweetAlert2
    Swal.fire({
      title: 'Confirmar cambio de estado',
      html: `¿Estás seguro de cambiar el estado de <strong>${libro.nombre}</strong> a <strong>${nuevoEstado ? 'ACTIVO' : 'INACTIVO'}</strong>?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Realizar el cambio solo si se confirma
        this.crudService.toggleLibroEstado(libroId.toString()).subscribe({
          next: (libroActualizado) => {
            // Actualizar el libro en la lista local
            const index = this.libros.findIndex(l => l.id === libroId);
            if (index !== -1) {
              this.libros[index] = libroActualizado;
            }
            
            this.toastr.success(
              `Estado cambiado a ${libroActualizado.estado ? 'Activo' : 'Inactivo'}`, 
              'Éxito'
            );
          },
          error: (error) => {
            console.error('Error al cambiar el estado:', error);
            let errorMsg = 'Error al cambiar el estado';
            
            // Extraer mensaje de error más específico si está disponible
            if (error.error && error.error.message) {
              errorMsg = error.error.message;
            } else if (error.message) {
              errorMsg = error.message;
            }
            
            this.toastr.error(errorMsg, 'Error');
            
            // Recargar datos para asegurar que tenemos el estado correcto
            this.cargarTable();
          }
        });
      }
    });
  }
}
