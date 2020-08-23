import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContactsComponent } from './contacts.component';
import { ContactDetailComponent } from './contact-detail/contact-detail.component';
import { SecretaryDetailsComponent } from '@app/shared/components/secretary-details/secretary-details.component';
import { PracticianDetailComponent } from '@app/shared/components/practician-detail/practician-detail.component';


const routes: Routes = [
  {
    path: "",
    component: ContactsComponent,
    children: [
      {
        path: "contact-detail/:id",
        component: ContactDetailComponent,
      },
      {
        path: "praticien-detail/:id",
        component: PracticianDetailComponent,
      },
      {
        path: "secretaire-detail/:id",
        component: SecretaryDetailsComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContactsRoutingModule { }
