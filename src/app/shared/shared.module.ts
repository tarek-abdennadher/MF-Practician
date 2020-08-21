import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntPhoneComponent } from './components/int-phone/int-phone.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InternationalPhoneNumberModule } from 'ngx-international-phone-number';
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { CKEditorComponent } from './components/ckeditor/ckeditor.component';
import { SecretaryDetailsComponent } from './components/secretary-details/secretary-details.component';

@NgModule({
  declarations: [IntPhoneComponent, CKEditorComponent, SecretaryDetailsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InternationalPhoneNumberModule,
    CKEditorModule,
  ],
  exports: [IntPhoneComponent, CKEditorComponent, SecretaryDetailsComponent]
})
export class SharedModule { }
