import { Component, OnInit } from "@angular/core";
import { MyDocumentsService } from "./my-documents.service";
import { Location } from "@angular/common";
import { GlobalService } from "@app/core/services/global.service";
import { Router } from "@angular/router";
import { PracticianSearch } from "../practician-search/practician-search.model";
/**
 * AutoComplete Default Sample
 */
import { enableRipple } from "@syncfusion/ej2-base";
enableRipple(true);

import { AutoComplete } from "@syncfusion/ej2-dropdowns";
import { PatientSerch } from "../my-patients/my-patients";
@Component({
  selector: "app-my-documents",
  templateUrl: "./my-documents.component.html",
  styleUrls: ["./my-documents.component.scss"],
})
export class MyDocumentsComponent implements OnInit {
  attachements = [];
  page = this.globalService.messagesDisplayScreen.documents;
  topText = this.globalService.messagesDisplayScreen.documents;

  backButton = true;

  isCheckbox: boolean = false;
  itemsList = [];
  filtredItemsList = [];
  imageSource = "assets/imgs/user.png";
  search: string;

  constructor(
    private mydocumentsService: MyDocumentsService,
    private globalService: GlobalService,
    private _location: Location,
    public router: Router,
    private documentService: MyDocumentsService
  ) {}

  ngOnInit(): void {
    this.getMySendersAndReceivers();
  }

  getMySendersAndReceivers() {
    this.mydocumentsService
      .getMySendersAndeceiversDetails()
      .subscribe((sendersAndReceivers) => {
        sendersAndReceivers.forEach((element) => {
          let senderAndReceiver = this.mappingSendersAndReceivers(element);
          this.itemsList.push(senderAndReceiver);
        });

        this.itemsList.forEach((item) => {
          if (item.photoId) {
            item.users.forEach((user) => {
              this.documentService.downloadFile(item.photoId).subscribe(
                (response) => {
                  let myReader: FileReader = new FileReader();
                  myReader.onloadend = (e) => {
                    user.img = myReader.result;
                  };
                  let ok = myReader.readAsDataURL(response.body);
                },
                (error) => {
                  user.img = "assets/imgs/user.png";
                }
              );
            });
          } else {
            item.users.forEach((user) => {
              if (user.type == "MEDICAL") {
                user.img = "assets/imgs/avatar_docteur.svg";
              } else if (user.type == "SECRETARY") {
                user.img = "assets/imgs/avatar_secrétaire.svg";
              } else if (user.type == "PATIENT") {
                if (user.civility == "M") {
                  user.img = "assets/imgs/avatar_homme.svg";
                } else if (user.civility == "MME") {
                  user.img = "assets/imgs/avatar_femme.svg";
                } else if (user.civility == "CHILD") {
                  user.img = "assets/imgs/avatar_enfant.svg";
                }
              }
            });
          }
        });
        const myPatients = [];
        this.itemsList.forEach((p) => {
          const patient = new PatientSerch();
          patient.fullName = p.users[0].fullName;
          patient.photoId = p.photoId;
          myPatients.push(patient);
        });
        this.searchAutoComplete(myPatients);
      });
  }
  getDetailSwitchRole(senderDetail) {
    switch (senderDetail.role) {
      case "PATIENT":
        return senderDetail.patient;
      case "PRACTICIAN":
        return senderDetail.practician;
      case "SECRETARY":
        return senderDetail.secretary;
      default:
        return null;
    }
  }
  mappingSendersAndReceivers(senderAndReceiver) {
    const practician = new PracticianSearch();
    const detail = this.getDetailSwitchRole(senderAndReceiver);
    practician.id = senderAndReceiver.id;
    practician.isSeen = true;
    practician.users = [
      {
        fullName: detail.fullName,
        img: "assets/imgs/user.png",
        title: detail.title,
        type:
          senderAndReceiver.role == "PRACTICIAN"
            ? "MEDICAL"
            : senderAndReceiver.role,
        civility: senderAndReceiver.role ? detail.civility : null,
      },
    ];
    practician.object = {
      name: detail.address,
      isImportant: false,
      isLocalisation: detail.address ? true : false,
    };
    practician.time = null;
    practician.isImportant = false;
    practician.hasFiles = false;
    practician.isViewDetail = true;
    practician.isChecked = false;
    practician.photoId = detail.photoId;

    return practician;
  }

  goBack() {
    this._location.back();
  }

  cardClicked(item) {
    this.router.navigate(["/mes-documents/list/" + item.id]);
  }

  searchAction(search) {
    if (this.filtredItemsList.length < this.itemsList.length) {
      this.filtredItemsList = this.itemsList;
    }
    this.itemsList = this.filtredItemsList;
    this.itemsList = this.itemsList.filter((item) =>
      item.users[0].fullName.toLowerCase().includes(search)
    );
  }

  searchAutoComplete(myPatients) {
    myPatients.forEach((user) => {
      if (user.photoId) {
        this.documentService.downloadFile(user.photoId).subscribe(
          (response) => {
            let myReader: FileReader = new FileReader();
            myReader.onloadend = (e) => {
              user.img = myReader.result;
            };
            let ok = myReader.readAsDataURL(response.body);
          },
          (error) => {
            user.img = "assets/imgs/user.png";
          }
        );
      }
    });
    let atcObj: AutoComplete = new AutoComplete({
      dataSource: myPatients,
      fields: { value: "fullName" },
      itemTemplate:
        "<div><img src=${img} style='height:2rem;   border-radius: 50%;'></img>" +
        '<span class="country"> ${fullName} </span>',
      placeholder: "Nom, prénom",
      popupHeight: "450px",
      highlight: true,
      suggestionCount: 5,
      enabled: myPatients.length != 0 ? true : false,
      noRecordsTemplate: "Aucune données trouvé",
      sortOrder: "Ascending",
    });
    atcObj.appendTo("#patients");
    atcObj.showSpinner();
  }
}
