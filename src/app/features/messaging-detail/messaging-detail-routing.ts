import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { MessagingDetailComponent } from "./messaging-detail.component";
import { MessagingReplyComponent } from "../messaging-reply/messaging-reply.component";
import { MessagingDetailResolve } from "../services/messaging-detail.resolve";

const routes: Routes = [
  {
    path: "",
    component: MessagingDetailComponent,
    children: [
      {
        path: "messagerie-repondre/:id",
        component: MessagingReplyComponent,
        resolve: {
          messagingdetail: MessagingDetailResolve,
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MessageDetailRoutingModule {}
