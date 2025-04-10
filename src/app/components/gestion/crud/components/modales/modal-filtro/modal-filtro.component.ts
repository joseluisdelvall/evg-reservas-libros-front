import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ModalOptions } from 'src/app/components/shared/modal-content/models/modal-options';

@Component({
  selector: 'app-modal-filtro',
  templateUrl: './modal-filtro.component.html',
  styleUrls: ['./modal-filtro.component.css']
})
export class ModalFiltroComponent implements OnInit, OnChanges {

  @Input() modo: 'libros' | 'editoriales' | null = null;

  filtroModalOptions!: ModalOptions;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
      if (changes['modo'] && changes['modo'].currentValue) {
        this.filtroModalOptions = {
          title: 'Filtrar ' + this.modo,
          modalId: 'filtro' + this.modo,
          size: 'xl',
          okButton: {
            text: 'Filtrar'
          },
          cancelButton: {
            text: 'Cancelar'
          }
        };
      }
    }

}
