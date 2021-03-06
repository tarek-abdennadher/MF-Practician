import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MyAccountComponent } from "./my-account/my-account.component";
import { MySecretariesComponent } from "./my-secretaries/my-secretaries.component";
import { TeleSecretariesComponent } from "./tele-secretaries/tele-secretaries.component";
import { FacturesComponent } from "./factures/factures.component";
import { StatsComponent } from "./stats/stats.component";
import { AccountRoutingModule } from "./account-routing.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedMaterialModule } from "@app/shared-material/shared-material.module";
import { AccountService } from "../services/account.service";
import { HlsLinksModule } from "hls-links";
import { HlsPasswordStrengthModule } from "hls-password-strength";
import { HlsMessagingListModule } from "hls-messaging-list";
import { SharedModule } from "@app/shared/shared.module";
import { InternationalPhoneNumberModule } from "ngx-international-phone-number";
import { PipesModule } from "@app/shared/pipes/pipes.module";
import { MyContactsComponent } from "./my-contacts/my-contacts.component";
import { MyContactDetailComponent } from "./my-contacts/my-contact-detail/my-contact-detail.component";
import { NgxSpinnerModule } from "ngx-spinner";
import { NotifierModule, NotifierOptions } from "angular-notifier";
import { MyLeavesComponent } from "./my-leaves/my-leaves.component";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { ApxPieComponent } from "./stats/apx-pie/apx-pie.component";
import { NgApexchartsModule } from "ng-apexcharts";
import { HlsGenericListModule } from "hls-generic-list";
import { LeavesGuard } from "./guards/leaves.guard";
import { TlsGuard } from "./guards/tls.guard";
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
    MyAccountComponent,
    MySecretariesComponent,
    TeleSecretariesComponent,
    FacturesComponent,
    StatsComponent,
    MyContactsComponent,
    MyContactDetailComponent,
    MyLeavesComponent,
    MyContactDetailComponent,
    ApxPieComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    AccountRoutingModule,
    SharedMaterialModule,
    HlsLinksModule,
    HlsMessagingListModule,
    HlsPasswordStrengthModule,
    SharedModule,
    InternationalPhoneNumberModule,
    PipesModule,
    NgxSpinnerModule,
    NotifierModule.withConfig(notifierOptions),
    BsDatepickerModule.forRoot(),
    NgApexchartsModule,
    HlsGenericListModule,
  ],
  providers: [AccountService, LeavesGuard, TlsGuard],
})
export class AccountModule {}
