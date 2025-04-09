import { Component, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalOptions } from '../../shared/modal-content/models/modal-options';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-crud',
  templateUrl: './crud.component.html',
  styleUrls: ['./crud.component.css']
})
export class CrudComponent implements OnInit {
  modo: 'libros' | 'editoriales' | null = null;

  // nuevoModalOptions
  nuevoModalOptions!: ModalOptions;

  constructor(private route: ActivatedRoute,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    // Subscribe to the route parameters
    this.route.paramMap.subscribe(params => {
      const modoParam = params.get('modo');
      if (modoParam === 'libros' || modoParam === 'editoriales') {
        this.modo = modoParam;
      } else {
        this.modo = null; // Handle invalid mode if necessary
      }
    });
  }

  modal(): void {
    this.toastr.success('Bienvenido a la sección de gestión', 'Gestión');
  }
}
