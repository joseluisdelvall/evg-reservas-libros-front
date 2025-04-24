import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { ModalOptions } from 'src/app/admin/components/shared/modal-content/models/modal-options';

@Component({
  selector: 'app-modal-periodo-reservas',
  templateUrl: './modal-periodo-reservas.component.html',
  styleUrls: ['./modal-periodo-reservas.component.css']
})
export class ModalPeriodoReservasComponent implements OnInit {

  modalGestionReservasOption!: ModalOptions;
  form!: FormGroup;
  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {

    this.crearFormulario();

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

  crearFormulario() {
    this.form = this.formBuilder.group({
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required]
    }); 
  }
}