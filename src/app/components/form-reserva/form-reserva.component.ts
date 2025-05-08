import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CursoService } from '../../services/curso.service';
import { LibroService } from '../../services/libro.service';
import { ReservaService } from '../../services/reserva.service';
import { Curso } from '../../models/curso.model';
import { Libro } from '../../models/libro.model';
import { ReservaRequest, ReservaResponse } from '../../models/reserva.model';

@Component({
  selector: 'app-form-reserva',
  templateUrl: './form-reserva.component.html',
  styleUrls: ['./form-reserva.component.css']
})
export class FormReservaComponent implements OnInit {
  reservaForm!: FormGroup;
  cursos: Curso[] = [];
  libros: Libro[] = [];
  mostrarLibros = false;
  loading = false;
  justificanteFile: File | null = null;
  mensajeExito: string = '';
  mensajeError: string = '';
  reservaCompletada: ReservaResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private cursoService: CursoService,
    private libroService: LibroService,
    private reservaService: ReservaService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCursos();
    this.listenCursoChanges();
  }

  loadCursos() {
    this.cursoService.getCursos().subscribe({
      next: (data) => {
        this.cursos = data;
      },
      error: (error) => {
        console.error('Error al cargar los cursos:', error);
      }
    });
  }

  loadLibrosByCurso(cursoId: string) {
    this.libroService.getLibrosByCurso(cursoId).subscribe({
      next: (libros) => {
        this.libros = libros;
        
        const libroControl = this.reservaForm.get('libro');
        if (this.libros.length > 0) {
          libroControl?.enable();
          
          // Agregar validadores pero sin disparar errores
          libroControl?.setValidators(Validators.required);
          libroControl?.updateValueAndValidity({onlySelf: true, emitEvent: false});
          
          this.mostrarLibros = true;
        } else {
          libroControl?.disable();
          libroControl?.clearValidators();
          this.mostrarLibros = false;
        }
        libroControl?.updateValueAndValidity({onlySelf: true, emitEvent: false});
      },
      error: (error) => {
        console.error('Error al cargar los libros:', error);
        this.mostrarLibros = false;
      }
    });
  }

  initForm() {
    this.reservaForm = this.fb.group({
      nombreAlumno: ['', [Validators.required, Validators.minLength(3)]],
      apellidosAlumno: ['', [Validators.required, Validators.minLength(3)]],
      nombreTutor: ['', Validators.minLength(3)],
      apellidosTutor: ['', Validators.minLength(3)],
      dni: ['', [Validators.required, Validators.minLength(9)]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern('^[6-9]\\d{8}$')]],
      curso: [null, Validators.required],
      libro: [{ value: '', disabled: true }, Validators.required],
      justificante: ['', Validators.required]
    });
  }  

  listenCursoChanges() {
    this.reservaForm.get('curso')?.valueChanges.subscribe(curso => {
      const libroControl = this.reservaForm.get('libro');
      
      // Temporalmente quitar validadores antes de resetear
      libroControl?.clearValidators();
      libroControl?.updateValueAndValidity();
      
      // Resetear valor
      libroControl?.setValue(null);
      
      // Resetear estados
      libroControl?.markAsPristine();
      libroControl?.markAsUntouched();
      
      if (!curso) {
        this.mostrarLibros = false;
        return;
      }
      
      // Si curso es un objeto, obtenemos su id
      const cursoId = curso && typeof curso === 'object' ? curso.id : curso;
      
      // Cargar los libros desde el backend
      this.loadLibrosByCurso(cursoId);
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.justificanteFile = file;
      this.reservaForm.patchValue({ justificante: file.name });
      this.reservaForm.get('justificante')?.updateValueAndValidity();
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.reservaForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getError(controlName: string): string {
    const control = this.reservaForm.get(controlName);
    if (control?.hasError('required')) return 'Este campo es obligatorio.';
    if (controlName === 'correo' && control?.hasError('email')) return 'Ingrese un correo electrónico válido.';
    if (controlName === 'telefono' && control?.hasError('pattern')) return 'Ingrese un teléfono válido (9 dígitos, comenzando por 6, 7, 8 o 9).';
    if (control?.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength'].requiredLength;
      return `Debe tener al menos ${requiredLength} caracteres.`;
    }
    return '';
  }

  onSubmit() {
    // Log del estado del formulario para depuración
    this.logFormStatus();
    
    if (this.reservaForm.valid && this.justificanteFile) {
      this.loading = true;
      this.mensajeExito = '';
      this.mensajeError = '';
      this.reservaCompletada = null; // Reset any previous reservation

      // Preparar los datos para enviar
      const formValues = this.reservaForm.value;
      
      try {
        // Extraer los IDs de los libros seleccionados
        let librosIds: number[] = [];
        
        if (Array.isArray(formValues.libro)) {
          librosIds = formValues.libro.map((libro: Libro | number) => {
            // Si es un objeto Libro, obtenemos su ID, si es un número lo usamos directamente
            return typeof libro === 'object' ? libro.id : Number(libro);
          });
        } else if (formValues.libro) {
          // Si es un único valor
          librosIds = [typeof formValues.libro === 'object' ? formValues.libro.id : Number(formValues.libro)];
        }
        
        // Verificar si hay libros seleccionados
        if (librosIds.length === 0) {
          throw new Error('Debe seleccionar al menos un libro');
        }

        const reservaData: ReservaRequest = {
          nombreAlumno: formValues.nombreAlumno,
          apellidosAlumno: formValues.apellidosAlumno,
          nombreTutorLegal: formValues.nombreTutor || undefined,
          apellidosTutorLegal: formValues.apellidosTutor || undefined,
          correo: formValues.correo,
          dni: formValues.dni,
          telefono: formValues.telefono,
          idCurso: formValues.curso,
          libros: librosIds
        };

        // Log para depuración
        console.log('Datos del formulario a enviar:', reservaData);
        console.log('Archivo justificante:', this.justificanteFile);

        // Comprobación de tamaño del archivo (opcional)
        const fileSizeMB = this.justificanteFile.size / (1024 * 1024);
        console.log(`Tamaño del archivo: ${fileSizeMB.toFixed(2)} MB`);
        
        if (fileSizeMB > 5) {
          this.mensajeError = 'El archivo es demasiado grande. El tamaño máximo permitido es 5MB.';
          this.loading = false;
          return;
        }

        // Enviar al backend usando JSON
        this.reservaService.crearReserva(reservaData, this.justificanteFile)
          .subscribe({
            next: (response) => {
              this.loading = false;
              
              // Log para depuración
              console.log('Respuesta procesada del servidor:', response);
              
              // Verificar si la respuesta tiene la estructura esperada
              if (response && response.id) {
                // Si el id es mayor a 1000, sabemos que es una respuesta simulada
                // debido a un problema de comunicación con el servidor de correo
                if (response.id >= 1000) {
                  this.mensajeExito = `¡Reserva realizada con éxito! Se registró su reserva pero hubo un problema al enviar el correo de confirmación. Por favor, guarde este número de reserva: ${response.id}.`;
                } else {
                  this.mensajeExito = `¡Reserva realizada con éxito! Número de reserva: ${response.id}. Se ha enviado un correo de confirmación.`;
                }
                
                // Guardar la respuesta y resetear el formulario
                this.reservaCompletada = response;
                this.resetForm();
              } else {
                // Si la respuesta no tiene la estructura esperada
                console.error('Respuesta inesperada del servidor:', response);
                this.mensajeError = 'La respuesta del servidor no tiene el formato esperado.';
              }
            },
            error: (error) => {
              this.loading = false;
              console.error('Error al crear la reserva:', error);
              this.mensajeError = `Error al procesar la reserva: ${error.message || 'Error desconocido'}. Por favor, inténtelo de nuevo.`;
            }
          });
      } catch (error: any) {
        this.loading = false;
        this.mensajeError = `Error en el formulario: ${error.message || 'Error desconocido'}`;
        console.error('Error al preparar los datos:', error);
      }
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.reservaForm.controls).forEach(key => {
        this.reservaForm.get(key)?.markAsTouched();
      });
      
      if (!this.justificanteFile) {
        this.mensajeError = 'Debe adjuntar un justificante de pago.';
      } else {
        this.mensajeError = 'Por favor, complete correctamente todos los campos obligatorios.';
      }
    }
  }

  resetForm() {
    this.reservaForm.reset();
    this.mostrarLibros = false;
    this.justificanteFile = null;
    this.mensajeExito = '';
    this.mensajeError = '';
    // No reseteamos this.reservaCompletada aquí para mantener el resumen visible
  }

  // Obtener el nombre del curso por su ID
  getCursoNombre(cursoId: number | null): string {
    if (cursoId === null || cursoId === undefined) {
      return 'No especificado';
    }
    
    // Si aún no se han cargado los cursos
    if (!this.cursos || this.cursos.length === 0) {
      return `Curso ${cursoId}`;
    }
    
    const curso = this.cursos.find(c => parseInt(c.id) === cursoId);
    return curso ? curso.nombre : `Curso ${cursoId}`;
  }

  // Calcular el total de los libros
  calcularTotal(libros: any[] | null | undefined): string {
    if (!libros || libros.length === 0) {
      return '0.00';
    }
    return libros.reduce((total, libro) => total + parseFloat(libro.precio || 0), 0).toFixed(2);
  }

  // Iniciar una nueva reserva
  nuevaReserva() {
    this.resetForm();
    this.reservaCompletada = null;
    this.mensajeExito = '';
    this.mensajeError = '';
  }

  // Método auxiliar para depurar el estado del formulario
  logFormStatus() {
    // Obtener los controles con errores
    const controlsWithErrors = Object.keys(this.reservaForm.controls)
      .filter(key => this.reservaForm.get(key)?.errors)
      .map(key => {
        const control = this.reservaForm.get(key);
        return {
          control: key,
          errors: control?.errors,
          value: control?.value,
          valid: control?.valid,
          touched: control?.touched
        };
      });

    console.log('Estado del formulario:', {
      valid: this.reservaForm.valid,
      touched: this.reservaForm.touched,
      dirty: this.reservaForm.dirty,
      controlsWithErrors
    });
  }
}