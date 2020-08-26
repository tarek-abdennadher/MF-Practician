import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyPatientsRoutingModule } from './my-patients-routing.module';
import { HlsGenericListModule } from 'hls-generic-list';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { HlsGenericListLinksModule } from 'hls-generic-list-links';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { NotifierOptions, NotifierModule } from 'angular-notifier';
import { MyPatientsComponent } from './my-patients.component';
import { SharedModule } from '@app/shared/shared.module';
const notifierOptions: NotifierOptions = {
  position: {
    horizontal: {
      position: "left",
      distance: 370
    },
    vertical: {
      position: "top",
      distance: 90
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
  declarations: [MyPatientsComponent],
  imports: [
    CommonModule,
    MyPatientsRoutingModule,
    HlsGenericListModule,
    InfiniteScrollModule,
    HlsGenericListLinksModule,
    MatProgressSpinnerModule,
    SharedModule,
    NotifierModule.withConfig(notifierOptions),
  ]
})
export class MyPatientsModule { }
