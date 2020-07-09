import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { AccountService } from '../services/account.service';
import { MyDocumentsService } from '../my-documents/my-documents.service';
import { GlobalService } from '@app/core/services/global.service';
import { PatientFile } from '@app/shared/models/patient-file';
import { Subject } from 'rxjs';
import { CategoryService } from '../services/category.service';
import { takeUntil } from 'rxjs/operators';
import { MyPatientsService } from '../services/my-patients.service';

@Component({
  selector: 'app-mat-patient-file-dialog',
  templateUrl: './mat-patient-file-dialog.component.html',
  styleUrls: ['./mat-patient-file-dialog.component.scss']
})
export class MatPatientFileDialogComponent implements OnInit {
  public patientFileForm: FormGroup;
  labels: any;
  image: string | ArrayBuffer;
  practicianImage: string | ArrayBuffer;
  isDeleted: boolean = false;
  isMaidenNameShow: boolean;
  patientFile = new Subject();
  noteimageSource: string;
  userRole: string;
  linkedPatients = new Subject<[]>();
  categoryList = new Subject<[]>();
  avatars: { doctor: string; child: string; women: string; man: string; secretary: string; user: string; tls: string; };
  private _destroyed$ = new Subject();
  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private service: AccountService,
    private documentService: MyDocumentsService,
    private formBuilder: FormBuilder,
    private globalService: GlobalService,
    private categoryService: CategoryService,
    private patientService: MyPatientsService,
    public dialogRef: MatDialogRef<MatPatientFileDialogComponent>
  ) {
    this.labels = this.service.messages;
    this.isMaidenNameShow = false;
    this.isDeleted = false;
    this.avatars = this.globalService.avatars;
    this.noteimageSource = this.avatars.user;
    this.patchValue(this.data);
  }
  ngOnInit() {

    this.patchValue(this.data);
  }
  patchValue(data) {
    this.patientService.getPatientFileByPracticianId(data.info.patientId, data.info.practicianId)
      .pipe(takeUntil(this._destroyed$)).subscribe(patientFile => {
        this.patientFile.next(patientFile);
        this.userRole = data.info.userRole;
        if (patientFile.photoId) {
          this.documentService.downloadFile(patientFile.photoId).subscribe(
            (response) => {
              let myReader: FileReader = new FileReader();
              myReader.onloadend = (e) => {
                this.image = myReader.result;
              };
              let ok = myReader.readAsDataURL(response.body);
            },
            (error) => {
              if (patientFile?.civility == "MME") {
                this.image = this.avatars.women
              }
              else {
                this.image = this.avatars.man
              }

            }
          );
        }
        else {
          if (patientFile?.civility == "MME") {
            this.image = this.avatars.women
          }
          else {
            this.image = this.avatars.man
          }

        }
        if (patientFile?.practicianPhotoId) {
          this.documentService.downloadFile(patientFile.practicianPhotoId).subscribe(
            (response) => {
              let myReader: FileReader = new FileReader();
              myReader.onloadend = (e) => {
                this.practicianImage = myReader.result;
              };
              let ok = myReader.readAsDataURL(response.body);
            },
            (error) => {
              this.practicianImage = this.avatars.doctor
            }
          );
        }
      });
    this.categoryService
      .getCategoriesByPractician(data.info.practicianId).subscribe(res => {
        this.categoryList.next(res)
      })

  }

  submitNote(model) { }
  archieveNote(noteId) { }

  closeDialog() {
    this.dialogRef.close(false);
  }
  cancelAction() {
    this.dialogRef.close(false);
  }
  submit(model) {
    //TODO
  }

}
