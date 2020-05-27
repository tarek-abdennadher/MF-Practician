import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";
import { AccountService } from "@app/features/services/account.service";
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from "@angular/forms";
import { MustMatch } from "./must-match";
import { Speciality } from "@app/shared/models/speciality";
import { ContactsService } from "@app/features/services/contacts.service";
import { LocalStorageService } from "ngx-webstorage";
import { Subject } from "rxjs";
import { MyDocumentsService } from "@app/features/my-documents/my-documents.service";
import { HttpResponse } from "@angular/common/http";
import { FeaturesService } from "@app/features/features.service";
import { emailValidator } from "@app/core/Validators/email.validator";
import { CategoryService } from '@app/features/services/category.service';
import { MyPatientsService } from '@app/features/services/my-patients.service';
declare var $: any;
@Component({
  selector: "app-personal-informations",
  templateUrl: "./personal-informations.component.html",
  styleUrls: ["./personal-informations.component.scss"],
})
export class PersonalInformationsComponent implements OnInit {
  @Input("isPatientFile") isPatientFile = false;
  @Input("infoPatient") infoPatient: any;
  @Input("practicianId") practicianId;

  specialities: Array<Speciality>;
  isPasswordValid = false;
  errorMessage = "";
  passwordErrorMessage = "";
  successMessage = "";
  public messages: any;
  public labels: any;
  public errors: any;
  submitted = false;
  showAlert = false;
  showPasswordSuccess = false;
  showPasswordFailure = false;
  passwordSubmitted = false;
  otherPhones = new Subject<any[]>();
  addnewPhone = new Subject<boolean>();
  isLabelShow: boolean;
  public infoForm: FormGroup;
  public passwordForm: FormGroup;
  public today = new Date().toISOString().substr(0, 10);
  account: any;
  imageSource = "assets/imgs/user.png";
  password = "";
  public phones = new Array();
  public isPhonesValid = false;
  failureAlert = false;
  image: string | ArrayBuffer;
  hasImage = false;
  nodeId: any;
  mesCategories: any = [];
  updateAlert = false;
  constructor(
    public router: Router,
    public accountService: AccountService,
    private formBuilder: FormBuilder,
    private contactsService: ContactsService,
    private localSt: LocalStorageService,
    private documentService: MyDocumentsService,
    private featureService: FeaturesService,
    private categoryService: CategoryService,
    private patientService: MyPatientsService
  ) {
    this.messages = this.accountService.messages;
    this.labels = this.contactsService.messages;
    this.errors = this.accountService.errors;
    this.formBuilder = formBuilder;
    this.passwordSubmitted = false;
    this.showPasswordSuccess = false;
    this.showPasswordFailure = false;
    this.failureAlert = false;
    this.isLabelShow = false;
  }
  public isPractician = this.localSt.retrieve("role") == "PRACTICIAN";
  ngOnInit(): void {
    this.updateCSS();
    this.passwordSubmitted = false;
    this.getAllSpeciality();
    this.initInfoForm();
    this.initPasswordForm();
    this.getPersonalInfo();
    this.getAttachementFolderId();
    if (this.isPatientFile) {
      this.getMyCategories();
    } else {
    }
  }
  initInfoForm() {
    if (!this.isPatientFile) {
      if (this.isPractician) {
        this.infoForm = new FormGroup({
          id: new FormControl(null),
          last_name: new FormControl(null, Validators.required),
          first_name: new FormControl(null, Validators.required),
          email: new FormControl(null, {
            validators: [Validators.required, emailValidator],
          }),
          title: new FormControl(null, Validators.required),
          speciality: new FormControl(null, Validators.required),
          address: new FormControl(null, Validators.required),
          additional_address: new FormControl(null),
          phone: new FormControl(null, Validators.required),
          picture: new FormControl(null),
          civility: new FormControl(null, Validators.required)
        });
      } else {
        this.infoForm = new FormGroup({
          id: new FormControl(null),
          last_name: new FormControl(null, Validators.required),
          first_name: new FormControl(null, Validators.required),
          email: new FormControl(null, {
            validators: [Validators.required, emailValidator],
          }),
          phone: new FormControl(null, Validators.required),
          picture: new FormControl(null),
          civility: new FormControl(null, Validators.required),
        });
      }
    } else {
      this.infoForm = new FormGroup({
        id: new FormControl(null),
        last_name: new FormControl(null, Validators.required),
        first_name: new FormControl(null, Validators.required),
        email: new FormControl(null, {
          validators: [Validators.required, emailValidator],
        }),
        civility: new FormControl(null, Validators.required),
        birthday: new FormControl(null, Validators.required),
        address: new FormControl(null, Validators.required),
        additional_address: new FormControl(null),
        phone: new FormControl(null, Validators.required),
        picture: new FormControl(null),
        category: new FormControl(null),
      });
    }
    this.updateCSS();
  }
  initPasswordForm() {
    this.passwordForm = this.formBuilder.group(
      {
        new_password: ["", [Validators.required, Validators.minLength(8)]],
        confirm_password: ["", Validators.required],
      },
      {
        validator: MustMatch("new_password", "confirm_password"),
      }
    );
  }
  get ctr() {
    return this.infoForm.controls;
  }
  get f2() {
    return this.passwordForm.controls;
  }
  getAllSpeciality() {
    this.contactsService.getAllSpecialities().subscribe((specialitiesList) => {
      this.specialities = specialitiesList;
    });
  }

