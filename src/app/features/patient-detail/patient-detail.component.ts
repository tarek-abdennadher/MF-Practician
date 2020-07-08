import {
  Component,
  OnInit,
  Inject,
  LOCALE_ID,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BsLocaleService } from "ngx-bootstrap/datepicker";
import { defineLocale, frLocale } from "ngx-bootstrap/chronos";
import { Subject, forkJoin } from "rxjs";
import { takeUntil, tap } from "rxjs/operators";
import { PatientFile } from "@app/shared/models/patient-file";
import { Location } from "@angular/common";
import { NoteService } from "@app/features/services/note.service";
import { NotifierService } from "angular-notifier";
import { MyPatientsService } from "../services/my-patients.service";
import { AccountService } from "../services/account.service";
import { MyDocumentsService } from "../my-documents/my-documents.service";
import { MyPatients } from "../my-patients/my-patients";
import { CategoryService } from "../services/category.service";
import { FeaturesService } from "../features.service";
import { LocalStorageService } from "ngx-webstorage";
import { GlobalService } from "@app/core/services/global.service";

@Component({
  selector: "app-patient-detail",
  templateUrl: "./patient-detail.component.html",
  styleUrls: ["./patient-detail.component.scss"],
})
export class PatientDetailComponent implements OnInit {
  @ViewChild("customNotification", { static: true }) customNotificationTmpl;
  private _destroyed$ = new Subject();
  noteimageSource: string;
  page = "MY_PRACTICIANS";
  notifMessage = "";
  links = {};
  number = null;
  topText = "Fiche Patient";
  bottomText = "";
  backButton = true;
  placement = "right";
  practicianId: number;
  patientId: number;
  patientFileId: number;
  patientFile = new Subject<PatientFile>();
  errors;
  imageSource: string | ArrayBuffer;
  practicianImage: string | ArrayBuffer;
  submitted = false;
  categoryList = new Subject<[]>();
  linkedPatients = new Subject();
  linkedPatientList = [];
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
    private route: ActivatedRoute,
    private router: Router,
    private featureService: FeaturesService,
    private accountService: AccountService,
    private localeService: BsLocaleService,
    private patientService: MyPatientsService,
    private categoryService: CategoryService,
    private _location: Location,
    private documentService: MyDocumentsService,
    private noteService: NoteService,
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
    this.route.params.subscribe((params) => {
      this.patientId = params["idAccount"];
      this.patientFileId = params["idAccount"];
    });
    forkJoin(
      this.getPatientFile(),
      this.getCategories(),
      this.getLinkedPatients()
    ).subscribe((res) => {});
  }

  getPatientFile() {
    return this.patientService
      .getPatientFileById(this.patientFileId)
      .pipe(takeUntil(this._destroyed$))
      .pipe(
        tap((patientFile) => {
          this.patientFile.next(patientFile);
          this.bottomText =
            patientFile?.firstName + " " + patientFile?.lastName;
          if (patientFile?.photoId) {
            this.documentService.downloadFile(patientFile.photoId).subscribe(
              (response) => {
                let myReader: FileReader = new FileReader();
                myReader.onloadend = (e) => {
                  this.imageSource = myReader.result;
                };
                let ok = myReader.readAsDataURL(response.body);
              },
              (error) => {
                if (patientFile?.civility == "MME") {
                  this.imageSource = this.avatars.women;
                } else {
                  this.imageSource = this.avatars.man;
                }
              }
            );
          } else {
            if (patientFile?.civility == "MME") {
              this.imageSource = this.avatars.women;
            } else {
              this.imageSource = this.avatars.man;
            }
          }
          if (patientFile?.practicianPhotoId != null) {
            this.documentService
              .downloadFile(patientFile.practicianPhotoId)
              .subscribe(
                (response) => {
                  let myReader: FileReader = new FileReader();
                  myReader.onloadend = (e) => {
                    this.practicianImage = myReader.result;
                  };
                  let ok = myReader.readAsDataURL(response.body);
                },
                (error) => {
                  this.practicianImage = this.avatars.doctor;
                }
              );
          } else {
            this.practicianImage = this.avatars.doctor;
          }
        })
      );
  }

  getLinkedPatients() {
    return this.patientService
      .getPatientsByParentId(this.patientId)
      .pipe(takeUntil(this._destroyed$))
      .pipe(
        tap((res) => {
          res.forEach((elm) => {
            this.linkedPatientList.push(this.mappingLinkedPatients(elm));
          });
          this.linkedPatients.next(this.linkedPatientList);
        })
      );
  }
  mappingLinkedPatients(patient) {
    const linkedPatients = new MyPatients();
    linkedPatients.fullInfo = patient;
    linkedPatients.users = [];
    linkedPatients.users.push({
      id: patient.id,
      fullName: patient.firstName + " " + patient.lastName,
      img: this.avatars.man,
      type: "PATIENT",
      civility: patient.civility,
    });
    linkedPatients.photoId = patient.photoId;
    linkedPatients.isSeen = true;
    linkedPatients.isViewDetail = true;
    if (linkedPatients.photoId) {
      linkedPatients.users.forEach((user) => {
        this.documentService.downloadFile(linkedPatients.photoId).subscribe(
          (response) => {
            let myReader: FileReader = new FileReader();
            myReader.onloadend = (e) => {
              user.img = myReader.result;
            };
            let ok = myReader.readAsDataURL(response.body);
          },
          (error) => {
            if (user.civility == "M") {
              user.img = this.avatars.man;
            } else if (user.civility == "MME") {
              user.img = this.avatars.women;
            } else if (user.civility == "CHILD") {
              user.img = this.avatars.child;
            }
          }
        );
      });
    } else {
      linkedPatients.users.forEach((user) => {
        if (user.civility == "M") {
          user.img = this.avatars.man;
        } else if (user.civility == "MME") {
          user.img = this.avatars.women;
        } else if (user.civility == "CHILD") {
          user.img = this.avatars.child;
        }
      });
    }
    return linkedPatients;
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
    this.patientService
      .updatePatientFile(model)
      .subscribe(this.handleResponse, this.handleError);
  }
  handleResponse = (res) => {
    if (res) {
      this.notifMessage = this.patientService.messages.edit_info_success;
      this.notifier.show({
        message: this.notifMessage,
        type: "info",
        template: this.customNotificationTmpl,
      });
      this.submitted = false;
    } else {
      this.notifMessage = this.patientService.errors.failed_update;
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
      this.notifMessage = this.patientService.errors.failed_update;
      this.notifier.show({
        message: this.notifMessage,
        type: "error",
        template: this.customNotificationTmpl,
      });
    }
  };
  submitNote(model) {
    if (model.id == null) {
      this.noteService
        .addNoteforPatientFile(model, this.patientFileId)
        .subscribe((res) => {
          if (res) {
            this.notifMessage = this.noteService.messages.add_success;
            this.notifier.show({
              message: this.notifMessage,
              type: "info",
              template: this.customNotificationTmpl,
            });
          } else {
            this.notifMessage = this.noteService.errors.failed_add;
            this.notifier.show({
              message: this.notifMessage,
              type: "error",
              template: this.customNotificationTmpl,
            });
            return;
          }
        });
    } else {
      this.noteService.updateNote(model).subscribe((res) => {
        if (res) {
          this.notifMessage = this.noteService.messages.edit_success;
          this.notifier.show({
            message: this.notifMessage,
            type: "info",
            template: this.customNotificationTmpl,
          });
        } else {
          this.notifMessage = this.noteService.errors.failed_edit;
          this.notifier.show({
            message: this.notifMessage,
            type: "error",
            template: this.customNotificationTmpl,
          });
          return;
        }
      });
    }
  }
  archieveNote(noteId) {
    this.noteService.deleteNote(noteId).subscribe((result) => {
      if (result) {
        this.notifMessage = this.noteService.messages.delete_success;
        this.notifier.show({
          message: this.notifMessage,
          type: "info",
          template: this.customNotificationTmpl,
        });
      }
    });
  }
  goBack() {
    this._location.back();
  }
  // destory any subscribe to avoid memory leak
  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
}
