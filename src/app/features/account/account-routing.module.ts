import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { MyAccountComponent } from "./my-account/my-account.component";
import { PersonalInformationsComponent } from "./personal-informations/personal-informations.component";
import { MySecretariesComponent } from "./my-secretaries/my-secretaries.component";
import { TeleSecretariesComponent } from "./tele-secretaries/tele-secretaries.component";
import { FacturesComponent } from "./factures/factures.component";
import { StatsComponent } from "./stats/stats.component";
import { MyLeavesComponent } from "./my-leaves/my-leaves.component";
import { SecretaryDetailsComponent } from "@app/shared/components/secretary-details/secretary-details.component";
import { DirtyCheckGuard } from "../dirty-check.guard";
import { LeavesGuard } from "./guards/leaves.guard";
import { TlsGuard } from "./guards/tls.guard";

const routes: Routes = [
  {
    path: "",
    component: MyAccountComponent,
    children: [
      { path: "", redirectTo: "", pathMatch: "full" },
      {
        path: "mes-informations",
        component: PersonalInformationsComponent,
        canDeactivate: [DirtyCheckGuard],
      },
      {
        path: "mes-secretaires",
        component: MySecretariesComponent,
        children: [
          {
            path: "secretaire-detail/:id",
            component: SecretaryDetailsComponent,
          },
        ],
      },
      {
        path: "mon-telesecretariat",
        component: TeleSecretariesComponent,
        canActivate: [TlsGuard],
      },
      {
        path: "mes-factures",
        component: FacturesComponent,
      },
      {
        path: "mes-stats",
        component: StatsComponent,
      },
      {
        path: "mes-conges",
        component: MyLeavesComponent,
        canActivate: [LeavesGuard],
        canDeactivate: [DirtyCheckGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule {}
