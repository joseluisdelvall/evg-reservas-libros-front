import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { ModalOptions } from 'src/app/admin/components/shared/modal-content/models/modal-options';
import { CrudService } from 'src/app/services/crud.service';
import { Editorial } from 'src/app/models/editorial.model';
import { Libro } from 'src/app/models/libro.model';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-ver',
  templateUrl: './modal-ver.component.html',
  styleUrls: ['./modal-ver.component.css']
})
export class ModalVerComponent implements OnInit, OnChanges {

  @Input() modo: 'libros' | 'editoriales' | null = null;
  @Input() idEntidad: string | null = null;
  @ViewChild('modalContent') modalContent!: ElementRef;
  @Output() estadoActualizado = new EventEmitter<void>();
  
  // verModalOptions
  verModalOptions!: ModalOptions;

  // Datos de la editorial y libro
  editorial: Editorial | null = null;
  libro: Libro | null = null;
  
  constructor(
    private crudService: CrudService,
    private toastr: ToastrService
  ) { }
  
  ngOnInit(): void {
    // Escuchar el evento de apertura del modal
    document.addEventListener('shown.bs.modal', (event: any) => {
      // Verificar si el modal abierto es el nuestro
      if (this.modo && event.target.id === 'ver' + this.modo) {
        this.recargarDatos();
      }
    });
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modo'] && changes['modo'].currentValue) {
      this.verModalOptions = {
        title: 'Detalles de ' + (this.modo === 'libros' ? 'libro' : 'editorial'),
        modalId: 'ver' + this.modo,
        size: 'xl',
        okButton: {
          text: 'Cerrar',
        }
      };
    }

    if (changes['idEntidad'] && changes['idEntidad'].currentValue) {
      if (this.modo === 'editoriales') {
        this.cargarDatosEditorial(changes['idEntidad'].currentValue);
      } else if (this.modo === 'libros') {
        this.cargarDatosLibro(changes['idEntidad'].currentValue);
      }
    }
  }

  cargarDatosEditorial(id: string): void {
    this.crudService.getEditorialById(id).subscribe({
      next: (editorial: Editorial) => {
        this.editorial = editorial;
      },
      error: (err) => {
        console.error('Error al cargar los datos de la editorial:', err);
      }
    });
  }
  
  cargarDatosLibro(id: string): void {
    this.crudService.getLibroById(id).subscribe({
      next: (libro: Libro) => {
        this.libro = libro;
      },
      error: (err) => {
        console.error('Error al cargar los datos del libro:', err);
      }
    });
  }

  // Método para recargar los datos cuando el modal se muestra
  recargarDatos(): void {
    if (this.idEntidad) {
      if (this.modo === 'editoriales') {
        this.cargarDatosEditorial(this.idEntidad);
      } else if (this.modo === 'libros') {
        this.cargarDatosLibro(this.idEntidad);
      }
    }
  }

  // Método para cambiar el estado desde el modal de visualización
  toggleEstado(): void {
    if (!this.editorial || !this.editorial.idEditorial) {
      return;
    }

    // Determinar el nuevo estado (inverso al actual)
    const nuevoEstado = !this.editorial.estado;
    
    // Mostrar confirmación con SweetAlert2
    Swal.fire({
      title: 'Confirmar cambio de estado',
      html: `¿Estás seguro de cambiar el estado de <strong>${this.editorial.nombre}</strong> a <strong>${nuevoEstado ? 'ACTIVO' : 'INACTIVO'}</strong>?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Realizar el cambio solo si se confirma
        this.crudService.toggleEditorialEstado(this.editorial!.idEditorial!).subscribe({
          next: (editorialActualizada) => {
            // Actualizar la editorial en la vista
            this.editorial = editorialActualizada;
            
            // Emitir evento para actualizar la tabla
            this.estadoActualizado.emit();
            
            this.toastr.success(
              `Estado cambiado a ${editorialActualizada.estado ? 'Activo' : 'Inactivo'}`, 
              'Éxito'
            );
          },
          error: (error) => {
            console.error('Error al cambiar el estado:', error);
            this.toastr.error('Error al cambiar el estado', 'Error');
          }
        });
      }
    });
  }
}
