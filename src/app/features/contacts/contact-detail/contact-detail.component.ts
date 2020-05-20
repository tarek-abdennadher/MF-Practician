import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { ContactsService } from "@app/features/services/contacts.service";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Speciality } from "@app/shared/models/speciality";
import { Location } from "@angular/common";
import { emailValidator } from "@app/core/Validators/email.validator";
import { Subject } from 'rxjs';
declare var $: any;
@Component({
  selector: "app-contact-detail",
  templateUrl: "./contact-detail.component.html",
  styleUrls: ["./contact-detail.component.scss"],
})
export class ContactDetailComponent implements OnInit {
  specialities: Array<Speciality>;
  errorMessage = "";
  successMessage = "";
  labels;
  public infoForm: FormGroup;
  submitted = false;
  topText = "Fiche contact Pro";
  page = "MY_PRACTICIANS";
  bottomText = ""
  backButton = true;
  param;
  failureAlert = false;
  public phones = new Array();
  public isPhonesValid = false;
  otherPhones = new Subject<any[]>();
  addnewPhone = new Subject<boolean>();
  isLabelShow: boolean;
  constructor(
    private _location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private contactsService: ContactsService
  ) {
    this.labels = this.contactsService.messages;
    this.failureAlert = false;
    this.initForm();
    this.isLabelShow = false;
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.param = params["id"];
      if (this.param != "add") {
        this.getContact(this.param);
      }
      this.getAllSpeciality();
    });
  }
  initForm() {
    this.updateCSS();
    this.infoForm = new FormGroup({
      id: new FormControl(null),
      type: new FormControl(null, Validators.required),
      name: new FormControl(null),
      last_name: new FormControl(null, Validators.required),
      first_name: new FormControl(null, Validators.required),
      email: new FormControl(null, emailValidator),
      title: new FormControl(null, Validators.required),
      speciality: new FormControl(null, Validators.required),
      address: new FormControl(null),
      additional_address: new FormControl(null),
      phone: new FormControl("+33"),
      picture: new FormControl(null),
    });
  }
  get ctr() {
    return this.infoForm.controls;
  }
  getContact(id) {
    this.contactsService.getContactById(id).subscribe((contact) => {
      this.otherPhones.next(contact.otherPhones);
      this.infoForm.patchValue({
        id: contact.id,
        type: contact.contactType,
        name: contact.facilityName,
        last_name: contact.lastName,
        first_name: contact.firstName,
        email: contact.email,
        title: contact.title,
        speciality: contact.speciality ? contact.speciality.id : null,
        address: contact.address,
        additional_address: contact.additionalAddress,
        phone: contact.phoneNumber ? contact.phoneNumber : "+33",
        otherPhones: contact.otherPhones ? contact.otherPhones : [],
        picture: contact.photoId
      });
      this.bottomText = contact.firstName + " " + contact.lastName;
      if (contact.otherPhones.length > 0) {
        this.isLabelShow = true;
      }
    });

  }
  getAllSpeciality() {
    this.contactsService.getAllSpecialities().subscribe((specialitiesList) => {
      this.specialities = specialitiesList;
    });
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
    const value = this.infoForm.value;
    const contact = {
      id: value.id,
      contactType: value.type,
      facilityName: value.name,
      title: value.title,
      speciality:
        value.speciality != null
          ? this.specialities.find((s) => s.id == value.speciality)
          : null,
      firstName: value.first_name,
      lastName: value.last_name,
      phoneNumber: value.phone,
      otherPhones: this.phones,
      email: value.email,
      address: value.address,
      additionalAddress: value.additional_address
    };
    let successResult = false;
    if (this.param == "add") {
      this.contactsService
        .addContact(contact)
        .subscribe((res) => {
          successResult = res;
          this.router
      .navigate(["/mes-contacts-pro"])
        });
    } else {
      this.contactsService
        .updateContact(contact)
        .subscribe((res) => {
          successResult = res;
          this.router
      .navigate(["/mes-contacts-pro"])
        });
    }

  }

  BackButton() {
    this._location.back();
  }
  // Phone component CSS
  updateCSS() {
    $(document).ready(function () {
      $(".form-control").each(function () {
        $(this).css("background", "#F1F1F1");
        $(this).css("border-color", "#F1F1F1");
      });
      $(".dropbtn.btn").each(function () {
        $(this).css("background", "#F1F1F1");
        $(this).css("border-color", "#F1F1F1");
        $(this).css("padding", "8px");
      });
      $(".arrow-down").each(function () {
        $(this).css("border-bottom", "#F1F1F1");
      });
    });
  }
  // Other phones list
  getPhoneList(event) {
    this.phones = event.value;
    if (this.phones.length > 0) {
      this.isLabelShow = true;
    }
    else {
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
  close() {
    this.failureAlert = false;
  }
}
