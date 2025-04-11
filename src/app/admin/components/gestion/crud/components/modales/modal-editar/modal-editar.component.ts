import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ModalOptions } from 'src/app/admin/components/shared/modal-content/models/modal-options';

@Component({
  selector: 'app-modal-editar',
  templateUrl: './modal-editar.component.html',
  styleUrls: ['./modal-editar.component.css']
})
export class ModalEditarComponent implements OnInit, OnChanges {

  @Input() modo: 'libros' | 'editoriales' | null = null;
  
    // editarModalOptions
    editarModalOptions!: ModalOptions;
  
    constructor() { }
  
    ngOnInit(): void {}
  
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
      }
    }
  
}
