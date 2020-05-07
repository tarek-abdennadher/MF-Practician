import { Component, OnInit } from "@angular/core";
import { MyPatientsService } from "../services/my-patients.service";
import { MyPatients, PatientSerch } from "./my-patients";
import { Router, ActivatedRoute } from "@angular/router";
import { GlobalService } from "@app/core/services/global.service";
import { DialogService } from "../services/dialog.service";
import { FeaturesService } from "../features.service";
import { MyDocumentsService } from "../my-documents/my-documents.service";
/**
 * AutoComplete Default Sample
 */
import { enableRipple } from "@syncfusion/ej2-base";
enableRipple(true);

import { AutoComplete } from "@syncfusion/ej2-dropdowns";
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
  section: string;
  isInvitation: Boolean = false;

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
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private featureService: FeaturesService,
    private documentService: MyDocumentsService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params["section"]) {
        switch (params["section"]) {
          case "accepted": {
            this.section = "accepted";
            this.isInvitation = false;
            this.getPatientsOfCurrentParactician();
            break;
          }
          case "pending": {
            this.section = "pending";
            this.isInvitation = true;
            this.getPendingListRealTime();
            this.markNotificationsAsSeen();
            break;
          }
          case "prohibit": {
            this.section = "prohibit";
            this.isInvitation = false;
            this.getPatientsProhibitedOfCurrentParactician();
            break;
          }
          case "archived": {
            this.section = "archived";
            this.isInvitation = false;
            this.getPatientsArchivedOfCurrentParactician();
            break;
          }
        }
      }
    });
  }

  markNotificationsAsSeen() {
    this.featureService.markReceivedNotifAsSeen().subscribe((resp) => {
      this.featureService.listNotifications = this.featureService.listNotifications.filter(
        (notif) => notif.messageId != null
      );
    });
  }
  getPatientsOfCurrentParactician() {
    this.myPatients = [];
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
            this.mappingMyPatients(elm.patient, elm.prohibited, elm.archived)
          );
        });
        this.filtredPatients = this.myPatients;
        this.retriveImg(this.myPatients);
      });
  }

  getPatientsProhibitedOfCurrentParactician() {
    this.myPatients = [];
    this.myPatientsService
      .getPatientsProhibitedOfCurrentParactician()
      .subscribe((myPatients) => {
        this.number = myPatients.length;
        this.bottomText =
          this.number > 1
            ? this.globalService.messagesDisplayScreen.patients
            : this.globalService.messagesDisplayScreen.patient;
        myPatients.forEach((elm) => {
          this.myPatients.push(
            this.mappingMyPatients(elm.patient, elm.prohibited, elm.archived)
          );
        });
        this.filtredPatients = this.myPatients;
        this.retriveImg(this.myPatients);
      });
  }

  getPatientsPendingOfCurrentParactician() {
    this.myPatients = [];
    this.myPatientsService
      .getPatientsPendingOfCurrentParactician()
      .subscribe((myPatients) => {
        this.number = myPatients.length;
        this.bottomText =
          this.number > 1
            ? this.globalService.messagesDisplayScreen.patients
            : this.globalService.messagesDisplayScreen.patient;
        myPatients.forEach((elm) => {
          this.myPatients.push(
            this.mappingMyPatients(elm.patient, elm.prohibited, elm.archived)
          );
        });
        this.filtredPatients = this.myPatients;
        this.retriveImg(this.myPatients);
      });
  }

  getPatientsArchivedOfCurrentParactician() {
    this.myPatients = [];
    this.myPatientsService
      .getPatientsArchivedOfCurrentParactician()
      .subscribe((myPatients) => {
        this.number = myPatients.length;
        this.bottomText =
          this.number > 1
            ? this.globalService.messagesDisplayScreen.patients
            : this.globalService.messagesDisplayScreen.patient;
        myPatients.forEach((elm) => {
          this.myPatients.push(
            this.mappingMyPatients(elm.patient, elm.prohibited, elm.archived)
          );
        });
        this.filtredPatients = this.myPatients;
        this.retriveImg(this.myPatients);
      });
  }

  retriveImg(list) {
    list.forEach((item) => {
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
          if (user.civility == "M") {
            user.img = "assets/imgs/avatar_homme.svg";
          } else if (user.civility == "MME") {
            user.img = "assets/imgs/avatar_femme.svg";
          } else if (user.civility == "CHILD") {
            user.img = "assets/imgs/avatar_enfant.svg";
          }
        });
      }
    });
    const myPatients = [];
    this.myPatients.forEach((p) => {
      const patient = new PatientSerch();
      patient.fullName = p.users[0].fullName;
      patient.img = p.users[0].img;
      myPatients.push(patient);
    });
    let atcObj: AutoComplete = new AutoComplete({
      dataSource: myPatients,
      fields: { value: "fullName" },
      itemTemplate:
        "<div><img src=${img} style='height:2rem'></img>" +
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

  mappingMyPatients(patient, prohibited, archived) {
    const myPatients = new MyPatients();
    myPatients.users = [];
    myPatients.users.push({
      id: patient.patientId,
      accountId: patient.id,
      fullName: patient.fullName,
      img: "assets/imgs/user.png",
      type: "PATIENT",
      civility: patient.civility,
    });
    myPatients.photoId = patient.photoId;
    myPatients.isMarkAsSeen = true;
    myPatients.isSeen = true;
    myPatients.isProhibited = prohibited;
    myPatients.isArchived = archived;
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
    this.router.navigate(["/messagerie-ecrire/"], {
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
          this.filtredPatients = this.filtredPatients.filter(
            (elm) => elm.users[0].id != item.users[0].id
          );
          this.number--;
        }
      });
  }
  editAction(item) {
    console.log("edit");
  }
  deleteAction(item) {
    this.dialogService
      .openConfirmDialog(
        this.globalService.messagesDisplayScreen.delete_confirmation_patient,
        "Suppression"
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
              this.number--;
            });
        }
      });
  }
  authorizeAction(item) {
    this.myPatientsService
      .authorizePatient(item.users[0].id)
      .subscribe((resp) => {
        if (resp == true) {
          this.filtredPatients = this.filtredPatients.filter(
            (elm) => elm.users[0].id != item.users[0].id
          );
        }
        this.number--;
      });
  }

  acceptedAction(item) {
    this.myPatientsService
      .acceptPatientInvitation(item.users[0].id)
      .subscribe((resp) => {
        if (resp == true) {
          this.filtredPatients = this.filtredPatients.filter(
            (elm) => elm.users[0].id != item.users[0].id
          );
          this.number--;
          this.featureService.setNumberOfPending(
            this.featureService.getNumberOfPendingValue() - 1
          );
          this.featureService.listNotifications = this.featureService.listNotifications.filter(
            (notif) => notif.senderId != item.users[0].accountId
          );
          this.featureService
            .markNotificationAsSeenBySenderId(item.users[0].accountId)
            .subscribe((resp) => {
              console.log("invitation accepter");
            });
        }
      });
  }

  refuseAction(item) {
    this.myPatientsService
      .declinePatientInvitation(item.users[0].id)
      .subscribe((resp) => {
        if (resp == true) {
          this.filtredPatients = this.filtredPatients.filter(
            (elm) => elm.users[0].id != item.users[0].id
          );
          this.number--;
          this.featureService.setNumberOfPending(
            this.featureService.getNumberOfPendingValue() - 1
          );
          this.featureService.listNotifications = this.featureService.listNotifications.filter(
            (notif) => notif.senderId != item.users[0].accountId
          );
        }
      });
  }

  archivedAction(item) {
    this.myPatientsService
      .archivePatient(item.users[0].id)
      .subscribe((resp) => {
        if (resp == true) {
          this.filtredPatients = this.filtredPatients.filter(
            (elm) => elm.users[0].id != item.users[0].id
          );
          this.number--;
        }
      });
  }

  activatedAction(item) {
    this.myPatientsService
      .activatePatient(item.users[0].id)
      .subscribe((resp) => {
        if (resp == true) {
          this.filtredPatients = this.filtredPatients.filter(
            (elm) => elm.users[0].id != item.users[0].id
          );
          this.number--;
        }
      });
  }

  getPendingListRealTime() {
    this.featureService.getNumberOfPendingObs().subscribe((resp) => {
      if (this.featureService.getNumberOfPendingValue() != this.number) {
        this.getPatientsPendingOfCurrentParactician();
      }
    });
  }

  cardClicked(item) {
    this.router.navigate(["/patient-detail/" + item.users[0].accountId]);
  }
}
