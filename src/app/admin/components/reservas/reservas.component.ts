import { Component, OnInit } from '@angular/core';
import { ModalOptions } from '../shared/modal-content/models/modal-options';
import { PeriodoReservasService, PeriodoReservas } from 'src/app/services/periodo-reservas.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.component.html',
  styleUrls: ['./reservas.component.css']
})
export class ReservasComponent implements OnInit {
  periodoActual: PeriodoReservas | null = null;

  modalOptions!: ModalOptions;
  modalOptions2!: ModalOptions;

  constructor(
    private periodoReservasService: PeriodoReservasService,
    private toastr: ToastrService
  ) { }

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
    this.obtenerPeriodoActual();
  }

  obtenerPeriodoActual() {
    this.periodoReservasService.getPeriodoReservas().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.periodoActual = response.data;
        }
      },
      error: (error) => {
        this.toastr.error('Error al cargar el período de reservas', 'Error');
        console.error('Error:', error);
      }
    });
  }

  esPeriodoActivo(): boolean {
    if (!this.periodoActual) return false;
    
    const fechaActual = new Date();
    const fechaInicio = new Date(this.periodoActual.fechaInicio);
    const fechaFin = new Date(this.periodoActual.fechaFin);
    
    // Resetear las horas para comparar solo fechas
    fechaActual.setHours(0, 0, 0, 0);
    fechaInicio.setHours(0, 0, 0, 0);
    fechaFin.setHours(23, 59, 59, 999);
    
    return fechaActual >= fechaInicio && fechaActual <= fechaFin;
  }

  esPeriodoFuturo(): boolean {
    if (!this.periodoActual) return false;
    
    const fechaActual = new Date();
    const fechaInicio = new Date(this.periodoActual.fechaInicio);
    
    // Resetear las horas para comparar solo fechas
    fechaActual.setHours(0, 0, 0, 0);
    fechaInicio.setHours(0, 0, 0, 0);
    
    return fechaInicio > fechaActual;
  }

  getEstadoPeriodo(): string {
    if (this.esPeriodoActivo()) {
      return 'Período Activo';
    } else if (this.esPeriodoFuturo()) {
      return 'Próximamente';
    } else {
      return 'Período Finalizado';
    }
  }
}
