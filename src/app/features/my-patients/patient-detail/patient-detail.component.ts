import { Component, OnInit, ViewChild, Inject, LOCALE_ID } from '@angular/core';
import { Subject, forkJoin } from 'rxjs';
import { PatientFile } from '@app/shared/models/patient-file';
import { NotifierService } from 'angular-notifier';
import { OrderDirection } from '@app/shared/enmus/order-direction';
import { ActivatedRoute, Router } from '@angular/router';
import { FeaturesService } from '@app/features/features.service';
import { AccountService } from '@app/features/services/account.service';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { MyPatientsService } from '@app/features/services/my-patients.service';
import { CategoryService } from '@app/features/services/category.service';
import { MyDocumentsService } from '@app/features/my-documents/my-documents.service';
import { NoteService } from '@app/features/services/note.service';
import { LocalStorageService } from 'ngx-webstorage';
import { MessagingListService } from '@app/features/services/messaging-list.service';
import { GlobalService } from '@app/core/services/global.service';
import { defineLocale, frLocale } from 'ngx-bootstrap/chronos';
import { takeUntil, tap } from 'rxjs/operators';
import { MyPatients } from '@app/shared/models/my-patients';

@Component({
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss']
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
  messages: Array<any> = new Array();
  pageNo = 0;
  direction: OrderDirection = OrderDirection.DESC;
  itemsList: Array<any>;
  filtredItemList: Array<any> = new Array();
  page2 = this.globalService.messagesDisplayScreen.inbox;
  scroll = false;
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
  }

  ngOnInit(): void {
    if (this.localStorage.retrieve("role") == "PRACTICIAN") {
      this.userRole = "PRACTICIAN"
      this.practicianId = this.featureService.getUserId();
    } else {
      this.userRole = "SECRETARY"
      this.practicianId = this.featureService.selectedPracticianId;
    }
    this.route.queryParams.subscribe((params) => {
      this.patientFileId = params["id"];
      forkJoin(
        this.getPatientFile(),
        this.getCategories()
      ).subscribe((res) => { });
      this.featureService.setIsMessaging(false);
      this.getPatientInbox(this.pageNo);
    });

  }

  getPatientFile() {
    return this.patientService
      .getPatientFileById(this.patientFileId)
      .pipe(takeUntil(this._destroyed$))
      .pipe(
        tap((patientFile) => {
          this.patientFile.next(patientFile);
          if (patientFile.patientId) {
            this.patientId = patientFile.patientId;
            this.isPatientFile = true;
            this.patientService
              .getPatientsByParentId(patientFile.patientId)
              .pipe(takeUntil(this._destroyed$))
              .subscribe((res) => {
                res.forEach((elm) => {
                  this.linkedPatientList.push(this.mappingLinkedPatients(elm));
                });
                this.linkedPatients.next(this.linkedPatientList);
              }
              );
          }
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
              if (patientFile?.civility == "CHILD") {
                this.imageSource = this.avatars.child
              }
              else this.imageSource = this.avatars.man
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
      this.router.navigate(["."], { relativeTo: this.route.parent });
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

  cancelAction() {
    this.router.navigate(["."], { relativeTo: this.route.parent });
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
    this.itemsList = [];
    this.filtredItemList = [];
  }

  cardClicked(item) {
    this.router.navigate(["/messagerie-lire/" + item.id], {
      queryParams: {
        context: "inbox",
      },
    });
  }
  getPatientInbox(pageNo) {
    this.messagesServ.getMessagesByPatientFile(this.patientFileId, pageNo, this.direction).subscribe(res => {
      this.messages = res;
      this.messages.sort(function (m1, m2) {
        return (
          new Date(m2.updatedAt).getTime() - new Date(m1.updatedAt).getTime()
        );
      });
      this.itemsList = this.messages.map((item) => this.parseMessage(item));
      this.filtredItemList = this.itemsList;
    });
  }
  getPatientNextInbox(pageNo) {
    this.messagesServ.getMessagesByPatientFile(this.patientFileId, pageNo, this.direction).subscribe(res => {
      this.messages = res;
      this.messages.sort(function (m1, m2) {
        return (
          new Date(m2.updatedAt).getTime() - new Date(m1.updatedAt).getTime()
        );
      });
      this.itemsList.push(
        ...this.messages.map((item) => this.parseMessage(item))
      );
      this.filtredItemList = this.itemsList;
    });
  }
  parseMessage(message): any {
    let parsedMessage = {
      id: message.id,
      isSeen: message.seenAsReceiver,
      users: [
        {
          id: message.sender.id,
          fullName: message.sender.fullName,
          img: this.avatars.user,
          title: message.sender.jobTitle,
          civility: message.sender.civility,
          type:
            message.sender.role == "PRACTICIAN"
              ? "MEDICAL"
              : message.sender.role,
        },
      ],
      object: {
        name: message.object,
        isImportant: message.importantObject,
      },
      time: message.updatedAt,
      isImportant: message.important,
      hasFiles: message.hasFiles,
      photoId: message.sender.photoId,
    };
    if (parsedMessage.photoId) {
      this.documentService.downloadFile(parsedMessage.photoId).subscribe(
        (response) => {
          let myReader: FileReader = new FileReader();
          myReader.onloadend = (e) => {
            parsedMessage.users[0].img = myReader.result.toString();
          };
          let ok = myReader.readAsDataURL(response.body);
        },
        (error) => {
          parsedMessage.users[0].img = this.avatars.user;
        }
      );
    } else {
      parsedMessage.users.forEach((user) => {
        if (user.type == "MEDICAL") {
          user.img = this.avatars.doctor;
        } else if (user.type == "SECRETARY") {
          user.img = this.avatars.secretary;
        } else if (user.type == "TELESECRETARYGROUP") {
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
    return parsedMessage;
  }

  onScroll() {
    if (this.filtredItemList.length > 9) {
      this.pageNo++;
      this.getPatientNextInbox(this.pageNo);
    }
  }

  // destory any subscribe to avoid memory leak
  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

}
