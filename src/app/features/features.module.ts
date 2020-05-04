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
import { PracticianSearchComponent } from "./practician-search/practician-search.component";
import { PracticianDetailComponent } from "./practician-detail/practician-detail.component";
import { HlsPracticianDetailModule } from "hls-practician-detail";
import { ArchieveMessagesComponent } from "./archieve-messages/archieve-messages.component";
import { HlsSendMessageModule } from "hls-send-message";
import { SendMessageComponent } from "./send-message/send-message.component";
import { SecretaryDetailComponent } from "./secretary-detail/secretary-detail.component";
import { MatConfirmDialogComponent } from "./mat-confirm-dialog/mat-confirm-dialog.component";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { PracticianInvitationComponent } from "./practician-invitation/practician-invitation.component";
import { PatientDetailComponent } from "./patient-detail/patient-detail.component";
import { EnumCorrespondencePipe } from "@app/shared/pipes/enumCorrespondencePipe";
import { NgxSpinnerModule } from "ngx-spinner";
import { InternationalPhoneNumberModule } from "ngx-international-phone-number";
import { SharedModule } from "@app/shared/shared.module";
import { PersonalInformationsComponent } from "./account/personal-informations/personal-informations.component";
import { HlsPasswordStrengthModule } from "hls-password-strength";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
const notifierOptions: NotifierOptions = {
  position: {
    horizontal: {
      position: "left",
      distance: 370,
    },
    vertical: {
      position: "top",
      distance: 90,
    },
  },
  theme: "material",
  behaviour: {
    autoHide: 2000,
    onClick: false,
    onMouseover: "pauseAutoHide",
    showDismissButton: false,
  },
  animations: {
    enabled: true,
    show: {
      preset: "fade",
      speed: 1500,
      easing: "ease",
    },
    hide: {
      preset: "fade",
      speed: 300,
      easing: "ease",
      offset: 50,
    },
    shift: {
      speed: 300,
      easing: "ease",
    },
    overlap: 150,
  },
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
    ContactDetailComponent,
    PracticianSearchComponent,
    PracticianDetailComponent,
    SendMessageComponent,
    ArchieveMessagesComponent,
    SecretaryDetailComponent,
    MatConfirmDialogComponent,
    PracticianInvitationComponent,
    PatientDetailComponent,
    EnumCorrespondencePipe,
    PersonalInformationsComponent,
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
    HlsSearchModule,
    HlsPracticianDetailModule,
    HlsSendMessageModule,
    MatDialogModule,
    MatIconModule,
    NgxSpinnerModule,
    InternationalPhoneNumberModule,
    SharedModule,
    BsDatepickerModule.forRoot(),
    HlsPasswordStrengthModule,
    InternationalPhoneNumberModule,
    InfiniteScrollModule,
    MatProgressSpinnerModule
  ],

  providers: [MessageService, ContactsService],
})
export class FeaturesModule {}
