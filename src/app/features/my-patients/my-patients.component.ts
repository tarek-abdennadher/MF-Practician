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
import { FormGroup, FormBuilder } from "@angular/forms";
import { CategoryService } from "../services/category.service";
import { OrderDirection } from "@app/shared/enmus/order-direction";
@Component({
  selector: "app-my-patients",
  templateUrl: "./my-patients.component.html",
  styleUrls: ["./my-patients.component.scss"],
})
export class MyPatientsComponent implements OnInit {
  links = {};
  imageSource: string;
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

  pageNo = 0;
  listLength = 0;
  scroll = false;
  public searchForm: FormGroup;
  atcObj: AutoComplete = new AutoComplete();
  mesCategories = [];
  public filterPatientsForm: FormGroup;
  avatars: {
    doctor: string;
    child: string;
    women: string;
    man: string;
    secretary: string;
    user: string;
  };
  direction: OrderDirection = OrderDirection.DESC;

  constructor(
    private globalService: GlobalService,
    private myPatientsService: MyPatientsService,
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private featureService: FeaturesService,
    private documentService: MyDocumentsService,
    private formBuilder: FormBuilder,
    private featuresService: FeaturesService,
    private categoryService: CategoryService
  ) {
    this.filterPatientsForm = this.formBuilder.group({
      category: [""],
    });
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.user;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.pageNo = 0;
      this.myPatients = [];
      this.filtredPatients = [];
      this.getMyCategories();
      if (params["section"]) {
        switch (params["section"]) {
          case "accepted": {
            this.section = "accepted";
            this.featureService.setActiveChild("patient");
            this.isInvitation = false;
            this.getPatientsOfCurrentParactician(this.pageNo);
            this.searchPatients()
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
    this.featureService.setIsMessaging(false);
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
      .getPatientsOfCurrentParacticianV2(
        this.featureService.getUserId(),
        pageNo,
        this.direction
      )
      .subscribe((myPatients) => {
        this.number = myPatients.length;
        this.bottomText =
          this.number > 1
            ? this.globalService.messagesDisplayScreen.patients
            : this.globalService.messagesDisplayScreen.patient;
        myPatients.forEach((elm) => {
          this.myPatients.push(
            this.mappingMyPatients(elm, elm.prohibited, elm.archived)
          );
        });
        this.filtredPatients = this.myPatients;
      });
  }
  searchPatients() {
    this.featureService.getFilteredPatientsSearch().subscribe(res => {
      if (res == null) {
        this.filtredPatients = [];
      } else if (res?.length > 0) {
        let patients = [];
        res.forEach((elm) => {
          patients.push(
            this.mappingMyPatients(elm, elm.prohibited, elm.archived)
          );
        });
        this.filtredPatients = patients;
      } else {
        this.filtredPatients = this.myPatients;
      }
    })
  }
  getNextPagePatientsOfCurrentParactician(pageNo) {
    this.myPatientsService
      .getPatientsOfCurrentParacticianV2(
        this.featureService.getUserId(),
        pageNo,
        this.direction
      )
      .subscribe((myPatients) => {
        if (myPatients.length > 0) {
          this.number = this.number + myPatients.length;
          myPatients.forEach((elm) => {
            this.myPatients.push(
              this.mappingMyPatients(elm, elm.prohibited, elm.archived)
            );
          });
        }
      });
  }

  getPatientsOfCurrentParacticianByCategory(pageNo, categoryId) {
    this.myPatientsService
      .getPatientsOfCurrentParacticianByCategory(
        pageNo,
        categoryId,
        this.direction
      )
      .subscribe((myPatients) => {
        this.number = myPatients.length;
        this.bottomText =
          this.number > 1
            ? this.globalService.messagesDisplayScreen.patients
            : this.globalService.messagesDisplayScreen.patient;
        myPatients.forEach((elm) => {
          this.myPatients.push(
            this.mappingMyPatients(elm, elm.prohibited, elm.archived)
          );
        });
        this.filtredPatients = this.myPatients;
      });
  }

  getPatientsProhibitedOfCurrentParactician(pageNo) {
    this.myPatientsService
      .getPatientsProhibitedOfCurrentParactician(pageNo, this.direction)
      .subscribe((myPatients) => {
        this.number = myPatients.length;
        this.bottomText =
          this.number > 1
            ? this.globalService.messagesDisplayScreen.patients
            : this.globalService.messagesDisplayScreen.patient;
        myPatients.forEach((elm) => {
          this.myPatients.push(
            this.mappingMyPatients(elm, elm.prohibited, elm.archived)
          );
        });
        this.filtredPatients = this.myPatients;
      });
  }

  getNextPatientsProhibitedOfCurrentParactician(pageNo) {
    this.myPatientsService
      .getPatientsProhibitedOfCurrentParactician(pageNo, this.direction)
      .subscribe((myPatients) => {
        if (myPatients.length > 0) {
          this.number = this.number + myPatients.length;
          myPatients.forEach((elm) => {
            this.myPatients.push(
              this.mappingMyPatients(elm, elm.prohibited, elm.archived)
            );
          });
        }
      });
  }

  getPatientsPendingOfCurrentParactician(pageNo) {
    this.myPatientsService
      .getPendingInvitations(pageNo, this.direction)
      .subscribe((myPatients) => {
        this.number = myPatients.length;
        this.bottomText =
          this.number > 1
            ? this.globalService.messagesDisplayScreen.patients
            : this.globalService.messagesDisplayScreen.patient;
        this.myPatients = [];
        myPatients.forEach((elm) => {
          this.myPatients.push(
            this.mappingMyPatients(elm, elm.prohibited, elm.archived)
          );
        });
        this.filtredPatients = this.myPatients;
      });
  }

  getNextPatientsPendingOfCurrentParactician(pageNo) {
    this.myPatientsService
      .getPendingInvitations(pageNo, this.direction)
      .subscribe((myPatients) => {
        if (myPatients.length > 0) {
          this.number = this.number + myPatients.length;
          myPatients.forEach((elm) => {
            this.myPatients.push(
              this.mappingMyPatients(elm, elm.prohibited, elm.archived)
            );
          });
        }
      });
  }

  getPatientsArchivedOfCurrentParactician(pageNo) {
    this.myPatientsService
      .getPatientsArchivedOfCurrentParactician(pageNo, this.direction)
      .subscribe((myPatients) => {
        this.number = myPatients.length;
        this.bottomText =
          this.number > 1
            ? this.globalService.messagesDisplayScreen.patients
            : this.globalService.messagesDisplayScreen.patient;
        myPatients.forEach((elm) => {
          this.myPatients.push(
            this.mappingMyPatients(elm, elm.prohibited, elm.archived)
          );
        });
        this.filtredPatients = this.myPatients;
      });
  }

  getNextPatientsArchivedOfCurrentParactician(pageNo) {
    this.myPatientsService
      .getPatientsArchivedOfCurrentParactician(pageNo, this.direction)
      .subscribe((myPatients) => {
        if (myPatients.length > 0) {
          this.number = this.number + myPatients.length;
          myPatients.forEach((elm) => {
            this.myPatients.push(
              this.mappingMyPatients(elm, elm.prohibited, elm.archived)
            );
          });
        }
      });
  }

  mappingMyPatients(patient, prohibited, archived) {
    const myPatients = new MyPatients();
    myPatients.users = [];
    myPatients.users.push({
      id: patient.id,
      accountId: patient.patient ? patient.patient.accountId : null,
      patientId: patient.patient ? patient.patient.id : null,
      fullName: patient.fullName,
      img: this.avatars.user,
      type: "PATIENT",
      civility: patient.civility,
    });
    myPatients.photoId = patient.photoId;
    myPatients.isMarkAsSeen = patient.patient ? true : false;
    myPatients.isSeen = true;
    myPatients.isProhibited = prohibited;
    myPatients.isArchived = archived;
    myPatients.isPatientFile = patient.patient ? false : true;
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
            user.img = this.avatars.user;
          }
        );
      });
    } else {
      myPatients.users.forEach((user) => {
        if (user.civility == "M") {
          user.img = this.avatars.man;
        } else if (user.civility == "MME") {
          user.img = this.avatars.women;
        } else if (user.civility == "CHILD") {
          user.img = this.avatars.child;
        }
      });
    }
    return myPatients;
  }

  performFilter(filterBy) {
    filterBy = filterBy.toLowerCase();
    return this.myPatients.filter(
      (patient) =>
        patient.users[0].fullName.toLowerCase().indexOf(filterBy) !== -1
    );
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
      .prohibitePatient(item.users[0].patientId)
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
    this.router.navigate(["/fiche-patient/" + item.users[0].id]);
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
      .authorizePatient(item.users[0].patientId)
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
      .acceptPatientInvitation(item.users[0].patientId)
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
            .subscribe((resp) => { });
        }
      });
  }
  refuseAction(item) {
    this.myPatientsService
      .prohibitePatient(item.users[0].patientId)
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
      .archivePatient(item.users[0].patientId)
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
      .activatePatient(item.users[0].patientId)
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
    this.number = 0;
    this.bottomText = this.globalService.messagesDisplayScreen.patient;
    this.featureService.getNumberOfPendingObs().subscribe((resp) => {
      if (
        this.featureService.getNumberOfPendingValue() != this.myPatients.length
      ) {
        this.getPatientsPendingOfCurrentParactician(pageNo);
      }
    });
  }

  cardClicked(item) {
    this.router.navigate(["/fiche-patient/" + item.users[0].id]);
  }

  onScroll() {
    if (this.listLength != this.filtredPatients.length) {
      this.listLength = this.filtredPatients.length;
      this.pageNo++;
      if (this.section) {
        switch (this.section) {
          case "accepted": {
            this.getNextPagePatientsOfCurrentParactician(this.pageNo);
            break;
          }
          case "pending": {
            this.getNextPatientsPendingOfCurrentParactician(this.pageNo);
            break;
          }
          case "prohibit": {
            this.getNextPatientsProhibitedOfCurrentParactician(this.pageNo);
            break;
          }
          case "archived": {
            this.getNextPatientsArchivedOfCurrentParactician(this.pageNo);
            break;
          }
        }
      }
    }
  }
  getMyCategories() {
    this.categoryService.getMyCategories().subscribe((categories) => {
      this.mesCategories = categories;
    });
  }

  filter() {
    this.pageNo = 0;
    this.filtredPatients = [];
    this.myPatients = [];
    console.log(this.filterPatientsForm.value.category);
    if (this.filterPatientsForm.value.category != "") {
      this.getPatientsOfCurrentParacticianByCategory(
        this.pageNo,
        this.filterPatientsForm.value.category
      );
    } else {
      this.getPatientsOfCurrentParactician(this.pageNo);
    }
  }

  upSortClicked() {
    this.direction = OrderDirection.ASC;
    this.resetList();
  }

  downSortClicked() {
    this.direction = OrderDirection.DESC;
    this.resetList();
  }

  resetList() {
    this.pageNo = 0;
    this.filter();
  }
}
