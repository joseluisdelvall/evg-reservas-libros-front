import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, FormArray } from '@angular/forms';
import { CursoService } from '../../services/curso.service';
import { LibroService } from '../../services/libro.service';
import { ReservaService } from '../../services/reserva.service';
import { Curso } from '../../models/curso.model';
import { Libro } from '../../models/libro.model';
import { ReservaRequest, ReservaResponse } from '../../models/reserva.model';
import { ToastrService } from 'ngx-toastr';
import { PeriodoReservasService, PeriodoReservas } from '../../services/periodo-reservas.service';

@Component({
  selector: 'app-form-reserva',
  templateUrl: './form-reserva.component.html',
  styleUrls: ['./form-reserva.component.css']
})
export class FormReservaComponent implements OnInit {
  reservaForm!: FormGroup;
  cursos: Curso[] = [];
  libros: Libro[] = [];
  librosSeleccionados: number[] = []; // Para guardar los IDs de los libros seleccionados
  totalAPagar: number = 0; // Para mostrar el total
  mostrarLibros = false;
  loading = false;
  justificanteFile: File | null = null;
  mensajeExito: string = '';
  mensajeError: string = '';
  reservaCompletada: ReservaResponse | null = null;
  mostrandoErrores: boolean = false; // Flag para controlar que solo se muestre un toast a la vez
  
  // Nuevas propiedades para el control del periodo de reservas
  periodoReservas: PeriodoReservas | null = null;
  periodoReservasActivo: boolean = false;
  fechaActual: Date = new Date();
  mensajePeriodo: string = '';
  verificandoPeriodo: boolean = true; // Nueva variable para controlar la carga inicial

  constructor(
    private fb: FormBuilder,
    private cursoService: CursoService,
    private libroService: LibroService,
    private reservaService: ReservaService,
    private toastr: ToastrService,
    private periodoReservasService: PeriodoReservasService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.verificarPeriodoReservas();
    this.loadCursos();
    this.listenCursoChanges();
  }

