import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
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
import { filter, takeUntil } from "rxjs/operators";
import { DomSanitizer, Title } from "@angular/platform-browser";
import { NewMessageWidgetService } from "../new-message-widget/new-message-widget.service";
import { Subject } from "rxjs";
import { NotifierService } from "angular-notifier";
import { Category } from "@app/shared/models/category";
declare var $: any;
@Component({
  selector: "app-my-patients",
  templateUrl: "./my-patients.component.html",
  styleUrls: ["./my-patients.component.scss"],
})
export class MyPatientsComponent implements OnInit, OnDestroy {
  @ViewChild("customNotification", { static: true }) customNotificationTmpl;
  private _destroyed$ = new Subject();
  links = { isAdd: true, isTypeFilter: false };
  addText = "Ajouter un patient";
  imageSource: string;
  myPatients = [];
  filtredPatients = [];
  isMyPatients = true;
  page = "PATIENT";
  topText = this.globalService.messagesDisplayScreen.my_patients;
  number = 0;
  pageNo = 0;
  listLength = 0;
  scroll = false;
  public searchForm: FormGroup;
  mesCategories = [];
  categs: Array<Category>;
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
  private readonly notifier: NotifierService;
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
    private sanitizer: DomSanitizer,
    private messageWidgetService: NewMessageWidgetService,
    notifierService: NotifierService,
    private title: Title
  ) {
    this.title.setTitle(this.topText);
    this.notifier = notifierService;
    this.filterPatientsForm = this.formBuilder.group({
      category: [""],
    });
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.user;
  }

  ngOnInit(): void {
    this.scroll = true;
    this.initPatients();
    this.myPatientsService.refreshPatientFileListObs
      .pipe(takeUntil(this._destroyed$))
      .subscribe((res: any) => {
        if (res) {
          this.notifier.show({
            message: res.message,
            type: res.type,
            template: this.customNotificationTmpl,
          });
        }
      });
    // update list after detail view
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url === "/mes-patients?loading=true") {
          let currentRoute = this.route;
          while (currentRoute.firstChild)
            currentRoute = currentRoute.firstChild;
          this.listLength = 0;
          this.pageNo = 0;
          this.getPatientsOfCurrentParactician(this.pageNo);
          setTimeout(() => {
            $(".selectpicker").selectpicker("refresh");
          }, 500);
        }
      });
  }
  initPatients() {
    this.getMyCategories();
    this.links.isTypeFilter = true;
    this.links.isAdd = true;
    this.featureService.setActiveChild("patient");
    this.getPatientsOfCurrentParactician(this.pageNo);
    this.searchPatients();
  }

  markNotificationsAsSeen() {
    this.featureService.markReceivedNotifAsSeen().subscribe((resp) => {
      this.featureService.listNotifications = this.featureService.listNotifications.filter(
        (notif) => notif.messageId != null
      );
    });
  }
  getPatientsOfCurrentParactician(pageNo) {
    this.myPatients = [];
    this.filtredPatients = [];
    this.myPatientsService
      .getPatientsOfCurrentParacticianV4(
        this.featureService.getUserId(),
        pageNo,
        this.direction
      )
      .pipe(takeUntil(this._destroyed$))
      .subscribe((myPatients) => {
        this.number = myPatients.length;
        myPatients.forEach((elm) => {
          this.myPatients.push(
            this.mappingMyPatients(elm, elm.prohibited, elm.archived)
          );
        });

        this.filtredPatients = this.myPatients;
        this.scroll = false;
      });
  }

  searchPatients() {
    this.featureService.getFilteredPatientsSearch().subscribe((res) => {
      if (res.length > 0) {
        this.filtredPatients= []
        this.myPatientsService
        .getPatientsOfCurrentParacticianSearch(
          this.featureService.getUserId(),
          res[0]
        )
        .pipe(takeUntil(this._destroyed$))
        .subscribe((myPatients) => {
          this.number = myPatients.length;
          myPatients.forEach((elm) => {
            this.filtredPatients.push(
              this.mappingMyPatients(elm, elm.prohibited, elm.archived)
            );
          });
          this.scroll = false;
        });
      }else{
          this.filtredPatients = this.myPatients;
          this.scroll = false;
      }
    });
  }

  getNextPagePatientsOfCurrentParactician(pageNo) {
    this.myPatientsService
      .getPatientsOfCurrentParacticianV4(
        this.featureService.getUserId(),
        pageNo,
        this.direction
      )
      .pipe(takeUntil(this._destroyed$))
      .subscribe(myPatients => {
        if (myPatients.length > 0) {
          this.number = this.number + myPatients.length;
          myPatients.forEach(elm => {
            this.myPatients.push(
              this.mappingMyPatients(elm, elm.prohibited, elm.archived)
            );
            this.filtredPatients.push(this.mappingMyPatients(elm, elm.prohibited, elm.archived));
          });
        }
      });
  }

  getPatientsOfCurrentParacticianByCategory(pageNo, categoryId) {
    let category = new Category();
    category = this.categs.find((e) => e.name == categoryId);
    if (category) {
      this.myPatientsService
        .getPatientsOfCurrentParacticianByCategory(
          pageNo,
          category.id,
          this.direction
        )
        .pipe(takeUntil(this._destroyed$))
        .subscribe((myPatients) => {
          this.number = myPatients.length;
          myPatients.forEach((elm) => {
            this.myPatients.push(
              this.mappingMyPatients(elm, elm.prohibited, elm.archived)
            );
          });
          this.filtredPatients = this.myPatients;
        });
    }
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
      civility: patient.civility,
    });
    myPatients.id = patient.id;
    myPatients.photoId = patient.photoId;
    myPatients.isMarkAsSeen = false;
    myPatients.isSeen = true;
    myPatients.isProhibited = prohibited;
    myPatients.isArchived = archived;
    myPatients.isPatientFile = patient.patient ? false : true;
    myPatients.isAddedByPatient = patient.addedByPatient;
    myPatients.users.forEach((user) => {
      this.documentService
        .getDefaultImageEntity(user.id, "PATIENT_FILE")
        .subscribe(
          (response) => {
            let myReader: FileReader = new FileReader();
            myReader.onloadend = (e) => {
              user.img = this.sanitizer.bypassSecurityTrustUrl(
                myReader.result as string
              );
            };
            let ok = myReader.readAsDataURL(response);
          },
          (error) => {
            user.img = this.avatars.user;
          }
        );
    });

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
    this.messageWidgetService.toggleObs.next(item.users[0].accountId);
  }
  prohibitAction(item) {
    this.myPatientsService
      .prohibitePatient(item.users[0].patientId)
      .pipe(takeUntil(this._destroyed$))
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
    this.cardClicked(item);
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
            .pipe(takeUntil(this._destroyed$))
            .subscribe((resp) => {
              this.filtredPatients = this.filtredPatients.filter(
                (elm) => elm.users[0].id != item.users[0].id
              );
              this.number--;
            });
        }
      });
  }

  archivedAction(item) {
    this.dialogService
      .openConfirmDialog(
        this.globalService.messagesDisplayScreen.archive_confirmation_patient,
        "Confirmation d'archivage"
      )
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.myPatientsService
            .deletePatientFile(item.users[0].id)
            .pipe(takeUntil(this._destroyed$))
            .subscribe((resp) => {
              if (resp == true) {
                this.filtredPatients = this.filtredPatients.filter(
                  (elm) => elm.users[0].id != item.users[0].id
                );
                this.number--;
              }
            });
        }
      });
  }

  cardClicked(item) {
    jQuery([document.documentElement, document.body]).animate(
      {
        scrollTop: $("#appPatientFile").offset().top - 100,
      },
      1000
    );
    this.featureService.setHistoryPatient(false);
    this.router.navigate(["fiche-patient"], {
      queryParams: {
        id: this.featureService.encrypt(item.users[0].id),
      },
      relativeTo: this.route,
    });
  }

  onScroll() {
    if (this.listLength != this.filtredPatients.length && this.featureService.searchPatientsFiltered.getValue().length == 0) {
      this.listLength = this.filtredPatients.length;
      this.pageNo++;
      this.getNextPagePatientsOfCurrentParactician(this.pageNo);
    }
  }

  getMyCategories() {
    this.categoryService.getMyCategories().subscribe((categories) => {
      this.categs = categories;
      this.mesCategories = categories;
      this.mesCategories = this.mesCategories.map((s) => s.name);
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
    jQuery([document.documentElement, document.body]).animate(
      {
        scrollTop: $("#appPatientFile").offset().top - 100,
      },
      1000
    );
    this.router.navigate(["ajout-patient"], { relativeTo: this.route });
  }
  ngOnDestroy(): void {
    this._destroyed$.next(true);
    this._destroyed$.unsubscribe();
  }
}
