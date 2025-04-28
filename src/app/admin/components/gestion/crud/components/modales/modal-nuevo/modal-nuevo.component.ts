import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalOptions } from 'src/app/admin/components/shared/modal-content/models/modal-options';

@Component({
  selector: 'app-modal-nuevo',
  templateUrl: './modal-nuevo.component.html',
  styleUrls: ['./modal-nuevo.component.css']
})
export class ModalNuevoComponent implements OnInit, OnChanges {

  @Input() modo: 'libros' | 'editoriales' | null = null;

  // nuevoModalOptions
  nuevoModalOptions!: ModalOptions;

  formL!: FormGroup;
  formE!: FormGroup;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {}

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

  crearFormularios() {
    // Aquí puedes inicializar los formularios según el modo
    if (this.modo === 'libros') {
      this.formL = this.formBuilder.group({
            nombre: ['', Validators.required],
            isbn: ['', Validators.required],
            editorial: ['', Validators.required],
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

  onSubmit(): void {
    
    if (this.modo === 'libros') {
      if (this.formL.valid) {
        // Aquí puedes manejar el envío del formulario de libros
        
        console.log('Formulario de libros enviado:', this.formL.value);
      } else {
        console.log('Formulario de libros inválido', this.formL.errors);
      }
    } else if (this.modo === 'editoriales') {

      if (this.formE.valid) {

        console.log('Formulario de editoriales enviado:', this.formE.value);
      } else {
        console.log('Formulario de editoriales inválido', this.formE.errors);
      }
    }
  }

}
