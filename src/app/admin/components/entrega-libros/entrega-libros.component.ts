import { Component, OnInit } from '@angular/core';
import { ReservaResponse, LibroReserva } from 'src/app/models/reserva.model';
import { Curso } from 'src/app/models/curso.model';
import { ToastrService } from 'ngx-toastr';
import { ReservaService } from 'src/app/services/reserva.service';
import { CursoService } from 'src/app/services/curso.service';

@Component({
  selector: 'app-entrega-libros',
  templateUrl: './entrega-libros.component.html',
  styleUrls: ['./entrega-libros.component.css']
})
export class EntregaLibrosComponent implements OnInit {
  reservas: ReservaResponse[] = [];
  reservasFiltradas: ReservaResponse[] = [];
  reservaSeleccionada: ReservaResponse | null = null;
  busqueda: string = '';
  filtroCurso: string = '';
  filtroFecha: string = '';
  filtroEstado: string = '';
  cursos: Curso[] = [];
  librosEntrega: { libro: LibroReserva, entregado: boolean }[] = [];
  mensajeExito: string = '';
  paginaActual: number = 1;
  reservasPorPagina: number = 6;
  mostrarModalConfirmacion: boolean = false;
  cargando: boolean = false;
  procesandoEntrega: boolean = false;

  constructor(
    private toastr: ToastrService,
    private reservaService: ReservaService,
    private cursoService: CursoService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;
    
    // Cargar cursos y reservas en paralelo
    Promise.all([
      this.cursoService.getCursos().toPromise(),
      this.reservaService.obtenerReservas().toPromise()
    ]).then(([cursos, reservas]) => {
      this.cursos = cursos || [];
      this.reservas = reservas || [];
      this.reservasFiltradas = [...this.reservas];
      this.cargando = false;
    }).catch(error => {
      console.error('Error al cargar datos:', error);
      this.toastr.error('Error al cargar los datos', 'Error');
      this.cargando = false;
    });
  }

  // Estado de entrega de una reserva - adaptado al nuevo formato
  getEstadoReserva(reserva: ReservaResponse): 'completo' | 'parcial' | 'pendiente' {
    const total = reserva.libros.length;
    const entregados = reserva.libros.filter(l => l.fechaRecogida !== null).length;
    if (entregados === 0) return 'pendiente';
    if (entregados === total) return 'completo';
    return 'parcial';
  }

  // Badge de estado
  getBadgeEstadoReserva(reserva: ReservaResponse): string {
    const estado = this.getEstadoReserva(reserva);
    if (estado === 'completo') return 'bg-success';
    if (estado === 'parcial') return 'bg-warning';
    return 'bg-secondary';
  }

  // Texto de estado
  getTextoEstadoReserva(reserva: ReservaResponse): string {
    const estado = this.getEstadoReserva(reserva);
    if (estado === 'completo') return 'Completada';
    if (estado === 'parcial') return 'Parcial';
    return 'Pendiente';
  }

  // Filtrar reservas por búsqueda, curso, fecha y estado - adaptado al nuevo formato
  filtrarReservas() {
    let resultado = [...this.reservas];
    const termino = this.busqueda.toLowerCase().trim();
    if (termino) {
      resultado = resultado.filter(r =>
        (r.nombreAlumno + ' ' + r.apellidosAlumno).toLowerCase().includes(termino) ||
        r.correo.toLowerCase().includes(termino) ||
        r.idReserva.toString().includes(termino) ||
        (r.dni && r.dni.toLowerCase().includes(termino))
      );
    }
    if (this.filtroCurso) {
      resultado = resultado.filter(r => r.curso.idCurso.toString() === this.filtroCurso);
    }
    if (this.filtroFecha) {
      resultado = resultado.filter(r => r.fecha === this.filtroFecha);
    }
    if (this.filtroEstado) {
      resultado = resultado.filter(r => this.getEstadoReserva(r) === this.filtroEstado);
    }
    this.paginaActual = 1;
    this.reservasFiltradas = resultado;
  }

  // Paginación
  getReservasPagina(): ReservaResponse[] {
    const inicio = (this.paginaActual - 1) * this.reservasPorPagina;
    return this.reservasFiltradas.slice(inicio, inicio + this.reservasPorPagina);
  }
  totalPaginas(): number {
    return Math.ceil(this.reservasFiltradas.length / this.reservasPorPagina);
  }
  cambiarPagina(delta: number) {
    const nueva = this.paginaActual + delta;
    if (nueva >= 1 && nueva <= this.totalPaginas()) {
      this.paginaActual = nueva;
    }
  }

