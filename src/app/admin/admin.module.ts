import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AsideComponent } from './components/general/aside/aside.component';
import { HeaderComponent } from './components/general/header/header.component';
import { ModalEditarComponent } from './components/gestion/crud/components/modales/modal-editar/modal-editar.component';
import { ModalFiltroComponent } from './components/gestion/crud/components/modales/modal-filtro/modal-filtro.component';
import { ModalNuevoComponent } from './components/gestion/crud/components/modales/modal-nuevo/modal-nuevo.component';
import { CrudComponent } from './components/gestion/crud/crud.component';
import { LoginComponent } from './components/login/login.component';
import { PedidosComponent } from './components/pedidos/pedidos.component';
import { ModalPeriodoReservasComponent } from './components/reservas/modales/modal-periodo-reservas/modal-periodo-reservas.component';
import { ReservasComponent } from './components/reservas/reservas.component';
import { ModalContentComponent } from './components/shared/modal-content/modal-content.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { ModalVerComponent } from './components/gestion/crud/components/modales/modal-ver/modal-ver.component';


@NgModule({
  declarations: [
    AdminLayoutComponent,
    AdminComponent,
    HeaderComponent,
    ReservasComponent,
    PedidosComponent,
    LoginComponent,
    CrudComponent,
    AsideComponent,
    ModalContentComponent,
    ModalNuevoComponent,
    ModalPeriodoReservasComponent,
    ModalNuevoComponent,
    ModalEditarComponent,
    ModalFiltroComponent,
    AdminLayoutComponent,
    ModalVerComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
