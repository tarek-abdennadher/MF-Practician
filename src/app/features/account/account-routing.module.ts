import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { MyAccountComponent } from './my-account/my-account.component';
import { PersonalInformationsComponent } from './personal-informations/personal-informations.component';
import { MySecretariesComponent } from './my-secretaries/my-secretaries.component';
import { TeleSecretariesComponent } from './tele-secretaries/tele-secretaries.component';
import { FacturesComponent } from './factures/factures.component';
import { StatsComponent } from './stats/stats.component';


const routes: Routes = [
  {
    path: "",
    component: MyAccountComponent,
    children: [
      { path: "", redirectTo: "", pathMatch: "full" },
      {
        path: "personal-info",
        component: PersonalInformationsComponent
      },
      {
        path: "secretaries",
        component: MySecretariesComponent
      },
      {
        path: "tele-secretaries",
        component: TeleSecretariesComponent
      },
      {
        path: "factures",
        component: FacturesComponent
      },
      {
        path: "stats",
        component: StatsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule {}
