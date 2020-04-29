import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { LocalStorageService } from "ngx-webstorage";
import { Location } from "@angular/common";
import { MyPatientsService } from "../services/my-patients.service";
import { EnumCorrespondencePipe } from "@app/shared/pipes/enumCorrespondencePipe";
import { MyDocumentsService } from "../my-documents/my-documents.service";
import { PracticianSearch } from "../practician-search/practician-search.model";
import { GlobalService } from "@app/core/services/global.service";

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
  itemsList: any;
  message: any;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private myPatientService: MyPatientsService,
    private localSt: LocalStorageService,
    private _location: Location,
    private enumCorespondencePipe: EnumCorrespondencePipe,
    private documentService: MyDocumentsService,
    private globalService: GlobalService
  ) {
    this.message = this.globalService.messagesDisplayScreen;
  }

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
          this.mappingToItemsList(this.patient.linkedPatients);
        }
        if (this.patient.photoId) {
          this.documentService.downloadFile(this.patient.photoId).subscribe(
            (response) => {
              let myReader: FileReader = new FileReader();
              myReader.onloadend = (e) => {
                this.patient.img = myReader.result;
              };
              let ok = myReader.readAsDataURL(response.body);
            },
            (error) => {
              this.patient.img = "assets/imgs/user.png";
            }
          );
        }
      });
  }

  mappingToItemsList(patients) {
    this.itemsList = [];
    Array.from(patients).forEach((element) => {
      this.mappingByItem(element);
    });
  }
  mappingByItem(element) {
    let image: string | ArrayBuffer;

    this.documentService.downloadFile(element.photoId).subscribe((response) => {
      let myReader: FileReader = new FileReader();
      myReader.onloadend = (e) => {
        image = myReader.result;
        patient.id = element.id;
        patient.users = [
          {
            fullName: element.fullName,
            img: element.photoId ? image : "assets/imgs/user.png",
            title: "",
            type: "PATIENT",
          },
        ];
        patient.isViewDetail = true;
        patient.isArchieve = true;
        patient.isSeen = true;
        this.itemsList.push(patient);
      };
      let ok = myReader.readAsDataURL(response.body);
    });
    let patient = new PracticianSearch();
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
