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

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ReservasComponent,
    PedidosComponent,
    LoginComponent,
    CrudComponent,
    AsideComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
