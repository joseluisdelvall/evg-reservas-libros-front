import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { CrudComponent } from './components/gestion/crud/crud.component';
import { LoginComponent } from './components/login/login.component';
import { PedidosComponent } from './components/pedidos/pedidos.component';
import { ReservasComponent } from './components/reservas/reservas.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';

const routes: Routes = [
  {
    // Cuando se navega a '/admin', se carga AdminLayoutComponent
    path: '', // La ruta base DENTRO del módulo admin (corresponde a /admin)
    component: AdminLayoutComponent,
    // Las siguientes rutas se cargarán DENTRO del <router-outlet> de AdminLayoutComponent
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'reservas', component: ReservasComponent },
      { path: 'pedidos', component: PedidosComponent },
      { path: 'crud/:modo', component: CrudComponent },
      { path: '**', redirectTo: 'login' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
