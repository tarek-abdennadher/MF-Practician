import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { AccountService } from "../services/account.service";
import { ContactsService } from "../services/contacts.service";
import { ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
@Component({
  selector: "app-secretary-detail",
  templateUrl: "./secretary-detail.component.html",
  styleUrls: ["./secretary-detail.component.scss"],
})
export class SecretaryDetailComponent implements OnInit {
  public infoForm: FormGroup;
  public messages: any;
  public labels: any;
  page = "SECRETARIES";
  number = null;
  topText = "Détails du secrétaire";
  bottomText = "";
  backButton = true;
  isPractician = true;
  links = {};
  selectedSecretary: any;
  constructor(
    private accountService: AccountService,
    private contactsService: ContactsService,
    private route: ActivatedRoute,
    private _location: Location
  ) {
    this.messages = this.accountService.messages;
    this.labels = this.contactsService.messages;
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.getSecretary(params["id"]);
    });
  }

  getSecretary(id) {
    this.initInfoForm();
    this.accountService.getAccountById(id).subscribe((value) => {
      this.selectedSecretary = value;
      this.infoForm.patchValue({
        id: value.id,
        sec_id: value.secretary ? value.secretary.id : null,
        last_name: value.secretary ? value.secretary.lastName : "",
        first_name: value.secretary ? value.secretary.firstName : "",
        email: value.email,
        civility: value.secretary ? value.secretary.civility : null,
        phone: value.phoneNumber,
        picture: value.secretary ? value.secretary.photoId : null,
      });
      this.infoForm.disable();
    });
  }
  initInfoForm() {
    this.infoForm = new FormGroup({
      id: new FormControl(null),
      sec_id: new FormControl(null),
      last_name: new FormControl(null),
      first_name: new FormControl(null),
      email: new FormControl(null),
      civility: new FormControl(null),
      phone: new FormControl(),
      picture: new FormControl(null),
    });
  }
  BackButton() {
    this._location.back();
  }
}
