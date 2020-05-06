import { Component, OnInit } from "@angular/core";
import { MyPatientsService } from "../services/my-patients.service";
import { MyPatients } from "./my-patients";
import { Router, ActivatedRoute } from "@angular/router";
import { GlobalService } from "@app/core/services/global.service";
import { DialogService } from "../services/dialog.service";
import { FeaturesService } from "../features.service";
import { MyDocumentsService } from "../my-documents/my-documents.service";

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

  pageNo = 0;
  listLength = 0;
  scroll = false;
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
      this.pageNo = 0;
      this.myPatients = [];
      this.filtredPatients = [];
      if (params["section"]) {
        switch (params["section"]) {
          case "accepted": {
            this.section = "accepted";
            this.isInvitation = false;
            for (let i = 0; i < 10; i++) {
              this.getPatientsOfCurrentParactician(this.pageNo);
            }
            break;
          }
          case "pending": {
            this.section = "pending";
            this.isInvitation = true;
            this.getPendingListRealTime(this.pageNo);
            this.markNotificationsAsSeen();
            break;
          }
          case "prohibit": {
            this.section = "prohibit";
            this.isInvitation = false;
            this.getPatientsProhibitedOfCurrentParactician(this.pageNo);
            break;
          }
          case "archived": {
            this.section = "archived";
            this.isInvitation = false;
            this.getPatientsArchivedOfCurrentParactician(this.pageNo);
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
  getPatientsOfCurrentParactician(pageNo) {
    this.myPatientsService
      .getPatientsOfCurrentParactician(pageNo)
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
      });
  }

  getPatientsProhibitedOfCurrentParactician(pageNo) {
    this.myPatientsService
      .getPatientsProhibitedOfCurrentParactician(pageNo)
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
      });
  }

  getPatientsPendingOfCurrentParactician(pageNo) {
    this.myPatientsService
      .getPatientsPendingOfCurrentParactician(pageNo)
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
      });
  }

  getPatientsArchivedOfCurrentParactician(pageNo) {
    this.myPatientsService
      .getPatientsArchivedOfCurrentParactician(pageNo)
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
      });
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
    });
    myPatients.photoId = patient.photoId;
    myPatients.isMarkAsSeen = true;
    myPatients.isSeen = true;
    myPatients.isProhibited = prohibited;
    myPatients.isArchived = archived;
    if (myPatients.photoId) {
      myPatients.users.forEach((user) => {
        this.documentService.downloadFile(myPatients.photoId).subscribe(
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
    }
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

  getPendingListRealTime(pageNo) {
    this.featureService.getNumberOfPendingObs().subscribe((resp) => {
      if (this.featureService.getNumberOfPendingValue() != this.number) {
        this.getPatientsPendingOfCurrentParactician(pageNo);
      }
    });
  }

  cardClicked(item) {
    this.router.navigate(["/patient-detail/" + item.users[0].accountId]);
  }

  onScroll() {
    if (this.listLength != this.filtredPatients.length) {
      this.listLength = this.filtredPatients.length;
      this.pageNo++;
      if (this.section) {
        switch (this.section) {
          case "accepted": {
            this.getPatientsOfCurrentParactician(this.pageNo);
            break;
          }
          case "pending": {
            this.getPendingListRealTime(this.pageNo);
            break;
          }
          case "prohibit": {
            this.getPatientsProhibitedOfCurrentParactician(this.pageNo);
            break;
          }
          case "archived": {
            this.getPatientsArchivedOfCurrentParactician(this.pageNo);
            break;
          }
        }
      }
    }
  }
}
