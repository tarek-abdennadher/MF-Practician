import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '@app/features/services/account.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MustMatch } from './must-match';
import { Speciality } from '@app/shared/models/speciality';
import { ContactsService } from '@app/features/services/contacts.service';
declare var $: any;
@Component({
  selector: 'app-personal-informations',
  templateUrl: './personal-informations.component.html',
  styleUrls: ['./personal-informations.component.scss']
})
export class PersonalInformationsComponent implements OnInit {
  specialities: Array<Speciality>;
  isPasswordValid = false;
  errorMessage = "";
  successMessage = "";
  public messages: any;
  public labels: any;
  public errors: any;
  submitted = false;
  showAlert = false;
  showPasswordSuccess = false;
  showPasswordFailure = false;
  passwordSubmitted = false;
  public infoForm: FormGroup;
  public passwordForm: FormGroup;
  public today = new Date().toISOString().substr(0, 10);
  account: any;
  imageSource = "assets/imgs/user.png";
  password = '';
  constructor(public router: Router,
              public accountService: AccountService,
              private formBuilder: FormBuilder,
              private contactsService: ContactsService) {
    this.messages = this.accountService.messages;
    this.labels = this.contactsService.messages;
    this.errors = this.accountService.errors;
    this.formBuilder = formBuilder;
    this.passwordSubmitted = false;
    this.showPasswordSuccess = false;
    this.showPasswordFailure = false;
  }

  ngOnInit(): void {
    this.passwordSubmitted = false;
    this.getAllSpeciality();
    this.initInfoForm();
    this.initPasswordForm();
    this.getPersonalInfo();
  }
  initInfoForm() {
    this.infoForm = new FormGroup({
      id: new FormControl(null),
      last_name: new FormControl(null, Validators.required),
      first_name: new FormControl(null, Validators.required),
      email: new FormControl(null, {validators: [Validators.required, Validators.email]}),
      title: new FormControl(null, Validators.required),
      speciality: new FormControl(null, Validators.required),
      address: new FormControl(null, Validators.required),
      additional_address: new FormControl(null),
      phone: new FormControl(null,{validators: [Validators.required, Validators.pattern("[0-9]*")]}),
      other_phone: new FormControl(null, Validators.pattern("[0-9]*")),
      other_phone_note: new FormControl(null),
      picture: new FormControl(null)
    });
  }
  initPasswordForm() {
    this.passwordForm = this.formBuilder.group({
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', Validators.required]
    }, {
      validator: MustMatch('new_password', 'confirm_password')
    });
  }
  get ctr() {
    return this.infoForm.controls;
  }
  get f2() { return this.passwordForm.controls; }
  getAllSpeciality() {
    this.contactsService.getAllSpecialities().subscribe(specialitiesList => {
        this.specialities = specialitiesList;
    });
  }
  resetOtherPhone() {
    this.infoForm.patchValue({
      other_phone: null,
      other_phone_note: null
    });
  }
  passwordValid(event) {
    this.isPasswordValid = event;
  }
  return() {
    this.router.navigate(['/features/list']);
  }
  close() {
    this.showAlert = false;
    this.showPasswordSuccess = false;
  }
  getPersonalInfo() {
    this.accountService.getCurrentAccount().subscribe(account => {
      if (account && account.practician) {
        this.account = account.practician;
        this.infoForm.patchValue({
          id: account.practician.id ? account.practician.id : null,
          email: account.email ? account.email : '',
          phone: account.phoneNumber ? account.phoneNumber : '',
          last_name:  account.practician.lastName ? account.practician.lastName : '',
          first_name: account.practician.firstName ? account.practician.firstName : '',
          title: account.practician.jobTitle ? account.practician.jobTitle : null,
          speciality: account.practician.speciality ? account.practician.speciality.id : null,
          address: account.practician.address ? account.practician.address : '',
          additional_address: account.practician.additionalAddress ? account.practician.additionalAddress : '',
          other_phone: account.practician.otherPhoneNumber ? account.practician.otherPhoneNumber : '',
          other_phone_note: account.practician.note ? account.practician.note : '',
          picture: account.practician.photoId ? account.practician.photoId : null,
        });
      }
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
        id: this.infoForm.value.id,
        firstName: this.infoForm.value.first_name,
        lastName: this.infoForm.value.last_name,
        jobTitle: this.infoForm.value.title,
        speciality: this.infoForm.value.speciality != null ? this.specialities.find(s => s.id == this.infoForm.value.speciality) : null,
        address: this.infoForm.value.address,
        photoId: this.infoForm.value.picture,
        additionalAddress: this.infoForm.value.additional_address,
        otherPhoneNumber: this.infoForm.value.other_phone,
        note: this.infoForm.value.other_phone_note
      }
    };
    this.accountService.updateAccount(model).subscribe(res => {
      this.showAlert = true;
      $('.alert').alert();
      this.submitted = false;
    });
  }
  resetPasswordSubmit() {
    this.passwordSubmitted = true;
    if (this.passwordForm.invalid && !this.isPasswordValid) {
      return;
    }
    this.accountService.updatePassword(this.passwordForm.value.new_password).subscribe(res => {
      if (res) {
        this.showPasswordSuccess = true;
        $('#alertPasswordSuccess').alert();
        this.passwordForm.patchValue({
          new_password: '',
          confirm_password: ''
        });
        this.isPasswordValid = false;
        this.initPasswordForm();
        this.passwordForm.setErrors(null);
        this.passwordSubmitted = false;
      } else {
        this.showPasswordFailure = true;
        $('#alertPasswordFailure').alert();
      }
    });
  }
}
