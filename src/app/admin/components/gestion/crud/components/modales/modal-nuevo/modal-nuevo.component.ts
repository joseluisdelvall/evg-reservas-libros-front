import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ModalOptions } from 'src/app/admin/components/shared/modal-content/models/modal-options';
import { CrudService } from 'src/app/services/crud.service';
import { Libro } from 'src/app/models/libro.model';
import { Editorial } from 'src/app/models/editorial.model';

@Component({
  selector: 'app-modal-nuevo',
  templateUrl: './modal-nuevo.component.html',
  styleUrls: ['./modal-nuevo.component.css']
})
export class ModalNuevoComponent implements OnInit, OnChanges {

  @Input() modo: 'libros' | 'editoriales' | null = null;
  @Output() entidadCreada = new EventEmitter<any>(); // Emitir el evento cuando se crea una entidad

  // nuevoModalOptions
  nuevoModalOptions!: ModalOptions;

  formL!: FormGroup;
  formE!: FormGroup;
  editoriales: Editorial[] = [];

  constructor(private formBuilder: FormBuilder,
    private crudService: CrudService
  ) { }

  ngOnInit(): void {
    this.cargarEditoriales();
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
    }
  }

  resetFormularios(): void {
    if (this.modo === 'libros' && this.formL) {
        this.formL.reset();
    } else if (this.modo === 'editoriales' && this.formE) {
        this.formE.reset();
    }
}

  crearFormularios() {
    if (this.modo === 'libros') {
      this.formL = this.formBuilder.group({
        nombre: ['', Validators.required],
        isbn: ['', Validators.required],
        editorial: [null, Validators.required],
        precio: [null, [Validators.required, Validators.min(1)]]
      }); 

      // Suscribirse a los cambios del formulario para depuración
      this.formL.valueChanges.subscribe(value => {
        console.log('Valores del formulario:', value);
        console.log('Valor del control editorial:', this.formL.get('editorial')?.value);
        console.log('Estado del control editorial:', this.formL.get('editorial')?.valid);
        console.log('Errores del control editorial:', this.formL.get('editorial')?.errors);
        console.log('Estado completo del formulario:', this.formL);
      });
    } else if (this.modo === 'editoriales') {
      this.formE = this.formBuilder.group({
        nombre: ['', Validators.required],
        correos: this.formBuilder.array([
          this.formBuilder.control('', [Validators.email]),
          this.formBuilder.control('', [Validators.email]),
          this.formBuilder.control('', [Validators.email])
        ]),
        telefonos: this.formBuilder.array([
          this.formBuilder.control(''),
          this.formBuilder.control(''),
          this.formBuilder.control('')
        ])
      }); 
    }
  }

  // Métodos auxiliares para acceder a los FormArray
  getCorreosControls() {
    return (this.formE.get('correos') as FormArray).controls;
  }

  getTelefonosControls() {
    return (this.formE.get('telefonos') as FormArray).controls;
  }

  cargarEditoriales(): void {
    this.crudService.getEditoriales().subscribe({
      next: (data: Editorial[]) => {
        this.editoriales = data;
      },
      error: (error) => {
        console.error('Error al cargar las editoriales:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.modo === 'libros') {
      console.log('Estado del formulario antes de validar:', this.formL);
      console.log('Valor del control editorial:', this.formL.get('editorial')?.value);
      console.log('Tipo del valor editorial:', typeof this.formL.get('editorial')?.value);

      if (this.formL.valid) {
        const libroData: Libro = {
          nombre: this.formL.value.nombre,
          isbn: this.formL.value.isbn,
          editorial: {
            idEditorial: this.formL.value.editorial
          } as Editorial,
          precio: this.formL.value.precio
        };

        console.log('Datos del libro a añadir:', libroData);

        this.crudService.addLibro(libroData).subscribe(
          (response) => {
            console.log('Libro añadido:', response);
            this.entidadCreada.emit();
            this.resetFormularios();
          },
          (error) => {
            console.error('Error al añadir el libro:', error);
          }
        );
      } else {
        console.log('Formulario de libros inválido', this.formL.errors);
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

        console.log('Datos de la editorial a añadir:', editorialData);

        this.crudService.addEditorial(editorialData).subscribe(
          (response) => {
            console.log('Editorial añadida:', response);
            this.entidadCreada.emit();
            this.resetFormularios();
          }
        );
      } else {
        console.log('Formulario de editoriales inválido', this.formE.errors);
      }
    }
  }
  
}
