import { Component, Inject, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { emailValidator } from "@app/core/Validators/email.validator";
import { ContactsService } from "@app/features/services/contacts.service";
import { NotifierService } from "angular-notifier";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-mat-contact-detail-dialog",
  templateUrl: "./mat-contact-detail-dialog.component.html",
  styleUrls: ["./mat-contact-detail-dialog.component.scss"],
})
export class MatContactDetailDialogComponent implements OnInit, OnDestroy {
  @ViewChild("customNotification", { static: true }) customNotificationTmpl;
  private _destroyed$ = new Subject();
  labels;
  contactId: number;
  submitted = false;
  public infoForm: FormGroup;
  click: boolean = false;
  otherPhones = new Array();
  addnewPhone = new Subject<boolean>();
  public phones = new Array();
  public isPhonesValid = false;
  isLabelShow: boolean;
  failureAlert: boolean = false;
  isAdd: boolean = false;
  notifMessage: string;
  private readonly notifier: NotifierService;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private contactsService: ContactsService,
    public dialogRef: MatDialogRef<MatContactDetailDialogComponent>,
    notifierService: NotifierService
  ) {
    this.notifier = notifierService;
    this.labels = this.contactsService.messages;
    this.contactId = this.data.info;
    this.failureAlert = false;
  }

  ngOnInit(): void {
    this.initForm();
    this.getContactById(this.contactId);
  }
  getContactById(contactId) {
    this.contactsService
      .getContactById(contactId)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((contact) => {
        this.otherPhones = contact.otherPhones;
        this.infoForm.patchValue({
          id: contact.id,
          type: contact.contactType,
          name: contact.facilityName,
          last_name: contact.lastName,
          first_name: contact.firstName,
          email: contact.email,
          title: contact.title,
          address: contact.address,
          additional_address: contact.additionalAddress,
          phone: contact.phoneNumber ? contact.phoneNumber : "+33",
          otherPhones: contact.otherPhones ? contact.otherPhones : [],
          picture: contact.photoId,
          zipCode: contact.zipCode,
          city: contact.city,
        });
        if (contact.otherPhones.length > 0) {
          this.isLabelShow = true;
        }
      });
  }
  initForm() {
    this.infoForm = new FormGroup({
      id: new FormControl(null),
      type: new FormControl(null, Validators.required),
      name: new FormControl(null),
      last_name: new FormControl(null, Validators.required),
      first_name: new FormControl(null, Validators.required),
      email: new FormControl(null, emailValidator),
      title: new FormControl(null, Validators.required),
      address: new FormControl(null),
      additional_address: new FormControl(null),
      phone: new FormControl("+33"),
      picture: new FormControl(null),
      zipCode: new FormControl(null),
      city: new FormControl(null),
    });
  }
  get ctr() {
    return this.infoForm.controls;
  }
  closeDialog() {
    this.dialogRef.close(false);
  }
  cancelActionClicked() {
    this.dialogRef.close(false);
  }
  close() {
    this.failureAlert = false;
  }
  // Other phones list
  getPhoneList(event) {
    this.phones = event.value;
    if (this.phones.length > 0) {
      this.isLabelShow = true;
    } else {
      this.isLabelShow = false;
    }
  }
  submitPhones(event) {
    this.isPhonesValid = event;
  }
  addPhone() {
    this.addnewPhone.next(true);
    this.isLabelShow = true;
  }
  submit() {
    this.submitted = true;
    if (!this.isPhonesValid) {
      this.failureAlert = true;
      ($("#FailureAlert") as any).alert();
      return;
    }
    if (this.infoForm.controls["phone"].errors?.phoneEmptyError) {
      this.infoForm.controls["phone"].setErrors(null);
    }
    if (this.infoForm.controls["email"].value == null) {
      this.infoForm.controls["email"].setErrors(null);
    }
    if (this.infoForm.invalid) {
      return;
    }
    const value = this.infoForm.value;
    const contact = {
      id: value.id,
      contactType: value.type,
      facilityName: value.name,
      title: value.title,
      firstName: value.first_name,
      lastName: value.last_name,
      phoneNumber: value.phone,
      otherPhones: this.phones,
      email: value.email,
      address: value.address,
      additionalAddress: value.additional_address,
      city: value.city,
      zipCode: value.zipCode,
    };
    this.contactsService
      .updateContact(contact)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((res) => {
        if (res) {
          this.notifMessage = this.labels.contact_edit;
          this.notifier.show({
            message: this.notifMessage,
            type: "info",
            template: this.customNotificationTmpl,
          });
        } else {
          this.notifMessage = this.labels.edit_failed;
          this.notifier.show({
            message: this.notifMessage,
            type: "error",
            template: this.customNotificationTmpl,
          });
        }
      });
  }
  ngOnDestroy(): void {
    this._destroyed$.next(true);
    this._destroyed$.unsubscribe();
  }
}
