import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/general/header/header.component';
import { ReservasComponent } from './components/reservas/reservas.component';
import { PedidosComponent } from './components/pedidos/pedidos.component';
import { LoginComponent } from './components/login/login.component';
import { CrudComponent } from './components/gestion/crud/crud.component';
import { AsideComponent } from './components/general/aside/aside.component';
import { ModalContentComponent } from './components/shared/modal-content/modal-content.component';
import { ModalNuevoComponent } from './components/gestion/crud/components/modales/modal-nuevo/modal-nuevo.component';
import { ModalEditarComponent } from './components/gestion/crud/components/modales/modal-editar/modal-editar.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ReservasComponent,
    PedidosComponent,
    LoginComponent,
    CrudComponent,
    AsideComponent,
    ModalContentComponent,
    ModalNuevoComponent,
    ModalEditarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
