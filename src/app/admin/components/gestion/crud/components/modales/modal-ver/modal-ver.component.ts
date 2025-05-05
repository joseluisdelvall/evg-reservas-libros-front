import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
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
  
  // verModalOptions
  verModalOptions!: ModalOptions;

  // Datos de la editorial
  editorial: Editorial | null = null;
  
  constructor(private crudService: CrudService) { }
  
  ngOnInit(): void {}
  
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
    // Por ahora, hasta que se implemente el servicio, usaremos datos de prueba
    this.editorial = {
      idEditorial: id,
      nombre: 'Editorial de Prueba',
      correos: ['correo1@editorial.com', 'correo2@editorial.com', 'correo3@editorial.com'],
      telefonos: ['912345678', '913456789', '914567890'],
      estado: '1'
    };
    
    // Cuando se implemente el servicio, usaremos:
    /*
    this.crudService.getEditorialById(id).subscribe({
      next: (editorial: Editorial) => {
        this.editorial = editorial;
      },
      error: (err) => {
        console.error('Error al cargar los datos de la editorial:', err);
      }
    });
    */
  }
}
