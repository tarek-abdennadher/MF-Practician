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
import { FormGroup, FormBuilder } from "@angular/forms";
import { AccountService } from "../services/account.service";
import { FeaturesService } from "../features.service";
import { DomSanitizer } from "@angular/platform-browser";
import { Observable } from "rxjs";
@Component({
  selector: "app-my-documents",
  templateUrl: "./my-documents.component.html",
  styleUrls: ["./my-documents.component.scss"]
})
export class MyDocumentsComponent implements OnInit {
  attachements = [];
  page = this.globalService.messagesDisplayScreen.documents;
  topText = this.globalService.messagesDisplayScreen.documents;

  backButton = true;
  links = {
    isTypeFilter: true,
    isSearch: true
  };
  isCheckbox: boolean = false;
  itemsList = [];
  filtredItemsList = [];
  imageSource: string;
  search: string;
  avatars: {
    doctor: string;
    child: string;
    women: string;
    man: string;
    secretary: string;
    user: string;
    tls: string;
  };

  public filterDocumentsForm: FormGroup;

  destinations = new Set();
  documentTypes = new Set();
  myPatients = [];
  account: any;
  linkedPatients: any;
  imageObs: any;

  constructor(
    private mydocumentsService: MyDocumentsService,
    private globalService: GlobalService,
    private _location: Location,
    public router: Router,
    private documentService: MyDocumentsService,
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private featureService: FeaturesService,
    private sanitizer: DomSanitizer
  ) {
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.user;
    this.filterDocumentsForm = this.formBuilder.group({
      documentType: [""],
      destination: [""]
    });
  }

  ngOnInit(): void {
    this.featureService.setActiveChild("document");
    this.getMySendersAndReceivers();
    this.getAllObjects();
    this.getPersonalInfo();
    this.featureService.setIsMessaging(false);
  }

  getMySendersAndReceivers() {
    this.mydocumentsService
      .getMySendersAndeceiversDetails()
      .subscribe(sendersAndReceivers => {
        sendersAndReceivers.forEach(element => {
          let senderAndReceiver = this.mappingSendersAndReceivers(element);
          this.itemsList.push(senderAndReceiver);
        });
        this.itemsList.forEach(item => {
          item.users.forEach(user => {
            this.documentService.getDefaultImage(item.id).subscribe(
              response => {
                let myReader: FileReader = new FileReader();
                myReader.onloadend = e => {
                  user.img = this.sanitizer.bypassSecurityTrustUrl(
                    myReader.result as string
                  );
                  const patient = new PatientSerch();
                  patient.fullName = user.fullName;
                  patient.img = this.sanitizer.bypassSecurityTrustUrl(
                    myReader.result as string
                  );
                  patient.id = item.id;
                  patient.photoId = item.photoId;
                  this.myPatients.push(patient);
                };
                let ok = myReader.readAsDataURL(response);
              },
              error => {
                user.img = this.avatars.user;
              }
            );
          });
        });
        this.searchAutoComplete(this.myPatients);
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
      case "TELESECRETARYGROUP":
        return senderDetail.telesecretaryGroup;
      case "OPERATOR":
        return senderDetail.telesecretary;
      case "SUPERVISOR":
        return senderDetail.telesecretary;
      case "SUPER_SUPERVISOR":
        return senderDetail.telesecretary;
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
        img: this.avatars.user,
        title: detail.title,
        type:
          senderAndReceiver.role == "PRACTICIAN"
            ? "MEDICAL"
            : senderAndReceiver.role,
        civility: senderAndReceiver.role ? detail.civility : null
      }
    ];
    practician.object = {
      name: detail.address ? detail.address : "",
      isImportant: false,
      isLocalisation: detail.address ? true : false
    };
    practician.time = null;
    practician.isImportant = false;
    practician.hasFiles = false;
    practician.isViewDetail = false;
    practician.isChecked = false;
    practician.photoId = detail.photoId;

    return practician;
  }

  goBack() {
    this._location.back();
  }

  cardClicked(item) {
    this.documentService.setId(item.id);
    this.router.navigate(["/mes-documents/list/" + item.id], {
      queryParams: {
        type: this.filterDocumentsForm.value.documentType
      }
    });
  }

  searchAction(value) {
    if (this.filtredItemsList.length < this.itemsList.length) {
      this.filtredItemsList = this.itemsList;
    }
    this.itemsList = this.filtredItemsList;
    this.itemsList = this.itemsList.filter(item =>
      item.users[0].fullName.toLowerCase().includes(value)
    );
  }