  // Selección y feedback visual - adaptado al nuevo formato
  seleccionarReserva(reserva: ReservaResponse) {
    this.reservaSeleccionada = reserva;
    this.mensajeExito = '';
    this.librosEntrega = reserva.libros.map(libro => ({ libro, entregado: false }));
  }
  esReservaSeleccionada(reserva: ReservaResponse): boolean {
    return this.reservaSeleccionada?.idReserva === reserva.idReserva;
  }

  // Feedback inmediato al marcar entrega
  marcarEntrega(index: number) {
    // Verificar si el libro puede ser entregado (idEstado = 4)
    if (!this.puedeEntregarLibro(this.librosEntrega[index].libro)) {
      this.toastr.warning('Este libro no está disponible para entrega.', 'Aviso');
      return;
    }
    
    this.librosEntrega[index].entregado = !this.librosEntrega[index].entregado;
  }

  // Verificar si un libro puede ser entregado (debe tener idEstado = 4)
  puedeEntregarLibro(libro: LibroReserva): boolean {
    return libro.idEstado === 4 && libro.fechaRecogida === null;
  }

  // Totales de entregados y pendientes - adaptado al nuevo formato
  getTotalEntregados(): number {
    return this.librosEntrega.filter(l => l.entregado || l.libro.fechaRecogida !== null).length;
  }
  getTotalPendientes(): number {
    return this.librosEntrega.filter(l => !l.entregado && l.libro.fechaRecogida === null).length;
  }

  // Modal de confirmación
  abrirModalConfirmacion() {
    this.mostrarModalConfirmacion = true;
  }
  cerrarModalConfirmacion() {
    this.mostrarModalConfirmacion = false;
  }
  confirmarEntrega() {
    // Filtrar solo los libros que pueden ser entregados
    const librosValidosParaEntregar = this.librosEntrega.filter(l => 
      l.entregado && this.puedeEntregarLibro(l.libro)
    );
    
    if (librosValidosParaEntregar.length === 0) {
      this.toastr.warning('No hay libros válidos seleccionados para entregar. Solo se pueden entregar libros en estado disponible.', 'Aviso');
      return;
    }

    if (!this.reservaSeleccionada) {
      this.toastr.error('No hay reserva seleccionada.', 'Error');
      return;
    }

    // Obtener los IDs de los libros válidos a entregar
    const librosAEntregar = librosValidosParaEntregar.map(l => l.libro.idLibro);

    this.procesandoEntrega = true;
    this.cerrarModalConfirmacion();

    // Llamar al endpoint para entregar los libros
    this.reservaService.entregarLibros(this.reservaSeleccionada.idReserva, librosAEntregar)
      .subscribe({
        next: (response) => {
          this.procesandoEntrega = false;
          
          // Actualizar el estado local de los libros entregados
          this.librosEntrega.forEach(l => {
            if (l.entregado && this.puedeEntregarLibro(l.libro)) {
              l.libro.fechaRecogida = new Date().toISOString().split('T')[0];
              l.entregado = false; // Reset selection
            }
          });

          // Actualizar también en la reserva original para que se refleje en la lista
          if (this.reservaSeleccionada) {
            this.reservaSeleccionada.libros.forEach(libro => {
              if (librosAEntregar.includes(libro.idLibro)) {
                libro.fechaRecogida = new Date().toISOString().split('T')[0];
              }
            });
          }

          this.toastr.success(`¡Entrega registrada correctamente! Se han entregado ${librosValidosParaEntregar.length} libro(s).`, 'Éxito');
        },
        error: (error) => {
          this.procesandoEntrega = false;
          console.error('Error al entregar libros:', error);
          
          let mensajeError = 'Error al registrar la entrega.';
          if (error.error && error.error.message) {
            mensajeError = error.error.message;
          } else if (error.message) {
            mensajeError = error.message;
          }
          
          this.toastr.error(mensajeError, 'Error');
        }
      });
  }

  limpiarSeleccion() {
    this.reservaSeleccionada = null;
    this.mensajeExito = '';
  }

  todosEntregados(): boolean {
    return this.librosEntrega.length > 0 && this.librosEntrega.every(l => l.libro.fechaRecogida !== null);
  }

  // Verificar si hay libros seleccionados para entregar
  hayLibrosSeleccionados(): boolean {
    return this.librosEntrega.some(l => l.entregado && this.puedeEntregarLibro(l.libro));
  }

  getNombreCurso(idCurso: string | number): string {
    const curso = this.cursos.find(c => c.id == idCurso.toString());
    return curso ? curso.nombre : idCurso.toString();
  }
}
