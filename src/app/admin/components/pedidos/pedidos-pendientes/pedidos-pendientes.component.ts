import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Libro } from 'src/app/models/libro.model';
import { Editorial } from 'src/app/models/editorial.model';
import { CrudService } from 'src/app/services/crud.service';
import Swal from 'sweetalert2';

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
  librosPendientes: Libro[] = [];
  librosPendientesEditorial: Libro[] = [];
  librosPendientesFiltrados: Libro[] = [];

  // Selecciones
  editorialSeleccionada: Editorial | null = null;
  librosPedido: LibroPedido[] = [];

  // Búsquedas
  busquedaEditorial: string = '';
  busquedaLibro: string = '';

  constructor(
    private crudService: CrudService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    // Usar datos falsos para demostración
    this.cargarDatosFalsos();
    // Descomentar la línea siguiente cuando tengas el backend implementado
    // this.cargarDatos();
  }

  /**
   * Carga datos falsos para demostración
   */
  cargarDatosFalsos(): void {
    this.isLoading = true;
    
    // Simular delay de carga
    setTimeout(() => {
      this.editoriales = this.generarEditorialesFalsas();
      this.librosPendientes = this.generarLibrosFalsos();
      this.filtrarEditoriales();
      this.isLoading = false;
    }, 1000);
  }

  /**
   * Genera editoriales falsas para demostración
   */
  generarEditorialesFalsas(): Editorial[] {
    return [
      {
        idEditorial: '1',
        nombre: 'Editorial Planeta',
        correos: [
          'pedidos@planeta.es',
          'comercial@planeta.es',
          'distribucion@planeta.es'
        ],
        telefonos: [
          '912345678',
          '912345679',
          '912345680'
        ],
        estado: true
      },
      {
        idEditorial: '2',
        nombre: 'Penguin Random House',
        correos: [
          'ventas@penguinrandomhouse.com',
          'pedidos@penguinrandomhouse.com',
          'libreria@penguinrandomhouse.com'
        ],
        telefonos: [
          '913456789',
          '913456790'
        ],
        estado: true
      },
      {
        idEditorial: '3',
        nombre: 'Editorial Anagrama',
        correos: [
          'pedidos@anagrama.es',
          'distribucion@anagrama.es'
        ],
        telefonos: [
          '934567890',
          '934567891',
          '934567892'
        ],
        estado: true
      },
      {
        idEditorial: '4',
        nombre: 'Alfaguara',
        correos: [
          'comercial@alfaguara.com',
          'pedidos@alfaguara.com',
          'ventas@alfaguara.com',
          'distribucion@alfaguara.com'
        ],
        telefonos: [
          '915678901',
          '915678902'
        ],
        estado: true
      },
      {
        idEditorial: '5',
        nombre: 'Editorial Crítica',
        correos: [
          'info@critica.es',
          'pedidos@critica.es',
          'comercial@critica.es'
        ],
        telefonos: [
          '916789012',
          '916789013'
        ],
        estado: true
      },
      {
        idEditorial: '6',
        nombre: 'Tusquets Editores',
        correos: [
          'pedidos@tusquets.com',
          'comercial@tusquets.com',
          'ventas@tusquets.com'
        ],
        telefonos: [
          '917890123',
          '917890124',
          '917890125'
        ],
        estado: true
      }
    ];
  }

  /**
   * Genera libros falsos para demostración
   */
  generarLibrosFalsos(): Libro[] {
    const editoriales = this.generarEditorialesFalsas();
    
    return [
      // Libros de Editorial Planeta
      {
        id: 1,
        nombre: 'Cien años de soledad',
        isbn: '978-84-376-0494-7',
        precio: 18.90,
        estado: true,
        editorial: editoriales[0],
        unidadesPendientes: 5
      },
      {
        id: 2,
        nombre: 'El amor en los tiempos del cólera',
        isbn: '978-84-376-0495-4',
        precio: 19.50,
        estado: true,
        editorial: editoriales[0],
        unidadesPendientes: 3
      },
      {
        id: 3,
        nombre: 'La casa de los espíritus',
        isbn: '978-84-376-0496-1',
        precio: 17.95,
        estado: true,
        editorial: editoriales[0],
        unidadesPendientes: 8
      },
      
      // Libros de Penguin Random House
      {
        id: 4,
        nombre: '1984',
        isbn: '978-84-663-0001-1',
        precio: 15.90,
        estado: true,
        editorial: editoriales[1],
        unidadesPendientes: 12
      },
      {
        id: 5,
        nombre: 'Rebelión en la granja',
        isbn: '978-84-663-0002-8',
        precio: 12.50,
        estado: true,
        editorial: editoriales[1],
        unidadesPendientes: 6
      },
      {
        id: 6,
        nombre: 'Un mundo feliz',
        isbn: '978-84-663-0003-5',
        precio: 16.90,
        estado: true,
        editorial: editoriales[1],
        unidadesPendientes: 4
      },
      {
        id: 7,
        nombre: 'Fahrenheit 451',
        isbn: '978-84-663-0004-2',
        precio: 14.95,
        estado: true,
        editorial: editoriales[1],
        unidadesPendientes: 7
      },
      
      // Libros de Editorial Anagrama
      {
        id: 8,
        nombre: 'Los detectives salvajes',
        isbn: '978-84-339-2001-1',
        precio: 22.90,
        estado: true,
        editorial: editoriales[2],
        unidadesPendientes: 3
      },
      {
        id: 9,
        nombre: '2666',
        isbn: '978-84-339-2002-8',
        precio: 28.50,
        estado: true,
        editorial: editoriales[2],
        unidadesPendientes: 2
      },
      {
        id: 10,
        nombre: 'Estrella distante',
        isbn: '978-84-339-2003-5',
        precio: 16.90,
        estado: true,
        editorial: editoriales[2],
        unidadesPendientes: 9
      },
      
      // Libros de Alfaguara
      {
        id: 11,
        nombre: 'Rayuela',
        isbn: '978-84-204-0001-1',
        precio: 21.90,
        estado: true,
        editorial: editoriales[3],
        unidadesPendientes: 5
      },
      {
        id: 12,
        nombre: 'Bestiario',
        isbn: '978-84-204-0002-8',
        precio: 15.50,
        estado: true,
        editorial: editoriales[3],
        unidadesPendientes: 4
      },
      {
        id: 13,
        nombre: 'Final del juego',
        isbn: '978-84-204-0003-5',
        precio: 17.90,
        estado: true,
        editorial: editoriales[3],
        unidadesPendientes: 6
      },
      {
        id: 14,
        nombre: 'Las armas secretas',
        isbn: '978-84-204-0004-2',
        precio: 16.50,
        estado: true,
        editorial: editoriales[3],
        unidadesPendientes: 3
      },
      
      // Libros de Editorial Crítica
      {
        id: 15,
        nombre: 'Sapiens: De animales a dioses',
        isbn: '978-84-9892-001-1',
        precio: 23.90,
        estado: true,
        editorial: editoriales[4],
        unidadesPendientes: 15
      },
      {
        id: 16,
        nombre: 'Homo Deus',
        isbn: '978-84-9892-002-8',
        precio: 24.50,
        estado: true,
        editorial: editoriales[4],
        unidadesPendientes: 10
      },
      {
        id: 17,
        nombre: '21 lecciones para el siglo XXI',
        isbn: '978-84-9892-003-5',
        precio: 22.90,
        estado: true,
        editorial: editoriales[4],
        unidadesPendientes: 8
      },
      
      // Libros de Tusquets Editores
      {
        id: 18,
        nombre: 'El nombre de la rosa',
        isbn: '978-84-8383-001-1',
        precio: 25.90,
        estado: true,
        editorial: editoriales[5],
        unidadesPendientes: 7
      },
      {
        id: 19,
        nombre: 'El péndulo de Foucault',
        isbn: '978-84-8383-002-8',
        precio: 27.50,
        estado: true,
        editorial: editoriales[5],
        unidadesPendientes: 4
      },
      {
        id: 20,
        nombre: 'La isla del día de antes',
        isbn: '978-84-8383-003-5',
        precio: 24.90,
        estado: true,
        editorial: editoriales[5],
        unidadesPendientes: 6
      },
      
      // Libros adicionales
      {
        id: 21,
        nombre: 'Don Quijote de la Mancha',
        isbn: '978-84-376-0497-8',
        precio: 29.90,
        estado: true,
        editorial: editoriales[0],
        unidadesPendientes: 20
      },
      {
        id: 22,
        nombre: 'Matar a un ruiseñor',
        isbn: '978-84-663-0005-9',
        precio: 18.90,
        estado: true,
        editorial: editoriales[1],
        unidadesPendientes: 8
      },
      {
        id: 23,
        nombre: 'Crónica de una muerte anunciada',
        isbn: '978-84-376-0498-5',
        precio: 16.90,
        estado: true,
        editorial: editoriales[0],
        unidadesPendientes: 5
      },
      {
        id: 24,
        nombre: 'El túnel',
        isbn: '978-84-204-0005-9',
        precio: 14.90,
        estado: true,
        editorial: editoriales[3],
        unidadesPendientes: 3
      },
      {
        id: 25,
        nombre: 'La metamorfosis',
        isbn: '978-84-339-2004-2',
        precio: 12.90,
        estado: true,
        editorial: editoriales[2],
        unidadesPendientes: 9
      }
    ];
  }

  /**
   * Carga todos los datos necesarios al inicializar el componente
   */
  cargarDatos(): void {
    this.isLoading = true;
    
    // Cargar editoriales y libros en paralelo
    Promise.all([
      this.cargarEditoriales(),
      this.cargarLibrosPendientes()
    ]).then(() => {
      this.filtrarEditoriales();
      this.isLoading = false;
    }).catch(error => {
      console.error('Error al cargar datos:', error);
      this.toastr.error('Error al cargar los datos', 'Error');
      this.isLoading = false;
    });
  }

  /**
   * Carga todas las editoriales activas
   */
  cargarEditoriales(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.crudService.getEditoriales().subscribe({
        next: (data: Editorial[]) => {
          // Filtrar solo editoriales activas
          this.editoriales = data.filter(editorial => editorial.estado === true);
          console.log('Editoriales cargadas:', this.editoriales.length);
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar editoriales:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * Carga todos los libros que están pendientes de pedido
   * Por ahora considera todos los libros activos como pendientes
   */
  cargarLibrosPendientes(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.crudService.getLibros().subscribe({
        next: (data: Libro[]) => {
          // Filtrar libros activos que necesitan ser pedidos
          // Aquí puedes ajustar la lógica según tus criterios de "pendiente"
          this.librosPendientes = data.filter(libro => 
            libro.estado === true && 
            libro.editorial && 
            libro.editorial.estado === true
            // Por ahora consideramos todos los libros activos como pendientes
            // Más adelante puedes añadir criterios específicos como stock bajo
          );
          console.log('Libros pendientes cargados:', this.librosPendientes.length);
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar libros pendientes:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * Filtra las editoriales según el texto de búsqueda
   */
  filtrarEditoriales(): void {
    const termino = this.busquedaEditorial.toLowerCase().trim();
    
    if (!termino) {
      // Mostrar solo editoriales que tienen libros pendientes
      this.editorialesFiltradas = this.editoriales.filter(editorial => 
        this.getLibrosPendientesPorEditorial(editorial.idEditorial).length > 0
      );
    } else {
      this.editorialesFiltradas = this.editoriales.filter(editorial => 
        editorial.nombre && editorial.nombre.toLowerCase().includes(termino) &&
        this.getLibrosPendientesPorEditorial(editorial.idEditorial).length > 0
      );
    }
  }

  /**
   * Obtiene los libros pendientes para una editorial específica
   */
  getLibrosPendientesPorEditorial(editorialId: string | undefined): Libro[] {
    if (!editorialId) return [];
    
    return this.librosPendientes.filter(libro => 
      libro.editorial && libro.editorial.idEditorial === editorialId
    );
  }

  /**
   * Selecciona una editorial y carga sus libros pendientes
   */
  seleccionarEditorial(editorial: Editorial): void {
    this.editorialSeleccionada = editorial;
    this.librosPedido = []; // Limpiar selección anterior
    this.busquedaLibro = ''; // Limpiar búsqueda anterior
    
    // Cargar libros pendientes de esta editorial
    this.cargarLibrosPendientesEditorial();
  }

  /**
   * Carga los libros pendientes de la editorial seleccionada
   */
  cargarLibrosPendientesEditorial(): void {
    if (!this.editorialSeleccionada) return;
    
    this.isLoadingLibros = true;
    
    // Simular un pequeño delay para mostrar el spinner
    setTimeout(() => {
      this.librosPendientesEditorial = this.getLibrosPendientesPorEditorial(
        this.editorialSeleccionada!.idEditorial
      );
      this.filtrarLibrosPendientes();
      this.isLoadingLibros = false;
    }, 300);
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
    if (!libro.id) return;
    
    const index = this.librosPedido.findIndex(l => l.id === libro.id);
    if (index === -1) {
      // Si no está en el pedido, lo añadimos con cantidad 1 o el máximo disponible
      const cantidadInicial = libro.unidadesPendientes && libro.unidadesPendientes > 0 ? 1 : 0;
      if (cantidadInicial > 0) {
        this.librosPedido.push({ id: libro.id, cantidad: cantidadInicial });
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
    if (libroId === undefined) return false;
    return this.librosPedido.some(l => l.id === libroId);
  }

  /**
   * Selecciona todos los libros pendientes de la editorial actual
   */
  seleccionarTodos(): void {
    if (!this.editorialSeleccionada) return;
    
    // Iterar sobre los libros filtrados en lugar de todos los de la editorial
    this.librosPendientesFiltrados.forEach(libro => {
      if (libro.id && libro.unidadesPendientes && libro.unidadesPendientes > 0) {
        // Si el libro ya está en el pedido, actualizar su cantidad al máximo disponible
        const index = this.librosPedido.findIndex(l => l.id === libro.id);
        if (index !== -1) {
          this.librosPedido[index].cantidad = libro.unidadesPendientes;
        } else {
          // Si no está en el pedido, añadirlo con la cantidad máxima disponible
          this.librosPedido.push({ 
            id: libro.id, 
            cantidad: libro.unidadesPendientes 
          });
        }
      }
    });
    
    // Ajustar el mensaje para reflejar que se seleccionaron los filtrados
    this.toastr.info(
      `Se han seleccionado ${this.librosPendientesFiltrados.length} libros filtrados con sus cantidades máximas.`,
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
      return `<div class="libro-pedido-item">${libro?.nombre} - ${libroPedido.cantidad} unidades</div>`;
    }).join('');

    const correosHtml = this.editorialSeleccionada.correos && this.editorialSeleccionada.correos.length > 0 ?
      `<p><strong>Correos:</strong><br>${this.editorialSeleccionada.correos.map(correo => 
        `<span class="ms-3">• ${correo}</span>`).join('<br>')}</p>` : '';

    const telefonosHtml = this.editorialSeleccionada.telefonos && this.editorialSeleccionada.telefonos.length > 0 ?
      `<p><strong>Teléfonos:</strong><br>${this.editorialSeleccionada.telefonos.map(telefono => 
        `<span class="ms-3">• ${telefono}</span>`).join('<br>')}</p>` : '';

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

    // Simular delay de procesamiento (2-3 segundos)
    Swal.fire({
      title: 'Procesando pedido',
      html: 'Por favor, espera...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    setTimeout(() => {
      const numeroPedido = 'PED-' + Date.now().toString().slice(-6);
      const totalLibros = this.librosPedido.reduce((total, libro) => total + libro.cantidad, 0);

      Swal.fire({
        title: '¡Pedido Realizado!',
        html: `
          <div class="text-start">
            <p><strong>Número de pedido:</strong> ${numeroPedido}</p>
            <p><strong>Total de libros:</strong> ${totalLibros}</p>
          </div>
        `,
        icon: 'success'
      });

      // Limpiar selección
      this.librosPedido = [];
      this.editorialSeleccionada = null;
    }, 2500);
  }

  getCantidadPedido(libroId: number | undefined): number {
    if (!libroId) return 1; // Valor por defecto si no hay ID
    const libroEnPedido = this.librosPedido.find(lp => lp.id === libroId);
    return libroEnPedido ? libroEnPedido.cantidad : 1;
  }

  actualizarCantidad(libroId: number | undefined, event: any): void {
    if (!libroId) return;

    const libroSeleccionado = this.librosPendientesEditorial.find(l => l.id === libroId);
    if (!libroSeleccionado) return;

    const maxUnidades = libroSeleccionado.unidadesPendientes || 0;
    let cantidad = parseInt(event.target.value, 10);

    if (isNaN(cantidad) || cantidad < 1) {
      cantidad = 1; // Mínimo 1 si se introduce algo inválido o menor que 1
    }

    if (cantidad > maxUnidades) {
      cantidad = maxUnidades; // No permitir pedir más de las unidades pendientes
    }
    
    // Si maxUnidades es 0, la cantidad también debería ser 0, pero el mínimo actual es 1.
    // Para este caso, si se intenta pedir un libro con 0 unidades pendientes, se establece a 0.
    if (maxUnidades === 0) {
        cantidad = 0;
    }

    const index = this.librosPedido.findIndex(lp => lp.id === libroId);
    if (index > -1) {
      if (cantidad === 0) { // Si la cantidad es 0, se elimina de la lista de pedido
        this.librosPedido.splice(index, 1);
      } else {
        this.librosPedido[index].cantidad = cantidad;
      }
    } else if (cantidad > 0) { // Solo añadir si la cantidad es mayor que 0
      this.librosPedido.push({ id: libroId, cantidad });
    }

    // Actualizar el valor en el input para reflejar la corrección
    event.target.value = cantidad.toString();
  }

  incrementarCantidad(libroId: number | undefined): void {
    if (!libroId) return;
    const libroSeleccionado = this.librosPendientesEditorial.find(l => l.id === libroId);
    if (!libroSeleccionado) return;
    const maxUnidades = libroSeleccionado.unidadesPendientes || 0;

    const index = this.librosPedido.findIndex(lp => lp.id === libroId);
    if (index > -1) {
      if (this.librosPedido[index].cantidad < maxUnidades) {
        this.librosPedido[index].cantidad++;
      }
    } else if (maxUnidades > 0) { // Solo añadir si hay unidades pendientes y es el primer incremento
        this.librosPedido.push({ id: libroId, cantidad: 1 });
    }
  }

  decrementarCantidad(libroId: number | undefined): void {
    if (!libroId) return;
    const index = this.librosPedido.findIndex(lp => lp.id === libroId);
    if (index > -1) {
      this.librosPedido[index].cantidad--;
      if (this.librosPedido[index].cantidad <= 0) {
        this.librosPedido.splice(index, 1); // Eliminar si la cantidad es 0 o menos
      }
    }
  }
}
