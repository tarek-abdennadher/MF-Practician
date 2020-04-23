import { Component, OnInit } from "@angular/core";
import { MyPatientsService } from "../services/my-patients.service";
import { MyPatients } from "./my-patients";
import { Router, ActivatedRoute } from "@angular/router";
import { GlobalService } from "@app/core/services/global.service";
import { DialogService } from "../services/dialog.service";
import { FeaturesService } from "../features.service";

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
    private featureService: FeaturesService
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
            this.mappingMyPatients(elm.patient, elm.prohibited)
          );
        });
        this.filtredPatients = this.myPatients;
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
            this.mappingMyPatients(elm.patient, elm.prohibited)
          );
        });
        this.filtredPatients = this.myPatients;
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
            this.mappingMyPatients(elm.patient, elm.prohibited)
          );
        });
        this.filtredPatients = this.myPatients;
      });
  }

  mappingMyPatients(patient, prohibited) {
    const myPatients = new MyPatients();
    myPatients.users = [];
    myPatients.users.push({
      id: patient.patientId,
      accountId: patient.id,
      fullName: patient.fullName,
      img: "assets/imgs/user.png",
      type: "PATIENT",
    });
    myPatients.isMarkAsSeen = true;
    myPatients.isSeen = true;
    myPatients.isProhibited = prohibited;
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
          this.filtredPatients = this.filtredPatients.filter((elm) => {
            elm.users[0].id != item.users[0].id;
          });
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
            });
        }
      });
  }
  authorizeAction(item) {
    this.myPatientsService
      .authorizePatient(item.users[0].id)
      .subscribe((resp) => {
        if (resp == true) {
          this.filtredPatients = this.filtredPatients.filter((elm) => {
            elm.users[0].id != item.users[0].id;
          });
        }
      });
  }

  acceptedAction(item) {
    this.myPatientsService
      .acceptPatientInvitation(item.users[0].id)
      .subscribe((resp) => {
        if (resp == true) {
          this.filtredPatients = this.filtredPatients.filter((elm) => {
            elm.users[0].id != item.users[0].id;
          });
          this.featureService.setNumberOfPending(
            this.featureService.getNumberOfPendingValue() - 1
          );
          this.featureService.listNotifications = this.featureService.listNotifications.filter(
            (notif) => {
              notif.senderId != item.users[0].accountId;
            }
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
          this.filtredPatients = this.filtredPatients.filter((elm) => {
            elm.users[0].id != item.users[0].id;
          });
          this.featureService.setNumberOfPending(
            this.featureService.getNumberOfPendingValue() - 1
          );
          this.featureService.listNotifications = this.featureService.listNotifications.filter(
            (notif) => {
              notif.senderId != item.users[0].accountId;
            }
          );
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
