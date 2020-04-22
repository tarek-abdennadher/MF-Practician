import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyAccountComponent } from './my-account/my-account.component';
import { PersonalInformationsComponent } from './personal-informations/personal-informations.component';
import { MySecretariesComponent } from './my-secretaries/my-secretaries.component';
import { TeleSecretariesComponent } from './tele-secretaries/tele-secretaries.component';
import { FacturesComponent } from './factures/factures.component';
import { StatsComponent } from './stats/stats.component';
import { AccountRoutingModule } from './account-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedMaterialModule } from '@app/shared-material/shared-material.module';
import { AccountService } from '../services/account.service';
import { HlsLinksModule } from 'hls-links';
import { HlsPasswordStrengthModule } from 'hls-password-strength';
import { HlsMessagingListModule } from 'hls-messaging-list';
import { IntPhoneComponent } from '@app/shared/components/int-phone/int-phone.component';
import { SharedModule } from '@app/shared/shared.module';
import { InternationalPhoneNumberModule } from 'ngx-international-phone-number';
@NgModule({
  declarations: [
    MyAccountComponent,
    PersonalInformationsComponent,
    MySecretariesComponent,
    TeleSecretariesComponent,
    FacturesComponent,
    StatsComponent],
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
    InternationalPhoneNumberModule
  ],
  providers: [
    AccountService
  ]
})
export class AccountModule { }
