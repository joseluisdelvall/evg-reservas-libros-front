import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Libro } from 'src/app/models/libro.model';
import { Curso } from 'src/app/models/curso.model';
import { CrudService } from 'src/app/services/crud.service';
import { CursoService } from 'src/app/services/curso.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface LibroCursoAsignacion {
  id?: string;
  idLibro?: number;
  idCurso?: number;
  libroNombre?: string;
  cursoNombre?: string;
  libro?: Libro;
  curso?: Curso | null; // Permitir null aquí
}

@Component({
  selector: 'app-asignar-libros-cursos',
  templateUrl: './asignar-libros-cursos.component.html',
  styleUrls: ['./asignar-libros-cursos.component.css']
})
export class AsignarLibrosCursosComponent implements OnInit {
  cursoForm: FormGroup;
  libros: Libro[] = [];
  librosFiltrados: Libro[] = [];
  busquedaLibro: string = '';
  cursos: Curso[] = [];
  cursoSeleccionado: Curso | null = null;
  asignaciones: LibroCursoAsignacion[] = [];
  isLoading: boolean = false;
  librosSeleccionados: Libro[] = [];
  cambiosPendientes: boolean = false;

  constructor(
    private fb: FormBuilder,
    private crudService: CrudService,
    private cursoService: CursoService,
    private toastr: ToastrService
  ) {
    this.cursoForm = this.fb.group({
      curso: ['', Validators.required],
      librosIds: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.cargarCursos();
    this.cargarLibros();
    this.listenCursoChanges();
    this.cargarAsignaciones();
  }

  cargarAsignaciones(): void {
    this.isLoading = true;
    this.crudService.getLibrosCursos().subscribe({
      next: (data) => {
        this.asignaciones = data;
        console.log('Asignaciones cargadas:', this.asignaciones);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar asignaciones:', error);
        this.toastr.error('Error al cargar asignaciones', 'Error');
        this.isLoading = false;
      }
    });
  }

  cargarCursos(): void {
    this.isLoading = true;
    this.cursoService.getCursos().subscribe({
      next: (data) => {
        this.cursos = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar los cursos:', error);
        this.toastr.error('Error al cargar los cursos', 'Error');
        this.isLoading = false;
      }
    });
  }

  cargarLibros(): void {
    this.isLoading = true;
    this.crudService.getLibros().subscribe({
      next: (data) => {
        // Filtrar solo libros activos y asegurar que todos los campos necesarios existan
        this.libros = data
          .filter(libro => libro.estado === true)
          .map(libro => ({
            ...libro,
            id: libro.id || 0,
            nombre: libro.nombre || 'Libro sin nombre',
            isbn: libro.isbn || 'Sin ISBN',
            precio: libro.precio || 0
          }));
        console.log('Libros cargados:', this.libros);
        this.librosFiltrados = [...this.libros];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar los libros:', error);
        this.toastr.error('Error al cargar los libros', 'Error');
        this.isLoading = false;
      }
    });
  }

  filtrarLibros(): void {
    const termino = this.busquedaLibro.toLowerCase().trim();
    
    if (!termino) {
      // Crear copia para evitar referencias
      this.librosFiltrados = [...this.libros];
      return;
    }
    
    this.librosFiltrados = this.libros.filter(libro => 
      (libro.nombre && libro.nombre.toLowerCase().includes(termino)) || 
      (libro.isbn && libro.isbn.toLowerCase().includes(termino))
    );
  }

  listenCursoChanges() {
    this.cursoForm.get('curso')?.valueChanges.subscribe(cursoId => {
      if (cursoId) {
        // Evitamos posibles ciclos infinitos verificando que el cursoSeleccionado sea diferente
        if (!this.cursoSeleccionado || this.cursoSeleccionado.id !== cursoId) {
          // Preguntar si hay cambios pendientes
          if (this.cambiosPendientes) {
            if (confirm('Hay cambios sin guardar. ¿Deseas continuar sin guardarlos?')) {
              this.cambiarCurso(cursoId);
            } else {
              // Restablecer el valor del select al curso anterior
              setTimeout(() => {
                this.cursoForm.get('curso')?.setValue(this.cursoSeleccionado?.id || '', { emitEvent: false });
              });
            }
          } else {
            this.cambiarCurso(cursoId);
          }
        }
      } else {
        // Resetear todo cuando no hay curso seleccionado
        this.cursoSeleccionado = null;
        this.librosSeleccionados = [];
        this.busquedaLibro = '';
        this.filtrarLibros();
        this.cambiosPendientes = false;
      }
    });
  }

  cambiarCurso(cursoId: string): void {
    this.librosSeleccionados = [];
    this.cursoSeleccionado = this.cursos.find(c => c.id === cursoId) || null;

    if (this.cursoSeleccionado) {
      this.isLoading = true;
      const idEtapaCurso = this.cursoSeleccionado.etapa;

      // 1. Obtener libros de la etapa
      this.crudService.getLibrosByEtapa(idEtapaCurso).subscribe({
        next: (resp: { status: string; data: any[] }) => {
          const librosEtapa = resp.data || [];
          this.librosFiltrados = librosEtapa;

          // 2. Obtener libros asignados al curso
          this.crudService.getLibrosByCurso(cursoId).subscribe({
            next: (resp2: { status: string; data: any[] }) => {
              const librosAsignados = resp2.data || [];
              const idsAsignados = librosAsignados.map((l: any) => l.id);

              // 3. Marcar como seleccionados los que están en ambos arrays
              this.librosSeleccionados = this.librosFiltrados.filter(libro =>
                idsAsignados.includes(libro.id)
              );

              this.isLoading = false;
            },
            error: () => {
              this.librosSeleccionados = [];
              this.isLoading = false;
            }
          });
        },
        error: () => {
          this.librosFiltrados = [];
          this.librosSeleccionados = [];
          this.isLoading = false;
        }
      });

      this.busquedaLibro = '';
      this.cambiosPendientes = false;
    }
  }

  toggleLibroSeleccionado(libro: Libro): void {
    if (!this.cursoSeleccionado || !libro.id) return;
    
    const index = this.librosSeleccionados.findIndex(l => l.id === libro.id);
    
    if (index !== -1) {
      // El libro ya está seleccionado, lo quitamos de la UI pero no del backend todavía
      this.librosSeleccionados.splice(index, 1);
    } else {
      // El libro no está seleccionado, lo añadimos a la UI pero no al backend todavía
      this.librosSeleccionados.push(libro);
    }
    
    // Indicar que hay cambios pendientes
    this.cambiosPendientes = true;
  }

  isLibroSeleccionado(libroId: number | undefined): boolean {
    if (libroId === undefined) return false;
    return this.librosSeleccionados.some(l => l.id === libroId);
  }

  guardarCambios(): void {
    if (!this.cursoSeleccionado || !this.cambiosPendientes) {
      if (!this.cursoSeleccionado) {
        this.toastr.warning('Selecciona un curso primero', 'Aviso');
      } else {
        this.toastr.info('No hay cambios pendientes para guardar', 'Información');
      }
      return;
    }
    
    this.isLoading = true;
    
    // Convertir cursoId a number
    const cursoId = typeof this.cursoSeleccionado.id === 'string' ? 
      parseInt(this.cursoSeleccionado.id, 10) : this.cursoSeleccionado.id;
    
    // 1. Obtener la lista actual de libros asignados al curso desde el backend
    this.crudService.getLibrosByCurso(this.cursoSeleccionado.id).pipe(
      catchError(error => {
        console.error('Error al obtener asignaciones actuales:', error);
        return of({ status: 'error', data: [] }); // Retornar formato esperado
      })
    ).subscribe(asignacionesActualesResp => {
      // Asegurar que siempre trabajamos con un array de asignaciones
      const asignacionesActuales: any[] = Array.isArray(asignacionesActualesResp)
        ? asignacionesActualesResp
        : (asignacionesActualesResp && Array.isArray(asignacionesActualesResp.data) ? asignacionesActualesResp.data : []);
      
      // Convertir a array de IDs de libros, asegurando que sean números
      const librosActualesIds = asignacionesActuales
        .map((a: any) => Number(a.id))
        .filter(id => !isNaN(id)); // Filtrar valores NaN
      
      const librosSeleccionadosIds = this.librosSeleccionados
        .map((l: any) => Number(l.id))
        .filter((id: any) => id !== undefined && !isNaN(id)) as number[];
      
      // 2. Determinar qué libros añadir (están en seleccionados pero no en actuales)
      const librosParaAñadir = librosSeleccionadosIds.filter((id: number) => !librosActualesIds.includes(id));
      
      // 3. Determinar qué libros eliminar (están en actuales pero no en seleccionados)
      const librosParaEliminar = librosActualesIds.filter((id: number) => !librosSeleccionadosIds.includes(id));
      
      // 4. Crear las operaciones de añadir y eliminar
      const operacionesAñadir = librosParaAñadir.map((idLibro: number) => 
        this.crudService.asignarLibroACurso(idLibro, cursoId).pipe(
          catchError(error => {
            console.error(`Error al asignar libro ${idLibro}:`, error);
            return of(null);
          })
        )
      );
      
      const operacionesEliminar = librosParaEliminar.map((idLibro: number) => {
        return this.crudService.eliminarAsignacionLibroCurso(idLibro, cursoId).pipe(
          catchError(error => {
            console.error(`Error al eliminar asignación de libro ${idLibro}:`, error);
            return of(null);
          })
        );
      });
      
      // 5. Ejecutar todas las operaciones en paralelo
      const todasLasOperaciones = [...operacionesAñadir, ...operacionesEliminar];
      
      if (todasLasOperaciones.length === 0) {
        this.isLoading = false;
        this.toastr.info('No se detectaron cambios en las asignaciones', 'Información');
        this.cambiosPendientes = false;
        return;
      }
      
      forkJoin(todasLasOperaciones).subscribe({
        next: (resultados) => {
          this.isLoading = false;
          this.cambiosPendientes = false;
          
          // Contar éxitos y fallos
          const exitosos = resultados.filter(r => r !== null).length;
          const fallidos = resultados.filter(r => r === null).length;
          
          if (fallidos === 0) {
            this.toastr.success(
              `Se han actualizado las asignaciones para el curso ${this.cursoSeleccionado!.nombre}`,
              'Éxito'
            );
          } else if (exitosos > 0) {
            this.toastr.warning(
              `Algunas asignaciones no se pudieron actualizar (${exitosos} éxitos, ${fallidos} fallos)`,
              'Aviso'
            );
          } else {
            this.toastr.error(
              'No se pudo actualizar ninguna asignación',
              'Error'
            );
          }
          
          // Actualizar las asignaciones globales
          this.cargarAsignaciones();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al guardar cambios:', error);
          this.toastr.error('Error al guardar los cambios', 'Error');
        }
      });
    });
  }

  eliminarAsignacion(asignacion: LibroCursoAsignacion) {
    if (!asignacion.idLibro || !asignacion.idCurso) {
      console.error('No se pueden eliminar asignaciones sin idLibro e idCurso');
      this.toastr.error('Error: Faltan datos para eliminar la asignación');
      return;
    }

    // Convertir a números si vienen como strings
    const idLibro = typeof asignacion.idLibro === 'string' ? 
      parseInt(asignacion.idLibro, 10) : asignacion.idLibro;
    const idCurso = typeof asignacion.idCurso === 'string' ? 
      parseInt(asignacion.idCurso, 10) : asignacion.idCurso;

    // Validar que son números válidos
    if (isNaN(idLibro) || isNaN(idCurso)) {
      console.error('IDs inválidos:', { idLibro, idCurso });
      this.toastr.error('Error: IDs de libro o curso inválidos');
      return;
    }

    console.log('Eliminando asignación:', { idLibro, idCurso });

    this.isLoading = true;
    
    this.crudService.eliminarAsignacionLibroCurso(idLibro, idCurso).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        if (response.status === 'success') {
          // Remover la asignación de la lista local
          this.asignaciones = this.asignaciones.filter(a => 
            !(a.idLibro === idLibro && a.idCurso === idCurso)
          );
          
          // Remover el libro de la lista de seleccionados
          this.librosSeleccionados = this.librosSeleccionados.filter(l => 
            l.id !== idLibro
          );
          
          this.toastr.success('Asignación eliminada correctamente');
          this.cambiosPendientes = false; // Cambiar a false ya que se guardó el cambio
        } else {
          this.toastr.error(response.message || 'Error al eliminar la asignación');
        }
      },
      error: (error) => {
        console.error('Error al eliminar asignación:', error);
        this.toastr.error('Error al eliminar la asignación');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  asignarLibroACurso(libro: Libro) {
    if (!this.cursoSeleccionado || !libro.id) {
      this.toastr.error('Debe seleccionar un curso y un libro válido');
      return;
    }

    // Asegurar que los IDs sean números válidos
    const idLibro = typeof libro.id === 'string' ? parseInt(libro.id, 10) : libro.id;
    const idCurso = typeof this.cursoSeleccionado.id === 'string' ? 
      parseInt(this.cursoSeleccionado.id, 10) : this.cursoSeleccionado.id;

    if (isNaN(idLibro) || isNaN(idCurso)) {
      console.error('IDs inválidos:', { idLibro, idCurso });
      this.toastr.error('Error: IDs de libro o curso inválidos');
      return;
    }

    console.log('Asignando libro a curso:', { idLibro, idCurso });

    this.isLoading = true;

    this.crudService.asignarLibroACurso(idLibro, idCurso).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        // Agregar el libro a la lista de seleccionados solo si no está ya
        if (!this.librosSeleccionados.find(l => l.id === idLibro)) {
          this.librosSeleccionados.push(libro);
        }
        
        // Crear nueva asignación para mostrar en la lista
        const nuevaAsignacion: LibroCursoAsignacion = {
          idLibro: idLibro,
          idCurso: idCurso,
          libroNombre: libro.nombre,
          cursoNombre: this.cursoSeleccionado?.nombre,
          libro: libro,
          curso: this.cursoSeleccionado
        };
        
        this.asignaciones.push(nuevaAsignacion);
        this.toastr.success('Libro asignado correctamente al curso');
        this.cambiosPendientes = false; // Cambiar a false ya que se guardó el cambio
      },
      error: (error) => {
        console.error('Error al asignar libro:', error);
        this.toastr.error('Error al asignar el libro al curso');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}