  // Método para verificar si estamos en el periodo de reservas
  verificarPeriodoReservas() {
    this.verificandoPeriodo = true; // Indicamos que estamos verificando
    this.periodoReservasService.getPeriodoReservas().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.periodoReservas = response.data;
          
          // Convertir fechas del periodo a objetos Date
          const fechaInicio = new Date(response.data.fechaInicio);
          const fechaFin = new Date(response.data.fechaFin);
          
          // Resetear horas, minutos y segundos para comparar solo fechas
          this.fechaActual.setHours(0, 0, 0, 0);
          fechaInicio.setHours(0, 0, 0, 0);
          fechaFin.setHours(23, 59, 59, 999); // Final del día
          
          // Verificar si la fecha actual está dentro del rango
          this.periodoReservasActivo = 
            this.fechaActual >= fechaInicio && this.fechaActual <= fechaFin;
          
          if (!this.periodoReservasActivo) {
            // Formatear fechas para el mensaje
            const formatoFecha = (fecha: Date) => fecha.toLocaleDateString('es-ES');
            
            if (this.fechaActual < fechaInicio) {
              this.mensajePeriodo = `El periodo de reservas comenzará el ${formatoFecha(fechaInicio)}`;
            } else {
              this.mensajePeriodo = `El periodo de reservas finalizó el ${formatoFecha(fechaFin)}`;
            }
            
            // Mostrar mensaje con toastr
            this.toastr.info(this.mensajePeriodo, 'Periodo de Reservas');
          }
        }
        this.verificandoPeriodo = false; // Finalizamos la verificación
      },
      error: (error) => {
        console.error('Error al verificar el periodo de reservas:', error);
        this.periodoReservasActivo = false; // Por defecto, no permitir reservas en caso de error
        this.mensajePeriodo = 'No se pudo verificar el periodo de reservas. Por favor, inténtelo más tarde.';
        this.toastr.error(this.mensajePeriodo, 'Error');
        this.verificandoPeriodo = false; // Finalizamos la verificación incluso en caso de error
      }
    });
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
      next: (librosRespuesta) => {
        this.libros = librosRespuesta || []; // Asegurar que this.libros sea siempre un array
        this.librosSeleccionados = []; // Limpiar selección previa
        this.reservaForm.get('librosSeleccionados')?.setValue([]); // Actualizar valor del control
        this.reservaForm.get('librosSeleccionados')?.markAsUntouched(); // Marcar como no tocado
        this.calcularTotalAPagar(); // Recalcular total
        
        if (this.libros.length > 0) {
          this.reservaForm.get('librosSeleccionados')?.enable();
          this.reservaForm.get('librosSeleccionados')?.setValidators(this.minLibroSeleccionado(1));
          this.mostrarLibros = true;
        } else {
          this.reservaForm.get('librosSeleccionados')?.disable();
          this.reservaForm.get('librosSeleccionados')?.clearValidators();
          this.mostrarLibros = false;
        }
        this.reservaForm.get('librosSeleccionados')?.updateValueAndValidity();
      },
      error: (error) => {
        console.error('Error al cargar los libros:', error);
        this.mostrarLibros = false;
      }
    });
  }

  // Validador personalizado para el DNI español
  validarDNI(control: AbstractControl): ValidationErrors | null {
    const valor = control.value;
    
    if (!valor) return null;
    
    // Verificar el formato: 8 dígitos seguidos de una letra
    const dniRegex = /^[0-9]{8}[A-Za-z]$/;
    if (!dniRegex.test(valor)) {
      return { formatoInvalido: true };
    }
    
    // Extraer los dígitos y la letra
    const numero = parseInt(valor.substr(0, 8), 10);
    const letraProporcionada = valor.substr(8, 1).toUpperCase();
    
    // Array de letras posibles según el algoritmo del DNI español
    const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
    
    // Calcular la letra correcta
    const letraCalculada = letras.charAt(numero % 23);
    
    // Comparar la letra proporcionada con la calculada
    if (letraProporcionada !== letraCalculada) {
      return { letraInvalida: true };
    }
    
    return null;
  }

  // Validador personalizado para prevenir caracteres especiales peligrosos (SQLi)
  validarCaracteresEspeciales(control: AbstractControl): ValidationErrors | null {
    const valor = control.value;
    
    if (!valor) return null;
    
    // Caracteres peligrosos para SQL injection y XSS
    const caracteresProhibidos = /['"`;><\/\\{}[\]()=&|]/;
    
    if (caracteresProhibidos.test(valor)) {
      return { caracteresProhibidos: true };
    }
    
    return null;
  }

  // Validador para archivos permitidos (PDF e imágenes)
  validarTipoArchivo(file: File): boolean {
    const tiposPermitidos = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png'
    ];
    
    return tiposPermitidos.includes(file.type);
  }

  initForm() {
    this.reservaForm = this.fb.group({
      nombreAlumno: ['', [
        Validators.required, 
        Validators.minLength(3),
        this.validarCaracteresEspeciales.bind(this)
      ]],
      apellidosAlumno: ['', [
        Validators.required, 
        Validators.minLength(3),
        this.validarCaracteresEspeciales.bind(this)
      ]],
      nombreTutor: ['', [
        Validators.minLength(3),
        this.validarCaracteresEspeciales.bind(this)
      ]],
      apellidosTutor: ['', [
        Validators.minLength(3),
        this.validarCaracteresEspeciales.bind(this)
      ]],
      dni: ['', [
        Validators.required, 
        // Validators.pattern('^[0-9]{8}[A-Za-z]$'),
        // this.validarDNI.bind(this)
      ]],
      correo: ['', [
        Validators.required, 
        Validators.email,
        Validators.pattern('^[a-zA-ZñÑ0-9._%+-]+@[a-zA-ZñÑ0-9.-]+\\.[a-zA-ZñÑ]{2,}$')
      ]],
      telefono: ['', [Validators.required, Validators.pattern('^[6-9]\\d{8}$')]],
      curso: [null, Validators.required],
      librosSeleccionados: [{ value: [], disabled: true }, this.minLibroSeleccionado(1)],
      justificante: ['', Validators.required]
    });
  }  

  listenCursoChanges() {
    this.reservaForm.get('curso')?.valueChanges.subscribe(cursoId => {
      const librosControl = this.reservaForm.get('librosSeleccionados');
      const nombreTutorControl = this.reservaForm.get('nombreTutor');
      const apellidosTutorControl = this.reservaForm.get('apellidosTutor');
  
      librosControl?.clearValidators();
      librosControl?.setValue([]);
      this.librosSeleccionados = [];
      this.calcularTotalAPagar();
  
      if (cursoId) {
        const cursoSeleccionado = this.cursos.find(c => c.id === cursoId);
        const esInfantil = cursoSeleccionado?.nombre.toLowerCase().includes('infantil');
  
        // Validación condicional para los tutores
        if (esInfantil) {
          nombreTutorControl?.setValidators([
            Validators.required, 
            Validators.minLength(3),
            this.validarCaracteresEspeciales.bind(this)
          ]);
          apellidosTutorControl?.setValidators([
            Validators.required, 
            Validators.minLength(3),
            this.validarCaracteresEspeciales.bind(this)
          ]);
        } else {
          nombreTutorControl?.setValidators([
            Validators.minLength(3),
            this.validarCaracteresEspeciales.bind(this)
          ]);
          apellidosTutorControl?.setValidators([
            Validators.minLength(3),
            this.validarCaracteresEspeciales.bind(this)
          ]);
        }
  
        nombreTutorControl?.updateValueAndValidity();
        apellidosTutorControl?.updateValueAndValidity();
  
        this.loadLibrosByCurso(cursoId.toString());
        librosControl?.enable();
        librosControl?.setValidators(this.minLibroSeleccionado(1));
      } else {
        this.libros = [];
        this.mostrarLibros = false;
        librosControl?.disable();
  
        // Establecer validadores básicos del tutor si no hay curso seleccionado
        nombreTutorControl?.setValidators([
          Validators.minLength(3),
          this.validarCaracteresEspeciales.bind(this)
        ]);
        apellidosTutorControl?.setValidators([
          Validators.minLength(3),
          this.validarCaracteresEspeciales.bind(this)
        ]);
        nombreTutorControl?.updateValueAndValidity();
        apellidosTutorControl?.updateValueAndValidity();
      }
  
      librosControl?.updateValueAndValidity();
    });
  }
  

  // Validador personalizado para asegurar que al menos X libros estén seleccionados
  minLibroSeleccionado(min: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (this.mostrarLibros && control.value && control.value.length < min) {
        return { 'minLibros': { requiredCount: min, actualCount: control.value.length } };
      }
      return null;
    };
  }

  onLibroCheckboxChange(event: any, libroId: number) {
    const isChecked = event.target.checked;
    if (isChecked) {
      if (!this.librosSeleccionados.includes(libroId)) {
        this.librosSeleccionados.push(libroId);
      }
    } else {
      const index = this.librosSeleccionados.indexOf(libroId);
      if (index > -1) {
        this.librosSeleccionados.splice(index, 1);
      }
    }
    // Actualizar el valor del FormControl para que la validación funcione
    this.reservaForm.get('librosSeleccionados')?.setValue(this.librosSeleccionados);
    this.reservaForm.get('librosSeleccionados')?.markAsTouched(); // Marcar como tocado para mostrar errores si es necesario
    this.calcularTotalAPagar(); // Recalcular el total cada vez que cambia la selección
  }

  isLibroSeleccionado(libroId: number): boolean {
    return this.librosSeleccionados.includes(libroId);
  }

  calcularTotalAPagar(): void {
    this.totalAPagar = 0;
    if (this.librosSeleccionados && this.libros) {
      this.librosSeleccionados.forEach(libroId => {
        const libroEncontrado = this.libros.find(l => l.id === libroId);
        if (libroEncontrado && typeof libroEncontrado.precio === 'number') {
          this.totalAPagar += libroEncontrado.precio;
        }
      });
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!this.validarTipoArchivo(file)) {
        this.toastr.error(
          'Solo se permiten archivos PDF e imágenes (JPG, JPEG, PNG)', 
          'Tipo de archivo no válido'
        );
        // Limpiar el input
        event.target.value = '';
        this.justificanteFile = null;
        this.reservaForm.patchValue({ justificante: '' });
        return;
      }

      // Validar tamaño del archivo (máximo 5MB)
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 5) {
        this.toastr.error(
          'El archivo es demasiado grande. El tamaño máximo permitido es 5MB.', 
          'Archivo demasiado grande'
        );
        // Limpiar el input
        event.target.value = '';
        this.justificanteFile = null;
        this.reservaForm.patchValue({ justificante: '' });
        return;
      }

      this.justificanteFile = file;
      this.reservaForm.patchValue({ justificante: file.name });
      this.reservaForm.get('justificante')?.updateValueAndValidity();
      this.toastr.success('Archivo adjuntado correctamente', 'Éxito');
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.reservaForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getError(controlName: string): string {
    const control = this.reservaForm.get(controlName);
    if (control?.errors) {
      if (control.errors['required']) {
        return 'Este campo es obligatorio.';
      }
      if (control.errors['minlength']) {
        return `Debe tener al menos ${control.errors['minlength'].requiredLength} caracteres.`;
      }
      if (control.errors['pattern']) {
        if (controlName === 'dni') return 'El formato del DNI no es válido (8 números y 1 letra).';
        if (controlName === 'correo') return 'El formato del correo no es válido.';
        if (controlName === 'telefono') return 'El formato del teléfono no es válido (debe empezar por 6, 7, 8 o 9 y tener 9 dígitos).';
        return 'Formato incorrecto.';
      }
      if (control.errors['formatoInvalido']) {
        return 'El formato del DNI no es válido (8 números y 1 letra).';
      }
      if (control.errors['letraInvalida']) {
        return 'La letra del DNI no es correcta.';
      }
      if (control.errors['caracteresProhibidos']) {
        return 'No se permiten caracteres especiales como comillas, punto y coma, mayor que, menor que, etc.';
      }
      if (controlName === 'librosSeleccionados' && control.errors['minLibros']) {
        return 'Debe seleccionar al menos un libro.';
      }
    }
    return '';
  }

  onSubmit() {
    // Si no estamos en periodo de reservas, no permitir el envío
    if (!this.periodoReservasActivo) {
      this.toastr.warning(this.mensajePeriodo, 'Periodo de Reservas');
      return;
    }
    
    // Log del estado del formulario para depuración
    this.logFormStatus();
    
    // Marcar todos los campos como tocados para mostrar errores de validación
    Object.keys(this.reservaForm.controls).forEach(key => {
      this.reservaForm.get(key)?.markAsTouched();
    });
    
    // Verificar si el formulario es válido y tiene el archivo adjunto
    if (this.reservaForm.invalid || !this.justificanteFile) {
      // Mostrar mensaje de error con toastr solo si no se está mostrando ya
      if (!this.mostrandoErrores) {
        this.mostrandoErrores = true;
        
        this.mensajeError = 'Por favor, complete correctamente todos los campos obligatorios.';
        this.toastr.warning(this.mensajeError, 'Validación');
        
        // Resetear el flag después de un tiempo para permitir mostrar nuevamente
        setTimeout(() => {
          this.mostrandoErrores = false;
        }, 3000);
      }
      return; // Salir del método sin enviar el formulario al servidor
    }
    
    // Si llegamos aquí, el formulario es válido y podemos continuar con el envío
    this.loading = true;
    this.mensajeExito = '';
    this.mensajeError = '';
    this.reservaCompletada = null; // Reset any previous reservation

    // Preparar los datos para enviar
    const formValues = this.reservaForm.value;
    
    try {
      // Verificar si hay libros seleccionados
      if (this.librosSeleccionados.length === 0) {
        throw new Error('Debe seleccionar al menos un libro');
      }

      const reservaData: ReservaRequest = {
        nombreAlumno: formValues.nombreAlumno,
        apellidosAlumno: formValues.apellidosAlumno,
        nombreTutorLegal: formValues.nombreTutor || null,
        apellidosTutorLegal: formValues.apellidosTutor || null,
        correo: formValues.correo,
        dni: formValues.dni,
        telefono: formValues.telefono,
        idCurso: formValues.curso,
        libros: this.librosSeleccionados
      };

      // Comprobación de tamaño del archivo (opcional)
      const fileSizeMB = this.justificanteFile.size / (1024 * 1024);
      
      if (fileSizeMB > 5) {
        this.mensajeError = 'El archivo es demasiado grande. El tamaño máximo permitido es 5MB.';
        this.toastr.error(this.mensajeError, 'Error');
        this.loading = false;
        return;
      }

      // Enviar al backend usando JSON
      this.reservaService.crearReserva(reservaData, this.justificanteFile)
        .subscribe({
          next: (response) => {
            this.loading = false;
            
            // Verificar si la respuesta tiene la estructura esperada
            if (response && response.id) {
              // Convertir la respuesta del servicio al formato del modelo
              const reservaCompletada: ReservaResponse = {
                idReserva: response.id,
                nombreAlumno: response.nombreAlumno,
                apellidosAlumno: response.apellidosAlumno,
                correo: response.correo,
                dni: response.dni,
                telefono: response.telefono,
                justificante: response.justificante,
                fecha: response.fecha,
                verificado: response.verificado === 1,
                totalPagado: response.totalPagado,
                curso: {
                  idCurso: response.curso,
                  nombreCurso: this.getCursoNombre(response.curso),
                  nombreEtapa: ''
                },
                libros: response.libros || []
              };

              // Si el id es mayor a 1000, sabemos que es una respuesta simulada
              // debido a un problema de comunicación con el servidor de correo
              if (response.id >= 1000) {
                this.mensajeExito = `¡Reserva realizada con éxito! Se registró su reserva pero hubo un problema al enviar el correo de confirmación. Por favor, guarde este número de reserva: ${response.id}.`;
                this.toastr.success(this.mensajeExito, 'Éxito');
              } else {
                this.mensajeExito = `¡Reserva realizada con éxito! Número de reserva: ${response.id}. Se ha enviado un correo de confirmación.`;
                this.toastr.success(this.mensajeExito, 'Éxito');
              }
              
              // Guardar la respuesta y resetear el formulario
              this.reservaCompletada = reservaCompletada;
              this.resetForm();
            } else {
              // Si la respuesta no tiene la estructura esperada
              console.error('Respuesta inesperada del servidor:', response);
              this.mensajeError = 'La respuesta del servidor no tiene el formato esperado.';
              this.toastr.error(this.mensajeError, 'Error');
            }
          },
          error: (error) => {
            this.loading = false;
            console.error('Error al crear la reserva:', error);
            this.mensajeError = `Error al procesar la reserva: ${error.message || 'Error desconocido'}. Por favor, inténtelo de nuevo.`;
            this.toastr.error(this.mensajeError, 'Error');
          }
        });
    } catch (error: any) {
      this.loading = false;
      this.mensajeError = `Error en el formulario: ${error.message || 'Error desconocido'}`;
      this.toastr.error(this.mensajeError, 'Error');
      console.error('Error al preparar los datos:', error);
    }
  }

  resetForm() {
    this.reservaForm.reset();
    this.justificanteFile = null;
    // Limpiar específicamente el campo de archivo si existe un input con id 'justificante'
    const fileInput = document.getElementById('justificante') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    this.libros = [];
    this.librosSeleccionados = []; // También limpiar la selección de libros
    this.totalAPagar = 0; // Resetear total
    this.mostrarLibros = false;
    
    // Re-deshabilitar y limpiar validadores del control de libros
    const librosControl = this.reservaForm.get('librosSeleccionados');
    librosControl?.disable();
    librosControl?.clearValidators();
    librosControl?.setValue([]);
    librosControl?.updateValueAndValidity();
    
    // Si el formulario tiene un control llamado 'curso', resetearlo también.
    if (this.reservaForm.get('curso')) {
      this.reservaForm.get('curso')?.setValue(null);
    }
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
      }
    );
  }
}