import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { OrderDirection } from "@app/shared/enmus/order-direction";
import { GlobalService } from "@app/core/services/global.service";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { MyPatientsService } from "../services/my-patients.service";
import { DialogService } from "../services/dialog.service";
import { FeaturesService } from "../features.service";
import { MyDocumentsService } from "../my-documents/my-documents.service";
import { CategoryService } from "../services/category.service";
import { MyPatients } from "@app/shared/models/my-patients";
import { filter } from "rxjs/operators";
import { DomSanitizer } from "@angular/platform-browser";
@Component({
  selector: "app-my-patients",
  templateUrl: "./my-patients.component.html",
  styleUrls: ["./my-patients.component.scss"]
})
export class MyPatientsComponent implements OnInit {
  links = { isAdd: true, isTypeFilter: false };
  addText = "Ajouter un patient";
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
  mesCategories = [];
  categs = [];
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
    private categoryService: CategoryService,
    private sanitizer: DomSanitizer
  ) {
    this.filterPatientsForm = this.formBuilder.group({
      category: [""]
    });
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.user;
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.pageNo = 0;
      this.myPatients = [];
      this.filtredPatients = [];
      this.getMyCategories();
      if (params["section"]) {
        switch (params["section"]) {
          case "accepted": {
            this.initPatients();
            break;
          }
          case "pending": {
            this.initPendingPatients();
            break;
          }
          case "prohibit": {
            this.initProhibitedPatients();
            break;
          }
          case "archived": {
            this.initArchivedPatients();
            break;
          }
        }
      }
    });
    // update categories after detail view
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        let currentRoute = this.route;
        while (currentRoute.firstChild) currentRoute = currentRoute.firstChild;
        switch (this.section) {
          case "accepted": {
            this.initPatients();
            break;
          }
          case "pending": {
            this.initPendingPatients();
            break;
          }
          case "prohibit": {
            this.initProhibitedPatients();
            break;
          }
          case "archived": {
            this.initArchivedPatients();
            break;
          }
        }
      });
  }
  initPatients() {
    this.links.isTypeFilter = true;
    this.links.isAdd = true;
    this.section = "accepted";
    this.featureService.setActiveChild("patient");
    this.isInvitation = false;
    this.getPatientsOfCurrentParactician(this.pageNo);
    this.searchPatients();
  }
  initPendingPatients() {
    this.links.isTypeFilter = false;
    this.links.isAdd = false;
    this.section = "pending";
    this.isInvitation = true;
    this.featureService.setActiveChild(null);
    this.getPendingListRealTime(this.pageNo);
    this.markNotificationsAsSeen();
  }
  initProhibitedPatients() {
    this.links.isTypeFilter = false;
    this.links.isAdd = false;
    this.section = "prohibit";
    this.featureService.setActiveChild(null);
    this.isInvitation = false;
    this.getPatientsProhibitedOfCurrentParactician(this.pageNo);
  }
  initArchivedPatients() {
    this.links.isTypeFilter = false;
    this.links.isAdd = false;
    this.section = "archived";
    this.featureService.setActiveChild(null);
    this.isInvitation = false;
    this.getPatientsArchivedOfCurrentParactician(this.pageNo);
  }

  markNotificationsAsSeen() {
    this.featureService.markReceivedNotifAsSeen().subscribe(resp => {
      this.featureService.listNotifications = this.featureService.listNotifications.filter(
        notif => notif.messageId != null
      );
    });
  }
  getPatientsOfCurrentParactician(pageNo) {
    this.myPatients = [];
    this.filtredPatients = [];
    this.myPatientsService
      .getPatientsOfCurrentParacticianV2(
        this.featureService.getUserId(),
        pageNo,
        this.direction
      )
      .subscribe(myPatients => {
        this.number = myPatients.length;
        this.bottomText =
          this.number > 1
            ? this.globalService.messagesDisplayScreen.patients
            : this.globalService.messagesDisplayScreen.patient;
        myPatients.forEach(elm => {
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
        this.number = this.filtredPatients.length;
        this.bottomText =
          this.number > 1
            ? this.globalService.messagesDisplayScreen.patients
            : this.globalService.messagesDisplayScreen.patient;
      } else if (res?.length > 0) {
        let patients = [];
        res.forEach(elm => {
          patients.push(
            this.mappingMyPatients(elm, elm.prohibited, elm.archived)
          );
        });
        this.filtredPatients = patients;
        this.number = this.filtredPatients.length;
        this.bottomText =
          this.number > 1
            ? this.globalService.messagesDisplayScreen.patients
            : this.globalService.messagesDisplayScreen.patient;
      } else {
        this.filtredPatients = this.myPatients;
        this.number = this.filtredPatients.length;
        this.bottomText =
          this.number > 1
            ? this.globalService.messagesDisplayScreen.patients
            : this.globalService.messagesDisplayScreen.patient;
      }
    });
  }
  getNextPagePatientsOfCurrentParactician(pageNo) {
    this.myPatientsService
      .getPatientsOfCurrentParacticianV2(
        this.featureService.getUserId(),
        pageNo,
        this.direction
      )
      .subscribe(myPatients => {
        if (myPatients.length > 0) {
          this.number = this.number + myPatients.length;
          myPatients.forEach(elm => {
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
        this.categs.find(e => e.name == categoryId).id,
        this.direction
      )
      .subscribe(myPatients => {
        this.number = myPatients.length;
        this.bottomText =
          this.number > 1
            ? this.globalService.messagesDisplayScreen.patients
            : this.globalService.messagesDisplayScreen.patient;
        myPatients.forEach(elm => {
          this.myPatients.push(
            this.mappingMyPatients(elm, elm.prohibited, elm.archived)
          );
        });
        this.filtredPatients = this.myPatients;
      });
  }

  getPatientsProhibitedOfCurrentParactician(pageNo) {
    this.myPatients = [];
    this.filtredPatients = [];
    this.myPatientsService
      .getPatientsProhibitedOfCurrentParactician(pageNo, this.direction)
      .subscribe(myPatients => {
        this.number = myPatients.length;
        this.bottomText =
          this.number > 1
            ? this.globalService.messagesDisplayScreen.patients
            : this.globalService.messagesDisplayScreen.patient;
        myPatients.forEach(elm => {
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
      .subscribe(myPatients => {
        if (myPatients.length > 0) {
          this.number = this.number + myPatients.length;
          myPatients.forEach(elm => {
            this.myPatients.push(
              this.mappingMyPatients(elm, elm.prohibited, elm.archived)
            );
          });
        }
      });
  }

  getPatientsPendingOfCurrentParactician(pageNo) {
    this.myPatients = [];
    this.filtredPatients = [];
    this.myPatientsService
      .getPendingInvitations(pageNo, this.direction)
      .subscribe(myPatients => {
        this.number = myPatients.length;
        this.bottomText =
          this.number > 1
            ? this.globalService.messagesDisplayScreen.patients
            : this.globalService.messagesDisplayScreen.patient;
        this.myPatients = [];
        myPatients.forEach(elm => {
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
      .subscribe(myPatients => {
        if (myPatients.length > 0) {
          this.number = this.number + myPatients.length;
          myPatients.forEach(elm => {
            this.myPatients.push(
              this.mappingMyPatients(elm, elm.prohibited, elm.archived)
            );
          });
        }
      });
  }

  getPatientsArchivedOfCurrentParactician(pageNo) {
    this.myPatients = [];
    this.filtredPatients = [];
    this.myPatientsService
      .getPatientFilesArchived(pageNo, this.direction)
      .subscribe(myPatients => {
        this.number = myPatients.length;
        this.bottomText =
          this.number > 1
            ? this.globalService.messagesDisplayScreen.patients
            : this.globalService.messagesDisplayScreen.patient;
        myPatients.forEach(elm => {
          this.myPatients.push(this.mappingMyPatients(elm, false, true));
        });
        this.filtredPatients = this.myPatients;
      });
  }

  getNextPatientsArchivedOfCurrentParactician(pageNo) {
    this.myPatientsService
      .getPatientFilesArchived(pageNo, this.direction)
      .subscribe(myPatients => {
        if (myPatients.length > 0) {
          this.number = this.number + myPatients.length;
          myPatients.forEach(elm => {
            this.myPatients.push(this.mappingMyPatients(elm, false, true));
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
      civility: patient.civility
    });
    myPatients.id = patient.id;
    myPatients.photoId = patient.photoId;
    myPatients.isMarkAsSeen = false;
    myPatients.isSeen = true;
    myPatients.isProhibited = prohibited;
    myPatients.isArchived = archived;
    myPatients.isPatientFile = patient.patient ? false : true;
    myPatients.users.forEach(user => {
      this.documentService
        .getDefaultImageEntity(user.id, "PATIENT_FILE")
        .subscribe(
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
            user.img = this.avatars.user;
          }
        );
    });

    return myPatients;
  }

  performFilter(filterBy) {
    filterBy = filterBy.toLowerCase();
    return this.myPatients.filter(
      patient =>
        patient.users[0].fullName.toLowerCase().indexOf(filterBy) !== -1
    );
  }

  writeAction(item) {
    this.router.navigate(["/messagerie-ecrire/"], {
      queryParams: {
        id: item.users[0].accountId
      }
    });
  }
  prohibitAction(item) {
    this.myPatientsService
      .prohibitePatient(item.users[0].patientId)
      .subscribe(resp => {
        if (resp == true) {
          this.filtredPatients = this.filtredPatients.filter(
            elm => elm.users[0].id != item.users[0].id
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
      .subscribe(res => {
        if (res) {
          this.myPatientsService
            .deletePatientFromMyPatients(item.users[0].id)
            .subscribe(resp => {
              this.filtredPatients = this.filtredPatients.filter(
                elm => elm.users[0].id != item.users[0].id
              );
              this.number--;
            });
        }
      });
  }
  authorizeAction(item) {
    this.myPatientsService
      .authorizePatient(item.users[0].patientId)
      .subscribe(resp => {
        if (resp == true) {
          this.filtredPatients = this.filtredPatients.filter(
            elm => elm.users[0].id != item.users[0].id
          );
        }
        this.number--;
      });
  }

  acceptedAction(item) {
    this.myPatientsService
      .acceptPatientInvitation(item.users[0].patientId)
      .subscribe(resp => {
        if (resp == true) {
          this.filtredPatients = this.filtredPatients.filter(
            elm => elm.users[0].id != item.users[0].id
          );
          this.number--;
          this.featureService.setNumberOfPending(
            this.featureService.getNumberOfPendingValue() - 1
          );
          this.featureService.listNotifications = this.featureService.listNotifications.filter(
            notif => notif.senderId != item.users[0].accountId
          );
          this.featureService
            .markNotificationAsSeenBySenderId(item.users[0].accountId)
            .subscribe(resp => {});
        }
      });
  }
  refuseAction(item) {
    this.myPatientsService
      .prohibitePatient(item.users[0].patientId)
      .subscribe(resp => {
        if (resp == true) {
          this.filtredPatients = this.filtredPatients.filter(
            elm => elm.users[0].id != item.users[0].id
          );
          this.number--;
          this.featureService.setNumberOfPending(
            this.featureService.getNumberOfPendingValue() - 1
          );
          this.featureService.listNotifications = this.featureService.listNotifications.filter(
            notif => notif.senderId != item.users[0].accountId
          );
        }
      });
  }

  archivedAction(item) {
    this.dialogService
      .openConfirmDialog(
        "Etes vous sur de bien vouloir archiver ce patient",
        "Confirmation d'archivage"
      )
      .afterClosed()
      .subscribe(res => {
        if (res) {
          this.myPatientsService
            .deletePatientFile(item.users[0].id)
            .subscribe(resp => {
              if (resp == true) {
                this.filtredPatients = this.filtredPatients.filter(
                  elm => elm.users[0].id != item.users[0].id
                );
                this.number--;
              }
            });
        }
      });
  }

  activatedAction(item) {
    this.myPatientsService
      .activatePatientFile(item.users[0].id)
      .subscribe(resp => {
        if (resp == true) {
          this.filtredPatients = this.filtredPatients.filter(
            elm => elm.users[0].id != item.users[0].id
          );
          this.number--;
        }
      });
  }

  getPendingListRealTime(pageNo) {
    this.number = 0;
    this.bottomText = this.globalService.messagesDisplayScreen.patient;
    this.featureService.getNumberOfPendingObs().subscribe(resp => {
      if (
        this.featureService.getNumberOfPendingValue() != this.myPatients.length
      ) {
        this.getPatientsPendingOfCurrentParactician(pageNo);
      }
    });
  }

  cardClicked(item) {
    this.router.navigate(["fiche-patient"], {
      queryParams: {
        id: item.users[0].id
      },
      relativeTo: this.route
    });
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
    this.categoryService.getMyCategories().subscribe(categories => {
      this.categs = categories;
      this.mesCategories = categories;
      this.mesCategories = this.mesCategories.map(s => s.name);
      this.mesCategories.unshift("Tout");
    });
  }
  listFilter(value: string) {
    this.pageNo = 0;
    this.filtredPatients = [];
    this.myPatients = [];
    if (value != "Tout") {
      this.getPatientsOfCurrentParacticianByCategory(this.pageNo, value);
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
    this.listFilter("Tout");
  }
  addPatient() {
    this.router.navigate(["ajout-patient"], { relativeTo: this.route });
  }
}
