import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MyPatientsRoutingModule } from "./my-patients-routing.module";
import { MyPatientsComponent } from "./my-patients.component";
import { HlsGenericListModule } from "hls-generic-list";
import { HlsGenericListLinksModule } from "hls-generic-list-links";
import { AddPatientComponent } from "./add-patient/add-patient.component";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { SharedModule } from "@app/shared/shared.module";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { NotifierModule, NotifierOptions } from "angular-notifier";

const notifierOptions: NotifierOptions = {
  position: {
    horizontal: {
      position: "right",
      distance: 20
    },
    vertical: {
      position: "bottom",
      distance: 250
    }
  },
  theme: "material",
  behaviour: {
    autoHide: 2000,
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
  declarations: [MyPatientsComponent, AddPatientComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HlsGenericListModule,
    HlsGenericListLinksModule,
    MatProgressSpinnerModule,
    InfiniteScrollModule,
    SharedModule,
    MyPatientsRoutingModule,
    NotifierModule.withConfig(notifierOptions)
  ]
})
export class MyPatientsModule {}
