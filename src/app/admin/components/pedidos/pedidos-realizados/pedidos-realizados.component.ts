import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Editorial } from 'src/app/models/editorial.model';
import { Libro } from 'src/app/models/libro.model';
import { ModalOptions } from '../../shared/modal-content/models/modal-options';
import { PedidoService, EditorialConPedidos, PedidoEditorial, LibroPedidoDetalle } from 'src/app/services/pedido.service';

interface Pedido {
  idPedido: number;
  fecha: string;
  idEditorial: string;
  editorial?: Editorial;
  librosPedido?: LibroPedido[];
  estadoPedido?: 'Pendiente' | 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado';
  numLibros?: number;
  estado?: string;
}

interface LibroPedido {
  idLibro: number;
  libro?: Libro;
  unidades: number;
  unidadesRecibidas?: number;
  nombre?: string;
  isbn?: string;
  precio?: number;
  cantidadNuevaRecibida?: number; // Nueva propiedad para las unidades que se están recibiendo ahora
}

@Component({
  selector: 'app-pedidos-realizados',
  templateUrl: './pedidos-realizados.component.html',
  styleUrls: ['./pedidos-realizados.component.css']
})
export class PedidosRealizadosComponent implements OnInit {
  isLoading: boolean = false;
  isLoadingDetalles: boolean = false;

  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  pedidoSeleccionado: Pedido | null = null;

  // Editoriales
  todasEditoriales: Editorial[] = [];
  editorialesConPedidos: Editorial[] = [];
  editorialesFiltradas: Editorial[] = [];
  editorialSeleccionada: Editorial | null = null;

  // Búsquedas
  busquedaEditorial: string = '';
  busquedaPedido: string = '';

  // Opciones del modal
  modalOptions: ModalOptions = {
    title: 'Detalles del Pedido',
    modalId: 'detallePedidoModal',
    size: 'xl', // Ampliamos el modal para la nueva columna
    okButton: {
      text: 'Confirmar Recepción',
      action: () => this.confirmarRecepcionPedido(),
    },
    cancelButton: {
      text: 'Cerrar'
    }
  };

  constructor(
    private toastr: ToastrService,
    private pedidoService: PedidoService
  ) { }

  ngOnInit(): void {
    this.cargarEditorialesConPedidos();
  }

