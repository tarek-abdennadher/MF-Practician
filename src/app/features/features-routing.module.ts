import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { FeaturesComponent } from "./features.component";
import { MessagingListComponent } from "./messaging-list/messaging-list.component";
import { MessagingDetailComponent } from "./messaging-detail/messaging-detail.component";
import { SentMessagesComponent } from "./sent-messages/sent-messages.component";
import { ArchieveMessagesComponent } from "./archieve-messages/archieve-messages.component";
import { MessagingReplyComponent } from "./messaging-reply/messaging-reply.component";
import { PracticianSearchComponent } from "./practician-search/practician-search.component";
import { SendMessageComponent } from "./send-message/send-message.component";
import { PracticianInvitationComponent } from "./practician-invitation/practician-invitation.component";
import { MessagingDetailResolve } from "./services/messaging-detail.resolve";
import { MessagingDetailService } from "./services/messaging-detail.service";
import { ForwardedMessagesComponent } from "./forwarded-messages/forwarded-messages.component";
import { PracticianDetailComponent } from '@app/shared/components/practician-detail/practician-detail.component';
import { PatientFileComponent } from '@app/shared/components/patient-file/patient-file.component';
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
        path: "mes-patients/:section",
        loadChildren: () =>
          import("./my-patients/my-patients.module").then(
            (m) => m.MyPatientsModule
          ),
      },
      {
        path: "messagerie-envoyes",
        component: SentMessagesComponent,
      },
      {
        path: "messagerie-transferes",
        component: ForwardedMessagesComponent,
      },
      {
        path: "mes-contacts-pro",
        loadChildren: () =>
          import("./contacts/contacts.module").then(
            (m) => m.ContactsModule
          ),
      },
      {
        path: "messagerie-repondre/:id",
        component: MessagingReplyComponent,
        resolve: {
          messagingdetail: MessagingDetailResolve,
        },
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
        path: "praticien-invitation",
        component: PracticianInvitationComponent,
      },
      {
        path: "mes-categories",
        loadChildren: () => import("./category/category.module").then((m) => m.CategoryModule),
      },
      {
        path: "mes-objets",
        loadChildren: () => import("./my-objects/my-objects.module").then((m) => m.MyObjectsModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [MessagingDetailService, MessagingDetailResolve],
})
export class FeaturesRoutingModule { }
