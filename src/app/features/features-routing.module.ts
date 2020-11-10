import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { FeaturesComponent } from "./features.component";
import { MessagingListComponent } from "./messaging-list/messaging-list.component";
import { SentMessagesComponent } from "./sent-messages/sent-messages.component";
import { ArchieveMessagesComponent } from "./archieve-messages/archieve-messages.component";
import { PracticianSearchComponent } from "./practician-search/practician-search.component";
import { MessagingDetailResolve } from "./services/messaging-detail.resolve";
import { MessagingDetailService } from "./services/messaging-detail.service";
import { ForwardedMessagesComponent } from "./forwarded-messages/forwarded-messages.component";
import { PracticianDetailComponent } from "@app/shared/components/practician-detail/practician-detail.component";
import { MyInvitationsComponent } from "./my-invitations/my-invitations.component";
import { PatientDetailComponent } from "./patient-detail/patient-detail.component";
import { MyPatientsArchivedComponent } from "./my-patients-archived/my-patients-archived.component";
import { MyPatientsBlockedComponent } from "./my-patients-blocked/my-patients-blocked.component";
import { ContactDetailComponent } from "./contacts/contact-detail/contact-detail.component";
import { DirtyCheckGuard } from "./dirty-check.guard";
import { ForbiddenComponent } from '@app/features/forbidden/forbidden.component';
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
        path: "forbidden",
        component: ForbiddenComponent,
      },
      {
        path: "messagerie/:id",
        component: MessagingListComponent,
      },
      {
        path: "messagerie-lire/:id",
        loadChildren: () =>
          import("./messaging-detail/messaging-detail.module").then(
            (m) => m.MessageDetailModule
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
          import("./contacts/contacts.module").then((m) => m.ContactsModule),
      },
      {
        path: "praticien-recherche",
        component: PracticianSearchComponent,
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
        path: "mes-documents",
        loadChildren: () =>
          import("./my-documents/my-documents.module").then(
            (m) => m.MyDocumentsModule
          ),
      },
      {
        path: "mes-categories",
        loadChildren: () =>
          import("./category/category.module").then((m) => m.CategoryModule),
      },
      {
        path: "mes-objets",
        loadChildren: () =>
          import("./my-objects/my-objects.module").then(
            (m) => m.MyObjectsModule
          ),
      },
      {
        path: "mes-patients",
        loadChildren: () =>
          import("./my-patients/my-patients.module").then(
            (m) => m.MyPatientsModule
          ),
      },
      {
        path: "mes-invitations",
        component: MyInvitationsComponent,
        children: [
          {
            path: "fiche-patient",
            component: PatientDetailComponent,
          },
        ],
      },
      {
        path: "mes-patients-archives",
        component: MyPatientsArchivedComponent,
        children: [
          {
            path: "fiche-patient",
            component: PatientDetailComponent,
          },
        ],
      },
      {
        path: "mes-patients-bloques",
        component: MyPatientsBlockedComponent,
        children: [
          {
            path: "fiche-patient",
            component: PatientDetailComponent,
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [MessagingDetailService, MessagingDetailResolve],
})
export class FeaturesRoutingModule {}
