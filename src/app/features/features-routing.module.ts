import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { FeaturesComponent } from "./features.component";
import { MessagingListComponent } from "./messaging-list/messaging-list.component";
import { MessagingDetailComponent } from "./messaging-detail/messaging-detail.component";
import { MyPatientsComponent } from "./my-patients/my-patients.component";
import { SentMessagesComponent } from "./sent-messages/sent-messages.component";
import { ContactsComponent } from "./contacts/contacts.component";
import { ContactDetailComponent } from "./contacts/contact-detail/contact-detail.component";
import { PracticianSearchComponent } from './practician-search/practician-search.component';
import { PracticianDetailComponent } from './practician-detail/practician-detail.component';

const routes: Routes = [
  {
    path: "",
    component: FeaturesComponent,
    children: [
      { path: "", redirectTo: "list", pathMatch: "full" },
      {
        path: "list",
        component: MessagingListComponent
      },
      {
        path: "detail/:id",
        component: MessagingDetailComponent
      },
      {
        path: "mes-patients",
        component: MyPatientsComponent
      },
      {
        path: "messagerie-envoyes",
        component: SentMessagesComponent
      },
      {
        path: "contacts",
        component: ContactsComponent
      },
      {
        path: "contact-detail/:id",
        component: ContactDetailComponent
      },
      {
        path: "search",
        component: PracticianSearchComponent
      },
      {
        path: "practician-detail/:id",
        component: PracticianDetailComponent
      },
      {
        path: 'compte',
        loadChildren: () => import('./account/account.module').then(m => m.AccountModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeaturesRoutingModule {}
