import { Component, OnInit } from '@angular/core';
import { ReservaResponse, LibroReserva } from 'src/app/models/reserva.model';
import { Curso } from 'src/app/models/curso.model';
import { ToastrService } from 'ngx-toastr';

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
  cursos: Curso[] = [
    { id: '7', nombre: '1º Infantil', etapa: 'Infantil' },
    { id: '8', nombre: '2º Infantil', etapa: 'Infantil' },
    { id: '9', nombre: '3º Infantil', etapa: 'Infantil' },
    { id: '10', nombre: '1º Bachillerato', etapa: 'Bachillerato' },
    { id: '11', nombre: '2º Bachillerato', etapa: 'Bachillerato' },
    { id: '13', nombre: 'CFGM Administración', etapa: 'Ciclos Formativos' },
    { id: '14', nombre: 'CFGS Informática', etapa: 'Ciclos Formativos' },
    { id: '15', nombre: 'CFGS Marketing', etapa: 'Ciclos Formativos' },
  ];
  librosEntrega: { libro: LibroReserva, entregado: boolean }[] = [];
  mensajeExito: string = '';
  paginaActual: number = 1;
  reservasPorPagina: number = 6;
  mostrarModalConfirmacion: boolean = false;

  constructor(private toastr: ToastrService) {}

  ngOnInit(): void {
    this.generarDatosFalsos();
    this.reservasFiltradas = [...this.reservas];
  }

  generarDatosFalsos() {
    this.reservas = [
      {
        id: 13,
        nombreAlumno: 'Paula',
        apellidosAlumno: 'Ramos',
        correo: 'paula.ramos@email.com',
        dni: '12345678A',
        fecha: '2024-06-13',
        verificado: 1,
        curso: 7,
        libros: [
          { id: 137, nombre: 'Colores y Formas', precio: '15.00', estado: 'pendiente' },
          { id: 138, nombre: 'Primeras Letras', precio: '16.00', estado: 'pendiente' },
        ]
      },
      {
        id: 14,
        nombreAlumno: 'Mario',
        apellidosAlumno: 'Gil',
        correo: 'mario.gil@email.com',
        dni: '23456789B',
        fecha: '2024-06-14',
        verificado: 0,
        curso: 8,
        libros: [
          { id: 139, nombre: 'Números Infantiles', precio: '14.00', estado: 'pendiente' },
          { id: 140, nombre: 'Cuentos Cortos', precio: '13.00', estado: 'pendiente' },
        ]
      },
      {
        id: 15,
        nombreAlumno: 'Sara',
        apellidosAlumno: 'Vega',
        correo: 'sara.vega@email.com',
        dni: '34567890C',
        fecha: '2024-06-15',
        verificado: 1,
        curso: 9,
        libros: [
          { id: 141, nombre: 'Dibujos y Manualidades', precio: '17.00', estado: 'pendiente' },
          { id: 142, nombre: 'Canciones Infantiles', precio: '12.00', estado: 'pendiente' },
        ]
      },
      {
        id: 16,
        nombreAlumno: 'Alberto',
        apellidosAlumno: 'Santos',
        correo: 'alberto.santos@email.com',
        dni: '45678901D',
        fecha: '2024-06-16',
        verificado: 1,
        curso: 10,
        libros: [
          { id: 143, nombre: 'Matemáticas 1º Bach', precio: '29.00', estado: 'pendiente' },
          { id: 144, nombre: 'Física 1º Bach', precio: '31.00', estado: 'pendiente' },
        ]
      },
      {
        id: 17,
        nombreAlumno: 'Clara',
        apellidosAlumno: 'Herrera',
        correo: 'clara.herrera@email.com',
        dni: '56789012E',
        fecha: '2024-06-17',
        verificado: 0,
        curso: 11,
        libros: [
          { id: 145, nombre: 'Lengua 2º Bach', precio: '28.00', estado: 'pendiente' },
          { id: 146, nombre: 'Historia 2º Bach', precio: '30.00', estado: 'pendiente' },
        ]
      },
      {
        id: 18,
        nombreAlumno: 'Iván',
        apellidosAlumno: 'Ortega',
        correo: 'ivan.ortega@email.com',
        dni: '67890123F',
        fecha: '2024-06-18',
        verificado: 1,
        curso: 11,
        libros: [
          { id: 147, nombre: 'Química 2º Bach', precio: '32.00', estado: 'pendiente' },
          { id: 148, nombre: 'Matemáticas 2º Bach', precio: '29.00', estado: 'pendiente' },
        ]
      },
      {
        id: 19,
        nombreAlumno: 'Raquel',
        apellidosAlumno: 'Pérez',
        correo: 'raquel.perez@email.com',
        dni: '78901234G',
        fecha: '2024-06-19',
        verificado: 1,
        curso: 13,
        libros: [
          { id: 149, nombre: 'Administración I', precio: '35.00', estado: 'pendiente' },
          { id: 150, nombre: 'Contabilidad', precio: '36.00', estado: 'pendiente' },
        ]
      },
      {
        id: 20,
        nombreAlumno: 'Andrés',
        apellidosAlumno: 'Luna',
        correo: 'andres.luna@email.com',
        dni: '89012345H',
        fecha: '2024-06-20',
        verificado: 0,
        curso: 14,
        libros: [
          { id: 151, nombre: 'Redes Informáticas', precio: '38.00', estado: 'pendiente' },
          { id: 152, nombre: 'Programación', precio: '40.00', estado: 'pendiente' },
        ]
      },
      {
        id: 21,
        nombreAlumno: 'Patricia',
        apellidosAlumno: 'Molina',
        correo: 'patricia.molina@email.com',
        dni: '90123456J',
        fecha: '2024-06-21',
        verificado: 1,
        curso: 15,
        libros: [
          { id: 153, nombre: 'Marketing Digital', precio: '37.00', estado: 'pendiente' },
          { id: 154, nombre: 'Gestión Comercial', precio: '39.00', estado: 'pendiente' },
        ]
      },
      ...this.reservas?.filter(r => !['1','2','3','4','5','6'].includes(r.curso?.toString())) || []
    ];
  }

  // Estado de entrega de una reserva
  getEstadoReserva(reserva: ReservaResponse): 'completo' | 'parcial' | 'pendiente' {
    const total = reserva.libros.length;
    const entregados = reserva.libros.filter(l => l.estado === 'entregado').length;
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

  // Filtrar reservas por búsqueda, curso, fecha y estado
  filtrarReservas() {
    let resultado = [...this.reservas];
    const termino = this.busqueda.toLowerCase().trim();
    if (termino) {
      resultado = resultado.filter(r =>
        r.nombreAlumno.toLowerCase().includes(termino) ||
        r.apellidosAlumno.toLowerCase().includes(termino) ||
        r.correo.toLowerCase().includes(termino) ||
        r.id.toString().includes(termino) ||
        (r.dni && r.dni.toLowerCase().includes(termino))
      );
    }
    if (this.filtroCurso) {
      resultado = resultado.filter(r => r.curso.toString() === this.filtroCurso);
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

  // Selección y feedback visual
  seleccionarReserva(reserva: ReservaResponse) {
    this.reservaSeleccionada = reserva;
    this.mensajeExito = '';
    this.librosEntrega = reserva.libros.map(libro => ({ libro, entregado: false }));
  }
  esReservaSeleccionada(reserva: ReservaResponse): boolean {
    return this.reservaSeleccionada?.id === reserva.id;
  }

  // Feedback inmediato al marcar entregado
  marcarEntrega(index: number) {
    this.librosEntrega[index].entregado = !this.librosEntrega[index].entregado;
  }

  // Totales de entregados y pendientes
  getTotalEntregados(): number {
    return this.librosEntrega.filter(l => l.entregado || l.libro.estado === 'entregado').length;
  }
  getTotalPendientes(): number {
    return this.librosEntrega.filter(l => !l.entregado && l.libro.estado !== 'entregado').length;
  }

  // Modal de confirmación
  abrirModalConfirmacion() {
    this.mostrarModalConfirmacion = true;
  }
  cerrarModalConfirmacion() {
    this.mostrarModalConfirmacion = false;
  }
  confirmarEntrega() {
    const entregados = this.librosEntrega.filter(l => l.entregado).length;
    if (entregados === 0) {
      this.toastr.warning('Selecciona al menos un libro para entregar.', 'Aviso');
      return;
    }
    this.librosEntrega.forEach(l => {
      if (l.entregado) l.libro.estado = 'entregado';
    });
    this.cerrarModalConfirmacion();
    this.toastr.success(`¡Entrega registrada! Se han entregado ${entregados} libro(s).`, 'Éxito');
  }

  limpiarSeleccion() {
    this.reservaSeleccionada = null;
    this.mensajeExito = '';
  }

  todosEntregados(): boolean {
    return this.librosEntrega.length > 0 && this.librosEntrega.every(l => l.libro.estado === 'entregado');
  }

  getNombreCurso(idCurso: string | number): string {
    const curso = this.cursos.find(c => c.id == idCurso.toString());
    return curso ? curso.nombre : idCurso.toString();
  }
}
