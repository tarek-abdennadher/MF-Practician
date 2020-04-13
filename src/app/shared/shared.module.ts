import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntPhoneComponent } from './components/int-phone/int-phone.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InternationalPhoneNumberModule } from 'ngx-international-phone-number';

@NgModule({
  declarations: [IntPhoneComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InternationalPhoneNumberModule
  ],
  exports: [IntPhoneComponent]
})
export class SharedModule { }
