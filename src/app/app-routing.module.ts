import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormReservaComponent } from './components/form-reserva/form-reserva.component';

const routes: Routes = [
  // Default route ESTO HAY QUE CAMBIARLO, HAY QUE HACER OTRO ROUTING DE /ADMIN
  // Rutas "externas"
  { path: 'form-reserva', component: FormReservaComponent},
  // Rutas "privadas"
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
