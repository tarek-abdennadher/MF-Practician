import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { FeaturesComponent } from "./features.component";
import { MessagingListComponent } from "./messaging-list/messaging-list.component";
import { MessagingDetailComponent } from "./messaging-detail/messaging-detail.component";
import { MyPatientsComponent } from "./my-patients/my-patients.component";
import { SentMessagesComponent } from "./sent-messages/sent-messages.component";
import { ContactsComponent } from "./contacts/contacts.component";
import { ContactDetailComponent } from "./contacts/contact-detail/contact-detail.component";
import { ArchieveMessagesComponent } from "./archieve-messages/archieve-messages.component";
import { MessagingReplyComponent } from "./messaging-reply/messaging-reply.component";
import { PracticianSearchComponent } from "./practician-search/practician-search.component";
import { PracticianDetailComponent } from "./practician-detail/practician-detail.component";
import { SendMessageComponent } from "./send-message/send-message.component";
import { SecretaryDetailComponent } from "./secretary-detail/secretary-detail.component";
import { PracticianInvitationComponent } from "./practician-invitation/practician-invitation.component";
import { PatientDetailComponent } from "./patient-detail/patient-detail.component";
import { NoteDetailComponent } from './patient-detail/note-detail/note-detail.component';

const routes: Routes = [
  {
    path: "",
    component: FeaturesComponent,
    children: [
      { path: "", redirectTo: "messagerie", pathMatch: "full" },
      {
        path: "messagerie",
        component: MessagingListComponent,
      },
      {
        path: "messagerie/:id",
        component: MessagingListComponent,
      },
      {
        path: "messagerie-lire/:id",
        component: MessagingDetailComponent,
      },
      {
        path: "mes-patients",
        component: MyPatientsComponent,
      },
      {
        path: "messagerie-envoyes",
        component: SentMessagesComponent,
      },
      {
        path: "mes-contacts-pro",
        component: ContactsComponent,
      },
      {
        path: "contact-detail/:id",
        component: ContactDetailComponent,
      },
      {
        path: "messagerie-repondre/:id",
        component: MessagingReplyComponent,
      },
      {
        path: "messagerie-repondre/:id",
        component: MessagingReplyComponent,
      },
      {
        path: "praticien-recherche",
        component: PracticianSearchComponent,
      },
      {
        path: "praticien-detail/:id",
        component: PracticianDetailComponent,
      },
      {
        path: "patient-detail/:idAccount",
        component: PatientDetailComponent,
      },
      {
        path: "patient-detail/:idAccount/:idPractician",
        component: PatientDetailComponent,
      },
      {
        path: "patient-detail/:idAccount/note/:idNote",
        component: NoteDetailComponent,
      },
      {
        path: "patient-detail/:idAccount/:idPractician/note/:idNote",
        component: NoteDetailComponent,
      },
      {
        path: "patient-detail/:idAccount/:idPractician/note",
        component: NoteDetailComponent,
      },
      {
        path: "messagerie-archives",
        component: ArchieveMessagesComponent,
      },
      {
        path: "compte",
        loadChildren: () =>
          import("./account/account.module").then((m) => m.AccountModule),
      },
      {
        path: "messagerie-ecrire",
        component: SendMessageComponent,
      },
      {
        path: "mes-documents",
        loadChildren: () =>
          import("./my-documents/my-documents.module").then(
            (m) => m.MyDocumentsModule
          ),
      },
      {
        path: "secretaire-detail/:id",
        component: SecretaryDetailComponent,
      },
      {
        path: "praticien-invitation",
        component: PracticianInvitationComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeaturesRoutingModule {}
