import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    } else if (this.modo === 'editoriales') {
      this.formE = this.formBuilder.group({
            nombre: ['', Validators.required],
            correo: ['', [Validators.required, Validators.email]],
            telefono: ['', Validators.required]
          }); 
    }
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

        this.crudService.addEditorial(this.formE.value).subscribe(
          (response) => {
            console.log('Editorial añadida:', response);
            this.entidadCreada.emit(); // Emitir el evento con la nueva editorial
            this.resetFormularios();
            // Aquí puedes manejar la respuesta después de añadir la editorial
          }
        );
        console.log('Formulario de editoriales enviado:', this.formE.value);
      } else {
        console.log('Formulario de editoriales inválido', this.formE.errors);
      }
    }
  }

  onEditorialChange(event: any): void {
    console.log('Evento de cambio en editorial:', event);
    console.log('Valor seleccionado:', event.target.value);
    console.log('Estado del control editorial:', this.formL.get('editorial'));
  }

}
