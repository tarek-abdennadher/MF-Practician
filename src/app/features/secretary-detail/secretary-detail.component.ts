import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from "@angular/forms";
import { AccountService } from "../services/account.service";
import { ContactsService } from "../services/contacts.service";
import { ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { MyDocumentsService } from '../my-documents/my-documents.service';
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
  image: string | ArrayBuffer;
  hasImage = false;
  isLabelShow: boolean;
  constructor(
    private accountService: AccountService,
    private contactsService: ContactsService,
    private route: ActivatedRoute,
    private _location: Location,
    private documentService: MyDocumentsService,
    private formBuilder: FormBuilder
  ) {
    this.messages = this.accountService.messages;
    this.labels = this.contactsService.messages;
    this.isLabelShow = false;
  }
  get phoneList() {
    return <FormArray>this.infoForm.get("otherPhones");
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.getSecretary(params["id"]);
    });
  }
  initInfoForm() {
    this.updateCSS();
    this.infoForm = new FormGroup({
      id: new FormControl(null),
      sec_id: new FormControl(null),
      last_name: new FormControl(null),
      first_name: new FormControl(null),
      email: new FormControl(null),
      civility: new FormControl(null),
      phone: new FormControl(),
      picture: new FormControl(null),
      otherPhones: this.formBuilder.array([])
    });
  }
  updatePhone(p): FormGroup {
    this.updateCSS();
    return this.formBuilder.group({
      id: [p.id ? p.id : null],
      phoneNumber: [p.phoneNumber ? p.phoneNumber : ""],
      note: [p.note ? p.note : null]
    });
  }

  getSecretary(id) {
    this.initInfoForm();
    this.accountService.getAccountById(id).subscribe((value) => {
      this.selectedSecretary = value;
      if (value.secretary.photoId) {
        this.hasImage = true;
        this.getPictureProfile(value.secretary.photoId);
      }
      if (this.selectedSecretary?.otherPhones && this.selectedSecretary?.otherPhones.length != 0) {
        this.updateCSS();
        this.isLabelShow = true;
        this.selectedSecretary.otherPhones.forEach(p =>
          this.phoneList.push(this.updatePhone(p)));
      }
      this.infoForm.patchValue({
        id: value.id,
        sec_id: value.secretary ? value.secretary.id : null,
        last_name: value.secretary ? value.secretary.lastName : "",
        first_name: value.secretary ? value.secretary.firstName : "",
        email: value.email,
        civility: value.secretary ? value.secretary.civility : null,
        phone: value.phoneNumber,
        picture: value.secretary ? value.secretary.photoId : null,
        otherPhones: value.secretary.otherPhones ? this.phoneList : []
      });
      this.bottomText = value.secretary.firstName + " " + value.secretary.lastName;
      this.infoForm.disable();
    });
  }
  BackButton() {
    this._location.back();
  }
  // initialise profile picture
  getPictureProfile(nodeId) {
    this.documentService.downloadFile(nodeId).subscribe(
      (response) => {
        let myReader: FileReader = new FileReader();
        myReader.onloadend = (e) => {
          this.image = myReader.result;
        };
        let ok = myReader.readAsDataURL(response.body);
      },
      (error) => {
        this.image = "assets/imgs/avatar_secrétaire.svg";
      }
    );
  }
  updateCSS() {
    $(document).ready(function () {
      $("input").prop("disabled", true);
      $(".form-control").each(function () {
        $(this).css("background", "#F1F1F1");
        $(this).css("border-color", "#F1F1F1");
        $(this).css("pointer-events", "none");
      });
      $(".dropbtn.btn").each(function () {
        $(this).css("background", "#F1F1F1");
        $(this).css("border-color", "#F1F1F1");
        $(this).css("padding", "8px");
        $(this).css("pointer-events", "none");
      });
      $(".arrow-down").each(function () {
        $(this).css("background", "#F1F1F1");
        $(this).css("border", "0px");
      });
    });
  }

}
