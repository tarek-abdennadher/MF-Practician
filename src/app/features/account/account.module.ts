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
import { CategoryComponent } from './category/category.component';
import { CategoryDetailComponent } from './category/category-detail/category-detail.component';
import { PipesModule } from '@app/shared/pipes/pipes.module';
@NgModule({
  declarations: [
    MyAccountComponent,
    MySecretariesComponent,
    TeleSecretariesComponent,
    FacturesComponent,
    StatsComponent,
    CategoryComponent,
    CategoryDetailComponent,
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
    PipesModule
  ],
  providers: [AccountService],
})
export class AccountModule { }
