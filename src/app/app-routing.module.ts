import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ReservasComponent } from './components/reservas/reservas.component';
import { PedidosComponent } from './components/pedidos/pedidos.component';
import { CrudComponent } from './components/gestion/crud/crud.component';
import { FormReservaComponent } from './components/form-reserva/form-reserva.component';

const routes: Routes = [
  // Default route ESTO HAY QUE CAMBIARLO, HAY QUE HACER OTRO ROUTING DE /ADMIN
  // Rutas "externas"
  { path: 'form-reserva', component: FormReservaComponent},
  // Rutas "privadas"
  { path: 'login', component: LoginComponent },
  { path: 'reservas', component: ReservasComponent },
  { path: 'pedidos', component: PedidosComponent },
  { path: 'crud/:modo', component: CrudComponent },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
