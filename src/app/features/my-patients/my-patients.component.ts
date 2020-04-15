import { Component, OnInit } from "@angular/core";
import { MyPatientsService } from "../services/my-patients.service";
import { MyPatients } from "./my-patients";
import { Router } from "@angular/router";
import { GlobalService } from "@app/core/services/global.service";
import { DialogService } from "../services/dialog.service";

@Component({
  selector: "app-my-patients",
  templateUrl: "./my-patients.component.html",
  styleUrls: ["./my-patients.component.scss"],
})
export class MyPatientsComponent implements OnInit {
  imageSource = "assets/imgs/user.png";
  myPatients = [];
  filtredPatients = [];
  isMyPatients = true;

  page = "PATIENT";
  topText = this.globalService.messagesDisplayScreen.my_patients;
  number = 0;
  bottomText =
    this.number > 1
      ? this.globalService.messagesDisplayScreen.patients
      : this.globalService.messagesDisplayScreen.patient;
  search: string;
  constructor(
    private globalService: GlobalService,
    private myPatientsService: MyPatientsService,
    private router: Router,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.getPatientsOfCurrentParactician();
  }
  getPatientsOfCurrentParactician() {
    this.myPatientsService
      .getPatientsOfCurrentParactician()
      .subscribe((myPatients) => {
        this.number = myPatients.length;
        this.bottomText =
          this.number > 1
            ? this.globalService.messagesDisplayScreen.patients
            : this.globalService.messagesDisplayScreen.patient;
        myPatients.forEach((elm) => {
          this.myPatients.push(
            this.mappingMyPatients(elm.patient, elm.prohibited)
          );
        });
        this.filtredPatients = this.myPatients;
      });
  }

  mappingMyPatients(patient, prohibited) {
    const myPatients = new MyPatients();
    myPatients.users = [];
    myPatients.users.push({
      id: patient.patientId,
      accountId: patient.id,
      fullName: patient.fullName,
      img: "assets/imgs/user.png",
      type: "PATIENT",
    });
    myPatients.isMarkAsSeen = true;
    myPatients.isSeen = true;
    myPatients.isProhibited = prohibited;
    return myPatients;
  }

  performFilter(filterBy) {
    filterBy = filterBy.toLocaleLowerCase();
    return this.myPatients.filter(
      (patient) =>
        patient.users[0].fullName.toLocaleLowerCase().indexOf(filterBy) !== -1
    );
  }

  searchAction(search) {
    const filterBy = search;
    this.filtredPatients =
      filterBy != null ? this.performFilter(filterBy) : this.myPatients;
  }
  writeAction(item) {
    this.router.navigate(["/features/messagerie-ecrire/"], {
      queryParams: {
        id: item.users[0].accountId,
      },
    });
  }
  prohibitAction(item) {
    this.myPatientsService
      .prohibitePatient(item.users[0].id)
      .subscribe((resp) => {
        if (resp == true) {
          const index = this.filtredPatients.findIndex(
            (elm) => elm.users[0].id == item.users[0].id
          );
          this.filtredPatients[index].isProhibited = true;
        }
      });
  }
  editAction(item) {
    console.log("edit");
  }
  deleteAction(item) {
    this.dialogService
      .openConfirmDialog(
        this.globalService.messagesDisplayScreen.delete_confirmation_patient
      )
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.myPatientsService
            .deletePatientFromMyPatients(item.users[0].id)
            .subscribe((resp) => {
              this.filtredPatients = this.filtredPatients.filter(
                (elm) => elm.users[0].id != item.users[0].id
              );
            });
        }
      });
  }
  authorizeAction(item) {
    this.myPatientsService
      .authorizePatient(item.users[0].id)
      .subscribe((resp) => {
        if (resp == true) {
          const index = this.filtredPatients.findIndex(
            (elm) => elm.users[0].id == item.users[0].id
          );
          this.filtredPatients[index].isProhibited = false;
        }
      });
  }
}
