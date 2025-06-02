import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { ModalOptions } from 'src/app/admin/components/shared/modal-content/models/modal-options';
import { PeriodoReservasService, PeriodoReservasResponse } from 'src/app/services/periodo-reservas.service';
import { ToastrService } from 'ngx-toastr';

declare var bootstrap: any;

@Component({
  selector: 'app-modal-periodo-reservas',
  templateUrl: './modal-periodo-reservas.component.html',
  styleUrls: ['./modal-periodo-reservas.component.css']
})
export class ModalPeriodoReservasComponent implements OnInit {
  @Output() periodoActualizado = new EventEmitter<void>();

  modalGestionReservasOption!: ModalOptions;
  form!: FormGroup;
  
  constructor(
    private formBuilder: FormBuilder,
    private periodoReservasService: PeriodoReservasService,
    private toastr: ToastrService
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
    this.periodoReservasService.getPeriodoReservas().subscribe({
      next: (response: PeriodoReservasResponse) => {
        if (response.status === 'success') {
          this.form.patchValue({
            fechaInicio: response.data.fechaInicio,
            fechaFin: response.data.fechaFin
          });
        }
      },
      error: (error) => {
        this.toastr.error('Error al cargar el período de reservas', 'Error');
        console.error('Error:', error);
      }
    });
  }

  onOkButtonClick() {
    if (this.form.invalid) {
      this.toastr.warning('Por favor complete todos los campos requeridos', 'Validación');
      return;
    }

    const periodoReservas = {
      fechaInicio: this.form.value.fechaInicio,
      fechaFin: this.form.value.fechaFin
    };

    this.periodoReservasService.updatePeriodoReservas(periodoReservas).subscribe({
      next: (response: PeriodoReservasResponse) => {
        if (response.status === 'success') {
          this.toastr.success('Periodo de reservas actualizado correctamente', 'Éxito');
          // Emitir evento de actualización
          this.periodoActualizado.emit();
          // Cerrar el modal usando Bootstrap
          const modalElement = document.getElementById('gestionReservas');
          if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal?.hide();
          }
        }
      },
      error: (error: any) => {
        this.toastr.error('Error al actualizar el período de reservas');
      }
    });
  }
}
