import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { LocalStorageService } from "ngx-webstorage";
import { Location } from "@angular/common";
import { PracticianDetailService } from "../practician-detail/practician-detail.service";
import { MyPatientsService } from "../services/my-patients.service";

@Component({
  selector: "app-patient-detail",
  templateUrl: "./patient-detail.component.html",
  styleUrls: ["./patient-detail.component.scss"],
})
export class PatientDetailComponent implements OnInit {
  patient: any;
  imageSource: string = "assets/imgs/user.png";
  public isFavorite: boolean = false;
  page = "MY_PRACTICIANS";
  number = null;
  topText = "Détails du patient";
  bottomText = "";
  backButton = true;
  isPatient = true;
  links = {};
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private myPatientService: MyPatientsService,
    private localSt: LocalStorageService,
    private _location: Location
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.getPatientWithPeopleAttached(params["id"]);
    });
  }
  getPatientWithPeopleAttached(id) {
    this.myPatientService
      .getPatientWithPeopleAttached(id)
      .subscribe((response) => {
        this.bottomText = response.fullName;
        this.patient = response;
      });
  }

  sendMessageClicked(item) {
    this.router.navigate(["/messagerie-ecrire"], {
      queryParams: {
        id: item.accountId,
      },
    });
  }
  BackButton() {
    this._location.back();
  }
}
