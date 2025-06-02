import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Libro } from 'src/app/models/libro.model';
import { Editorial } from 'src/app/models/editorial.model';
import { CrudService } from 'src/app/services/crud.service';
import Swal from 'sweetalert2';
import { PedidoService } from 'src/app/services/pedido.service';

interface LibroPedido {
  id: number;
  cantidad: number;
}

@Component({
  selector: 'app-pedidos-pendientes',
  templateUrl: './pedidos-pendientes.component.html',
  styleUrls: ['./pedidos-pendientes.component.css']
})
export class PedidosPendientesComponent implements OnInit {
  // Estados de carga
  isLoading: boolean = false;
  isLoadingLibros: boolean = false;

  // Datos principales
  editoriales: Editorial[] = [];
  editorialesFiltradas: Editorial[] = [];
  librosPendientesEditorial: Libro[] = [];
  librosPendientesFiltrados: Libro[] = [];

  // Selecciones
  editorialSeleccionada: Editorial | null = null;
  librosPedido: LibroPedido[] = [];

  // Filtros
  busquedaEditorial: string = '';
  busquedaLibro: string = '';

  constructor(
    private crudService: CrudService,
    private toastr: ToastrService,
    private pedidoService: PedidoService
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  /**
   * Carga todos los datos necesarios al inicializar el componente
   */
  cargarDatos(): void {
    this.isLoading = true;
    this.crudService.getEditorialesConLibrosPendientes().subscribe({
      next: (data) => {
        this.editoriales = data;
        this.editorialesFiltradas = [...this.editoriales];
        console.log('Editoriales cargadas:', this.editoriales.length);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
        this.toastr.error('Error al cargar los datos', 'Error');
        this.isLoading = false;
      }
    });
  }

  /**
   * Filtra las editoriales según el texto de búsqueda
   */
  filtrarEditoriales(): void {
    const termino = this.busquedaEditorial.toLowerCase().trim();
    
    if (!termino) {
      this.editorialesFiltradas = [...this.editoriales];
    } else {
      this.editorialesFiltradas = this.editoriales.filter(editorial => 
        editorial.nombre && editorial.nombre.toLowerCase().includes(termino)
      );
    }
  }

  /**
   * Selecciona una editorial y carga sus libros pendientes
   */
  seleccionarEditorial(editorial: Editorial): void {
    this.crudService.getEditorialById(editorial.idEditorial!).subscribe({
      next: (editorialCompleta) => {
        this.editorialSeleccionada = editorialCompleta;
        this.librosPedido = [];
        this.busquedaLibro = '';
        this.cargarLibrosPendientesEditorial();
      },
      error: (error) => {
        this.toastr.error('No se pudo cargar la editorial completa', 'Error');
        // Si falla, al menos asigna el objeto básico
        this.editorialSeleccionada = editorial;
        this.librosPedido = [];
        this.busquedaLibro = '';
        this.cargarLibrosPendientesEditorial();
      }
    });
  }

  /**
   * Carga los libros pendientes de la editorial seleccionada
   */
  cargarLibrosPendientesEditorial(): void {
    if (!this.editorialSeleccionada?.idEditorial) {
      this.toastr.warning('No se puede cargar los libros: ID de editorial no válido');
      return;
    }
    
    this.isLoadingLibros = true;
    this.crudService.getLibrosPendientesPorEditorial(this.editorialSeleccionada.idEditorial)
      .subscribe({
        next: (data: any[]) => {
          this.librosPendientesEditorial = data.map(libroDelBackend => {
            const { idLibro, ...resto } = libroDelBackend;
            return {
              ...resto,
              id: idLibro
            };
          });
          this.filtrarLibrosPendientes();
          this.isLoadingLibros = false;
        },
        error: (error) => {
          console.error('Error al cargar libros pendientes:', error);
          this.toastr.error('Error al cargar los libros pendientes', 'Error');
          this.isLoadingLibros = false;
        }
      });
  }

  /**
   * Filtra los libros pendientes según el texto de búsqueda
   */
  filtrarLibrosPendientes(): void {
    const termino = this.busquedaLibro.toLowerCase().trim();
    
    if (!termino) {
      this.librosPendientesFiltrados = [...this.librosPendientesEditorial];
    } else {
      this.librosPendientesFiltrados = this.librosPendientesEditorial.filter(libro => 
        (libro.nombre && libro.nombre.toLowerCase().includes(termino)) || 
        (libro.isbn && libro.isbn.toLowerCase().includes(termino))
      );
    }
  }

  /**
   * Alterna la selección de un libro para el pedido
   */
  toggleLibroPedido(libro: Libro): void {
    console.log('Libro a seleccionar:', libro); // Para debug
    
    if (!libro.id) {
      this.toastr.warning('El libro no tiene un ID válido' + libro.id);
      return;
    }
    
    const index = this.librosPedido.findIndex(l => l.id === Number(libro.id));
    if (index === -1) {
      // Si no está en el pedido, lo añadimos con cantidad 1 o el máximo disponible
      const cantidadInicial = libro.unidadesPendientes && libro.unidadesPendientes > 0 ? 1 : 0;
      if (cantidadInicial > 0) {
        this.librosPedido.push({ id: Number(libro.id), cantidad: cantidadInicial });
      }
    } else {
      // Si ya está en el pedido, lo quitamos
      this.librosPedido.splice(index, 1);
    }
  }

  /**
   * Verifica si un libro está seleccionado para el pedido
   */
  isLibroSeleccionadoPedido(libroId: number | undefined): boolean {
    if (!libroId) return false;
    return this.librosPedido.some(l => l.id === Number(libroId));
  }

  /**
   * Selecciona todos los libros filtrados con sus cantidades máximas
   */
  seleccionarTodos(): void {
    // Iterar sobre los libros filtrados en lugar de todos los de la editorial
    this.librosPendientesFiltrados.forEach(libro => {
      if (libro.id && libro.unidadesPendientes && libro.unidadesPendientes > 0) {
        // Si el libro ya está en el pedido, actualizar su cantidad al máximo disponible
        const index = this.librosPedido.findIndex(l => l.id === Number(libro.id));
        if (index !== -1) {
          this.librosPedido[index].cantidad = libro.unidadesPendientes;
        } else {
          // Si no está en el pedido, añadirlo con la cantidad máxima disponible
          this.librosPedido.push({ 
            id: Number(libro.id), 
            cantidad: libro.unidadesPendientes 
          });
        }
      }
    });
    
    // Mostrar mensaje de confirmación
    this.toastr.success(
      `Se han seleccionado ${this.librosPendientesFiltrados.length} libros con sus cantidades máximas.`,
      'Libros Seleccionados'
    );
  }

  /**
   * Deselecciona todos los libros del pedido actual
   */
  deseleccionarTodos(): void {
    // Considerar si al deseleccionar todos, también se deberían afectar solo los filtrados.
    // Por ahora, mantiene la funcionalidad de deseleccionar TODOS los que estaban en librosPedido.
    // Si se quiere que solo afecte a los filtrados que están en el pedido, la lógica sería más compleja:
    // const idsFiltrados = new Set(this.librosPendientesFiltrados.map(l => l.id));
    // this.librosPedido = this.librosPedido.filter(lp => !idsFiltrados.has(lp.id));
    this.librosPedido = [];
  }

  /**
   * Realiza el pedido de los libros seleccionados
   */
  realizarPedido(): void {
    if (!this.editorialSeleccionada) return;

    const librosInfo = this.librosPedido.map(libroPedido => {
      const libro = this.librosPendientesEditorial.find(l => l.id === libroPedido.id);
      return `<div class="libro-pedido-item">${libro?.nombre} (${libro?.isbn}) - ${libroPedido.cantidad} unidades</div>`;
    }).join('');

    const correosHtml = this.editorialSeleccionada.correos && this.editorialSeleccionada.correos.length > 0
      ? `<p><strong>Correos:</strong><br>${this.editorialSeleccionada.correos.map(correo => `<span class='ms-3'>• ${correo}</span>`).join('<br>')}</p>`
      : '';

    const telefonosHtml = this.editorialSeleccionada.telefonos && this.editorialSeleccionada.telefonos.length > 0
      ? `<p><strong>Teléfonos:</strong><br>${this.editorialSeleccionada.telefonos.map(telefono => `<span class='ms-3'>• ${telefono}</span>`).join('<br>')}</p>`
      : '';

    Swal.fire({
      title: 'Información del Pedido',
      html: `
        <div class="text-start">
          <h6 class="mb-3">Datos de la Editorial</h6>
          <p><strong>Nombre:</strong> ${this.editorialSeleccionada.nombre}</p>
          ${correosHtml}
          ${telefonosHtml}
          <h6 class="mt-4 mb-3">Libros a Pedir</h6>
          <div style="max-height: 200px; overflow-y: auto; text-align: left; font-size: 14px;">
            ${librosInfo}
          </div>
          <style>
            .libro-pedido-item {
              margin-bottom: 8px;
              line-height: 1.4;
              padding-left: 1rem;
            }
            .libro-pedido-item:before {
              content: "•";
              position: absolute;
              margin-left: -1rem;
            }
            .libro-pedido-item:last-child {
              margin-bottom: 0;
            }
            h6 {
              color: #0d6efd;
              border-bottom: 1px solid #dee2e6;
              padding-bottom: 8px;
            }
            p {
              margin-bottom: 1rem;
            }
          </style>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Confirmar Pedido',
      cancelButtonText: 'Cancelar',
      width: '600px'
    }).then((result) => {
      if (result.isConfirmed) {
        this.procesarPedido();
      }
    });
  }

  getLibroInfo(libroId: number): Libro | undefined {
    return this.librosPendientesEditorial.find(l => l.id === libroId);
  }

  procesarPedido(): void {
    if (!this.editorialSeleccionada) return;

    const librosParaEnviar = this.librosPedido.map(libro => ({
      idLibro: libro.id, // Convertimos id a idLibro
      cantidad: libro.cantidad
    }));

    const pedidoParaEnviar = {
      idEditorial: this.editorialSeleccionada.idEditorial,
      libros: librosParaEnviar
    };

    this.pedidoService.addPedido(pedidoParaEnviar).subscribe({
      next: (respuesta) => {
        this.toastr.success('¡Pedido realizado correctamente!', 'Éxito');
        // Limpiar selección
        this.librosPedido = [];
        this.editorialSeleccionada = null;
        // Refrescar la lista de editoriales automáticamente
        this.cargarDatos();
      },
      error: (error) => {
        this.toastr.error('Error al realizar el pedido', 'Error');
        console.error('Error al realizar el pedido:', error);
      }
    });
  }

  /**
   * Obtiene la cantidad pedida de un libro
   */
  getCantidadPedido(libroId: number | undefined): number {
    if (!libroId) return 1;
    const libroEnPedido = this.librosPedido.find(lp => lp.id === Number(libroId));
    return libroEnPedido ? libroEnPedido.cantidad : 1;
  }

  /**
   * Actualiza la cantidad de un libro en el pedido
   */
  actualizarCantidad(libroId: number | undefined, event: any): void {
    if (!libroId) return;

    const libroSeleccionado = this.librosPendientesEditorial.find(l => l.id === Number(libroId));
    if (!libroSeleccionado) return;

    const maxUnidades = libroSeleccionado.unidadesPendientes || 0;
    let cantidad = parseInt(event.target.value, 10);

    if (isNaN(cantidad) || cantidad < 1) {
      cantidad = 1;
    }

    if (cantidad > maxUnidades) {
      cantidad = maxUnidades;
    }

    if (maxUnidades === 0) {
      cantidad = 0;
    }

    const index = this.librosPedido.findIndex(lp => lp.id === Number(libroId));
    if (index > -1) {
      if (cantidad === 0) {
        this.librosPedido.splice(index, 1);
      } else {
        this.librosPedido[index].cantidad = cantidad;
      }
    } else if (cantidad > 0) {
      this.librosPedido.push({ id: Number(libroId), cantidad });
    }

    event.target.value = cantidad.toString();
  }

  /**
   * Incrementa la cantidad de un libro en el pedido
   */
  incrementarCantidad(libroId: number | undefined): void {
    if (!libroId) return;
    const libroSeleccionado = this.librosPendientesEditorial.find(l => l.id === Number(libroId));
    if (!libroSeleccionado) return;
    const maxUnidades = libroSeleccionado.unidadesPendientes || 0;

    const index = this.librosPedido.findIndex(lp => lp.id === Number(libroId));
    if (index > -1) {
      if (this.librosPedido[index].cantidad < maxUnidades) {
        this.librosPedido[index].cantidad++;
      }
    } else if (maxUnidades > 0) {
      this.librosPedido.push({ id: Number(libroId), cantidad: 1 });
    }
  }

  /**
   * Decrementa la cantidad de un libro en el pedido
   */
  decrementarCantidad(libroId: number | undefined): void {
    if (!libroId) return;
    const index = this.librosPedido.findIndex(lp => lp.id === Number(libroId));
    if (index > -1) {
      this.librosPedido[index].cantidad--;
      if (this.librosPedido[index].cantidad <= 0) {
        this.librosPedido.splice(index, 1);
      }
    }
  }
}
