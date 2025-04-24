import { Component, OnInit } from '@angular/core';
import { ModalOptions } from '../shared/modal-content/models/modal-options';

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.component.html',
  styleUrls: ['./reservas.component.css']
})
export class ReservasComponent implements OnInit {

  modalOptions!: ModalOptions;
  modalOptions2!: ModalOptions;

  constructor() { }

  ngOnInit(): void {
    this.modalOptions = {
      title: 'Gestion de período de reservas',
      modalId: 'reservasModal',
      okButton: {
        text: 'Guardar'
      },
      cancelButton: {
        text: 'Cancelar'
      }
    };
  }

}
