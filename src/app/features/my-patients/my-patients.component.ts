import { Component, OnInit } from "@angular/core";
import { MyPatientsService } from "../services/my-patients.service";
import { MyPatients } from "./my-patients";
import { Router } from '@angular/router';

@Component({
  selector: "app-my-patients",
  templateUrl: "./my-patients.component.html",
  styleUrls: ["./my-patients.component.scss"]
})
export class MyPatientsComponent implements OnInit {
  imageSource = "assets/imgs/IMG_3944.jpg";
  myPatients = [];
  myPatientsSearch = [];
  isMyPatients = true;
  constructor(private myPatientsService: MyPatientsService, private router: Router) {}

  ngOnInit(): void {
    this.getPatientsOfCurrentParactician();
  }
  getPatientsOfCurrentParactician() {
    this.myPatientsService
      .getPatientsOfCurrentParactician()
      .subscribe(myPatients => {
        myPatients.forEach(patient => {
          this.myPatients.push(this.mappingMyPatients(patient));
        });
        myPatients.forEach(patient => {
          this.myPatientsSearch.push(this.mappingMyPatients(patient));
        });
      });
  }

  mappingMyPatients(patient) {
    const myPatients = new MyPatients();
    myPatients.users = [];
    myPatients.users.push({
      id: patient.id,
      fullName: patient.fullName,
      img: "assets/imgs/user.png",
      type: "PATIENT"
    });
    myPatients.isMarkAsSeen = true;
    myPatients.isSeen = true;
    return myPatients;
  }

  searchAction(event) {
    this.myPatientsSearch.forEach(data => {
      this.myPatients = [];
      data.users
        .filter(user =>
          user.fullName.toLowerCase().includes(event.search.toLowerCase())
        )
        .forEach(patient => {
          const myPatients = new MyPatients();
          myPatients.users = [];
          myPatients.users.push({
            id: patient.id,
            fullName: patient.fullName,
            img: "assets/imgs/user.png",
            type: "PATIENT"
          });
          myPatients.isMarkAsSeen = true;
          myPatients.isSeen = true;
          this.myPatients.push(myPatients);
        });
    });
  }
  writeAction(item) {
    this.router.navigate(["/features/messagerie-ecrire/"], {
      queryParams: {
        id: item.users[0].id
      }
    });
  }
  prohibitAction(item) {
    console.log("prohibite");
  }
  editAction(item) {
    console.log("edit");
  }
  deleteAction(item) {
    console.log("delete");
  }
}
