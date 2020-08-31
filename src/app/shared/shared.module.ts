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
import { PatientFileComponent } from './components/patient-file/patient-file.component';
import { MatTabsModule } from '@angular/material/tabs';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { HlsGenericListModule } from 'hls-generic-list';
import { HlsDocumentGridModule } from 'hls-document-grid';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [IntPhoneComponent, CKEditorComponent, SecretaryDetailsComponent, PracticianDetailComponent, PatientFileComponent],
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
    HlsDocumentGridModule,
    InfiniteScrollModule,
    MatProgressSpinnerModule,
  ],
  exports: [IntPhoneComponent, CKEditorComponent, SecretaryDetailsComponent, PracticianDetailComponent, PatientFileComponent]
})
export class SharedModule { }
