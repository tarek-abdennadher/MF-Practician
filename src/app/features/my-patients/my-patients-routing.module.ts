import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyPatientsComponent } from './my-patients.component';
import { AddPatientComponent } from './add-patient/add-patient.component';
import { PatientDetailComponent } from '../patient-detail/patient-detail.component';

const routes: Routes = [
  {
    path: "",
    component: MyPatientsComponent,
    children: [
      {
        path: "ajout-patient",
        component: AddPatientComponent
      },
      {
        path: "fiche-patient",
        component: PatientDetailComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyPatientsRoutingModule { }
