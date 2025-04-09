import { Component, OnInit } from '@angular/core';
import { ModalOptions } from 'src/app/components/shared/modal-content/models/modal-options';

@Component({
  selector: 'app-modal-periodo-reservas',
  templateUrl: './modal-periodo-reservas.component.html',
  styleUrls: ['./modal-periodo-reservas.component.css']
})
export class ModalPeriodoReservasComponent implements OnInit {

  modalGestionReservasOption!: ModalOptions;

  constructor() { }

  ngOnInit(): void {

    this.modalGestionReservasOption = {
      title: 'Modificar el período de reservas',
      modalId: 'gestionReservas',
      size: 'lg',
      okButton: {
        text: 'Aceptar'
      },
      cancelButton: {
        text: 'Cancelar'
      }
    };
  }

}
