import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { PeriodoReservasService, PeriodoReservasResponse } from 'src/app/services/periodo-reservas.service';
import { ToastrService } from 'ngx-toastr';
import { ModalOptions } from 'src/app/admin/components/shared/modal-content/models/modal-options';

declare var bootstrap: any;

@Component({
  selector: 'app-modal-periodo-reservas',
  templateUrl: './modal-periodo-reservas.component.html',
  styleUrls: ['./modal-periodo-reservas.component.css']
})
export class ModalPeriodoReservasComponent implements OnInit {
  @Output() periodoActualizado = new EventEmitter<void>();

  modalGestionReservasOption: ModalOptions = {
    title: 'Modificar el período de reservas',
    modalId: 'gestionReservas',
    size: 'lg',
    okButton: {
      text: 'Aceptar',
      disabled: true
    },
    cancelButton: {
      text: 'Cancelar'
    }
  };

  form!: FormGroup;
  maxDate: string;
  minDate: string;
  
  constructor(
    private formBuilder: FormBuilder,
    private periodoReservasService: PeriodoReservasService,
    private toastr: ToastrService
  ) {
    // Calcular fecha mínima (hoy)
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    // Calcular fecha máxima (1 año desde hoy)
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() + 1);
    this.maxDate = maxDate.toISOString().split('T')[0];

    this.crearFormulario();
  }

  ngOnInit(): void {
    this.obtenerPeriodoReservas();
  }

  crearFormulario() {
    this.form = this.formBuilder.group({
      fechaInicio: ['', [
        Validators.required,
        this.fechaMinimaValidator(this.minDate)
      ]],
      fechaFin: ['', [
        Validators.required,
        this.fechaMaximaValidator(this.maxDate)
      ]]
    });

    // Suscribirse a los cambios de las fechas
    this.form.get('fechaInicio')?.valueChanges.subscribe(() => {
      this.actualizarValidaciones();
    });

    this.form.get('fechaFin')?.valueChanges.subscribe(() => {
      this.actualizarValidaciones();
    });

    // Suscribirse a los cambios del formulario
    this.form.statusChanges.subscribe(status => {
      if (this.modalGestionReservasOption.okButton) {
        this.modalGestionReservasOption.okButton.disabled = status !== 'VALID';
      }
    });
  }

  private fechaMinimaValidator(fechaMin: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const fecha = new Date(control.value);
      const fechaMinima = new Date(fechaMin);
      fechaMinima.setHours(0, 0, 0, 0); // Resetear la hora a inicio del día
      
      return fecha < fechaMinima ? { fechaMinima: true } : null;
    };
  }

  private fechaMaximaValidator(fechaMax: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const fecha = new Date(control.value);
      const fechaMaxima = new Date(fechaMax);
      fechaMaxima.setHours(23, 59, 59, 999); // Establecer al final del día
      
      return fecha > fechaMaxima ? { fechaMaxima: true } : null;
    };
  }

  obtenerPeriodoReservas() {
    this.periodoReservasService.getPeriodoReservas().subscribe({
      next: (response: PeriodoReservasResponse) => {
        if (response.status === 'success') {
          const fechaInicio = new Date(response.data.fechaInicio);
          const fechaFin = new Date(response.data.fechaFin);
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0);

          // Si la fecha de inicio es anterior a hoy, establecer hoy como fecha mínima
          if (fechaInicio < hoy) {
            this.form.patchValue({
              fechaInicio: this.minDate,
              fechaFin: response.data.fechaFin
            });
          } else {
            this.form.patchValue({
              fechaInicio: response.data.fechaInicio,
              fechaFin: response.data.fechaFin
            });
          }
        }
      },
      error: (error) => {
        this.toastr.error('Error al cargar el período de reservas', 'Error');
        console.error('Error:', error);
      }
    });
  }

  private actualizarValidaciones(): void {
    const fechaInicio = this.form.get('fechaInicio')?.value;
    const fechaFin = this.form.get('fechaFin')?.value;

    if (fechaInicio && fechaFin) {
      const fechaInicioDate = new Date(fechaInicio);
      const fechaFinDate = new Date(fechaFin);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      // Validar que la fecha de inicio no sea anterior a hoy
      if (fechaInicioDate < hoy) {
        this.form.get('fechaInicio')?.setErrors({ fechaAnterior: true });
        return;
      }

      // Validar que la fecha de fin no sea anterior a la fecha de inicio
      if (fechaFinDate < fechaInicioDate) {
        this.form.get('fechaFin')?.setErrors({ fechaAnterior: true });
        return;
      }

      // Validar rango máximo (1 año)
      const diffTime = Math.abs(fechaFinDate.getTime() - fechaInicioDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 365) {
        this.form.get('fechaFin')?.setErrors({ rangoExcedido: true });
        return;
      }

      // Limpiar errores si todo está correcto
      this.form.get('fechaInicio')?.setErrors(null);
      this.form.get('fechaFin')?.setErrors(null);
    }
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
          this.periodoActualizado.emit();
          const modalElement = document.getElementById('gestionReservas');
          if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal?.hide();
          }
        }
      },
      error: (error: any) => {
        this.toastr.error('Error al actualizar el período de reservas', 'Error');
      }
    });
  }
}
