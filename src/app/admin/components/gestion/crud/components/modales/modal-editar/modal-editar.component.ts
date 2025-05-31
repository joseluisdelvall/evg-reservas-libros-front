import { Component, Input, OnChanges, OnInit, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalOptions } from 'src/app/admin/components/shared/modal-content/models/modal-options';
import { CrudService } from 'src/app/services/crud.service';
import { Editorial } from 'src/app/models/editorial.model';
import { Libro } from 'src/app/models/libro.model';
import { ToastrService } from 'ngx-toastr';
import { Etapa } from 'src/app/models/etapa.model';
import { EtapaService } from 'src/app/services/etapa.service';

@Component({
  selector: 'app-modal-editar',
  templateUrl: './modal-editar.component.html',
  styleUrls: ['./modal-editar.component.css']
})
export class ModalEditarComponent implements OnInit, OnChanges {

  @Input() modo: 'libros' | 'editoriales' | null = null;
  @Input() idEntidad: string | null = null;
  @Output() entidadActualizada = new EventEmitter<void>();
  
  // editarModalOptions
  editarModalOptions!: ModalOptions;
  
  // Formularios
  formE!: FormGroup;
  formL!: FormGroup;
  
  // Datos de la editorial y libro
  editorial: Editorial | null = null;
  libro: Libro | null = null;
  
  // Lista de editoriales para el select
  editoriales: Editorial[] = [];
  etapas: Etapa[] = [];
  
  // Flag para controlar que solo se muestre un mensaje de error a la vez
  mostrandoErrores: boolean = false;
  
  constructor(
    private crudService: CrudService,
    private etapaService: EtapaService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) { }
  
  ngOnInit(): void {
    this.inicializarFormularios();
    this.cargarEditoriales();
    this.cargarEtapas();
    this.configurarModalCierreCondicional();
    this.configurarReseteoFormularioAlCerrar();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modo'] && changes['modo'].currentValue) {
      this.editarModalOptions = {
        title: 'Editar ' + (this.modo === 'libros' ? 'libro' : 'editorial'),
        modalId: 'editar' + this.modo,
        size: 'xl',
        okButton: {
          text: 'Aceptar',
        },
        cancelButton: {
          text: 'Cancelar',
        },
      };
      
      this.inicializarFormularios();
      
      // Asegurarse de que el cierre condicional se configure después de que cambie el modo
      setTimeout(() => {
        this.configurarModalCierreCondicional();
        this.configurarReseteoFormularioAlCerrar();
      }, 100);
    }
    
