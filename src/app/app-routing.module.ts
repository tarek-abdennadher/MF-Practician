

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './core/components/login/login.component';
import { AuthGuard } from './app.guard';
import { ResetPasswordComponent } from './core/components/reset-password/reset-password.component';
import { ChangePasswordComponent } from './core/components/change-password/change-password.component';


export const routes: Routes = [
  { path: '', redirectTo: 'connexion', pathMatch: 'full' },
  {
    path: 'connexion',
    component: LoginComponent,
  },
  {
    path: 'inscription',
    loadChildren: './core/components/register/register.module#RegisterModule',
  },
  {
    path: 'mot-de-passe-oublie',
    component: ResetPasswordComponent,
  },
  {
    path: 'mot-de-passe-reinitialisation',
    component: ChangePasswordComponent,
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
