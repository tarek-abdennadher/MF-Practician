import { Component, OnInit, ViewChild, Inject, LOCALE_ID } from "@angular/core";
import { Subject, forkJoin, BehaviorSubject } from "rxjs";
import { PatientFile } from "@app/shared/models/patient-file";
import { NotifierService } from "angular-notifier";
import { ActivatedRoute, Router } from "@angular/router";
import { FeaturesService } from "@app/features/features.service";
import { AccountService } from "@app/features/services/account.service";
import { BsLocaleService } from "ngx-bootstrap/datepicker";
import { MyPatientsService } from "@app/features/services/my-patients.service";
import { CategoryService } from "@app/features/services/category.service";
import { MyDocumentsService } from "@app/features/my-documents/my-documents.service";
import { NoteService } from "@app/features/services/note.service";
import { LocalStorageService } from "ngx-webstorage";
import { MessagingListService } from "@app/features/services/messaging-list.service";
import { GlobalService } from "@app/core/services/global.service";
import { defineLocale, frLocale } from "ngx-bootstrap/chronos";
import { takeUntil, tap } from "rxjs/operators";
import { MyPatients } from "@app/shared/models/my-patients";
import { PatientFileComponent } from "@app/shared/components/patient-file/patient-file.component";

@Component({
  selector: "app-patient-detail",
  templateUrl: "./patient-detail.component.html",
  styleUrls: ["./patient-detail.component.scss"]
})
export class PatientDetailComponent implements OnInit {
  @ViewChild("customNotification", { static: true }) customNotificationTmpl;
  private _destroyed$ = new Subject();
  noteimageSource: string;
  notifMessage = "";
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
  notes = new BehaviorSubject([]);
  notesList = [];
  userRole: string;
  isPatientFile = false;
  private readonly notifier: NotifierService;
  avatars: {
    doctor: string;
    child: string;
    women: string;
    man: string;
    secretary: string;
    user: string;
    tls: string;
  };
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private featureService: FeaturesService,
    private accountService: AccountService,
    private localeService: BsLocaleService,
    private patientService: MyPatientsService,
    private categoryService: CategoryService,
    private documentService: MyDocumentsService,
    private noteService: NoteService,
    private localStorage: LocalStorageService,
    notifierService: NotifierService,
    @Inject(LOCALE_ID) public locale: string,
    private messagesServ: MessagingListService,
    private globalService: GlobalService
  ) {
    defineLocale(this.locale, frLocale);
    this.localeService.use(this.locale);
    this.errors = this.accountService.errors;
    this.notifier = notifierService;
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.man;
    this.noteimageSource = this.avatars.user;
    this.linkedPatientList = [];
    this.notesList = [];
  }

  ngOnInit(): void {
    if (this.localStorage.retrieve("role") == "PRACTICIAN") {
      this.userRole = "PRACTICIAN";
      this.practicianId = this.featureService.getUserId();
    } else {
      this.userRole = "SECRETARY";
      this.practicianId = this.featureService.selectedPracticianId;
    }
    this.route.queryParams.subscribe(params => {
      this.patientFileId = params["id"];
      forkJoin(
        this.getPatientFile(),
        this.getCategories()
      ).subscribe(res => {});
      setTimeout(() => {
        this.featureService.setIsMessaging(false);
      });
    });
  }

  getPatientFile() {
    this.notesList = [];
    return this.patientService
      .getPatientFileById(this.patientFileId)
      .pipe(takeUntil(this._destroyed$))
      .pipe(
        tap(patientFile => {
          this.patientFile.next(patientFile);
          if (patientFile.notes && patientFile.notes.length > 0) {
            patientFile.notes.forEach(elm => {
              this.notesList.push(this.mappingNote(elm));
            });
          }
          this.notes.next(this.notesList);
          if (patientFile.patientId) {
            this.patientId = patientFile.patientId;
            this.isPatientFile = true;
            this.patientService
              .getPatientsByParentId(patientFile.patientId)
              .pipe(takeUntil(this._destroyed$))
              .subscribe(res => {
                res.forEach(elm => {
                  this.linkedPatientList = [];
                  this.linkedPatientList.push(this.mappingLinkedPatients(elm));
                });
                this.linkedPatients.next(this.linkedPatientList);
              });
          }
        })
      );
  }
  mappingNote(note) {
    return {
      id: note.id,
      users: [
        {
          fullName:
            note.value.length < 60
              ? note.value
              : note.value.substring(0, 60) + "..."
        }
      ],
      time: note.noteDate,
      isViewDetail: false,
      isArchieve: true,
      isSeen: true
    };
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
      civility: patient.civility
    });
    linkedPatients.photoId = patient.photoId;
    linkedPatients.isSeen = true;
    linkedPatients.isViewDetail = true;
    if (linkedPatients.photoId) {
      linkedPatients.users.forEach(user => {
        this.documentService.downloadFile(linkedPatients.photoId).subscribe(
          response => {
            let myReader: FileReader = new FileReader();
            myReader.onloadend = e => {
              user.img = myReader.result;
            };
            let ok = myReader.readAsDataURL(response.body);
          },
          error => {
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
      linkedPatients.users.forEach(user => {
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
        tap(res => {
          this.categoryList.next(res);
        })
      );
  }
  submit(model) {
    this.patientService
      .updatePatientFile(model)
      .subscribe(this.handleResponse, this.handleError);
  }
  handleResponse = res => {
    if (res) {
      this.notifMessage = this.patientService.messages.edit_info_success;
      this.notifier.show({
        message: this.notifMessage,
        type: "info",
        template: this.customNotificationTmpl
      });
      this.submitted = false;
      this.router.navigate(["."], {
        relativeTo: this.route.parent,
        queryParams: { loading: true }
      });
    } else {
      this.notifMessage = this.patientService.errors.failed_update;
      this.notifier.show({
        message: this.notifMessage,
        type: "error",
        template: this.customNotificationTmpl
      });
      return;
    }
  };

  handleError = err => {
    if (err && err.error && err.error.apierror) {
      this.notifMessage = err.error.apierror.message;
      this.notifier.show({
        message: this.notifMessage,
        type: "error",
        template: this.customNotificationTmpl
      });
    } else {
      this.notifMessage = this.patientService.errors.failed_update;
      this.notifier.show({
        message: this.notifMessage,
        type: "error",
        template: this.customNotificationTmpl
      });
    }
  };
  submitNote(model) {
    if (model.id == null) {
      this.noteService
        .addNoteforPatientFile(model, this.patientFileId)
        .subscribe(res => {
          if (res) {
            this.notifMessage = this.noteService.messages.add_success;
            this.notifier.show({
              message: this.notifMessage,
              type: "info",
              template: this.customNotificationTmpl
            });
            this.notesList.push(this.mappingNote(res));
            this.notes.next(this.notesList);
          } else {
            this.notifMessage = this.noteService.errors.failed_add;
            this.notifier.show({
              message: this.notifMessage,
              type: "error",
              template: this.customNotificationTmpl
            });
            return;
          }
        });
    } else {
      this.noteService.updateNote(model).subscribe(res => {
        if (res) {
          this.notifMessage = this.noteService.messages.edit_success;
          this.notifier.show({
            message: this.notifMessage,
            type: "info",
            template: this.customNotificationTmpl
          });
          let noteToUpdate = this.notesList.findIndex(x => x.id == res.id);
          if (noteToUpdate !== -1) {
            this.notesList[noteToUpdate] = this.mappingNote(res);
            this.notes.next(this.notesList);
          }
        } else {
          this.notifMessage = this.noteService.errors.failed_edit;
          this.notifier.show({
            message: this.notifMessage,
            type: "error",
            template: this.customNotificationTmpl
          });
          return;
        }
      });
    }
  }
  archieveNote(noteId) {
    this.noteService.deleteNote(noteId).subscribe(result => {
      if (result) {
        this.notifMessage = this.noteService.messages.delete_success;
        this.notifier.show({
          message: this.notifMessage,
          type: "info",
          template: this.customNotificationTmpl
        });
        this.notesList = this.notesList.filter(note => note.id != noteId);
        this.notes.next(this.notesList);
      }
    });
  }

  cancelAction() {
    this.router.navigate(["."], {
      relativeTo: this.route.parent,
      queryParams: { loading: false }
    });
  }

  cardClicked(item) {
    this.router.navigate(["/messagerie-lire/" + item.id], {
      queryParams: {
        context: "inbox"
      }
    });
  }

  // destory any subscribe to avoid memory leak
  ngOnDestroy(): void {
    this.notes.next([]);
    this.notes.complete();
    this._destroyed$.next();
    this._destroyed$.complete();
  }
}
