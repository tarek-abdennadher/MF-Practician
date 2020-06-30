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
import { FormGroup, FormBuilder } from '@angular/forms';
import { AccountService } from '../services/account.service';
import { FeaturesService } from '../features.service';
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
  imageSource : string;
  search: string;
  avatars: { doctor: string; child: string; women: string; man: string; secretary: string; user: string; tls: string; };

  public filterDocumentsForm: FormGroup;

  destinations = new Set();
  documentTypes = new Set();

  account: any;
  linkedPatients: any;
  constructor(
    private mydocumentsService: MyDocumentsService,
    private globalService: GlobalService,
    private _location: Location,
    public router: Router,
    private documentService: MyDocumentsService,
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private featureService : FeaturesService
  ) {
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.user;
    this.filterDocumentsForm = this.formBuilder.group({
      documentType: [""],
      destination: [""],
    });
  }

  ngOnInit(): void {
    this.featureService.setActiveChild("document");
    this.getMySendersAndReceivers();
    this.getAllObjects();
    this.getPersonalInfo();
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
                  user.img = this.avatars.user;
                }
              );
            });
          } else {
            item.users.forEach((user) => {
              if (user.type == "MEDICAL") {
                user.img = this.avatars.doctor;
              } else if (user.type == "SECRETARY") {
                user.img = this.avatars.secretary;
              }else if (user.type == "TELESECRETARYGROUP") {
                user.img = this.avatars.tls;
              } else if (user.type == "PATIENT") {
                if (user.civility == "M") {
                  user.img = this.avatars.man;
                } else if (user.civility == "MME") {
                  user.img = this.avatars.women;
                } else if (user.civility == "CHILD") {
                  user.img = this.avatars.child;
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
      case "TELESECRETARYGROUP":
        return senderDetail.telesecretaryGroup;
      default:
        return null;
    }
  }

  displaySendAction() {
    this.router.navigate(["/messagerie-ecrire"]);
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
        civility: senderAndReceiver.role ? detail.civility : null,
      },
    ];
    practician.object = {
      name: detail.address?detail.address:"",
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
    this.router.navigate(["/mes-documents/list/" + item.id],{
      queryParams: {
        type: this.filterDocumentsForm.value.documentType
      },
    });
  }

  searchAction() {
    if (this.filtredItemsList.length < this.itemsList.length) {
      this.filtredItemsList = this.itemsList;
    }
    this.itemsList = this.filtredItemsList;
    this.itemsList = this.itemsList.filter((item) =>
      item.users[0].fullName
        .toLowerCase()
        .includes((<HTMLInputElement>document.getElementById("patients")).value)
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
            user.img = this.avatars.user;
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
      noRecordsTemplate: "Aucune données trouvé",
      sortOrder: "Ascending",
    });
    atcObj.appendTo("#patients");
    atcObj.showSpinner();
  }
  getMySendersAndReceiversBySenderForAndObject(senderFor,object){
    this.mydocumentsService
      .getMySendersAndreceiversDetailsBySenderForIdAndObject(senderFor,object)
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
                user.img = this.avatars.doctor;
              } else if (user.type == "SECRETARY") {
                user.img = this.avatars.secretary;
              }else if (user.type == "TELESECRETARYGROUP") {
                user.img = this.avatars.tls;
              } else if (user.type == "PATIENT") {
                if (user.civility == "M") {
                  user.img = this.avatars.man;
                } else if (user.civility == "MME") {
                  user.img = this.avatars.women;
                } else if (user.civility == "CHILD") {
                  user.img = this.avatars.child;
                }
              }
            });
          }
        });
      });
  }
  getMySendersAndReceiversBySenderFor(senderFor){
    this.mydocumentsService
    .getMySendersAndreceiversDetailsBySenderForId(senderFor)
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
              user.img = this.avatars.doctor;
            } else if (user.type == "SECRETARY") {
              user.img = this.avatars.secretary;
            }else if (user.type == "TELESECRETARYGROUP") {
              user.img = this.avatars.tls;
            } else if (user.type == "PATIENT") {
              if (user.civility == "M") {
                user.img = this.avatars.man;
              } else if (user.civility == "MME") {
                user.img = this.avatars.women;
              } else if (user.civility == "CHILD") {
                user.img = this.avatars.child;
              }
            }
          });
        }
      });
    });
  }
  getMySendersAndReceiversByObject(object){
    this.mydocumentsService
    .getMySendersAndreceiversDetailsByObject(object)
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
              user.img = this.avatars.doctor;
            } else if (user.type == "SECRETARY") {
              user.img = this.avatars.secretary;
            }else if (user.type == "TELESECRETARYGROUP") {
              user.img = this.avatars.tls;
            } else if (user.type == "PATIENT") {
              if (user.civility == "M") {
                user.img = this.avatars.man;
              } else if (user.civility == "MME") {
                user.img = this.avatars.women;
              } else if (user.civility == "CHILD") {
                user.img = this.avatars.child;
              }
            }
          });
        }
      });
    });
  }
  getAllObjects(){
    this.documentService.getAllObjects().subscribe(objects => {
      this.documentTypes = objects;
    })
  }
  getPersonalInfo() {
    this.accountService.getCurrentAccount().subscribe((account) => {
      if (account && account.patient) {
        this.account = account.patient;
        this.linkedPatients = this.account.linkedPatients;
        this.linkedPatients.forEach((patient) => {
          this.destinations.add(patient);
        });
      }
    });
  }
  filter() {
    this.itemsList = [];
    if (
      this.filterDocumentsForm.value.destination != "" &&
      this.filterDocumentsForm.value.documentType != ""
    ) {
      this.getMySendersAndReceiversBySenderForAndObject(
        this.filterDocumentsForm.value.destination,
        this.filterDocumentsForm.value.documentType
      );
    } else if (
      this.filterDocumentsForm.value.destination != "" &&
      this.filterDocumentsForm.value.documentType == ""
    ) {
      this.getMySendersAndReceiversBySenderFor(
        this.filterDocumentsForm.value.destination
      );
    } else if (
      this.filterDocumentsForm.value.destination == "" &&
      this.filterDocumentsForm.value.documentType != ""
    ) {
      this.getMySendersAndReceiversByObject(
        this.filterDocumentsForm.value.documentType
      );
    } else {
      this.getMySendersAndReceivers();
    }
  }
}