    if (changes['idEntidad'] && changes['idEntidad'].currentValue) {
      if (this.modo === 'editoriales') {
        this.cargarDatosEditorial(changes['idEntidad'].currentValue);
      } else if (this.modo === 'libros') {
        this.cargarDatosLibro(changes['idEntidad'].currentValue);
      }
    }
  }
  
  // Método para configurar el reseteo del formulario al cerrar el modal
  configurarReseteoFormularioAlCerrar(): void {
    setTimeout(() => {
      const modalId = this.editarModalOptions?.modalId;
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

  // Método para resetear los formularios y limpiar validaciones visuales
  resetFormularios(): void {
    if (this.modo === 'libros' && this.formL) {
      // Desmarcar todos los campos como tocados para quitar los errores visuales
      Object.keys(this.formL.controls).forEach(key => {
        const control = this.formL.get(key);
        control?.markAsUntouched();
        control?.markAsPristine();
      });
    } else if (this.modo === 'editoriales' && this.formE) {
      // Desmarcar el campo nombre como tocado
      this.formE.get('nombre')?.markAsUntouched();
      this.formE.get('nombre')?.markAsPristine();
      
      // Desmarcar los controles de los grupos como tocados
      const correosGroup = this.formE.get('correosGroup') as FormGroup;
      Object.keys(correosGroup.controls).forEach(key => {
        const control = correosGroup.get(key);
        control?.markAsUntouched();
        control?.markAsPristine();
      });
      
      const telefonosGroup = this.formE.get('telefonosGroup') as FormGroup;
      Object.keys(telefonosGroup.controls).forEach(key => {
        const control = telefonosGroup.get(key);
        control?.markAsUntouched();
        control?.markAsPristine();
      });
    }
    
    this.mostrandoErrores = false;
  }
  
  // Método para prevenir que se cierre el modal si el formulario no es válido
  configurarModalCierreCondicional(): void {
    // Esperar a que el DOM esté listo
    setTimeout(() => {
      const modalId = this.editarModalOptions?.modalId;
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
  
  inicializarFormularios(): void {
    this.formE = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      correosGroup: this.fb.group({
        correo1: ['', [Validators.email]],
        correo2: ['', [Validators.email]],
        correo3: ['', [Validators.email]]
      }),
      telefonosGroup: this.fb.group({
        telefono1: ['', [Validators.pattern('^[6-9]\\d{8}$')]],
        telefono2: ['', [Validators.pattern('^[6-9]\\d{8}$')]],
        telefono3: ['', [Validators.pattern('^[6-9]\\d{8}$')]]
      })
    });
    
    this.formL = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      isbn: ['', [Validators.required, Validators.pattern('^[0-9-]{10,20}$')]],
      editorial: [null, Validators.required],
      precio: [null, [
        Validators.required, 
        Validators.min(1),
        Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')
      ]],
      etapa: [null, Validators.required]
    });
  }

  // Método para bloquear la entrada de caracteres no numéricos en el campo de precio
  blockInvalidInput(event: KeyboardEvent): void {
    // Permitir solo números, punto decimal, teclas de navegación y borrado
    const invalidChars = ['e', 'E', '+', '-'];
    
    if (invalidChars.includes(event.key)) {
      event.preventDefault();
    }
  }

  // Método para comprobar si un control es inválido
  isInvalid(controlName: string): boolean {
    const form = this.modo === 'libros' ? this.formL : this.formE;
    const control = form.get(controlName);
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

  // Método para verificar si un control en un grupo de formularios es inválido
  isInvalidGroup(groupName: string, controlName: string): boolean {
    const group = this.formE.get(groupName) as FormGroup;
    if (!group) return false;
    
    const control = group.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  // Método para obtener mensajes de error para controles dentro de grupos
  getErrorGroup(groupName: string, controlName: string): string {
    const group = this.formE.get(groupName) as FormGroup;
    if (!group) return '';
    
    const control = group.get(controlName);
    if (!control) return '';
    
    if (control.hasError('email')) return 'Ingrese un correo electrónico válido.';
    if (control.hasError('pattern')) return 'Ingrese un teléfono válido (9 dígitos, comenzando por 6, 7, 8 o 9).';
    
    return '';
  }
  
  cargarEditoriales(): void {
    this.crudService.getEditoriales().subscribe({
      next: (editoriales: Editorial[]) => {
        this.editoriales = editoriales;
      },
      error: (err: unknown) => {
        console.error('Error al cargar las editoriales:', err);
        this.toastr.error('Error al cargar las editoriales', 'Error');
      }
    });
  }
  
  cargarEtapas(): void {
    this.etapaService.getEtapas().subscribe({
      next: (etapas: Etapa[]) => {
        this.etapas = etapas;
      },
      error: (error) => {
        console.error('Error al cargar las etapas:', error);
        this.toastr.error('Error al cargar las etapas', 'Error');
      }
    });
  }
  

  cargarDatosEditorial(id: string): void {
    this.crudService.getEditorialById(id).subscribe({
      next: (editorial: Editorial) => {
        this.editorial = editorial;
        
        // Resetear el formulario con los datos cargados
        this.formE.patchValue({
          nombre: editorial.nombre
        });
        
        // Cargar correos
        if (editorial.correos && editorial.correos.length > 0) {
          const correosGroup = this.formE.get('correosGroup') as FormGroup;
          
          // Asignar hasta 3 correos a los campos correspondientes
          for (let i = 0; i < Math.min(editorial.correos.length, 3); i++) {
            correosGroup.get(`correo${i+1}`)?.setValue(editorial.correos[i]);
          }
        }
        
        // Cargar teléfonos
        if (editorial.telefonos && editorial.telefonos.length > 0) {
          const telefonosGroup = this.formE.get('telefonosGroup') as FormGroup;
          
          // Asignar hasta 3 teléfonos a los campos correspondientes
          for (let i = 0; i < Math.min(editorial.telefonos.length, 3); i++) {
            telefonosGroup.get(`telefono${i+1}`)?.setValue(editorial.telefonos[i]);
          }
        }
      },
      error: (err: unknown) => {
        console.error('Error al cargar los datos de la editorial:', err);
        this.toastr.error('Error al cargar los datos de la editorial', 'Error');
      }
    });
  }
  
  cargarDatosLibro(id: string): void {
    this.crudService.getLibroById(id).subscribe({
      next: (libro: Libro) => {
        this.libro = libro;
        
        // Resetear el formulario con los datos cargados
        this.formL.patchValue({
          nombre: libro.nombre,
          isbn: libro.isbn,
          editorial: libro.editorial?.idEditorial,
          precio: libro.precio,
          etapa: libro.etapa?.id
        });
      },
      error: (err: unknown) => {
        console.error('Error al cargar los datos del libro:', err);
        this.toastr.error('Error al cargar los datos del libro', 'Error');
      }
    });
  }
  
  onSubmit(): void {
    if (this.modo === 'editoriales' && this.formE.valid && this.idEntidad) {
      // Extraer valores de los correos y teléfonos desde grupos
      const correosGroup = this.formE.get('correosGroup')?.value;
      const telefonosGroup = this.formE.get('telefonosGroup')?.value;
      
      // Filtrar correos vacíos
      const correos = [
        correosGroup.correo1,
        correosGroup.correo2,
        correosGroup.correo3
      ].filter(correo => correo !== '');
      
      // Filtrar teléfonos vacíos
      const telefonos = [
        telefonosGroup.telefono1,
        telefonosGroup.telefono2,
        telefonosGroup.telefono3
      ].filter(telefono => telefono !== '');
      
      const editorialActualizada = {
        ...this.editorial,
        nombre: this.formE.value.nombre,
        correos: correos,
        telefonos: telefonos
      };
      
      this.crudService.updateEditorial(this.idEntidad, editorialActualizada).subscribe({
        next: () => {
          this.toastr.success('Editorial actualizada correctamente', 'Éxito');
          this.entidadActualizada.emit();
          this.mostrandoErrores = false;
        },
        error: (err: unknown) => {
          console.error('Error al actualizar la editorial:', err);
          this.toastr.error('Error al actualizar la editorial', 'Error');
        }
      });
    } else if (this.modo === 'libros' && this.formL.valid && this.idEntidad) {
      // Formatear el libro exactamente como lo espera el backend
      const libroActualizado = {
        nombre: this.formL.value.nombre,
        isbn: this.formL.value.isbn,
        editorial: {
          idEditorial: this.formL.value.editorial
        },
        precio: this.formL.value.precio,
        etapa: {
          id: this.formL.value.etapa
        } as Etapa
      };
      
      this.crudService.updateLibro(this.idEntidad, libroActualizado).subscribe({
        next: () => {
          this.toastr.success('Libro actualizado correctamente', 'Éxito');
          this.entidadActualizada.emit();
          this.mostrandoErrores = false;
        },
        error: (err: unknown) => {
          console.error('Error al actualizar el libro:', err);
          this.toastr.error('Error al actualizar el libro', 'Error');
        }
      });
    } else {
      // Si el formulario no es válido, marcar todos los campos como tocados para mostrar errores
      if (this.modo === 'libros') {
        Object.keys(this.formL.controls).forEach(key => {
          const control = this.formL.get(key);
          control?.markAsTouched();
        });
        
        // Mostrar mensaje solo si no se está mostrando ya
        if (!this.mostrandoErrores) {
          this.mostrandoErrores = true;
          this.toastr.warning('Por favor complete todos los campos requeridos', 'Validación');
          // Resetear el flag después de un tiempo para permitir mostrar nuevamente
          setTimeout(() => {
            this.mostrandoErrores = false;
          }, 3000);
        }
      } else if (this.modo === 'editoriales') {
        // Marcar el campo nombre como tocado
        this.formE.get('nombre')?.markAsTouched();
        
        // Marcar los controles de los grupos como tocados
        const correosGroup = this.formE.get('correosGroup') as FormGroup;
        Object.keys(correosGroup.controls).forEach(key => {
          const control = correosGroup.get(key);
          if (control?.value) control.markAsTouched();
        });
        
        const telefonosGroup = this.formE.get('telefonosGroup') as FormGroup;
        Object.keys(telefonosGroup.controls).forEach(key => {
          const control = telefonosGroup.get(key);
          if (control?.value) control.markAsTouched();
        });
        
        // Mostrar mensaje solo si no se está mostrando ya
        if (!this.mostrandoErrores) {
          this.mostrandoErrores = true;
          this.toastr.warning('Por favor complete todos los campos requeridos', 'Validación');
          // Resetear el flag después de un tiempo para permitir mostrar nuevamente
          setTimeout(() => {
            this.mostrandoErrores = false;
          }, 3000);
        }
      }
    }
  }
}
