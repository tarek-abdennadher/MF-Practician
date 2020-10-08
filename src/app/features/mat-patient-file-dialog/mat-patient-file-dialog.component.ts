import { Component, OnInit, Inject, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FormGroup, FormBuilder } from "@angular/forms";
import { AccountService } from "../services/account.service";
import { MyDocumentsService } from "../my-documents/my-documents.service";
import { GlobalService } from "@app/core/services/global.service";
import { Subject, BehaviorSubject } from "rxjs";
import { CategoryService } from "../services/category.service";
import { takeUntil } from "rxjs/operators";
import { MyPatientsService } from "../services/my-patients.service";
import { NotifierService } from "angular-notifier";
import { NoteService } from "../services/note.service";
import { MyPatients } from "@app/shared/models/my-patients";

@Component({
  selector: "app-mat-patient-file-dialog",
  templateUrl: "./mat-patient-file-dialog.component.html",
  styleUrls: ["./mat-patient-file-dialog.component.scss"],
})
export class MatPatientFileDialogComponent implements OnInit {
  @ViewChild("customNotification", { static: true }) customNotificationTmpl;
  public patientFileForm: FormGroup;
  labels: any;
  image: string | ArrayBuffer;
  practicianImage: string | ArrayBuffer;
  isDeleted: boolean = false;
  isMaidenNameShow: boolean;
  patientFile = new Subject();
  noteimageSource: string;
  userRole: string;
  linkedPatients = new Subject();
  linkedPatientList = [];
  categoryList = new Subject<[]>();
  notifMessage = "";
  patientFileId: number;
  notes = new BehaviorSubject([]);
  notesList = [];
  avatars: {
    doctor: string;
    child: string;
    women: string;
    man: string;
    secretary: string;
    user: string;
    tls: string;
  };
  private _destroyed$ = new Subject();
  private readonly notifier: NotifierService;
  popup: boolean = true;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private noteService: NoteService,
    private service: AccountService,
    private documentService: MyDocumentsService,
    private formBuilder: FormBuilder,
    private globalService: GlobalService,
    private categoryService: CategoryService,
    private patientService: MyPatientsService,
    notifierService: NotifierService,
    public dialogRef: MatDialogRef<MatPatientFileDialogComponent>
  ) {
    this.labels = this.service.messages;
    this.isMaidenNameShow = false;
    this.isDeleted = false;
    this.notifier = notifierService;
    this.avatars = this.globalService.avatars;
    this.noteimageSource = this.avatars.user;
    this.linkedPatientList = [];
    this.notesList = [];
    this.patchValue(this.data);
  }
  ngOnInit() {
    this.patchValue(this.data);
  }
  patchValue(data) {
    if (data.info.patientFileId != null) {
      this.patientService
        .getPatientFileById(data.info.patientFileId)
        .pipe(takeUntil(this._destroyed$))
        .subscribe((patientFile) => {
          this.patientFile.next(patientFile);
          this.userRole = data.info.userRole;
          this.patientFileId = patientFile.id;
          this.notesList = [];
          if (patientFile.notes && patientFile.notes.length > 0) {
            patientFile.notes.forEach((elm) => {
              this.notesList.push(this.mappingNote(elm));
            });
          }
          this.notes.next(this.notesList);
          this.linkedPatientList = [];
          this.linkedPatients.next(null);
          if (patientFile.linkedPatientFiles) {
            patientFile.linkedPatientFiles.forEach((elm) => {
              this.linkedPatientList.push(this.mappingLinkedPatients(elm));
            });
            this.linkedPatients.next(this.linkedPatientList);
          }
        });
    } else {
      this.patientService
        .getPatientFileByPracticianId(
          data.info.patientId,
          data.info.practicianId
        )
        .pipe(takeUntil(this._destroyed$))
        .subscribe((patientFile) => {
          this.patientFile.next(patientFile);
          this.notesList = [];
          if (patientFile.notes && patientFile.notes.length > 0) {
            patientFile.notes.forEach((elm) => {
              this.notesList.push(this.mappingNote(elm));
            });
          }
          this.notes.next(this.notesList);
          this.linkedPatientList = [];
          this.linkedPatients.next(null);
          if (patientFile.linkedPatientFiles) {
            patientFile.linkedPatientFiles.forEach((elm) => {
              this.linkedPatientList.push(this.mappingLinkedPatients(elm));
            });
            this.linkedPatients.next(this.linkedPatientList);
          }
          this.userRole = data.info.userRole;
          this.patientFileId = patientFile.id;
        });
    }
    this.categoryService
      .getCategoriesByPractician(data.info.practicianId)
      .subscribe((res) => {
        this.categoryList.next(res);
      });
  }
  mappingNote(note) {
    return {
      id: note.id,
      users: [
        {
          fullName:
            note.value.length < 60
              ? note.value
              : note.value.substring(0, 60) + "...",
        },
      ],
      time: note.noteDate,
      isViewDetail: false,
      isArchieve: true,
      isSeen: true,
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
            this.notesList.push(this.mappingNote(res));
            this.notes.next(this.notesList);
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
          let noteToUpdate = this.notesList.findIndex((x) => x.id == res.id);
          if (noteToUpdate !== -1) {
            this.notesList[noteToUpdate] = this.mappingNote(res);
            this.notes.next(this.notesList);
          }
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
        this.notesList = this.notesList.filter((note) => note.id != noteId);
        this.notes.next(this.notesList);
      }
    });
  }

  closeDialog() {
    this.dialogRef.close(false);
  }
  cancelAction() {
    this.dialogRef.close(false);
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
  submitLinkedPatient(model) {
    this.patientService
      .addLinkedPatient(this.patientFileId, model)
      .subscribe((res) => {
        if (res) {
          this.notifMessage = this.patientService.messages.add_success;
          this.notifier.show({
            message: this.notifMessage,
            type: "info",
            template: this.customNotificationTmpl,
          });
          this.linkedPatientList.push(this.mappingLinkedPatients(res));
          this.linkedPatients.next(this.linkedPatientList);
        } else {
          this.notifMessage = this.patientService.errors.failed_add_patient;
          this.notifier.show({
            message: this.notifMessage,
            type: "error",
            template: this.customNotificationTmpl,
          });
          return;
        }
      });
  }
  updateLinkedPatient(model) {
    this.patientService.updateLinkedPatient(model).subscribe((res) => {
      if (res) {
        this.notifMessage = this.patientService.messages.update_sucess;
        this.notifier.show({
          message: this.notifMessage,
          type: "info",
          template: this.customNotificationTmpl,
        });
        let patientToUpdate = this.linkedPatientList.findIndex(
          (x) => x.fullInfo.id == res.id
        );
        if (patientToUpdate !== -1) {
          this.linkedPatientList[patientToUpdate] = this.mappingLinkedPatients(
            res
          );
          this.linkedPatients.next(this.linkedPatientList);
        }
      } else {
        this.notifMessage = this.patientService.errors.failed_edit_patient;
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
