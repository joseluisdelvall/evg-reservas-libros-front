import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Editorial } from 'src/app/models/editorial.model';
import { Libro } from 'src/app/models/libro.model';
import { ModalOptions } from '../../shared/modal-content/models/modal-options';
// Asumimos que tienes modelos similares o puedes crearlos
// import { CrudService } from 'src/app/services/crud.service'; // Lo comentamos por ahora

interface Pedido {
  idPedido: number;
  fecha: string; // o Date
  idEditorial: string; // Coincide con el tipo en Editorial.model.ts
  editorial?: Editorial; // Para facilitar la visualización del nombre
  librosPedido?: LibroPedido[];
  estadoPedido?: 'Pendiente' | 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado'; // Nuevo estado
}

interface LibroPedido {
  idLibro: number; // Coincide con el tipo en Libro.model.ts
  libro?: Libro; // Para facilitar la visualización del nombre
  unidades: number;
  unidadesRecibidas?: number; // Nueva propiedad
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
    private toastr: ToastrService
    // private crudService: CrudService // Comentado hasta que se use
  ) { }

  ngOnInit(): void {
    this.cargarDatosFalsos();
  }

  cargarDatosFalsos(): void {
    this.isLoading = true;

    // Simular carga de editoriales y libros base
    this.todasEditoriales = this.generarEditorialesFalsasBase();
    const todosLibros = this.generarLibrosFalsosBase(this.todasEditoriales);

    // Simular pedidos
    const pedidosSimulados: Pedido[] = [
      { idPedido: 13, fecha: '2024-03-01', idEditorial: '1', estadoPedido: 'Enviado' },
      { idPedido: 14, fecha: '2024-03-05', idEditorial: '2', estadoPedido: 'Entregado' },
      { idPedido: 15, fecha: '2024-03-10', idEditorial: '3', estadoPedido: 'Enviado' },
      { idPedido: 16, fecha: '2024-03-12', idEditorial: '1', estadoPedido: 'Procesando' },
      { idPedido: 17, fecha: '2024-03-15', idEditorial: '4', estadoPedido: 'Enviado' },
    ];

    // Simular libros por pedido
    const librosPorPedidoSimulados: { [idPedido: number]: LibroPedido[] } = {
      13: [
        { idLibro: 1, unidades: 6, unidadesRecibidas: 0 },
        { idLibro: 3, unidades: 8, unidadesRecibidas: 0 },
      ],
      14: [
        { idLibro: 7, unidades: 1, unidadesRecibidas: 1 },
        { idLibro: 9, unidades: 2, unidadesRecibidas: 2 },
        { idLibro: 13, unidades: 3, unidadesRecibidas: 3 },
      ],
      15: [
        { idLibro: 8, unidades: 4, unidadesRecibidas: 0 },
        { idLibro: 10, unidades: 1, unidadesRecibidas: 0 },
      ],
      16: [
        { idLibro: 2, unidades: 5, unidadesRecibidas: 0 },
      ],
      17: [
        { idLibro: 15, unidades: 2, unidadesRecibidas: 0 },
        { idLibro: 16, unidades: 1, unidadesRecibidas: 0 },
      ]
    };

    this.pedidos = pedidosSimulados.map(p => {
      const editorial = this.todasEditoriales.find(e => e.idEditorial === p.idEditorial);
      const librosPedido = librosPorPedidoSimulados[p.idPedido]?.map(lp => {
        const libro = todosLibros.find(l => l.id === lp.idLibro);
        return { ...lp, libro, unidadesRecibidas: lp.unidadesRecibidas === undefined && p.estadoPedido === 'Entregado' ? lp.unidades : (lp.unidadesRecibidas || 0) };
      }) || [];
      return { ...p, editorial, librosPedido };
    });

    // Obtener editoriales con pedidos
    this.actualizarEditorialesConPedidos();
    this.filtrarEditoriales();
    
    this.isLoading = false;
  }

  actualizarEditorialesConPedidos(): void {
    // Obtener IDs únicos de editoriales con pedidos
    const idsEditoriales = [...new Set(this.pedidos.map(p => p.idEditorial))];
    
    // Filtrar las editoriales que tienen pedidos
    this.editorialesConPedidos = this.todasEditoriales.filter(
      editorial => idsEditoriales.includes(editorial.idEditorial || '')
    );
  }

  generarEditorialesFalsasBase(): Editorial[] {
    return [
      { idEditorial: '1', nombre: 'Editorial Planeta', correos: ['info@planeta.es'], telefonos: ['911234567'], estado: true },
      { idEditorial: '2', nombre: 'Penguin Random House', correos: ['info@penguin.com'], telefonos: ['912345678'], estado: true },
      { idEditorial: '3', nombre: 'Editorial Anagrama', correos: ['info@anagrama.es'], telefonos: ['934567890'], estado: true },
      { idEditorial: '4', nombre: 'Alfaguara', correos: ['info@alfaguara.com'], telefonos: ['915678901'], estado: true },
    ];
  }

  generarLibrosFalsosBase(editoriales: Editorial[]): Libro[] {
    return [
      { id: 1, nombre: 'Cien años de soledad', isbn: '111-111', editorial: editoriales[0], estado: true, unidadesPendientes: 0 },
      { id: 2, nombre: 'El amor en los tiempos del cólera', isbn: '222-222', editorial: editoriales[0], estado: true, unidadesPendientes: 0 },
      { id: 3, nombre: 'La casa de los espíritus', isbn: '333-333', editorial: editoriales[0], estado: true, unidadesPendientes: 0 },
      { id: 7, nombre: 'Fahrenheit 451', isbn: '777-777', editorial: editoriales[1], estado: true, unidadesPendientes: 0 },
      { id: 8, nombre: 'Los detectives salvajes', isbn: '888-888', editorial: editoriales[2], estado: true, unidadesPendientes: 0 },
      { id: 9, nombre: '2666', isbn: '999-999', editorial: editoriales[2], estado: true, unidadesPendientes: 0 },
      { id: 10, nombre: 'Estrella distante', isbn: '101-010', editorial: editoriales[2], estado: true, unidadesPendientes: 0 },
      { id: 13, nombre: 'Final del juego', isbn: '131-313', editorial: editoriales[3], estado: true, unidadesPendientes: 0 },
      { id: 15, nombre: 'Sapiens: De animales a dioses', isbn: '151-515', editorial: editoriales[3], estado: true, unidadesPendientes: 0 },
      { id: 16, nombre: 'Homo Deus', isbn: '161-616', editorial: editoriales[3], estado: true, unidadesPendientes: 0 },
    ];
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

  seleccionarEditorial(editorial: Editorial): void {
    this.editorialSeleccionada = editorial;
    this.pedidoSeleccionado = null;
    this.busquedaPedido = '';
    this.filtrarPedidosPorEditorial();
  }

  filtrarPedidosPorEditorial(): void {
    if (!this.editorialSeleccionada) {
      this.pedidosFiltrados = [];
      return;
    }

    // Filtrar pedidos por editorial
    this.pedidosFiltrados = this.pedidos.filter(pedido => 
      pedido.idEditorial === this.editorialSeleccionada?.idEditorial
    );

    // Aplicar búsqueda si existe
    const termino = this.busquedaPedido.toLowerCase().trim();
    if (termino) {
      this.pedidosFiltrados = this.pedidosFiltrados.filter(pedido =>
        (pedido.idPedido.toString().includes(termino)) ||
        (pedido.fecha.includes(termino))
      );
    }
  }

  seleccionarPedido(pedido: Pedido): void {
    this.isLoadingDetalles = true;
    this.pedidoSeleccionado = JSON.parse(JSON.stringify(pedido)); 
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
    this.isLoadingDetalles = false;
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
    return this.pedidos.filter(p => p.idEditorial === idEditorial).length;
  }

  handleUnidadesRecibidasChange(item: LibroPedido, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let valor = parseInt(inputElement.value, 10);

    if (isNaN(valor) || valor < 0) {
      valor = 0;
    }
    if (valor > item.unidades) {
      valor = item.unidades;
    }
    item.unidadesRecibidas = valor;
    inputElement.value = valor.toString(); // Actualizar el input por si se corrigió el valor
  }

  confirmarRecepcionPedido(): void {
    if (!this.pedidoSeleccionado) return;

    const datosParaLog = {
      idEditorial: this.pedidoSeleccionado.idEditorial,
      idPedido: this.pedidoSeleccionado.idPedido,
      librosRecibidos: this.pedidoSeleccionado.librosPedido?.map(item => ({
        idLibro: item.libro?.id, // Asumiendo que el id del libro está en item.libro.idLibro
        cantidadRecibida: item.unidadesRecibidas || 0
      })) || []
    };
    console.log('Datos de recepción de pedido:', datosParaLog);

    // Lógica para confirmar la recepción. Ejemplo:
    // Validar que todas las unidades recibidas sean consistentes
    let completo = true;
    this.pedidoSeleccionado.librosPedido?.forEach(item => {
      if ((item.unidadesRecibidas || 0) < item.unidades) {
        completo = false;
      }
      // Aquí podrías actualizar el stock del libro si tienes esa lógica
      // item.libro.stock += item.unidadesRecibidas;
    });

    const pedidoOriginal = this.pedidos.find(p => p.idPedido === this.pedidoSeleccionado!.idPedido);
    if (pedidoOriginal) {
      pedidoOriginal.librosPedido = JSON.parse(JSON.stringify(this.pedidoSeleccionado.librosPedido)); // Actualizar con los datos del modal
      pedidoOriginal.estadoPedido = completo ? 'Entregado' : 'Procesando'; 
    }
    
    

    this.toastr.success(`Pedido #${this.pedidoSeleccionado.idPedido} actualizado. Estado: ${completo ? 'Entregado' : 'Procesando'}.`, 'Recepción Confirmada');
    this.pedidoSeleccionado = null; // Limpiar para cerrar modal o refrescar vista
    this.filtrarPedidosPorEditorial(); // Refrescar lista de pedidos si es necesario

    
  }

  // En un futuro, estos métodos llamarían al servicio CrudService
  // cargarPedidosReales(): void { ... }
  // cargarDetallesPedidoReales(idPedido: number): void { ... }
}
