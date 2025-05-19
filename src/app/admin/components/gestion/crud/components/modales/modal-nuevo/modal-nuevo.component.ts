import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { ModalOptions } from 'src/app/admin/components/shared/modal-content/models/modal-options';
import { CrudService } from 'src/app/services/crud.service';
import { Libro } from 'src/app/models/libro.model';
import { Editorial } from 'src/app/models/editorial.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-modal-nuevo',
  templateUrl: './modal-nuevo.component.html',
  styleUrls: ['./modal-nuevo.component.css']
})
export class ModalNuevoComponent implements OnInit, OnChanges {

  @Input() modo: 'libros' | 'editoriales' | 'reservas' | null = null;
  @Output() entidadCreada = new EventEmitter<any>(); // Emitir el evento cuando se crea una entidad

  // nuevoModalOptions
  nuevoModalOptions!: ModalOptions;

  formL!: FormGroup;
  formE!: FormGroup;
  formR!: FormGroup;
  editoriales: Editorial[] = [];
  mostrandoErrores: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private crudService: CrudService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.cargarEditoriales();
    this.configurarModalCierreCondicional();
    this.configurarReseteoFormularioAlCerrar();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modo'] && changes['modo'].currentValue) {
      this.crearFormularios();
      this.nuevoModalOptions = {
        title: 'Añadir ' + (this.modo === 'libros' ? 'libro' : 'editorial'),
        modalId: 'nuevo' + this.modo,
        size: 'xl',
        okButton: {
          text: 'Aceptar',
        },
        cancelButton: {
          text: 'Cancelar',
        },
      };

