import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyPatientsRoutingModule } from './my-patients-routing.module';
import { MyPatientsComponent } from './my-patients.component';
import { HlsGenericListModule } from 'hls-generic-list';
import { HlsGenericListLinksModule } from 'hls-generic-list-links';
import { AddPatientComponent } from './add-patient/add-patient.component';
import { PatientDetailComponent } from './add-patient/patient-detail/patient-detail.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SharedModule } from '@app/shared/shared.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';


@NgModule({
  declarations: [MyPatientsComponent, AddPatientComponent, PatientDetailComponent],
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
  ]
})
export class MyPatientsModule { }
