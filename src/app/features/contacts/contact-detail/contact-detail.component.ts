import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ContactsService } from "@app/features/services/contacts.service";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Speciality } from "@app/shared/models/speciality";
import { emailValidator } from "@app/core/Validators/email.validator";
import { Subject } from "rxjs";
import { AccountService } from "@app/features/services/account.service";
import { FeaturesService } from "@app/features/features.service";
import { ComponentCanDeactivate } from "@app/features/component-can-deactivate";
import { EmailUniqueValidatorService } from "@app/core/Validators/email-unique-validator.service";
import { PracticianInvitationService } from "../practician-invitation.service";
import { FeaturesComponent } from "@app/features/features.component";
import { takeUntil } from "rxjs/operators";
import { LocalStorageService } from "ngx-webstorage";
declare var $: any;
@Component({
  selector: "app-contact-detail",
  templateUrl: "./contact-detail.component.html",
  styleUrls: ["./contact-detail.component.scss"],
})
export class ContactDetailComponent
  implements OnInit, ComponentCanDeactivate, OnDestroy {
  private _destroyed$ = new Subject();
  alertMessage = "Erreur survenue lors de l'invitation' du praticien";
  specialities = new Subject<Array<Speciality>>();
  mySpecialities = Array<Speciality>();
  errorMessage = "";
  successMessage = "";
  labels;
  public infoForm: FormGroup;
  submitted = false;
  topText = "";
  page = "MY_PRACTICIANS";
  practicianText =
    this.localSt.retrieve("role") == "PRACTICIAN" ? "confrère" : "praticien";
  infoText = "";
  bottomText = "";
  backButton = true;
  param;
  failureAlert = false;
  isLabelShow: boolean;
  jobTitlesList = [];
  constructor(
    private service: PracticianInvitationService,
    private router: Router,
    private contactsService: ContactsService,
    private featureService: FeaturesService,
    public accountService: AccountService,
    private emailUnique: EmailUniqueValidatorService,
    private featureComp: FeaturesComponent,
    private localSt: LocalStorageService
  ) {
    this.labels = this.contactsService.messages;
    this.failureAlert = false;
    this.isLabelShow = false;
  }
  ngOnDestroy(): void {
    this._destroyed$.next(true);
    this._destroyed$.unsubscribe();
  }
  canDeactivate(): boolean {
    return !this.infoForm.dirty;
  }
  ngOnInit(): void {
    this.infoText =
      this.localSt.retrieve("role") == "PRACTICIAN"
        ? this.labels.parrainer_practician
        : this.labels.parrainer_secretary;
    this.getjobTitles();
    this.getAllSpeciality();
    this.initForm();
    setTimeout(() => {
      this.featureService.setIsMessaging(false);
    });
    setTimeout(() => {
      $(".selectpicker").selectpicker("refresh");
    }, 1000);
  }
  initForm() {
    this.infoForm = new FormGroup({
      id: new FormControl(null),
      last_name: new FormControl(null, Validators.required),
      first_name: new FormControl(null, Validators.required),
      email: new FormControl(null, {
        validators: [Validators.required, emailValidator],
      }),
      title: new FormControl(null, Validators.required),
      speciality: new FormControl(null),
    });
    this.ctr.email.setAsyncValidators([this.emailUnique.emailExist()]);
  }
  get ctr() {
    return this.infoForm.controls;
  }

  getAllSpeciality() {
    this.contactsService
      .getAllSpecialities()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((specialitiesList) => {
        this.specialities.next(specialitiesList);
        this.mySpecialities = specialitiesList;
        $(".selectpicker").selectpicker("refresh");
      });
  }
  getjobTitles() {
    this.accountService
      .getJobTiles()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((resp) => {
        this.jobTitlesList = resp;
      });
  }
  submit() {
    this.submitted = true;
    if (this.infoForm.invalid) {
      return;
    }
    this.infoForm.markAsPristine();
    const value = this.infoForm.value;
    const model = {
      email: this.infoForm.value.email,
      practician: {
        firstName: this.infoForm.value.first_name,
        lastName: this.infoForm.value.last_name,
        jobTitle: this.infoForm.value.title,
        speciality:
          this.infoForm.value.speciality != null
            ? this.mySpecialities.find(
                (s) => s.id == this.infoForm.value.speciality
              )
            : null,
        address: this.infoForm.value.address,
      },
    };
    this.service
      .invitePractician(model)
      .pipe(takeUntil(this._destroyed$))
      .subscribe(this.handleResponseInvitation, this.handleError);
  }
  handleError = (err) => {
    if (err && err.error && err.error.apierror) {
      this.errorMessage = err.error.apierror.message;
      this.alertMessage = this.errorMessage;
      this.failureAlert = true;
    } else {
      throw err;
    }
  };
  handleResponseInvitation = (response) => {
    if (response) {
      this.submitted = false;
      this.featureComp.setNotif(this.service.texts.invite_success);
      this.router.navigate(["/mes-contacts-pro"]);
    } else {
      this.featureComp.setNotif(this.service.texts.invite_failure);
      this.router.navigate(["/mes-contacts-pro"]);
    }
  };
  cancel() {
    this.router.navigate(["/mes-contacts-pro"]);
  }

  close() {
    this.failureAlert = false;
  }
}
