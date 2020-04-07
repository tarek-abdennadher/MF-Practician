import { Component, OnInit } from "@angular/core";
import { MyPatientsService } from "../services/my-patients.service";
import { MyPatients } from "./my-patients";
import { Router } from "@angular/router";

@Component({
  selector: "app-my-patients",
  templateUrl: "./my-patients.component.html",
  styleUrls: ["./my-patients.component.scss"],
})
export class MyPatientsComponent implements OnInit {
  imageSource = "assets/imgs/IMG_3944.jpg";
  myPatients = [];
  filtredPatients = [];
  isMyPatients = true;
  constructor(
    private myPatientsService: MyPatientsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getPatientsOfCurrentParactician();
  }
  getPatientsOfCurrentParactician() {
    this.myPatientsService
      .getPatientsOfCurrentParactician()
      .subscribe((myPatients) => {
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

  searchAction(event) {
    const filterBy = event.search;
    this.filtredPatients =
      filterBy != null ? this.performFilter(filterBy) : this.myPatients;
  }
  writeAction(item) {
    console.log(item);
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
    this.myPatientsService
      .deletePatientFromMyPatients(item.users[0].id)
      .subscribe((resp) => {
        this.filtredPatients = this.filtredPatients.filter(
          (elm) => elm.users[0].id != item.users[0].id
        );
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
