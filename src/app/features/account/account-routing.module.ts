import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { MyAccountComponent } from './my-account/my-account.component';
import { PersonalInformationsComponent } from './personal-informations/personal-informations.component';
import { MySecretariesComponent } from './my-secretaries/my-secretaries.component';
import { TeleSecretariesComponent } from './tele-secretaries/tele-secretaries.component';
import { FacturesComponent } from './factures/factures.component';
import { StatsComponent } from './stats/stats.component';
import { CategoryComponent } from './category/category.component';
import { CategoryDetailComponent } from './category/category-detail/category-detail.component';
import { MyLeavesComponent } from './my-leaves/my-leaves.component';
import { PracticianObjectsComponent } from './practician-objects/practician-objects.component';
import { PracticianObjectDetailComponent } from './practician-objects/practician-object-detail/practician-object-detail.component';

const routes: Routes = [
  {
    path: "",
    component: MyAccountComponent,
    children: [
      { path: "", redirectTo: "", pathMatch: "full" },
      {
        path: "mes-informations",
        component: PersonalInformationsComponent
      },
      {
        path: "mes-secretaires",
        component: MySecretariesComponent
      },
      {
        path: "mon-telesecretariat",
        component: TeleSecretariesComponent
      },
      {
        path: "mes-factures",
        component: FacturesComponent
      },
      {
        path: "mes-stats",
        component: StatsComponent
      },
      {
        path: "mes-categories",
        component: CategoryComponent
      },
      {
        path: "mes-categories/:id",
        component: CategoryDetailComponent
      },
      {
        path: "mes-conges",
        component: MyLeavesComponent
      },
      {
        path: "mes-objets",
        component: PracticianObjectsComponent
      },
      {
        path: "mes-objets/:id",
        component: PracticianObjectDetailComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
