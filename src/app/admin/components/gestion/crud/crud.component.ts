import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalOptions } from '../../shared/modal-content/models/modal-options';
import { ToastrService } from 'ngx-toastr';
import { Libro } from 'src/app/models/libro.model';
import { Editorial } from 'src/app/models/editorial.model';
import { CrudService } from 'src/app/services/crud.service';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from 'src/app/shared/loading-spinner/loading-spinner.component';

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
  isLoadingTable: boolean = false;
  dtOptions: any = {};
  // Referencias a las tablas jQuery
  private currentTable: any = null;
  
  // Estado del filtro actual
  filtroEstado: 'todos' | 'activo' | 'inactivo' = 'todos';

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
    this.route.paramMap.subscribe(params => {
      const modoParam = params.get('modo');
      if (modoParam === 'libros' || modoParam === 'editoriales') {
        this.modo = modoParam;
        // Limpiar los datos anteriores
        this.libros = [];
        this.editorialesA = [];
        
        // Limpiar filtros anteriores si existen
        this.limpiarFiltros();
        
        // Añadir función personalizada de búsqueda
        this.configurarBusquedaPersonalizada();
        
        // Cargar los nuevos datos
        this.cargarTable();
      } else {
        this.modo = null;
      }
    });

    this.dtOptions = {
      order: [[1, 'desc']],
      autoWidth: false,
      pagingType: 'simple_numbers',
      processing: true,
      destroy: true,
      deferRender: true,
      language: {
        url: '//cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json',
        paginate: {
          first: '<i class="fas fa-angle-double-left"></i>',
          previous: '<i class="fas fa-angle-left"></i>',
          next: '<i class="fas fa-angle-right"></i>',
          last: '<i class="fas fa-angle-double-right"></i>'
        },
        search: 'Buscar:'
      },
      search: {
        smart: true,
        caseInsensitive: true,
        regex: false
      }
    };
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
    this.isLoading = true;
    
    // Destruir la tabla actual si existe
    if (this.currentTable) {
      this.currentTable.destroy();
      this.currentTable = null;
    }
    
    // Restablecer el filtro a "todos" al cambiar de vista
    this.filtroEstado = 'todos';

    // Ocultar el cuerpo de la tabla correspondiente durante la carga
    if (this.modo === 'libros') {
      $('#tablaLibros tbody').hide();
      this.libros = []; // Limpiar los datos actuales
      this.cargarLibros();
    } else if (this.modo === 'editoriales') {
      $('#tablaEditoriales tbody').hide();
      this.editorialesA = []; // Limpiar los datos actuales
      this.cargarEditoriales();
    }
  }

  cargarLibros(): void {
    this.isLoadingTable = true; // Show spinner
    this.crudService.getLibros().subscribe({
      next: (data: Libro[]) => {
        this.libros = data;

        if (this.currentTable) {
          this.currentTable.clear();
          this.currentTable.rows.add(this.libros);
          this.currentTable.draw(); // Ensure the table redraws
        } else if (this.modo === 'libros') {
          setTimeout(() => {
            this.inicializarTablaLibros();
          }, 0);
        }
        this.isLoadingTable = false; // Hide spinner
      },
      error: (error) => {
        console.error('Error al cargar los libros:', error);
        this.toastr.error('Error al cargar los libros', 'Error');
        this.isLoadingTable = false; // Hide spinner
      }
    });
  }

  cargarEditoriales(): void {
    this.isLoadingTable = true; // Show spinner
    this.crudService.getEditoriales().subscribe({
      next: (data: Editorial[]) => {
        this.editorialesA = data;

        if (this.currentTable) {
          this.currentTable.clear();
          this.currentTable.rows.add(this.editorialesA);
          this.currentTable.draw(); // Ensure the table redraws
        } else if (this.modo === 'editoriales') {
          setTimeout(() => {
            this.inicializarTablaEditoriales();
          }, 0);
        }
        this.isLoadingTable = false; // Hide spinner
      },
      error: (error) => {
        console.error('Error al cargar las editoriales:', error);
        this.toastr.error('Error al cargar las editoriales', 'Error');
        this.isLoadingTable = false; // Hide spinner
      }
    });
  }

  inicializarTablaLibros(): void {
    if (!this.libros.length || this.modo !== 'libros') return;

    const tableElement = $('#tablaLibros');
    if (tableElement.length === 0) return;

    // Destruir la tabla anterior si existe
    if (this.currentTable) {
      this.currentTable.destroy();
      this.currentTable = null;
    }

    // Ocultar solo el cuerpo de la tabla durante la carga
    $('#tablaLibros tbody').hide();

    this.currentTable = tableElement.DataTable({
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
            const estadoTexto = row.estado ? 'activo' : 'inactivo';
            return `
              <div class="text-center">
                <svg width="16" height="16" class="puntero toggle-estado" data-id="${row.id}">
                  <circle cx="8" cy="8" r="6" fill="${color}" />
                </svg>
                <span class="d-none">${estadoTexto}</span>
              </div>
            `;
          }
        }
      ],
      language: {
        url: '//cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json',
        paginate: {
          first: '<i class="fas fa-angle-double-left"></i>',
          previous: '<i class="fas fa-angle-left"></i>',
          next: '<i class="fas fa-angle-right"></i>',
          last: '<i class="fas fa-angle-double-right"></i>'
        }
      },
      pagingType: 'simple_numbers',
      pageLength: 10,
      processing: true,
      destroy: true,
      autoWidth: false,
      scrollX: true,
      stateSave: true,
      deferRender: true,
      dom: '<"top d-flex justify-content-between mb-3"lf>rt<"bottom d-flex justify-content-between"ip>',
      initComplete: (settings: any, json: any) => {
        this.currentTable.columns.adjust();
        // Mostrar el cuerpo de la tabla cuando esté completamente inicializada
        $('#tablaLibros tbody').show();
        
        // Añadir clases para mejorar el estilo
        $('.dataTables_paginate').addClass('pagination-container');
        $('.dataTables_length, .dataTables_filter').addClass('dt-custom-control');
        $('.paginate_button').addClass('btn btn-sm');
        $('.paginate_button.current').addClass('btn-primary');
        $('.paginate_button:not(.current)').addClass('btn-outline-primary');
      },
      drawCallback: () => {
        this.currentTable.columns.adjust();
        
        // Actualizar las clases al redibujar
        $('.paginate_button.current').addClass('btn-primary');
        $('.paginate_button:not(.current)').addClass('btn-outline-primary');
        
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
    if (!this.editorialesA.length || this.modo !== 'editoriales') return;

    const tableElement = $('#tablaEditoriales');
    if (tableElement.length === 0) return;

    // Destruir la tabla anterior si existe
    if (this.currentTable) {
      this.currentTable.destroy();
      this.currentTable = null;
    }

    // Ocultar solo el cuerpo de la tabla durante la carga
    $('#tablaEditoriales tbody').hide();

    this.currentTable = tableElement.DataTable({
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
            const estadoTexto = row.estado ? 'activo' : 'inactivo';
            return `
              <div class="text-center">
                <svg width="16" height="16" class="puntero toggle-estado" data-id="${row.idEditorial}">
                  <circle cx="8" cy="8" r="6" fill="${color}" />
                </svg>
                <span class="d-none">${estadoTexto}</span>
              </div>
            `;
          }
        }
      ],
      language: {
        url: '//cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json',
        paginate: {
          first: '<i class="fas fa-angle-double-left"></i>',
          previous: '<i class="fas fa-angle-left"></i>',
          next: '<i class="fas fa-angle-right"></i>',
          last: '<i class="fas fa-angle-double-right"></i>'
        }
      },
      pagingType: 'simple_numbers',
      pageLength: 10,
      processing: true,
      destroy: true,
      autoWidth: false,
      scrollX: true,
      stateSave: true,
      deferRender: true,
      dom: '<"top d-flex justify-content-between mb-3"lf>rt<"bottom d-flex justify-content-between"ip>',
      initComplete: (settings: any, json: any) => {
        this.currentTable.columns.adjust();
        // Mostrar el cuerpo de la tabla cuando esté completamente inicializada
        $('#tablaEditoriales tbody').show();
        
        // Añadir clases para mejorar el estilo
        $('.dataTables_paginate').addClass('pagination-container');
        $('.dataTables_length, .dataTables_filter').addClass('dt-custom-control');
        $('.paginate_button').addClass('btn btn-sm');
        $('.paginate_button.current').addClass('btn-primary');
        $('.paginate_button:not(.current)').addClass('btn-outline-primary');
      },
      drawCallback: () => {
        this.currentTable.columns.adjust();
        
        // Actualizar las clases al redibujar
        $('.paginate_button.current').addClass('btn-primary');
        $('.paginate_button:not(.current)').addClass('btn-outline-primary');
        
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
    this.isLoadingTable = true; // Show spinner
    if (this.modo === 'libros') {
      this.cargarLibros();
    } else if (this.modo === 'editoriales') {
      this.cargarEditoriales();
    }
  }

  toggleEditorialEstado(editorial: Editorial, event: Event): void {
    event.stopPropagation(); // Prevent other click events

    if (!editorial.idEditorial) {
      this.toastr.error('No se pudo cambiar el estado: ID no encontrado', 'Error');
      return;
    }

    const nuevoEstado = !editorial.estado;
    const editorialId = editorial.idEditorial.toString(); // Ensure ID is a string

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
        this.crudService.toggleEditorialEstado(editorialId).subscribe({
          next: (editorialActualizada) => {
            const index = this.editorialesA.findIndex(e => e.idEditorial === editorial.idEditorial);
            if (index !== -1) {
              this.editorialesA[index] = editorialActualizada;
            }

            this.toastr.success(
              `Estado cambiado a ${editorialActualizada.estado ? 'Activo' : 'Inactivo'}`,
              'Éxito'
            );

            if (this.currentTable) {
              this.currentTable.clear();
              this.currentTable.rows.add(this.editorialesA);
              this.currentTable.draw();
            }
          },
          error: (error) => {
            console.error('Error al cambiar el estado:', error);
            let errorMsg = 'Error al cambiar el estado';

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
    event.stopPropagation(); // Prevent other click events

    if (libro.id === undefined) {
      this.toastr.error('No se pudo cambiar el estado: ID no encontrado', 'Error');
      return;
    }

    const nuevoEstado = !libro.estado;
    const libroId = libro.id;

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
        this.crudService.toggleLibroEstado(libroId.toString()).subscribe({
          next: (libroActualizado) => {
            const index = this.libros.findIndex(l => l.id === libroId);
            if (index !== -1) {
              this.libros[index] = libroActualizado;
            }

            this.toastr.success(
              `Estado cambiado a ${libroActualizado.estado ? 'Activo' : 'Inactivo'}`,
              'Éxito'
            );

            if (this.currentTable) {
              this.currentTable.clear();
              this.currentTable.rows.add(this.libros);
              this.currentTable.draw();
            }
          },
          error: (error) => {
            console.error('Error al cambiar el estado:', error);
            let errorMsg = 'Error al cambiar el estado';

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

  filtrarPorEstado(estado: 'todos' | 'activo' | 'inactivo'): void {
    if (!this.currentTable) return;
    
    // Limpiar filtros anteriores pero mantener la búsqueda personalizada
    this.currentTable.search('').columns().search('').draw();
    
    // Limpiar filtros de estado previos
    if ($.fn.dataTable.ext.search.length > 1) {
      // Mantener solo el primer filtro (búsqueda personalizada)
      $.fn.dataTable.ext.search.splice(1);
    }
    
    if (estado === 'todos') {
      // No aplicar filtro, mostrar todos
      this.currentTable.draw();
      return;
    }
    
    // Aplicar filtro personalizado
    $.fn.dataTable.ext.search.push((settings: any, data: any, dataIndex: any) => {
      const rowData = this.currentTable.row(dataIndex).data();
      
      if (estado === 'activo') {
        return rowData.estado === true;
      } else if (estado === 'inactivo') {
        return rowData.estado === false;
      }
      
      return true; // Por defecto mostrar todas las filas
    });
    
    this.currentTable.draw();
  }

  // Método para limpiar filtros anteriores de DataTables
  limpiarFiltros(): void {
    // Eliminar cualquier filtro personalizado específico para estados
    // pero mantener el filtro de búsqueda personalizada
    if ($.fn.dataTable.ext.search.length > 1) {
      // Si hay más de un filtro, dejar solo el primero (búsqueda personalizada)
      while ($.fn.dataTable.ext.search.length > 1) {
        $.fn.dataTable.ext.search.pop();
      }
    } else if ($.fn.dataTable.ext.search.length === 0) {
      // Si no hay filtros, no hacer nada
      return;
    }
  }

  // Método para configurar búsqueda personalizada
  configurarBusquedaPersonalizada(): void {
    $.fn.dataTable.ext.search.push((settings: any, data: any, dataIndex: any) => {
      const searchValue = $('.dataTables_filter input').val() as string;
      
      // Si no hay texto de búsqueda, mostrar todas las filas
      if (!searchValue || searchValue.trim().length === 0) {
        return true;
      }
      
      // Si el valor de búsqueda es exactamente "activo" o "inactivo"
      if (searchValue.trim().toLowerCase() === 'activo' || searchValue.trim().toLowerCase() === 'inactivo') {
        const rowData = this.currentTable.row(dataIndex).data();
        const estadoFila = rowData.estado ? 'activo' : 'inactivo';
        
        return estadoFila === searchValue.trim().toLowerCase();
      }
      
      // Para otras búsquedas, usar el comportamiento por defecto
      return true;
    });
  }

  /**
   * Cambia el estado del filtro y aplica el filtrado correspondiente
   */
  cambiarFiltroEstado(estado: 'todos' | 'activo' | 'inactivo'): void {
    this.filtroEstado = estado;
    this.filtrarPorEstado(estado);
  }
  
  /**
   * Maneja el toggle del switch
   */
  toggleFiltroEstado(event: any): void {
    const isChecked = event.target.checked;
    
    if (isChecked) {
      // Si se marca, mostrar todos
      this.cambiarFiltroEstado('todos');
    } else {
      // Si se desmarca, mostrar solo activos
      this.cambiarFiltroEstado('activo');
    }
  }
}
