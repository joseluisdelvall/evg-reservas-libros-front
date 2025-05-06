import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { ModalOptions } from 'src/app/admin/components/shared/modal-content/models/modal-options';
import { CrudService } from 'src/app/services/crud.service';
import { Editorial } from 'src/app/models/editorial.model';

@Component({
  selector: 'app-modal-ver',
  templateUrl: './modal-ver.component.html',
  styleUrls: ['./modal-ver.component.css']
})
export class ModalVerComponent implements OnInit, OnChanges {

  @Input() modo: 'libros' | 'editoriales' | null = null;
  @Input() idEntidad: string | null = null;
  @ViewChild('modalContent') modalContent!: ElementRef;
  
  // verModalOptions
  verModalOptions!: ModalOptions;

  // Datos de la editorial
  editorial: Editorial | null = null;
  
  constructor(private crudService: CrudService) { }
  
  ngOnInit(): void {
    // Escuchar el evento de apertura del modal
    document.addEventListener('shown.bs.modal', (event: any) => {
      // Verificar si el modal abierto es el nuestro
      if (this.modo && event.target.id === 'ver' + this.modo) {
        this.recargarDatos();
      }
    });
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modo'] && changes['modo'].currentValue) {
      this.verModalOptions = {
        title: 'Detalles de ' + (this.modo === 'libros' ? 'libro' : 'editorial'),
        modalId: 'ver' + this.modo,
        size: 'xl',
        okButton: {
          text: 'Cerrar',
        }
      };
    }

    if (changes['idEntidad'] && changes['idEntidad'].currentValue && this.modo === 'editoriales') {
      this.cargarDatosEditorial(changes['idEntidad'].currentValue);
    }
  }

  cargarDatosEditorial(id: string): void {
    this.crudService.getEditorialById(id).subscribe({
      next: (editorial: Editorial) => {
        this.editorial = editorial;
      },
      error: (err) => {
        console.error('Error al cargar los datos de la editorial:', err);
      }
    });
  }

  // Método para recargar los datos cuando el modal se muestra
  recargarDatos(): void {
    if (this.idEntidad && this.modo === 'editoriales') {
      this.cargarDatosEditorial(this.idEntidad);
    }
  }
}
