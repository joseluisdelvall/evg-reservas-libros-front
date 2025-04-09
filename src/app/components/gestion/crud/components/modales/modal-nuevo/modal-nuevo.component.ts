import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ModalOptions } from 'src/app/components/shared/modal-content/models/modal-options';

@Component({
  selector: 'app-modal-nuevo',
  templateUrl: './modal-nuevo.component.html',
  styleUrls: ['./modal-nuevo.component.css']
})
export class ModalNuevoComponent implements OnInit, OnChanges {

  @Input() modo: 'libros' | 'editoriales' | null = null;

  // nuevoModalOptions
  nuevoModalOptions!: ModalOptions;

  constructor() { }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modo'] && changes['modo'].currentValue) {
      this.nuevoModalOptions = {
        title: 'Añadir ' + (this.modo === 'libros' ? 'libro' : 'editorial'),
        modalId: 'nuevo' + this.modo,
        size: 'xl'
      };
    }
  }

}
