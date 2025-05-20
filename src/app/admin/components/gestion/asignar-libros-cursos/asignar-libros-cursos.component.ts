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
  idCurso?: string;
  libroNombre?: string;
  cursoNombre?: string;
  libro?: Libro;
  curso?: Curso;
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
    // Limpiar selecciones previas para evitar acumulación
    this.librosSeleccionados = [];
    
    this.cursoSeleccionado = this.cursos.find(c => c.id === cursoId) || null;
    
    if (this.cursoSeleccionado) {
      console.log(`Curso seleccionado: ${this.cursoSeleccionado.nombre} (ID: ${cursoId})`);
      this.cargarLibrosDelCurso(cursoId);
      // Reiniciar búsqueda al cambiar de curso
      this.busquedaLibro = '';
      this.filtrarLibros();
      this.cambiosPendientes = false;
    }
  }

  cargarLibrosDelCurso(cursoId: string): void {
    console.log(`Cargando libros del curso con ID: ${cursoId}`);
    
    // Aseguramos que no estamos en un ciclo
    if (this.isLoading) {
      console.log('Ya hay una operación de carga en curso. Se cancelará esta petición.');
      return;
    }
    
    this.isLoading = true; // Activar indicador de carga
    
    // Usar el método real para cargar los libros del curso
    this.crudService.getLibrosByCurso(cursoId).subscribe({
      next: (asignaciones) => {
        // Obtener los IDs de los libros asignados
        const librosIds = asignaciones.map(a => a.idLibro);
        
        // Buscar los libros completos correspondientes a esos IDs
        this.librosSeleccionados = this.libros.filter(libro => 
          libro.id && librosIds.includes(libro.id)
        );
        
        console.log(`Se encontraron ${this.librosSeleccionados.length} libros asignados al curso.`);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar libros del curso:', error);
        this.toastr.error('Error al cargar los libros del curso', 'Error');
        this.isLoading = false;
      }
    });
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
    
    // 1. Obtener la lista actual de libros asignados al curso desde el backend
    this.crudService.getLibrosByCurso(this.cursoSeleccionado.id).pipe(
      catchError(error => {
        console.error('Error al obtener asignaciones actuales:', error);
        return of([]); // En caso de error, asumir que no hay asignaciones
      })
    ).subscribe(asignacionesActuales => {
      // Convertir a array de IDs de libros
      const librosActualesIds = asignacionesActuales.map(a => a.idLibro);
      const librosSeleccionadosIds = this.librosSeleccionados.map(l => l.id).filter(id => id !== undefined) as number[];
      
      // 2. Determinar qué libros añadir (están en seleccionados pero no en actuales)
      const librosParaAñadir = librosSeleccionadosIds.filter(id => !librosActualesIds.includes(id));
      
      // 3. Determinar qué libros eliminar (están en actuales pero no en seleccionados)
      const librosParaEliminar = librosActualesIds.filter(id => !librosSeleccionadosIds.includes(id));
      
      console.log(`Libros para añadir: ${librosParaAñadir.length}, Libros para eliminar: ${librosParaEliminar.length}`);
      
      // 4. Crear las operaciones de añadir y eliminar
      const operacionesAñadir = librosParaAñadir.map(idLibro => 
        this.crudService.asignarLibroACurso(idLibro, this.cursoSeleccionado!.id).pipe(
          catchError(error => {
            console.error(`Error al asignar libro ${idLibro}:`, error);
            return of(null);
          })
        )
      );
      
      const operacionesEliminar = librosParaEliminar.map(idLibro => 
        this.crudService.eliminarAsignacionLibroCurso(idLibro, this.cursoSeleccionado!.id).pipe(
          catchError(error => {
            console.error(`Error al eliminar asignación de libro ${idLibro}:`, error);
            return of(null);
          })
        )
      );
      
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
}