  searchAutoComplete(myPatients) {
    let atcObj: AutoComplete = new AutoComplete({
      dataSource: myPatients,
      fields: { value: "fullName" },
      itemTemplate:
        "<div><img src=${img.changingThisBreaksApplicationSecurity} style='height:2rem; width:2rem;   border-radius: 50%;'></img>" +
        '<span class="country"> ${fullName} </span>',
      placeholder: "Recherche par nom ...",
      popupHeight: "450px",
      highlight: true,
      suggestionCount: 5,
      noRecordsTemplate: "Aucune données trouvé",
      sortOrder: "Ascending"
    });
    atcObj.appendTo("#patients");
    atcObj.showSpinner();
  }
  getMySendersAndReceiversBySenderForAndObject(senderFor, object) {
    this.mydocumentsService
      .getMySendersAndreceiversDetailsBySenderForIdAndObject(senderFor, object)
      .subscribe(sendersAndReceivers => {
        sendersAndReceivers.forEach(element => {
          let senderAndReceiver = this.mappingSendersAndReceivers(element);
          this.itemsList.push(senderAndReceiver);
        });
        this.itemsList.forEach(item => {
          item.users.forEach(user => {
            this.documentService.getDefaultImage(item.id).subscribe(
              response => {
                let myReader: FileReader = new FileReader();
                myReader.onloadend = e => {
                  user.img = this.sanitizer.bypassSecurityTrustUrl(
                    myReader.result as string
                  );
                };
                let ok = myReader.readAsDataURL(response);
              },
              error => {
                user.img = "assets/imgs/user.png";
              }
            );
          });
        });
      });
  }
  getMySendersAndReceiversBySenderFor(senderFor) {
    this.mydocumentsService
      .getMySendersAndreceiversDetailsBySenderForId(senderFor)
      .subscribe(sendersAndReceivers => {
        sendersAndReceivers.forEach(element => {
          let senderAndReceiver = this.mappingSendersAndReceivers(element);
          this.itemsList.push(senderAndReceiver);
        });
        this.itemsList.forEach(item => {
          item.users.forEach(user => {
            this.documentService.getDefaultImage(item.id).subscribe(
              response => {
                let myReader: FileReader = new FileReader();
                myReader.onloadend = e => {
                  user.img = this.sanitizer.bypassSecurityTrustUrl(
                    myReader.result as string
                  );
                };
                let ok = myReader.readAsDataURL(response);
              },
              error => {
                user.img = "assets/imgs/user.png";
              }
            );
          });
        });
      });
  }
  getMySendersAndReceiversByObject(object) {
    this.mydocumentsService
      .getMySendersAndreceiversDetailsByObject(object)
      .subscribe(sendersAndReceivers => {
        sendersAndReceivers.forEach(element => {
          let senderAndReceiver = this.mappingSendersAndReceivers(element);
          this.itemsList.push(senderAndReceiver);
        });
        this.itemsList.forEach(item => {
          item.users.forEach(user => {
            this.documentService.getDefaultImage(item.id).subscribe(
              response => {
                let myReader: FileReader = new FileReader();
                myReader.onloadend = e => {
                  user.img = this.sanitizer.bypassSecurityTrustUrl(
                    myReader.result as string
                  );
                };
                let ok = myReader.readAsDataURL(response);
              },
              error => {
                user.img = "assets/imgs/user.png";
              }
            );
          });
        });
      });
  }
  getAllObjects() {
    this.documentService.getAllObjects().subscribe(objects => {
      this.documentTypes.add("Tout");
      objects.forEach(this.documentTypes.add, this.documentTypes);
    });
  }
  getPersonalInfo() {
    this.accountService.getCurrentAccount().subscribe(account => {
      if (account && account.patient) {
        this.account = account.patient;
        this.linkedPatients = this.account.linkedPatients;
        this.linkedPatients.forEach(patient => {
          this.destinations.add(patient);
        });
      }
    });
  }
  filter(value) {
    this.itemsList = [];
    if (this.filterDocumentsForm.value.destination != "" && value != "Tout") {
      this.getMySendersAndReceiversBySenderForAndObject(
        this.filterDocumentsForm.value.destination,
        value
      );
    } else if (
      this.filterDocumentsForm.value.destination != "" &&
      value == "Tout"
    ) {
      this.getMySendersAndReceiversBySenderFor(
        this.filterDocumentsForm.value.destination
      );
    } else if (
      this.filterDocumentsForm.value.destination == "" &&
      value != "Tout"
    ) {
      this.getMySendersAndReceiversByObject(value);
    } else {
      this.getMySendersAndReceivers();
    }
  }
}
