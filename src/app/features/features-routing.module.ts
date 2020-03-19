import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { FeaturesComponent } from "./features.component";
import { MessagingListComponent } from "./messaging-list/messaging-list.component";
import { MessagingDetailComponent } from "./messaging-detail/messaging-detail.component";
import { MyPatientsComponent } from "./my-patients/my-patients.component";
import { SentMessagesComponent } from "./sent-messages/sent-messages.component";

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
        path: "my-patients",
        component: MyPatientsComponent
      },
      { path: "sent", component: SentMessagesComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeaturesRoutingModule {}
