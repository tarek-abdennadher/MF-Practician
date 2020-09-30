import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject } from "rxjs";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { emailValidator } from "@app/core/Validators/email.validator";
import { ContactBookService } from "@app/features/services/contact-book.service";
import { FeaturesService } from "@app/features/features.service";
import { NotifierService } from "angular-notifier";
import { takeUntil } from "rxjs/operators";
declare var $: any;
@Component({
  selector: "app-my-contact-detail",
  templateUrl: "./my-contact-detail.component.html",
  styleUrls: ["./my-contact-detail.component.scss"],
})
export class MyContactDetailComponent implements OnInit, OnDestroy {
  @ViewChild("customNotification", { static: true }) customNotificationTmpl;
  private _destroyed$ = new Subject();
  action: string = "add";
  practicianId: number;
  contactId: number;
  errorMessage = "";
  successMessage = "";
  public messages: any;
  submitted = false;
  showAlert = false;
  otherPhones = new Subject<any[]>();
  addnewPhone = new Subject<boolean>();
  isLabelShow: boolean;
  public infoForm: FormGroup;
  public phones = new Array();
  public isPhonesValid = false;
  failureAlert = false;
  notifMessage = "";
  private readonly notifier: NotifierService;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ContactBookService,
    private featureService: FeaturesService,
    notifierService: NotifierService
  ) {
    this.notifier = notifierService;
    this.isLabelShow = false;
  }

  ngOnDestroy(): void {
    this._destroyed$.next(true);
    this._destroyed$.unsubscribe();
  }

  ngOnInit(): void {
    this.messages = this.service.messages;
    this.initInfoForm();
    this.practicianId = this.featureService.getUserId();
    this.route.params.subscribe((params) => {
      if (params["id"] != "add") {
        this.action = "edit";
        this.contactId = params["id"];
        this.getContactById(this.contactId);
      } else {
        this.action = "add";
      }
    });
    setTimeout(() => {
      this.featureService.setIsMessaging(false);
    });
  }
  getContactById(id) {
    this.service
      .getContactBookBy(id)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((contact) => {
        this.otherPhones.next(contact.phones);
        this.infoForm.patchValue({
          id: contact.id ? contact.id : null,
          email: contact.email ? contact.email : "",
          phone: contact.phoneNumber ? contact.phoneNumber : "+33",
          last_name: contact.lastName ? contact.lastName : "",
          first_name: contact.firstName ? contact.firstName : "",
          fonction: contact.fonction ? contact.fonction : "",
          otherPhones: contact.phones ? contact.phones : [],
        });
        if (contact?.phones && contact.phones.length > 0) {
          this.isLabelShow = true;
        }
      });
  }
  initInfoForm() {
    this.infoForm = new FormGroup({
      id: new FormControl(null),
      practicianId: new FormControl(null),
      last_name: new FormControl(null, Validators.required),
      first_name: new FormControl(null, Validators.required),
      email: new FormControl(null, [Validators.required, emailValidator]),
      fonction: new FormControl(null, Validators.required),
      phone: new FormControl(null, Validators.required),
    });
  }
  get ctr() {
    return this.infoForm.controls;
  }
  close() {
    this.showAlert = false;
  }
  submit() {
    this.submitted = true;
    if (!this.isPhonesValid) {
      this.failureAlert = true;
      $("#FailureAlert").alert();
      return;
    }
    if (this.infoForm.invalid) {
      return;
    }
    let model;
    model = {
      id: this.infoForm.value.id,
      email: this.infoForm.value.email,
      phoneNumber: this.infoForm.value.phone,
      phones: this.phones,
      firstName: this.infoForm.value.first_name,
      lastName: this.infoForm.value.last_name,
      fonction: this.infoForm.value.fonction,
    };
    if (this.action == "add") {
      this.service
        .addContactBookToPractician(this.practicianId, model)
        .pipe(takeUntil(this._destroyed$))
        .subscribe((result) => {
          if (result) {
            this.submitted = false;
            this.notifier.show({
              message: this.service.messages.add_success,
              type: "info",
              template: this.customNotificationTmpl,
            });
            this.router.navigate(["/compte/mes-contacts"]);
          } else {
            this.notifMessage = this.service.messages.add_fail;
            this.notifier.show({
              message: this.notifMessage,
              type: "error",
              template: this.customNotificationTmpl,
            });
            return;
          }
        });
    } else {
      this.service
        .updateContactBook(model)
        .pipe(takeUntil(this._destroyed$))
        .subscribe((result) => {
          if (result) {
            this.submitted = false;
            this.notifier.show({
              message: this.service.messages.edit_info_success,
              type: "info",
              template: this.customNotificationTmpl,
            });
            this.router.navigate(["/compte/mes-contacts"]);
          } else {
            this.notifMessage = this.service.messages.failed_update;
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
  cancel() {
    this.router.navigate(["/compte/mes-contacts"]);
  }
}
