import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntPhoneComponent } from './components/int-phone/int-phone.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InternationalPhoneNumberModule } from 'ngx-international-phone-number';
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { CKEditorComponent } from './components/ckeditor/ckeditor.component';
import { SecretaryDetailsComponent } from './components/secretary-details/secretary-details.component';
import { PracticianDetailComponent } from './components/practician-detail/practician-detail.component';
import { HlsPracticianDetailModule } from "hls-practician-detail";

@NgModule({
  declarations: [IntPhoneComponent, CKEditorComponent, SecretaryDetailsComponent, PracticianDetailComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InternationalPhoneNumberModule,
    CKEditorModule,
    HlsPracticianDetailModule
  ],
  exports: [IntPhoneComponent, CKEditorComponent, SecretaryDetailsComponent, PracticianDetailComponent]
})
export class SharedModule { }
