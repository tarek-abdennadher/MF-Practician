import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  FormArray,
} from "@angular/forms";
import { Router } from "@angular/router";
import { AccountService } from "@app/features/services/account.service";
import { ContactsService } from "@app/features/services/contacts.service";
import { DialogService } from "@app/features/services/dialog.service";
import { emailValidator } from "@app/core/Validators/email.validator";
import { Subject } from 'rxjs';
import { MyDocumentsService } from '@app/features/my-documents/my-documents.service';
declare var $: any;
@Component({
  selector: "app-my-secretaries",
  templateUrl: "./my-secretaries.component.html",
  styleUrls: ["./my-secretaries.component.scss"],
})
export class MySecretariesComponent implements OnInit {
  selectedSecretary: any;
  isList = true;
  isEdit: boolean;
  users: Array<any>;
  errorMessage = "";
  successMessage = "";
  public messages: any;
  public labels: any;
  public errors: any;
  submitted = false;
  showAlert = false;
  hasImage = false;
  public infoForm: FormGroup;
  public phoneForm: FormGroup;
  itemsList: Array<any> = [];
  isLabelShow: boolean;
  public otherPhones = FormArray;
  image: string | ArrayBuffer;
  imageSource = "assets/imgs/avatar_secrétaire.svg";
  constructor(
    public router: Router,
    public accountService: AccountService,
    private contactsService: ContactsService,
    private dialogService: DialogService,
    private documentService: MyDocumentsService,
    private formBuilder: FormBuilder
  ) {
    this.messages = this.accountService.messages;
    this.labels = this.contactsService.messages;
    this.errors = this.accountService.errors;
    this.isLabelShow = false;
  }

  get ctr() {
    return this.infoForm.controls;
  }
  get phoneList() {
    return <FormArray>this.infoForm.get("otherPhones");
  }
  ngOnInit(): void {
    this.initInfoForm();
    this.getMySecretaries();
  }

  initInfoForm() {
    this.updateCSS();
    this.infoForm = new FormGroup({
      id: new FormControl(null),
      sec_id: new FormControl(null),
      last_name: new FormControl(null, Validators.required),
      first_name: new FormControl(null, Validators.required),
      email: new FormControl(null, {
        validators: [Validators.required, emailValidator],
      }),
      civility: new FormControl(null, Validators.required),
      phone: new FormControl(null, Validators.required),
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
  close() {
    this.showAlert = false;
  }
  addSecretaryButton() {
    this.infoForm.reset();
    this.initInfoForm();
    this.isEdit = false;
    this.isList = !this.isList;
  }
  cancelAddSecretaryButton() {
    this.isList = true;
  }
  submit() {
    this.submitted = true;
    if (this.infoForm.invalid) {
      return;
    }

    if (!this.isEdit) {
      const model = {
        email: this.infoForm.value.email,
        phoneNumber: this.infoForm.value.phone,
        firstName: this.infoForm.value.first_name,
        lastName: this.infoForm.value.last_name,
        photoId: this.infoForm.value.picture,
        civility: this.infoForm.value.civility,
      };
      this.accountService.addSecretary(model).subscribe((res) => {
        this.showAlert = true;
        this.initInfoForm();
        $(".alert").alert();
        this.submitted = false;
        this.isList = true;
        this.getMySecretaries();
      });
    } else {
      const model = {
        id: this.infoForm.value.id,
        email: this.infoForm.value.email,
        phoneNumber: this.infoForm.value.phone,
        secretary: {
          id: this.infoForm.value.sec_id,
          firstName: this.infoForm.value.first_name,
          lastName: this.infoForm.value.last_name,
          photoId: this.infoForm.value.picture,
          civility: this.infoForm.value.civility,
        },
      };
      this.accountService.updateSecretaryAccount(model).subscribe((res) => {
        this.showAlert = true;
        this.initInfoForm();
        $(".alert").alert();
        this.submitted = false;
        this.isList = true;
        this.getMySecretaries();
      });
    }
  }
  return() {
    this.router.navigate(["/messagerie"]);
  }
  getMySecretaries() {
    this.accountService.getMySecretaries().subscribe(
      (contacts) => {
        this.users = contacts;
        this.itemsList = this.users.map((elm) => this.parseSec(elm));
      },
      (error) => {
        console.log("error");
      }
    );
  }
  parseSec(sec): any {
    let parsedSec = {
      id: sec.id,
      isSeen: true,
      users: [
        {
          id: sec.id,
          fullName: sec.fullName,
          img: "assets/imgs/avatar_secrétaire.svg",
          type: "SECRETARY",
        },
      ],
      isArchieve: true,
      isImportant: false,
      hasFiles: false,
      isViewDetail: true,
      isMarkAsSeen: false,
      isChecked: false,
      photoId: sec.photoId,
    };
    if (parsedSec.photoId) {
      parsedSec.users.forEach((user) => {
        this.documentService.downloadFile(parsedSec.photoId).subscribe(
          (response) => {
            let myReader: FileReader = new FileReader();
            myReader.onloadend = (e) => {
              user.img = myReader.result.toString();
            };
            let ok = myReader.readAsDataURL(response.body);
          },
          (error) => {
            user.img = "assets/imgs/avatar_secrétaire.svg";
          }
        );
      });
    }
    return parsedSec;
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
  cardClicked(item) {
    this.accountService.getAccountById(item.id).subscribe((value) => {
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
      this.updateCSS();
      this.infoForm.disable();
      this.isEdit = true;
      this.isList = false;
    });
  }
  selectItem(event) { }
  deleteActionClicked() { }

  deleteSecretary(item) {
    this.selectedSecretary = item;
    this.dialogService
      .openConfirmDialog(
        this.labels.delete_sec_confirm,
        this.labels.delete_sec_title
      )
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.accountService
            .detachSecretaryFronAccount(this.selectedSecretary.id)
            .subscribe((resp) => {
              this.getMySecretaries();
            });
        }
      });
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
        $(this).attr("disabled", true);
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
