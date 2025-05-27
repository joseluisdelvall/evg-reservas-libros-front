import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { CrudComponent } from './components/gestion/crud/crud.component';
import { LoginComponent } from './components/login/login.component';
import { ReservasComponent } from './components/reservas/reservas.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { AuthGuard } from '../guards/auth.guard';
import { AsignarLibrosCursosComponent } from './components/gestion/asignar-libros-cursos/asignar-libros-cursos.component';
import { PedidosPendientesComponent } from './components/pedidos/pedidos-pendientes/pedidos-pendientes.component';
import { PedidosRealizadosComponent } from './components/pedidos/pedidos-realizados/pedidos-realizados.component';

const routes: Routes = [
  {
    // Cuando se navega a '/admin', se carga AdminLayoutComponent
    path: '', // La ruta base DENTRO del módulo admin (corresponde a /admin)
    component: AdminLayoutComponent,
    // Las siguientes rutas se cargarán DENTRO del <router-outlet> de AdminLayoutComponent
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'reservas', component: ReservasComponent, canActivate: [AuthGuard] },
      { path: 'pedidos-pendientes', component: PedidosPendientesComponent, canActivate: [AuthGuard] },
      { path: 'pedidos-realizados', component: PedidosRealizadosComponent, canActivate: [AuthGuard] },
      { path: 'crud/:modo', component: CrudComponent, canActivate: [AuthGuard] },
      { path: 'asignar-libros-cursos', component: AsignarLibrosCursosComponent, canActivate: [AuthGuard] },
      { path: '**', redirectTo: 'login' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
