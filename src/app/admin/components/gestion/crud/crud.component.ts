import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalOptions } from '../../shared/modal-content/models/modal-options';
import { ToastrService } from 'ngx-toastr';
import { Libro } from 'src/app/models/libro.model';
import { Editorial } from 'src/app/models/editorial.model';
import { CrudService } from 'src/app/services/crud.service';
import Swal from 'sweetalert2';

// Importación para jQuery y DataTables
declare var $: any;

@Component({
  selector: 'app-crud',
  templateUrl: './crud.component.html',
  styleUrls: ['./crud.component.css']
})
export class CrudComponent implements OnInit, OnDestroy, AfterViewInit {
  modo: 'libros' | 'editoriales' | null = null;
  editorialSeleccionadaId: string | null = null;
  libroSeleccionadoId: string | null = null;
  isLoading: boolean = false;

  // Referencias a las tablas jQuery
  private currentTable: any = null;

  // nuevoModalOptions
  nuevoModalOptions!: ModalOptions;

  libros: Libro[] = [];
  editorialesA: Editorial[] = [];

  constructor(
    private route: ActivatedRoute,
    private crudService: CrudService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    // Subscribe to the route parameters
    this.route.paramMap.subscribe(params => {
      const modoParam = params.get('modo');
      if (modoParam === 'libros' || modoParam === 'editoriales') {
        // Destruir la tabla actual si existe
        if (this.currentTable) {
          this.currentTable.destroy();
          this.currentTable = null;
        }
        
        this.modo = modoParam;
        // Ocultar la tabla correspondiente antes de cargar
        if (this.modo === 'libros') {
          $('#tablaLibros').hide();
        } else {
          $('#tablaEditoriales').hide();
        }
        
        setTimeout(() => {
          this.cargarTable();
        }, 100);
      } else {
        this.modo = null;
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.modo) {
      this.cargarTable();
    }
  }

  ngOnDestroy(): void {
    if (this.currentTable) {
      this.currentTable.destroy();
      this.currentTable = null;
    }
  }

  cargarTable(): void {
    if (this.modo === 'libros') {
      this.cargarLibros();
    } else if (this.modo === 'editoriales') {
      this.cargarEditoriales();
    }
  }

  cargarLibros(): void {
    this.isLoading = true;
    
    // Asegurarse de que la tabla anterior se destruya
    if (this.currentTable) {
      this.currentTable.destroy();
      this.currentTable = null;
    }

    this.crudService.getLibros().subscribe({
      next: (data: Libro[]) => {
        this.libros = data;
        this.inicializarTablaLibros();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar los libros:', error);
        this.toastr.error('Error al cargar los libros', 'Error');
        this.isLoading = false;
      }
    });
  }

  cargarEditoriales(): void {
    this.isLoading = true;
    
    // Asegurarse de que la tabla anterior se destruya
    if (this.currentTable) {
      this.currentTable.destroy();
      this.currentTable = null;
    }

    this.crudService.getEditoriales().subscribe({
      next: (data: Editorial[]) => {
        this.editorialesA = data;
        this.inicializarTablaEditoriales();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar las editoriales:', error);
        this.toastr.error('Error al cargar las editoriales', 'Error');
        this.isLoading = false;
      }
    });
  }

  inicializarTablaLibros(): void {
    if (!this.libros.length) return;

    this.currentTable = $('#tablaLibros').DataTable({
      data: this.libros,
      columns: [
        { 
          data: null,
          render: (data: any, type: any, row: Libro) => {
            return `
              <div class="text-center">
                <i class="fas fa-edit puntero" style="color: blue;" data-bs-toggle="modal" data-bs-target="#editarlibros"></i>
                <i class="fas fa-eye ms-2 puntero" style="color: rgb(87, 87, 87);" data-bs-toggle="modal" data-bs-target="#verlibros"></i>
              </div>
            `;
          },
          width: '100px'
        },
        { 
          data: 'nombre',
          width: '25%'
        },
        { 
          data: 'isbn',
          width: '15%'
        },
        { 
          data: 'editorial',
          width: '20%',
          render: (data: any, type: any, row: Libro) => {
            return row.editorial ? row.editorial.nombre : '';
          }
        },
        { 
          data: 'precio',
          width: '15%'
        },
        { 
          data: 'estado',
          width: '100px',
          render: (data: any, type: any, row: Libro) => {
            const color = row.estado ? 'green' : 'red';
            return `
              <div class="text-center">
                <svg width="16" height="16" class="puntero toggle-estado" data-id="${row.id}">
                  <circle cx="8" cy="8" r="6" fill="${color}" />
                </svg>
              </div>
            `;
          }
        }
      ],
      language: {
        url: '//cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json'
      },
      responsive: true,
      pagingType: 'full_numbers',
      pageLength: 10,
      destroy: true,
      autoWidth: false,
      scrollX: true,
      drawCallback: () => {
        this.currentTable.columns.adjust();
        
        $('.fa-edit').off('click').on('click', (event: any) => {
          const rowData = this.currentTable.row($(event.currentTarget).closest('tr')).data();
          this.seleccionarLibro(rowData);
        });
        
        $('.fa-eye').off('click').on('click', (event: any) => {
          const rowData = this.currentTable.row($(event.currentTarget).closest('tr')).data();
          this.seleccionarLibro(rowData);
        });
        
        $('.toggle-estado').off('click').on('click', (event: any) => {
          const rowData = this.currentTable.row($(event.currentTarget).closest('tr')).data();
          this.toggleLibroEstado(rowData, event);
        });
      }
    });
  }

  inicializarTablaEditoriales(): void {
    if (!this.editorialesA.length) return;

    this.currentTable = $('#tablaEditoriales').DataTable({
      data: this.editorialesA,
      columns: [
        { 
          data: null,
          render: (data: any, type: any, row: Editorial) => {
            return `
              <div class="text-center">
                <i class="fas fa-edit puntero" style="color: blue;" data-bs-toggle="modal" data-bs-target="#editareditoriales"></i>
                <i class="fas fa-eye ms-2 puntero" style="color: rgb(87, 87, 87);" data-bs-toggle="modal" data-bs-target="#vereditoriales"></i>
              </div>
            `;
          },
          width: '100px'
        },
        { 
          data: 'nombre',
          width: '30%'
        },
        { 
          data: 'correos',
          width: '30%',
          render: (data: any, type: any, row: Editorial) => {
            return row.correos && row.correos.length > 0 ? row.correos[0] : '';
          }
        },
        { 
          data: 'telefonos',
          width: '20%',
          render: (data: any, type: any, row: Editorial) => {
            return row.telefonos && row.telefonos.length > 0 ? row.telefonos[0] : '';
          }
        },
        { 
          data: 'estado',
          width: '100px',
          render: (data: any, type: any, row: Editorial) => {
            const color = row.estado ? 'green' : 'red';
            return `
              <div class="text-center">
                <svg width="16" height="16" class="puntero toggle-estado" data-id="${row.idEditorial}">
                  <circle cx="8" cy="8" r="6" fill="${color}" />
                </svg>
              </div>
            `;
          }
        }
      ],
      language: {
        url: '//cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json'
      },
      responsive: true,
      pagingType: 'full_numbers',
      pageLength: 10,
      destroy: true,
      autoWidth: false,
      scrollX: true,
      drawCallback: () => {
        this.currentTable.columns.adjust();
        
        $('.fa-edit').off('click').on('click', (event: any) => {
          const rowData = this.currentTable.row($(event.currentTarget).closest('tr')).data();
          this.seleccionarEditorial(rowData);
        });
        
        $('.fa-eye').off('click').on('click', (event: any) => {
          const rowData = this.currentTable.row($(event.currentTarget).closest('tr')).data();
          this.seleccionarEditorial(rowData);
        });
        
        $('.toggle-estado').off('click').on('click', (event: any) => {
          const rowData = this.currentTable.row($(event.currentTarget).closest('tr')).data();
          this.toggleEditorialEstado(rowData, event);
        });
      }
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
    this.cargarTable();
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
            
            // Actualizar la tabla
            this.cargarEditoriales();
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
            
            // Actualizar la tabla
            this.cargarLibros();
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
          }
        });
      }
    });
  }
}
