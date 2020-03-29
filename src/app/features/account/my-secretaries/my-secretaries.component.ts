import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '@app/features/services/account.service';
import { ContactsService } from '@app/features/services/contacts.service';
declare var $: any;
@Component({
  selector: 'app-my-secretaries',
  templateUrl: './my-secretaries.component.html',
  styleUrls: ['./my-secretaries.component.scss']
})
export class MySecretariesComponent implements OnInit {
  users: Array<any>;
  errorMessage = "";
  successMessage = "";
  public messages: any;
  public labels: any;
  public errors: any;
  submitted = false;
  showAlert = false;
  public infoForm: FormGroup;
  itemsList: Array<any> = [];
  imageSource = "assets/imgs/user.png";
  constructor(public router: Router,
              public accountService: AccountService,
              private contactsService: ContactsService) {
    this.messages = this.accountService.messages;
    this.labels = this.contactsService.messages;
    this.errors = this.accountService.errors;
   }

  ngOnInit(): void {
    this.initInfoForm();
    this.getMySecretaries();
  }
  initInfoForm() {
    this.infoForm = new FormGroup({
      last_name: new FormControl(null, Validators.required),
      first_name: new FormControl(null, Validators.required),
      email: new FormControl(null, {validators: [Validators.required, Validators.email]}),
      civility: new FormControl(null, Validators.required),
      phone: new FormControl(null, {validators: [Validators.required, Validators.pattern("[0-9]*")]}),
      picture: new FormControl(null)
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
    if (this.infoForm.invalid) {
      return;
    }
    const model = {
        email: this.infoForm.value.email,
        phoneNumber: this.infoForm.value.phone,
        firstName: this.infoForm.value.first_name,
        lastName: this.infoForm.value.last_name,
        photoId: this.infoForm.value.picture,
        civility: this.infoForm.value.civility,
    };
    this.accountService.addSecretary(model).subscribe(res => {
      this.showAlert = true;
      this.initInfoForm();
      $('.alert').alert();
      this.submitted = false;
      this.getMySecretaries();
    });
  }
  return() {
    this.router.navigate(['/features/messageries']);
  }
  getMySecretaries(){
    this.accountService.getMySecretaries().subscribe(contacts => {
      this.users = contacts;
      this.itemsList = this.users.map(elm => {
        return {
          id: elm.id,
          isSeen: true,
          users: [{
            id: elm.id,
            fullName: elm.fullName,
            img: "assets/imgs/IMG_3944.jpg",
            title: "Sc",
            type: "MEDICAL"
          }],
          isImportant: false,
          hasFiles: false,
          isViewDetail: false,
          isMarkAsSeen: false,
          isChecked: false
        };
      });
  },
  error => {
    console.log("error");
  }
  );
  }
  cardClicked(event){}
 selectItem(event){}
 deleteActionClicked(){}

}
