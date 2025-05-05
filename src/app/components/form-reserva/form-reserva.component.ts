import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CursoService, Curso } from '../../services/curso.service';

@Component({
  selector: 'app-form-reserva',
  templateUrl: './form-reserva.component.html',
  styleUrls: ['./form-reserva.component.css']
})
export class FormReservaComponent implements OnInit {
  reservaForm!: FormGroup;
  cursos: Curso[] = [];
  libros: string[] = [];
  librosPorCurso: { [key: string]: string[] } = {
    '11': ['Programación', 'Bases de Datos', 'Lenguaje de Marcas'],
    '12': ['Desarrollo Web en Entorno Servidor', 'Desarrollo Web en Entorno Cliente', 'Despliegue de Aplicaciones Web'],
    '13': ['Montaje y Mantenimiento de Equipos', 'Sistemas Operativos Monopuesto', 'Redes Locales'],
    '14': ['Sistemas Operativos en Red', 'Servicios de Red e Internet', 'Seguridad Informática'],
  };
  mostrarLibros = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private cursoService: CursoService
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
      // Si curso es un objeto, obtenemos su id
      const cursoId = curso && typeof curso === 'object' ? curso.id : curso;
      this.libros = this.librosPorCurso[cursoId] || [];
      
      if (this.libros.length > 0) {
        libroControl?.enable();
        libroControl?.setValidators(Validators.required);
        this.mostrarLibros = true;
      } else {
        libroControl?.disable();
        libroControl?.clearValidators();
        this.mostrarLibros = false;
      }
      libroControl?.updateValueAndValidity();
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.reservaForm.patchValue({ justificante: file });
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
    if (this.reservaForm.valid) {
      this.loading = true;
      console.log('Formulario enviado:', this.reservaForm.value);
      // Simular envío
      setTimeout(() => {
        alert('Formulario enviado correctamente.');
        this.loading = false;
        this.reservaForm.reset();
        this.mostrarLibros = false;
      }, 1500);
    } else {
      Object.keys(this.reservaForm.controls).forEach(key => {
        this.reservaForm.get(key)?.markAsTouched();
      });
    }
  }
}