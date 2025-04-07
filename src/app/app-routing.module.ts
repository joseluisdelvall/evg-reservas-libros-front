import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ReservasComponent } from './components/reservas/reservas.component';
import { PedidosComponent } from './components/pedidos/pedidos.component';

const routes: Routes = [
  // Default route
  { path: 'login', component: LoginComponent },
  { path: 'reservas', component: ReservasComponent },
  { path: 'pedidos', component: PedidosComponent },
  // { path: 'libros', component: LibrosComponent },
  // { path: 'editoriales', component: EditorialesComponent },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
