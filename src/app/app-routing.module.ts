import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormReservaComponent } from './components/form-reserva/form-reserva.component';
import { LoginComponent } from './admin/components/login/login.component';
import { ReservasComponent } from './admin/components/reservas/reservas.component';
import { PedidosComponent } from './admin/components/pedidos/pedidos.component';
import { CrudComponent } from './admin/components/gestion/crud/crud.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  // Default route ESTO HAY QUE CAMBIARLO, HAY QUE HACER OTRO ROUTING DE /ADMIN
  // Rutas "externas"
  { path: 'form-reserva', component: FormReservaComponent},
  { path: '**', redirectTo: 'form-reserva'},
  // Rutas "privadas"
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
  { path: 'reservas', component: ReservasComponent, canActivate: [AuthGuard] },
  { path: 'pedidos', component: PedidosComponent, canActivate: [AuthGuard] },
  { path: 'crud/:modo', component: CrudComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  //{ path: '**', redirectTo: 'login' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
