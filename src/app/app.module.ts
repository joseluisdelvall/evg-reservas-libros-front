import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
import { ToastrModule } from 'ngx-toastr';
import { ModalPeriodoReservasComponent } from './components/reservas/modales/modal-periodo-reservas/modal-periodo-reservas.component';

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
    ModalPeriodoReservasComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({ // Configuración global opcional de Toastr
      timeOut: 3000,
      positionClass: 'toast-bottom-right'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