  passwordValid(event) {
    this.isPasswordValid = event;
  }
  return() {
    this.router.navigate(["/messagerie"]);
  }
  close() {
    this.showAlert = false;
    this.showPasswordSuccess = false;
    this.showPasswordFailure = false;
  }
  getPersonalInfo() {
    if (this.isPatientFile) {
      this.account = this.infoPatient;
      this.otherPhones.next(this.account.otherPhones);
      if (this.account.photoId) {
        this.hasImage = true;
      }
      this.infoForm.patchValue({
        id: this.account.id ? this.account.id : null,
        email: this.account.email ? this.account.email : "",
        phone: this.account.phoneNumber
          ? this.account.phoneNumber
          : "+33",
        last_name: this.account.lastName ? this.account.lastName : "",
        first_name: this.account.firstName ? this.account.firstName : "",
        civility: this.account.civility ? this.account.civility : null,
        birthday: this.account.birthday
          ? new Date(this.account.birthday)
          : null,
        address: this.account.address ? this.account.address : "",
        additional_address: this.account.additionalAddress
          ? this.account.additionalAddress
          : "",
        otherPhones: this.account.otherPhones ? this.account.otherPhones : [],
        picture: this.account.photoId ? this.account.photoId : null,
        category: this.infoPatient.category ? this.infoPatient.category.id : null,
      });
    } else {
      this.accountService.getCurrentAccount().subscribe((account) => {
        if (account && account.practician) {
          this.account = account.practician;
          this.otherPhones.next(account.otherPhones);
          if (this.account.photoId) {
            this.hasImage = true;
            this.getPictureProfile(this.account.photoId);
          } else {
            this.image = "assets/imgs/avatar_docteur.svg";
          }
          this.infoForm.patchValue({
            id: account.practician.id ? account.practician.id : null,
            email: account.email ? account.email : "",
            phone: account.phoneNumber ? account.phoneNumber : "+33",
            last_name: account.practician.lastName
              ? account.practician.lastName
              : "",
            first_name: account.practician.firstName
              ? account.practician.firstName
              : "",
            title: account.practician.jobTitle
              ? account.practician.jobTitle
              : null,
            civility: account.practician.civility
              ? account.practician.civility
              : null,
            speciality: account.practician.speciality
              ? account.practician.speciality.id
              : null,
            address: account.practician.address
              ? account.practician.address
              : "",
            additional_address: account.practician.additionalAddress
              ? account.practician.additionalAddress
              : "",
            otherPhones: account.otherPhones ? account.otherPhones : [],
            picture: account.practician.photoId
              ? account.practician.photoId
              : null,
          });
        } else if (account && account.secretary) {
          this.account = account.secretary;
          this.otherPhones.next(account.otherPhones);
          if (this.account.photoId) {
            this.hasImage = true;
            this.getPictureProfile(this.account.photoId);
          } else {
            this.image = "assets/imgs/avatar_secrétaire.svg";
          }
          this.infoForm.patchValue({
            id: account.secretary.id ? account.secretary.id : null,
            email: account.email ? account.email : "",
            phone: account.phoneNumber ? account.phoneNumber : "+33",
            last_name: account.secretary.lastName
              ? account.secretary.lastName
              : "",
            first_name: account.secretary.firstName
              ? account.secretary.firstName
              : "",
            civility: account.secretary.civility
              ? account.secretary.civility
              : null,
            otherPhones: account.otherPhones ? account.otherPhones : [],
          });
        }
      });
    }
    if (this.account?.otherPhones) {
      this.isLabelShow = true;
    }
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
    if (this.isPractician) {
      model = {
        email: this.infoForm.value.email,
        phoneNumber: this.infoForm.value.phone,
        otherPhones: this.phones,
        practician: {
          id: this.infoForm.value.id,
          civility: this.infoForm.value.civility,
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
          additionalAddress: this.infoForm.value.additional_address,
          photoId: this.account.photoId,
        },
      };
    } else {
      model = {
        email: this.infoForm.value.email,
        phoneNumber: this.infoForm.value.phone,
        otherPhones: this.phones,
        secretary: {
          id: this.infoForm.value.id,
          firstName: this.infoForm.value.first_name,
          lastName: this.infoForm.value.last_name,
          civility: this.infoForm.value.civility,
          photoId: this.account.photoId,
        },
      };
    }

    this.accountService.updateAccount(model).subscribe((res) => {
      this.showAlert = true;
      $(".alert").alert();
      this.submitted = false;
      if (this.image) {
        this.featureService.imageSource = this.image;
      } else {
        this.featureService.imageSource = "assets/imgs/user.png";
      }
    });
  }
  resetPasswordSubmit() {
    this.passwordSubmitted = true;
    if (this.passwordForm.invalid || !this.isPasswordValid) {
      return;
    }
    this.accountService
      .updatePasswordV2(this.passwordForm.value.new_password)
      .subscribe(this.handleResponsePasswordUpdate, this.handleError);
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
        this.image = "assets/imgs/user.png";
      }
    );
  }

  // Select file to upload
  selectFileToUpload(event) {
    let selectedFiles = event.target.files;
    const fileName = selectedFiles.item(0).name;

    if (selectedFiles) {
      const currentFileUpload = selectedFiles.item(0);
      this.documentService
        .uploadFileSelected(this.nodeId, currentFileUpload)
        .subscribe((event) => {
          if (event.body) {
            const bodySplited = event.body.toString().split("/");
            this.account.photoId = bodySplited[bodySplited.length - 1];
            this.hasImage = true;
          }
          if (event instanceof HttpResponse) {
            const file = selectedFiles[0];
            let myReader: FileReader = new FileReader();
            myReader.onloadend = (e) => {
              this.image = myReader.result;
            };
            myReader.readAsDataURL(file);
            selectedFiles = undefined;
          }
        });
    }
  }

  getAttachementFolderId() {
    this.documentService
      .getSiteById("helssycoreapplication")
      .subscribe((directory) => {
        const guid = directory.entry.guid;
        this.documentService.getAllChildFolders(guid).subscribe((data) => {
          const profilAttachementFolder = data.list.entries.filter(
            (directory) => directory.entry.name === "Profiles Pictures"
          )[0].entry;
          this.nodeId = profilAttachementFolder.id;
        });
      });
  }

  deletePicture() {
    this.image = null;
    this.account.photoId = null;
    this.hasImage = false;
  }
  handleError = (err) => {
    if (err && err.error && err.error.apierror) {
      this.passwordErrorMessage = err.error.apierror.message;
      this.showPasswordFailure = true;
      $("#alertPasswordFailure").alert();
    } else {
      throw err;
    }
  };
  handleResponsePasswordUpdate = (response) => {
    if (response) {
      this.showPasswordSuccess = true;
      $("#alertPasswordSuccess").alert();
      this.passwordForm.patchValue({
        new_password: "",
        confirm_password: "",
      });
      this.isPasswordValid = false;
      this.initPasswordForm();
      this.passwordForm.setErrors(null);
      this.passwordSubmitted = false;
    } else {
      this.passwordErrorMessage = this.accountService.messages.edit_password_failure;
      this.showPasswordFailure = true;
      $("#alertPasswordFailure").alert();
    }
  };

  updateCSS() {
    if (!this.isPatientFile) {
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
    } else {
      $(document).ready(function () {
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
  addPhone() {
    this.addnewPhone.next(true);
    this.isLabelShow = true;
  }

  updatePatientFile() {
    this.submitted = true;
    let patientFile;
    if (this.isPractician) {
      patientFile = {
        patientId: this.infoPatient.id,
        category: this.mesCategories.find(cat => cat.id == this.infoForm.value.category),
      }
    } else {
      patientFile = {
        patientId: this.infoPatient.id,
        practicianId: this.practicianId,
        category: this.mesCategories.find(cat => cat.id == this.infoForm.value.category),
      }
    }

    this.patientService.updatePatientFile(patientFile).subscribe(result => {
      this.showAlert = true;
      $(".alert").alert();
      this.submitted = false;
    }, error => {
      this.updateAlert = true;
      $("#FailureAlert").alert();
      return;
    });
  }

  getMyCategories() {
    if (this.practicianId) {
      this.categoryService.getCategoriesByPractician(this.practicianId).subscribe((categories) => {
        this.mesCategories = categories;
      });
    } else {
      this.categoryService.getMyCategories().subscribe((categories) => {
        this.mesCategories = categories;
      });
    }

  }


}
