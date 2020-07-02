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
import { MyContactsComponent } from './my-contacts/my-contacts.component';
import { MyContactDetailComponent } from './my-contacts/my-contact-detail/my-contact-detail.component';
import { MyLeavesComponent } from './my-leaves/my-leaves.component';
import { MyLeavesGuard } from './my-leaves/my-leaves.guard';

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
        component: MyLeavesComponent,
        canActivate: [MyLeavesGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
