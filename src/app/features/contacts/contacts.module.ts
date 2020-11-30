import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ContactsRoutingModule } from "./contacts-routing.module";
import { ContactsComponent } from "./contacts.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "@app/shared/shared.module";
import { HlsGenericListModule } from "hls-generic-list";
import { HlsLinksModule } from "hls-links";
import { HlsGenericListLinksModule } from "hls-generic-list-links";
import { PipesModule } from "@app/shared/pipes/pipes.module";
import { InternationalPhoneNumberModule } from "ngx-international-phone-number";
import { NotifierModule, NotifierOptions } from "angular-notifier";
import { NgxSpinnerModule } from "ngx-spinner";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
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
  declarations: [ContactsComponent],
  imports: [
    CommonModule,
    ContactsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    HlsGenericListModule,
    HlsLinksModule,
    HlsGenericListLinksModule,
    PipesModule,
    InternationalPhoneNumberModule,
    NotifierModule.withConfig(notifierOptions),
    NgxSpinnerModule,
    MatProgressSpinnerModule
  ]
})
export class ContactsModule {}
