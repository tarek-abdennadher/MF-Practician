import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { LocalStorageService } from "ngx-webstorage";
import { Location } from "@angular/common";
import { MyPatientsService } from "../services/my-patients.service";
import { EnumCorrespondencePipe } from "@app/shared/pipes/enumCorrespondencePipe";

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
  topText = "Fiche Patient";
  bottomText = "";
  backButton = true;
  isPatient = true;
  links = {};
  idAccount: number;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private myPatientService: MyPatientsService,
    private localSt: LocalStorageService,
    private _location: Location,
    private enumCorespondencePipe: EnumCorrespondencePipe
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.idAccount = params["idAccount"];
      this.getPatientWithPeopleAttached(this.idAccount);
    });
  }
  getPatientWithPeopleAttached(id) {
    this.myPatientService
      .getPatientWithPeopleAttached(id)
      .subscribe((response) => {
        this.bottomText = response.fullName;
        this.patient = response;
        if (this.patient.linkedPatients.length != 0) {
          this.patient.linkedPatients.forEach((patient) => {
            patient.correspondence = this.enumCorespondencePipe.transform(
              patient.correspondence
            );
          });
        }
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
