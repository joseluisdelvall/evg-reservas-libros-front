import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Pedido } from 'src/app/models/pedido.model';
import { PedidosService } from 'src/app/services/pedidos.service';

// Importación para jQuery y DataTables
declare var $: any;

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent implements OnInit, OnDestroy, AfterViewInit {
  isLoading: boolean = false;
  dtOptions: any = {};
  private currentTable: any = null;
  pedidos: Pedido[] = [];

  constructor(
    private pedidosService: PedidosService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.configurarDataTable();
  }

  ngAfterViewInit(): void {
    this.cargarPedidos();
  }

  ngOnDestroy(): void {
    if (this.currentTable) {
      this.currentTable.destroy();
      this.currentTable = null;
    }
  }

  private configurarDataTable(): void {
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

  cargarPedidos(): void {
    this.isLoading = true;
    
    // Destruir la tabla actual si existe
    if (this.currentTable) {
      this.currentTable.destroy();
      this.currentTable = null;
    }

    $('#tablaPedidos tbody').hide();
    this.pedidos = []; // Limpiar los datos actuales

    this.pedidosService.getPedidos().subscribe({
      next: (data: Pedido[]) => {
        this.pedidos = data;
        setTimeout(() => {
          this.inicializarTablaPedidos();
        }, 0);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar los pedidos:', error);
        this.toastr.error('Error al cargar los pedidos', 'Error');
        this.isLoading = false;
      }
    });
  }

  private inicializarTablaPedidos(): void {
    if (!this.pedidos.length) return;

    const tableElement = $('#tablaPedidos');
    if (tableElement.length === 0) return;

    // Destruir la tabla anterior si existe
    if (this.currentTable) {
      this.currentTable.destroy();
      this.currentTable = null;
    }

    // Ocultar solo el cuerpo de la tabla durante la carga
    $('#tablaPedidos tbody').hide();

    this.currentTable = tableElement.DataTable({
      ...this.dtOptions,
      data: this.pedidos,
      columns: [
        { 
          data: null,
          render: (data: any, type: any, row: Pedido) => {
            return `
              <div class="text-center">
                <button class="btn btn-link btn-sm ver-btn" title="Ver detalles">
                  <i class="fas fa-eye text-primary"></i>
                </button>
                <button class="btn btn-link btn-sm editar-btn" title="Editar">
                  <i class="fas fa-edit text-warning"></i>
                </button>
                <button class="btn btn-link btn-sm eliminar-btn" title="Eliminar">
                  <i class="fas fa-trash text-danger"></i>
                </button>
              </div>
            `;
          },
          orderable: false
        },
        { 
          data: 'fecha',
          render: (data: any) => {
            return data ? new Date(data).toLocaleDateString('es-ES') : '';
          }
        },
        {
          data: 'editorial',
          render: (data: any) => {
            return data ? data.nombre : '';
          }
        },
        {
          data: 'libros',
          render: (data: any) => {
            return data && Array.isArray(data) ? data.reduce((sum: number, item: any) => sum + (parseInt(item.cantidad, 10) || 0), 0) : 0;
          }
        },
        {
          data: 'estado',
          render: (data: boolean) => {
            const color = data ? 'green' : 'red';
            const texto = data ? 'Activo' : 'Inactivo';
            return `
              <div class="d-flex align-items-center">
                <svg width="16" height="16" class="me-2">
                  <circle cx="8" cy="8" r="6" fill="${color}" />
                </svg>
                ${texto}
              </div>
            `;
          }
        }
      ]
    });

    // Mostrar el cuerpo de la tabla una vez que se ha inicializado
    $('#tablaPedidos tbody').show();
  }
}
