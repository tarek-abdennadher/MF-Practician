

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './core/components/login/login.component';
import { AuthGuard } from './app.guard';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'features',
    loadChildren: './features/features.module#FeaturesModule',
    canActivateChild: [AuthGuard]
  }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
