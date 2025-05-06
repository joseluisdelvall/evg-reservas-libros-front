import { Component, Input, OnChanges, OnInit, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalOptions } from 'src/app/admin/components/shared/modal-content/models/modal-options';
import { CrudService } from 'src/app/services/crud.service';
import { Editorial } from 'src/app/models/editorial.model';
import { Libro } from 'src/app/models/libro.model';

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
  
  constructor(
    private crudService: CrudService,
    private fb: FormBuilder
  ) { }
  
  ngOnInit(): void {
    this.inicializarFormularios();
    this.cargarEditoriales();
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
    }
    
    if (changes['idEntidad'] && changes['idEntidad'].currentValue) {
      if (this.modo === 'editoriales') {
        this.cargarDatosEditorial(changes['idEntidad'].currentValue);
      } else if (this.modo === 'libros') {
        this.cargarDatosLibro(changes['idEntidad'].currentValue);
      }
    }
  }
  
  inicializarFormularios(): void {
    this.formE = this.fb.group({
      nombre: ['', Validators.required],
      correosGroup: this.fb.group({
        correo1: ['', [Validators.email]],
        correo2: ['', [Validators.email]],
        correo3: ['', [Validators.email]]
      }),
      telefonosGroup: this.fb.group({
        telefono1: [''],
        telefono2: [''],
        telefono3: ['']
      })
    });
    
    this.formL = this.fb.group({
      nombre: ['', Validators.required],
      isbn: ['', Validators.required],
      editorial: [null, Validators.required],
      precio: [null, [Validators.required, Validators.min(1)]]
    });
  }
  
  cargarEditoriales(): void {
    this.crudService.getEditoriales().subscribe({
      next: (editoriales: Editorial[]) => {
        this.editoriales = editoriales;
      },
      error: (err: unknown) => {
        console.error('Error al cargar las editoriales:', err);
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
          precio: libro.precio
        });
      },
      error: (err: unknown) => {
        console.error('Error al cargar los datos del libro:', err);
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
          console.log('Editorial actualizada correctamente');
          this.entidadActualizada.emit();
        },
        error: (err: unknown) => {
          console.error('Error al actualizar la editorial:', err);
        }
      });
    } else if (this.modo === 'libros' && this.formL.valid && this.idEntidad) {
      const libroActualizado = {
        ...this.libro,
        nombre: this.formL.value.nombre,
        isbn: this.formL.value.isbn,
        editorial: {
          idEditorial: this.formL.value.editorial
        } as Editorial,
        precio: this.formL.value.precio
      };
      
      this.crudService.updateLibro(this.idEntidad, libroActualizado).subscribe({
        next: () => {
          console.log('Libro actualizado correctamente');
          this.entidadActualizada.emit();
        },
        error: (err: unknown) => {
          console.error('Error al actualizar el libro:', err);
        }
      });
    }
  }
}
