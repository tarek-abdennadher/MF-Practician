import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { PracticianInvitationService } from "./practician-invitation.service";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Speciality } from "@app/shared/models/speciality";
import { ContactsService } from "../services/contacts.service";
import { emailValidator } from "@app/core/Validators/email.validator";
import { NotifierService } from "angular-notifier";
import {FeaturesService} from '@app/features/features.service';

@Component({
  selector: "app-practician-invitation",
  templateUrl: "./practician-invitation.component.html",
  styleUrls: ["./practician-invitation.component.scss"],
})
export class PracticianInvitationComponent implements OnInit {
  @ViewChild("customNotification", { static: true }) customNotificationTmpl;
  private readonly notifier: NotifierService;
  errorMessage = "";
  specialities: Array<Speciality>;
  submitted = false;
  public imageSource: string = "assets/imgs/invitation.jpg";
  page = "INBOX";
  number = null;
  topText = "Envoyer une invitation à un confrère";
  bottomText = "";
  backButton = true;
  links = {};
  texts: any;
  public infoForm: FormGroup;
  constructor(
    private router: Router,
    private service: PracticianInvitationService,
    private contactsService: ContactsService,
    private featureService: FeaturesService,
    notifierService: NotifierService
  ) {
    this.notifier = notifierService;
    this.texts = this.service.texts;
    this.submitted = false;
    this.getAllSpeciality();
  }

  ngOnInit(): void {
    this.initForm();
    this.featureService.setIsMessaging(false);
  }
  BackButton() {
    this.router.navigate(["/praticien-recherche"]);
  }

  initForm() {
    this.infoForm = new FormGroup({
      title: new FormControl(null, Validators.required),
      speciality: new FormControl(null, Validators.required),
      last_name: new FormControl(null, Validators.required),
      first_name: new FormControl(null, Validators.required),
      email: new FormControl(null, {
        validators: [Validators.required, emailValidator],
      }),
      phone: new FormControl(null, Validators.pattern("[0-9]*")),
      address: new FormControl(null),
    });
  }
  get ctr() {
    return this.infoForm.controls;
  }
  getAllSpeciality() {
    this.contactsService.getAllSpecialities().subscribe((specialitiesList) => {
      this.specialities = specialitiesList;
    });
  }
  submit() {
    this.submitted = true;
    if (this.infoForm.invalid) {
      return;
    }
    const model = {
      email: this.infoForm.value.email,
      phoneNumber: this.infoForm.value.phone,
      practician: {
        firstName: this.infoForm.value.first_name,
        lastName: this.infoForm.value.last_name,
        jobTitle: this.infoForm.value.title,
        speciality:
          this.infoForm.value.speciality != null
            ? this.specialities.find(
                (s) => s.id == this.infoForm.value.speciality
              )
            : null,
        address: this.infoForm.value.address,
      },
    };
    this.service
      .invitePractician(model)
      .subscribe(this.handleResponseInvitation, this.handleError);
  }

  handleError = (err) => {
    if (err && err.error && err.error.apierror) {
      this.errorMessage = err.error.apierror.message;
      this.notifier.show({
        message: this.errorMessage,
        type: "error",
        template: this.customNotificationTmpl,
      });
    } else {
      throw err;
    }
  };
  handleResponseInvitation = (response) => {
    if (response) {
      this.submitted = false;
      this.router.navigate(["/praticien-recherche"]);
    } else {
      this.errorMessage = this.service.texts.invite_failure;
      this.notifier.show({
        message: this.errorMessage,
        type: "error",
        template: this.customNotificationTmpl,
      });
    }
  };
}
