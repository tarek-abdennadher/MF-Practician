import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IntPhoneComponent } from "./components/int-phone/int-phone.component";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { InternationalPhoneNumberModule } from "ngx-international-phone-number";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { CKEditorComponent } from "./components/ckeditor/ckeditor.component";
import { SecretaryDetailsComponent } from "./components/secretary-details/secretary-details.component";
import { PracticianDetailComponent } from "./components/practician-detail/practician-detail.component";
import { HlsPracticianDetailModule } from "hls-practician-detail";
import { PatientFileComponent } from "./components/patient-file/patient-file.component";
import { MatTabsModule } from "@angular/material/tabs";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { HlsGenericListModule } from "hls-generic-list";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { HlsMessagingListModule } from "hls-messaging-list";
import { MatContactDetailDialogComponent } from "./components/mat-contact-detail-dialog/mat-contact-detail-dialog.component";
import { NotifierModule, NotifierOptions } from "angular-notifier";
import { PipesModule } from "./pipes/pipes.module";
const notifierOptions: NotifierOptions = {
  position: {
    horizontal: {
      position: "right",
      distance: 20,
    },
    vertical: {
      position: "bottom",
      distance: 250,
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
    IntPhoneComponent,
    CKEditorComponent,
    SecretaryDetailsComponent,
    PracticianDetailComponent,
    PatientFileComponent,
    MatContactDetailDialogComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InternationalPhoneNumberModule,
    CKEditorModule,
    HlsPracticianDetailModule,
    MatTabsModule,
    BsDatepickerModule.forRoot(),
    HlsGenericListModule,
    InfiniteScrollModule,
    MatProgressSpinnerModule,
    HlsMessagingListModule,
    NotifierModule.withConfig(notifierOptions),
    PipesModule,
  ],
  exports: [
    IntPhoneComponent,
    CKEditorComponent,
    SecretaryDetailsComponent,
    PracticianDetailComponent,
    PatientFileComponent,
    MatContactDetailDialogComponent,
  ],
})
export class SharedModule {}
