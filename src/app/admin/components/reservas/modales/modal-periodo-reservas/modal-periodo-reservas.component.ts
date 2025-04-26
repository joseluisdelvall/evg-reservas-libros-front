import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { ModalOptions } from 'src/app/admin/components/shared/modal-content/models/modal-options';
import { PeriodoReservasService, PeriodoReservasResponse } from 'src/app/services/periodo-reservas.service';

@Component({
  selector: 'app-modal-periodo-reservas',
  templateUrl: './modal-periodo-reservas.component.html',
  styleUrls: ['./modal-periodo-reservas.component.css']
})
export class ModalPeriodoReservasComponent implements OnInit {

  modalGestionReservasOption!: ModalOptions;
  form!: FormGroup;
  
  constructor(private formBuilder: FormBuilder,
    private periodoReservasService: PeriodoReservasService
  ) { }

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

    this.obtenerPeriodoReservas();
  }

  crearFormulario() {
    this.form = this.formBuilder.group({
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required]
    }); 
  }

  obtenerPeriodoReservas() {
    this.periodoReservasService.getPeriodoReservas().subscribe((response: PeriodoReservasResponse) => {
      if (response.status === 'success') {
        this.form.patchValue({
          fechaInicio: response.data.fechaInicio,
          fechaFin: response.data.fechaFin
        });
      }
    });
  }
}
