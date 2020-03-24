import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ContactsService } from '@app/features/services/contacts.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Speciality } from '@app/shared/models/speciality';
import { Location } from '@angular/common';
@Component({
  selector: 'app-contact-detail',
  templateUrl: './contact-detail.component.html',
  styleUrls: ['./contact-detail.component.scss']
})
export class ContactDetailComponent implements OnInit {
  specialities: Array<Speciality>;
  errorMessage = "";
  successMessage = "";
  labels;
  public infoForm: FormGroup;
  submitted = false;
  topText = "Mes contacts PRO";
  page = "MY_PRO_CONTACTS";
  backButton = true;
  param ;
  constructor(private _location: Location,private route: ActivatedRoute, private router: Router, private contactsService: ContactsService) {
    this.labels = this.contactsService.messages;
    this.initForm();
   }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.param = params["id"];
      if(this.param != "add") {
        this.getContact(this.param);
      }
      this.getAllSpeciality();
    });
  }
  initForm() {
    this.infoForm = new FormGroup({
      id: new FormControl(null),
      type: new FormControl(null, Validators.required),
      name: new FormControl(null, Validators.required),
      last_name: new FormControl(null, Validators.required),
      first_name: new FormControl(null, Validators.required),
      email: new FormControl(null, {validators: [Validators.required, Validators.email]}),
      title: new FormControl(null),
      speciality: new FormControl(null),
      address: new FormControl(null),
      additional_address: new FormControl(null),
      phone: new FormControl(null, Validators.pattern("[0-9]*")),
      other_phone: new FormControl(null, Validators.pattern("[0-9]*")),
      other_phone_note: new FormControl(null),
      picture: new FormControl(null)
    });
  }
  get ctr() {
    return this.infoForm.controls;
  }
  getContact(id) {
    this.contactsService.getContactById(id).subscribe(contact => {
      this.infoForm.patchValue({
        id: contact.id,
        type: contact.contactType,
        name: contact.facilityName,
        last_name: contact.lastName,
        first_name: contact.firstName,
        email: contact.email,
        title: contact.title,
        speciality: contact.speciality ? contact.speciality.id : null,
        address:   contact.address,
        additional_address: contact.additionalAddress,
        phone: contact.phoneNumber,
        other_phone:  contact.otherPhoneNumber,
        other_phone_note:  contact.note,
        picture: contact.photoId
      });
    });
  }
  getAllSpeciality() {
    this.contactsService.getAllSpecialities().subscribe(specialitiesList => {
        this.specialities = specialitiesList;
    });
  }
  submit() {
    this.submitted = true;
    if (this.infoForm.invalid) {
      return;
    }
    const value = this.infoForm.value;
    const contact = {
      id: value.id,
      contactType: value.type,
      facilityName: value.name,
      title: value.title,
      speciality: value.speciality != null ? this.specialities.find(s => s.id == value.speciality) : null,
      firstName: value.first_name,
      lastName: value.last_name,
      phoneNumber: value.phone,
      email : value.email,
      address: value.address,
      additionalAddress: value.additional_address,
      otherPhoneNumber: value.other_phone,
      note: value.other_phone_note
    };
    let successResult = false;
    if (this.param == "add") {
      this.contactsService.addContact(contact).subscribe(res => successResult = res);
    } else {
      this.contactsService.updateContact(contact).subscribe(res => successResult = res);
    }
    this.router.navigate(['features/contacts']).then(() => window.location.reload());
  }
  resetOtherPhone() {
    this.infoForm.patchValue({
      other_phone: null,
      other_phone_note: null
    });
  }
  BackButton() {
    this._location.back();
  }
}
