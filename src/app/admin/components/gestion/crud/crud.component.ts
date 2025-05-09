import { Component, OnChanges, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalOptions } from '../../shared/modal-content/models/modal-options';
import { ToastrService } from 'ngx-toastr';
import { Libro } from 'src/app/models/libro.model';
import { Editorial } from 'src/app/models/editorial.model';
import { CrudService } from 'src/app/services/crud.service';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-crud',
  templateUrl: './crud.component.html',
  styleUrls: ['./crud.component.css']
})
export class CrudComponent implements OnInit, OnDestroy {
  modo: 'libros' | 'editoriales' | null = null;
  editorialSeleccionadaId: string | null = null;
  libroSeleccionadoId: string | null = null;

  // DataTables
  dtOptions: DataTables.Settings = {};
  dtOptionsEditoriales: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  dtTriggerEditoriales: Subject<any> = new Subject<any>();

  // nuevoModalOptions
  nuevoModalOptions!: ModalOptions;

  libros: Libro[] = [];
  editorialesA: Editorial[] = [];

  // Variables para controlar si las tablas ya se han renderizado
  private librosTableInitialized = false;
  private editorialesTableInitialized = false;

  constructor(private route: ActivatedRoute,
    private crudService: CrudService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    // Configuración de DataTables para libros
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true,
      language: {
        url: '//cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json'
      },
      responsive: true
    };

    // Configuración de DataTables para editoriales
    this.dtOptionsEditoriales = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true,
      language: {
        url: '//cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json'
      },
      responsive: true
    };

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

  ngOnDestroy(): void {
    // Desuscribirse para evitar pérdidas de memoria
    this.dtTrigger.unsubscribe();
    this.dtTriggerEditoriales.unsubscribe();
  }

  cargarTable(): void {
    if (this.modo === 'libros') {
      this.crudService.getLibros().subscribe({
        next: (data: Libro[]) => {
          this.libros = data;
          console.log('Libros:', this.libros);
          
          // Renderizar la tabla
          if (!this.librosTableInitialized) {
            // Primera carga - inicializar
            this.librosTableInitialized = true;
            this.dtTrigger.next(null);
          } else {
            // Recargar la tabla existente
            this.rerenderLibrosTable();
          }
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
          
          // Renderizar la tabla
          if (!this.editorialesTableInitialized) {
            // Primera carga - inicializar
            this.editorialesTableInitialized = true;
            this.dtTriggerEditoriales.next(null);
          } else {
            // Recargar la tabla existente
            this.rerenderEditorialesTable();
          }
        },
        error: (error) => {
          console.error('Error al cargar las editoriales:', error);
          this.toastr.error('Error al cargar las editoriales', 'Error');
        }
      });
    }
  }
  
  // Métodos para recargar las tablas
  rerenderLibrosTable(): void {
    // Destruir la tabla actual
    $('#tablaLibros').DataTable().destroy();
    
    // Volver a renderizar
    setTimeout(() => {
      this.dtTrigger.next(null);
    });
  }
  
  rerenderEditorialesTable(): void {
    // Destruir la tabla actual
    $('#tablaEditoriales').DataTable().destroy();
    
    // Volver a renderizar
    setTimeout(() => {
      this.dtTriggerEditoriales.next(null);
    });
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
    if (this.modo === 'libros' && this.librosTableInitialized) {
      this.rerenderLibrosTable();
    } else if (this.modo === 'editoriales' && this.editorialesTableInitialized) {
      this.rerenderEditorialesTable();
    } else {
      this.cargarTable();
    }
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
