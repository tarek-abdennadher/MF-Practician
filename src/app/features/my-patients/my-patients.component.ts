import { Component, OnInit } from "@angular/core";
import { MyPatientsService } from "../services/my-patients.service";
import { MyPatients } from "./my-patients";

@Component({
  selector: "app-my-patients",
  templateUrl: "./my-patients.component.html",
  styleUrls: ["./my-patients.component.scss"]
})
export class MyPatientsComponent implements OnInit {
  imageSource = "assets/imgs/IMG_3944.jpg";
  myPatients = [];
  isMyPatients = true;
  constructor(private myPatientsService: MyPatientsService) {}

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
      });
  }

  mappingMyPatients(patient) {
    const myPatients = new MyPatients();
    myPatients.users = [];
    myPatients.users.push({
      fullName: patient.fullName,
      img: "assets/imgs/user.png",
      type: "PATIENT"
    });
    myPatients.isMarkAsSeen = true;
    myPatients.isSeen = true;
    return myPatients;
  }
}
