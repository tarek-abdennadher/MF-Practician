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
import { HlsLinksModule } from "hls-links";
import { HlsSearchModule } from "hls-search";
import { SentMessagesComponent } from "./sent-messages/sent-messages.component";
import { MessageService } from "./services/message.service";
import { HlsMessagingListModule } from "hls-messaging-list";
import { ContactsService } from "./services/contacts.service";
import { PracticianSearchComponent } from "./practician-search/practician-search.component";
import { ArchieveMessagesComponent } from "./archieve-messages/archieve-messages.component";
import { HlsSendMessageModule } from "hls-send-message";
import { HlsGenericListModule } from "hls-generic-list";
import { HlsNewMessageDetailModule } from "hls-new-message-detail";
import { HlsGenericListLinksModule } from "hls-generic-list-links";
import { SendMessageComponent } from "./send-message/send-message.component";
import { MatConfirmDialogComponent } from "./mat-confirm-dialog/mat-confirm-dialog.component";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { NgxSpinnerModule } from "ngx-spinner";
import { InternationalPhoneNumberModule } from "ngx-international-phone-number";
import { SharedModule } from "@app/shared/shared.module";
import { PersonalInformationsComponent } from "./account/personal-informations/personal-informations.component";
import { HlsPasswordStrengthModule } from "hls-password-strength";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { PipesModule } from "@app/shared/pipes/pipes.module";
import { JobtitlePipe } from "@app/shared/pipes/jobTitle.pipe";
import { NgApexchartsModule } from "ng-apexcharts";
import { NewMessageMobileComponent } from "./new-message-mobile/new-message-mobile.component";
import { ForwardedMessagesComponent } from "./forwarded-messages/forwarded-messages.component";
import { AccountService } from "./services/account.service";
import { SharedMaterialModule } from "@app/shared-material/shared-material.module";
import { NewMessageWidgetComponent } from "./new-message-widget/new-message-widget.component";
import { NewMessageComponent } from "./new-message/new-message.component";
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";
import { HlsCkeditorModule } from "hls-ckeditor";
import { MyInvitationsComponent } from "./my-invitations/my-invitations.component";
import { PatientDetailComponent } from "./patient-detail/patient-detail.component";
import { MyPatientsArchivedComponent } from "./my-patients-archived/my-patients-archived.component";
import { MyPatientsBlockedComponent } from "./my-patients-blocked/my-patients-blocked.component";
import { MatPatientFileDialogComponent } from "./mat-patient-file-dialog/mat-patient-file-dialog.component";
import { ContactDetailComponent } from "./contacts/contact-detail/contact-detail.component";

const notifierOptions: NotifierOptions = {
  position: {
    horizontal: {
      position: "right",
      distance: 20,
    },
    vertical: {
      position: "bottom",
      distance: 150,
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
    SentMessagesComponent,
    ForwardedMessagesComponent,
    PracticianSearchComponent,
    SendMessageComponent,
    ArchieveMessagesComponent,
    MatConfirmDialogComponent,
    PersonalInformationsComponent,
    NewMessageMobileComponent,
    NewMessageWidgetComponent,
    NewMessageComponent,
    PatientDetailComponent,
    MyInvitationsComponent,
    MyPatientsArchivedComponent,
    MyPatientsBlockedComponent,
    MatPatientFileDialogComponent,
    ContactDetailComponent,
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
    HlsSendMessageModule,
    MatDialogModule,
    MatIconModule,
    NgxSpinnerModule,
    SharedModule,
    BsDatepickerModule.forRoot(),
    HlsPasswordStrengthModule,
    InternationalPhoneNumberModule,
    InfiniteScrollModule,
    MatProgressSpinnerModule,
    PipesModule,
    NgApexchartsModule,
    HlsGenericListModule,
    HlsGenericListLinksModule,
    SharedMaterialModule,
    HlsNewMessageDetailModule,
    AngularMultiSelectModule,
    HlsCkeditorModule,
  ],

  providers: [MessageService, ContactsService, JobtitlePipe, AccountService],
})
export class FeaturesModule {}
