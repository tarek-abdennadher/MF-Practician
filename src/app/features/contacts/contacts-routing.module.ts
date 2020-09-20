import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ContactsComponent } from "./contacts.component";
import { ContactDetailComponent } from "./contact-detail/contact-detail.component";
import { SecretaryDetailsComponent } from "@app/shared/components/secretary-details/secretary-details.component";
import { PracticianDetailComponent } from "@app/shared/components/practician-detail/practician-detail.component";
import { DirtyCheckGuard } from "../dirty-check.guard";

const routes: Routes = [
  {
    path: "",
    component: ContactsComponent,
    children: [
      {
        path: "invitation",
        component: ContactDetailComponent,
        canDeactivate: [DirtyCheckGuard],
      },
      {
        path: "praticien-detail/:id",
        component: PracticianDetailComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContactsRoutingModule {}