      // Asegurarse de que el cierre condicional se configure después de que cambie el modo
      setTimeout(() => {
        this.configurarModalCierreCondicional();
        this.configurarReseteoFormularioAlCerrar();
      }, 100);
    }
  }

  // Método para configurar el reseteo del formulario al cerrar el modal
  configurarReseteoFormularioAlCerrar(): void {
    setTimeout(() => {
      const modalId = this.nuevoModalOptions?.modalId;
      if (!modalId) return;

      // Obtener el elemento del modal
      const modalElement = document.getElementById(modalId);
      if (!modalElement) return;

      // Añadir evento para resetear formulario cuando el modal se haya cerrado completamente
      modalElement.addEventListener('hidden.bs.modal', (event: Event) => {
        this.resetFormularios();
      });
    }, 200);
  }

  // Método para prevenir que se cierre el modal si el formulario no es válido
  configurarModalCierreCondicional(): void {
    // Esperar a que el DOM esté listo
    setTimeout(() => {
      const modalId = this.nuevoModalOptions?.modalId;
      if (!modalId) return;

      // Obtener el elemento del modal
      const modalElement = document.getElementById(modalId);
      if (!modalElement) return;

      // Añadir evento para interceptar el cierre del modal
      modalElement.addEventListener('hide.bs.modal', (event: Event) => {
        // Solo verificar validación cuando se cierra con el botón Aceptar (no con Cancelar o X)
        const target = event.target as HTMLElement;
        const activeElement = document.activeElement as HTMLElement;

        if (activeElement && 
            activeElement.classList.contains('btn-accept') && 
            !this.esFormularioValido()) {
          // Si el formulario no es válido y se está intentando cerrar con el botón Aceptar
          // Prevenir el cierre del modal
          event.preventDefault();
          // Mostrar errores solo si no se están mostrando ya
          if (!this.mostrandoErrores) {
            this.onSubmit();
          }
        }
      });
    }, 200);
  }

  // Comprobar si el formulario actual es válido
  esFormularioValido(): boolean {
    if (this.modo === 'libros') {
      return this.formL?.valid || false;
    } else if (this.modo === 'editoriales') {
      return this.formE?.valid || false;
    }
    return false;
  }

  resetFormularios(): void {
    if (this.modo === 'libros' && this.formL) {
      this.formL.reset();
      // Desmarcar todos los campos como tocados para quitar los errores visuales
      Object.keys(this.formL.controls).forEach(key => {
        const control = this.formL.get(key);
        control?.markAsUntouched();
        control?.markAsPristine();
      });
    } else if (this.modo === 'editoriales' && this.formE) {
      this.formE.reset();
      // Desmarcar el campo nombre como tocado
      this.formE.get('nombre')?.markAsUntouched();
      this.formE.get('nombre')?.markAsPristine();
      
      // Desmarcar los controles de los FormArray como tocados
      const correosArray = this.formE.get('correos') as FormArray;
      correosArray.controls.forEach(control => {
        control.markAsUntouched();
        control.markAsPristine();
      });
      
      const telefonosArray = this.formE.get('telefonos') as FormArray;
      telefonosArray.controls.forEach(control => {
        control.markAsUntouched();
        control.markAsPristine();
      });
    }
    this.mostrandoErrores = false;
  }

  crearFormularios() {
    if (this.modo === 'libros') {
      this.formL = this.formBuilder.group({
        nombre: ['', [Validators.required, Validators.minLength(3)]],
        isbn: ['', [Validators.required, Validators.pattern('^[0-9-]{10,20}$')]],
        editorial: [null, Validators.required],
        precio: [null, [
          Validators.required, 
          Validators.min(1),
          Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')
        ]]
      }); 
    } else if (this.modo === 'editoriales') {
      this.formE = this.formBuilder.group({
        nombre: ['', [Validators.required, Validators.minLength(3)]],
        correos: this.formBuilder.array([
          this.formBuilder.control('', [Validators.email]),
          this.formBuilder.control('', [Validators.email]),
          this.formBuilder.control('', [Validators.email])
        ]),
        telefonos: this.formBuilder.array([
          this.formBuilder.control('', [Validators.pattern('^[6-9]\\d{8}$')]),
          this.formBuilder.control('', [Validators.pattern('^[6-9]\\d{8}$')]),
          this.formBuilder.control('', [Validators.pattern('^[6-9]\\d{8}$')])
        ])
      }); 
    }
  }

  // Método para bloquear la entrada de caracteres no numéricos en el campo de precio
  blockInvalidInput(event: KeyboardEvent): void {
    // Permitir solo números, punto decimal, teclas de navegación y borrado
    const invalidChars = ['e', 'E', '+', '-'];
    
    if (invalidChars.includes(event.key)) {
      event.preventDefault();
    }
  }

  // Métodos auxiliares para acceder a los FormArray
  getCorreosControls() {
    return (this.formE.get('correos') as FormArray).controls;
  }

  getTelefonosControls() {
    return (this.formE.get('telefonos') as FormArray).controls;
  }

  // Método para comprobar si un control es inválido
  isInvalid(controlName: string): boolean {
    const form = this.modo === 'libros' ? this.formL : this.formE;
    const control = form.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  // Método para comprobar si un control en un FormArray es inválido
  isInvalidArray(arrayName: string, index: number): boolean {
    const form = this.formE;
    const array = form.get(arrayName) as FormArray;
    const control = array.at(index);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  // Método para obtener el mensaje de error
  getError(controlName: string): string {
    const form = this.modo === 'libros' ? this.formL : this.formE;
    const control = form.get(controlName);
    
    if (!control) return '';
    
    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('email')) return 'Ingrese un correo electrónico válido.';
    if (control.hasError('pattern')) {
      if (controlName === 'isbn') return 'El ISBN debe tener entre 10 y 20 caracteres (dígitos y guiones).';
      if (controlName === 'precio') return 'El precio debe ser un número con hasta 2 decimales.';
      return 'Formato inválido.';
    }
    if (control.hasError('min')) return `El valor mínimo es ${control.errors?.['min'].min}.`;
    if (control.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength'].requiredLength;
      return `Debe tener al menos ${requiredLength} caracteres.`;
    }
    return '';
  }

  // Método para obtener el mensaje de error de un control en un FormArray
  getErrorArray(arrayName: string, index: number): string {
    const form = this.formE;
    const array = form.get(arrayName) as FormArray;
    const control = array.at(index);
    
    if (!control) return '';
    
    if (control.hasError('email')) return 'Ingrese un correo electrónico válido.';
    if (control.hasError('pattern')) return 'Ingrese un teléfono válido (9 dígitos, comenzando por 6, 7, 8 o 9).';
    
    return '';
  }

  cargarEditoriales(): void {
    this.crudService.getEditoriales().subscribe({
      next: (data: Editorial[]) => {
        this.editoriales = data;
      },
      error: (error) => {
        console.error('Error al cargar las editoriales:', error);
        this.toastr.error('Error al cargar las editoriales', 'Error');
      }
    });
  }

  onSubmit(): void {
    if (this.modo === 'libros') {
      if (this.formL.valid) {
        const libroData: Libro = {
          nombre: this.formL.value.nombre,
          isbn: this.formL.value.isbn,
          editorial: {
            idEditorial: this.formL.value.editorial
          } as Editorial,
          precio: this.formL.value.precio
        };

        this.crudService.addLibro(libroData).subscribe({
          next: (response) => {
            this.toastr.success('Libro añadido correctamente', 'Éxito');
            this.entidadCreada.emit();
            this.resetFormularios();
          },
          error: (error) => {
            console.error('Error al añadir el libro:', error);
            this.toastr.error(`Error al añadir el libro: ${error.message || 'Error desconocido'}`, 'Error');
          }
        });
      } else {
        // Marcar todos los campos como tocados para mostrar errores
        Object.keys(this.formL.controls).forEach(key => {
          this.formL.get(key)?.markAsTouched();
        });
        
        // Mostrar mensaje solo si no se está mostrando ya
        if (!this.mostrandoErrores) {
          this.mostrandoErrores = true;
          this.toastr.warning('Por favor, complete correctamente todos los campos obligatorios', 'Validación');
          // Resetear el flag después de un tiempo para permitir mostrar nuevamente
          setTimeout(() => {
            this.mostrandoErrores = false;
          }, 3000);
        }
      }
    } else if (this.modo === 'editoriales') {
      if (this.formE.valid) {
        // Filtrar correos y teléfonos vacíos
        const correosFiltrados = this.formE.value.correos.filter((correo: string) => correo !== '');
        const telefonosFiltrados = this.formE.value.telefonos.filter((telefono: string) => telefono !== '');

        const editorialData: Editorial = {
          nombre: this.formE.value.nombre,
          correos: correosFiltrados,
          telefonos: telefonosFiltrados
        };

        this.crudService.addEditorial(editorialData).subscribe({
          next: (response) => {
            this.toastr.success('Editorial añadida correctamente', 'Éxito');
            this.entidadCreada.emit();
            this.resetFormularios();
          },
          error: (error) => {
            console.error('Error al añadir la editorial:', error);
            this.toastr.error(`Error al añadir la editorial: ${error.message || 'Error desconocido'}`, 'Error');
          }
        });
      } else {
        // Marcar todos los campos como tocados para mostrar errores
        this.formE.get('nombre')?.markAsTouched();
        
        // Marcar los controles de los FormArray como tocados
        const correosArray = this.formE.get('correos') as FormArray;
        const telefonosArray = this.formE.get('telefonos') as FormArray;
        
        correosArray.controls.forEach(control => {
          if (control.value) control.markAsTouched();
        });
        
        telefonosArray.controls.forEach(control => {
          if (control.value) control.markAsTouched();
        });
        
        // Mostrar mensaje solo si no se está mostrando ya
        if (!this.mostrandoErrores) {
          this.mostrandoErrores = true;
          this.toastr.warning('Por favor, complete correctamente todos los campos obligatorios', 'Validación');
          // Resetear el flag después de un tiempo para permitir mostrar nuevamente
          setTimeout(() => {
            this.mostrandoErrores = false;
          }, 3000);
        }
      }
    }
  }
  
}
