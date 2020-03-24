import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FeaturesRoutingModule } from "./features-routing.module";
import { FeaturesComponent } from "./features.component";
import { HlsNavBarModule } from "hls-nav-bar";
import { HlsSideBarModule } from "hls-side-bar";
import { MessagingListComponent } from "./messaging-list/messaging-list.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HlsMessagingDetailModule } from "hls-messaging-detail";
import { NotifierModule, NotifierOptions } from "angular-notifier";
import { MessagingDetailComponent } from "./messaging-detail/messaging-detail.component";
import { HlsLinksModule } from "hls-links";
import { MessagingReplyComponent } from "./messaging-reply/messaging-reply.component";
import { HlsSearchModule } from "hls-search";
import { MyPatientsComponent } from "./my-patients/my-patients.component";
import { SentMessagesComponent } from "./sent-messages/sent-messages.component";
import { MessageService } from "./services/message.service";
import { HlsMessagingListModule } from "hls-messaging-list";
import { ContactsComponent } from "./contacts/contacts.component";
import { ContactsService } from "./services/contacts.service";
import { ContactDetailComponent } from "./contacts/contact-detail/contact-detail.component";
const notifierOptions: NotifierOptions = {
  position: {
    horizontal: {
      position: "left",
      distance: 400
    },
    vertical: {
      position: "top",
      distance: 68
    }
  },
  theme: "material",
  behaviour: {
    autoHide: 5000,
    onClick: false,
    onMouseover: "pauseAutoHide",
    showDismissButton: false
  },
  animations: {
    enabled: true,
    show: {
      preset: "fade",
      speed: 1500,
      easing: "ease"
    },
    hide: {
      preset: "fade",
      speed: 300,
      easing: "ease",
      offset: 50
    },
    shift: {
      speed: 300,
      easing: "ease"
    },
    overlap: 150
  }
};
@NgModule({
  declarations: [
    FeaturesComponent,
    MessagingListComponent,
    MessagingDetailComponent,
    SentMessagesComponent,
    MessagingReplyComponent,
    MyPatientsComponent,
    ContactsComponent,
    ContactDetailComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    FeaturesRoutingModule,
    HlsNavBarModule,
    HlsSideBarModule,
    NotifierModule.withConfig(notifierOptions),
    HlsMessagingDetailModule,
    HlsLinksModule,
    HlsMessagingListModule,
    HlsSearchModule
  ],

  providers: [MessageService, ContactsService]
})
export class FeaturesModule {}
