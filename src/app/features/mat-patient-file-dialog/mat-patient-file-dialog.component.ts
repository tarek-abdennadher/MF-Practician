import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { AccountService } from '../services/account.service';
import { MyDocumentsService } from '../my-documents/my-documents.service';
import { GlobalService } from '@app/core/services/global.service';

@Component({
  selector: 'app-mat-patient-file-dialog',
  templateUrl: './mat-patient-file-dialog.component.html',
  styleUrls: ['./mat-patient-file-dialog.component.scss']
})
export class MatPatientFileDialogComponent implements OnInit {
  public patientFileForm: FormGroup;
  labels: any;
  image: string | ArrayBuffer;
  public phoneForm: FormGroup;
  isLabelShow: boolean;
  isMaidenNameShow: boolean;
  avatars: { doctor: string; child: string; women: string; man: string; secretary: string; user: string; tls: string; };
  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private service: AccountService,
    private documentService: MyDocumentsService,
    private formBuilder: FormBuilder,
    private globalService: GlobalService,
    public dialogRef: MatDialogRef<MatPatientFileDialogComponent>
  ) {
    this.labels = this.service.messages;
    this.isLabelShow = false;
    this.isMaidenNameShow = false;
    this.avatars = this.globalService.avatars;
  }
  get phoneList() {
    return <FormArray>this.patientFileForm.get("otherPhones");
  }
  ngOnInit() {
    this.initPatientFileForm();
    this.patchValue(this.data);
  }
  updatePhone(p): FormGroup {
    return this.formBuilder.group({
      otherPhone: [p ? p : ""]
    });
  }
  initPatientFileForm() {
    this.patientFileForm = new FormGroup({
      civility: new FormControl(null),
      birthday: new FormControl(null),
      firstName: new FormControl(null),
      lastName: new FormControl(null),
      maidenName: new FormControl(null),
      email: new FormControl(null),
      phoneNumber: new FormControl(null),
      address: new FormControl(null),
      additionalAddress: new FormControl(null),
      city: new FormControl(null),
      zipCode: new FormControl(null),
      category: new FormControl(null),
      otherPhones: this.formBuilder.array([])
    });
  }
  patchValue(data) {
    if (data?.patientFile?.photoId) {
      this.documentService.downloadFile(data.patientFile.photoId).subscribe(
        (response) => {
          let myReader: FileReader = new FileReader();
          myReader.onloadend = (e) => {
            this.image = myReader.result;
          };
          let ok = myReader.readAsDataURL(response.body);
        },
        (error) => {
          if (data?.patientFile?.civility == "MME") {
            this.image = this.avatars.women
          }
          else {
            this.image = this.avatars.man
          }

        }
      );
    }
    else {
      if (data?.patientFile?.civility == "MME") {
        this.image = this.avatars.women
      }
      else {
        this.image = this.avatars.man
      }
    }
    if (data?.patientFile?.otherPhones && data?.patientFile?.otherPhones.length != 0) {
      this.isLabelShow = true;
      data?.patientFile?.otherPhones.forEach(p =>
        this.phoneList.push(this.updatePhone(p)));
      this.patientFileForm.setControl('otherPhones', this.phoneList);
    }
    if (data?.patientFile?.maidenName != null) {
      this.isMaidenNameShow = true;

    }
    this.patientFileForm.patchValue({
      civility: data?.patientFile?.civility,
      birthday: (data?.patientFile?.birthday).substring(0, 10),
      lastName: data?.patientFile?.lastName,
      firstName: data?.patientFile?.firstName,
      maidenName: data?.patientFile?.maidenName,
      email: data?.patientFile?.email,
      address: data?.patientFile?.address,
      additionalAddress: data?.patientFile?.additionalAddress,
      phoneNumber: data?.patientFile?.phoneNumber,
      category: data?.patientFile?.category?.name
    })
  }

  closeDialog() {
    this.dialogRef.close(false);
  }

}
