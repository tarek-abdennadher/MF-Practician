import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { MyAccountComponent } from './my-account/my-account.component';
import { PersonalInformationsComponent } from './personal-informations/personal-informations.component';
import { MySecretariesComponent } from './my-secretaries/my-secretaries.component';
import { TeleSecretariesComponent } from './tele-secretaries/tele-secretaries.component';
import { FacturesComponent } from './factures/factures.component';
import { StatsComponent } from './stats/stats.component';
import { MyLeavesComponent } from './my-leaves/my-leaves.component';

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
        path: "mes-conges",
        component: MyLeavesComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
