import { Component, OnInit, ViewChild, Inject, LOCALE_ID } from "@angular/core";
import { Subject, forkJoin } from "rxjs";
import { PatientFile } from "@app/shared/models/patient-file";
import { NotifierService } from "angular-notifier";
import { Router } from "@angular/router";
import { FeaturesService } from "@app/features/features.service";
import { AccountService } from "@app/features/services/account.service";
import { BsLocaleService } from "ngx-bootstrap/datepicker";
import { MyPatientsService } from "@app/features/services/my-patients.service";
import { CategoryService } from "@app/features/services/category.service";

import { LocalStorageService } from "ngx-webstorage";
import { GlobalService } from "@app/core/services/global.service";
import { defineLocale, frLocale } from "ngx-bootstrap/chronos";
import { takeUntil, tap } from "rxjs/operators";
import { Location } from "@angular/common";
@Component({
  selector: "app-add-patient",
  templateUrl: "./add-patient.component.html",
  styleUrls: ["./add-patient.component.scss"],
})
export class AddPatientComponent implements OnInit {
  @ViewChild("customNotification", { static: true }) customNotificationTmpl;
  private _destroyed$ = new Subject();
  noteimageSource: string;
  page = "Fiche_Patient";
  notifMessage = "";
  links = {};
  number = null;
  topText = "Fiche Patient";
  bottomText = "";
  backButton = true;
  placement = "right";
  practicianId: number;
  patientId: number;
  patientFile = new Subject<PatientFile>();
  errors;
  imageSource: string | ArrayBuffer;
  practicianImage: string | ArrayBuffer;
  submitted = false;
  categoryList = new Subject<[]>();
  linkedPatients = new Subject();
  linkedPatientList = [];
  notes: any[] = [];
  private readonly notifier: NotifierService;
  avatars: {
    doctor: string;
    child: string;
    women: string;
    man: string;
    secretary: string;
    user: string;
  };
  constructor(
    private router: Router,
    private featureService: FeaturesService,
    private accountService: AccountService,
    private localeService: BsLocaleService,
    private patientService: MyPatientsService,
    private categoryService: CategoryService,
    private _location: Location,
    private localStorage: LocalStorageService,
    notifierService: NotifierService,
    @Inject(LOCALE_ID) public locale: string,
    private globalService: GlobalService
  ) {
    defineLocale(this.locale, frLocale);
    this.localeService.use(this.locale);
    this.errors = this.accountService.errors;
    this.notifier = notifierService;
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.man;
    this.noteimageSource = this.avatars.user;
  }

  ngOnInit(): void {
    if (this.localStorage.retrieve("role") == "PRACTICIAN") {
      this.practicianId = this.featureService.getUserId();
    } else {
      this.practicianId = this.featureService.selectedPracticianId;
    }
    forkJoin(this.getCategories()).subscribe((res) => {});
  }
  getCategories() {
    return this.categoryService
      .getCategoriesByPractician(this.practicianId)
      .pipe(takeUntil(this._destroyed$))
      .pipe(
        tap((res) => {
          this.categoryList.next(res);
        })
      );
  }
  submit(model) {
    model.practicianId = this.practicianId;
    console.log(model);
    this.patientService
      .createPatientFile(model)
      .subscribe(this.handleResponse, this.handleError);
  }
  handleResponse = (res) => {
    if (res) {
      this.notifMessage = this.patientService.messages.add_info_success;
      this.notifier.show({
        message: this.notifMessage,
        type: "info",
        template: this.customNotificationTmpl,
      });
      this.submitted = false;
      this.router.navigate(["/mes-patients"], {
        queryParams: {
          section: "accepted",
        },
      });
    } else {
      this.notifMessage = this.patientService.errors.failed_add;
      this.notifier.show({
        message: this.notifMessage,
        type: "error",
        template: this.customNotificationTmpl,
      });
      return;
    }
  };

  handleError = (err) => {
    if (err && err.error && err.error.apierror) {
      this.notifMessage = err.error.apierror.message;
      this.notifier.show({
        message: this.notifMessage,
        type: "error",
        template: this.customNotificationTmpl,
      });
    } else {
      this.notifMessage = this.patientService.errors.failed_add;
      this.notifier.show({
        message: this.notifMessage,
        type: "error",
        template: this.customNotificationTmpl,
      });
    }
  };
  submitNote(model) {}
  archieveNote(noteId) {}
  goBack() {
    this._location.back();
  }
  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
}