  cargarEditorialesConPedidos(): void {
    this.isLoading = true;
    
    this.pedidoService.getEditorialesConPedidos().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          // Convertir EditorialConPedidos a Editorial y mantener numPedidos
          this.editorialesConPedidos = response.data.map(item => ({
            idEditorial: item.idEditorial,
            nombre: item.nombre,
            numPedidos: item.numPedidos
          } as Editorial & { numPedidos: number }));
          
          this.filtrarEditoriales();
        } else {
          this.toastr.error('Error al cargar las editoriales', 'Error');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar editoriales con pedidos:', error);
        this.toastr.error('Error al conectar con el servidor', 'Error');
        this.isLoading = false;
      }
    });
  }

  seleccionarEditorial(editorial: Editorial): void {
    this.editorialSeleccionada = editorial;
    this.pedidoSeleccionado = null;
    this.busquedaPedido = '';
    this.cargarPedidosPorEditorial();
  }

  cargarPedidosPorEditorial(): void {
    if (!this.editorialSeleccionada?.idEditorial) {
      this.pedidosFiltrados = [];
      return;
    }

    this.isLoading = true;
    
    this.pedidoService.getPedidosPorEditorial(this.editorialSeleccionada.idEditorial).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          // Convertir PedidoEditorial a Pedido
          let pedidosTemp = response.data.map(pedidoData => ({
            idPedido: pedidoData.idPedido,
            fecha: pedidoData.fecha,
            idEditorial: this.editorialSeleccionada!.idEditorial!,
            editorial: this.editorialSeleccionada,
            numLibros: pedidoData.numLibros,
            estadoPedido: 'Pendiente' as const,
            estado: pedidoData.estado,
            librosPedido: []
          } as Pedido));

          // Ordenar: completados al final, pendientes y medioPendientes según orden original
          this.pedidos = pedidosTemp.sort((a, b) => {
            if (a.estado === 'completado' && b.estado !== 'completado') return 1;
            if (a.estado !== 'completado' && b.estado === 'completado') return -1;
            return 0;
          });
          
          this.aplicarFiltrosPedidos();
        } else {
          this.toastr.error('Error al cargar los pedidos', 'Error');
          this.pedidos = [];
          this.pedidosFiltrados = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar pedidos por editorial:', error);
        this.toastr.error('Error al conectar con el servidor', 'Error');
        this.pedidos = [];
        this.pedidosFiltrados = [];
        this.isLoading = false;
      }
    });
  }

  aplicarFiltrosPedidos(): void {
    this.pedidosFiltrados = [...this.pedidos];
    
    // Aplicar búsqueda si existe
    const termino = this.busquedaPedido.toLowerCase().trim();
    if (termino) {
      this.pedidosFiltrados = this.pedidosFiltrados.filter(pedido =>
        (pedido.idPedido.toString().includes(termino)) ||
        (pedido.fecha.includes(termino))
      );
    }
  }

  filtrarPedidosPorEditorial(): void {
    this.aplicarFiltrosPedidos();
  }

  filtrarEditoriales(): void {
    const termino = this.busquedaEditorial.toLowerCase().trim();
    if (!termino) {
      this.editorialesFiltradas = [...this.editorialesConPedidos];
    } else {
      this.editorialesFiltradas = this.editorialesConPedidos.filter(editorial =>
        editorial.nombre?.toLowerCase().includes(termino)
      );
    }
  }

  seleccionarPedido(pedido: Pedido): void {
    this.isLoadingDetalles = true;
    this.pedidoSeleccionado = JSON.parse(JSON.stringify(pedido));
    
    // Cargar detalles del pedido desde el backend
    this.pedidoService.getPedidoDetalle(pedido.idPedido).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          // Convertir los libros del backend al formato del componente
          this.pedidoSeleccionado!.librosPedido = response.data.libros.map(libro => ({
            idLibro: libro.idLibro,
            unidades: libro.cantidad,
            unidadesRecibidas: libro.unidadesRecibidas,
            nombre: libro.nombre,
            isbn: libro.ISBN,
            precio: libro.precio,
            libro: {
              id: libro.idLibro,
              nombre: libro.nombre,
              isbn: libro.ISBN,
              estado: true,
              unidadesPendientes: 0
            } as Libro
          } as LibroPedido));
          
          this.modalOptions = {
            ...this.modalOptions,
            title: `Recibir Pedido #${pedido.idPedido} (${pedido.estadoPedido || 'N/A'})`,
            okButton: {
              ...this.modalOptions.okButton,
              text: 'Confirmar Recepción',
              action: () => this.confirmarRecepcionPedido(),
              disabled: pedido.estadoPedido === 'Entregado'
            },
          };
        } else {
          this.toastr.error('Error al cargar los detalles del pedido', 'Error');
        }
        this.isLoadingDetalles = false;
      },
      error: (error) => {
        console.error('Error al cargar detalles del pedido:', error);
        this.toastr.error('Error al conectar con el servidor', 'Error');
        this.isLoadingDetalles = false;
      }
    });
  }

  limpiarSeleccion(): void {
    this.editorialSeleccionada = null;
    this.pedidoSeleccionado = null;
    this.busquedaEditorial = '';
    this.busquedaPedido = '';
    this.filtrarEditoriales();
    this.pedidosFiltrados = [];
  }

  getPedidosPorEditorial(idEditorial: string): number {
    // Usar los datos reales del backend
    const editorialConPedidos = this.editorialesConPedidos.find(e => e.idEditorial === idEditorial);
    if (editorialConPedidos && (editorialConPedidos as any).numPedidos !== undefined) {
      return (editorialConPedidos as any).numPedidos;
    }
    return 0;
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'pendiente':
        return 'bg-danger';
      case 'medioPendiente':
        return 'bg-warning';
      case 'completado':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }

  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'medioPendiente':
        return 'Medio Pendiente';
      case 'completado':
        return 'Completado';
      default:
        return estado;
    }
  }

  handleUnidadesRecibidasChange(item: LibroPedido, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let valor = parseInt(inputElement.value, 10);

    if (isNaN(valor) || valor < 0) {
      valor = 0;
    }
    const maxPermitido = item.unidades - (item.unidadesRecibidas || 0);
    if (valor > maxPermitido) {
      valor = maxPermitido;
    }
    item.cantidadNuevaRecibida = valor;
    inputElement.value = valor.toString();
  }

  confirmarRecepcionPedido(): void {
    if (!this.pedidoSeleccionado) return;

    const datosParaLog = {
      idEditorial: this.pedidoSeleccionado.idEditorial,
      idPedido: this.pedidoSeleccionado.idPedido,
      librosRecibidos: this.pedidoSeleccionado.librosPedido?.map(item => ({
        idLibro: item.idLibro,
        cantidadRecibida: item.cantidadNuevaRecibida || 0
      })) || []
    };

    // Hacer llamada al endpoint
    this.pedidoService.confirmarUnidadesRecibidas(datosParaLog).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.toastr.success(`Pedido #${this.pedidoSeleccionado!.idPedido} actualizado correctamente.`, 'Recepción Confirmada');
          
          // Cerrar modal y recargar pedidos
          this.pedidoSeleccionado = null;
          
          // Recargar los pedidos de la editorial actual
          this.cargarPedidosPorEditorial();
        } else {
          this.toastr.error('Error al confirmar la recepción del pedido', 'Error');
        }
      },
      error: (error) => {
        console.error('Error al enviar datos al servidor:', error);
        this.toastr.error('Error al conectar con el servidor', 'Error');
      }
    });
  }

  // En un futuro, estos métodos llamarían al servicio CrudService
  // cargarPedidosReales(): void { ... }
  // cargarDetallesPedidoReales(idPedido: number): void { ... }
}
