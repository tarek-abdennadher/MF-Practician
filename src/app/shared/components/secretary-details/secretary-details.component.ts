import { Component, OnInit, Input } from "@angular/core";
import { FormGroup, FormBuilder, FormArray, FormControl } from "@angular/forms";
import { AccountService } from "@app/features/services/account.service";
import { ContactsService } from "@app/features/services/contacts.service";
import { Router, ActivatedRoute } from "@angular/router";
import { MyDocumentsService } from "@app/features/my-documents/my-documents.service";
import { GlobalService } from "@app/core/services/global.service";
import { FeaturesService } from "@app/features/features.service";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";

@Component({
  selector: "app-secretary-details",
  templateUrl: "./secretary-details.component.html",
  styleUrls: ["./secretary-details.component.scss"]
})
export class SecretaryDetailsComponent implements OnInit {
  public infoForm: FormGroup;
  public messages: any;
  public labels: any;
  isPractician = true;
  links = {};
  selectedSecretary: any;
  image: string | ArrayBuffer | SafeUrl;
  hasImage = false;
  isLabelShow: boolean;
  avatars: {
    doctor: string;
    child: string;
    women: string;
    man: string;
    secretary: string;
    user: string;
  };
  constructor(
    private accountService: AccountService,
    private contactsService: ContactsService,
    public router: Router,
    private route: ActivatedRoute,
    private documentService: MyDocumentsService,
    private formBuilder: FormBuilder,
    private globalService: GlobalService,
    private featureService: FeaturesService,
    private sanitizer: DomSanitizer
  ) {
    this.messages = this.accountService.messages;
    this.labels = this.contactsService.messages;
    this.isLabelShow = false;
    this.avatars = this.globalService.avatars;
  }
  get phoneList() {
    return <FormArray>this.infoForm.get("otherPhones");
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.getSecretary(params["id"]);
    });
    this.featureService.setIsMessaging(false);
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
      otherPhones: this.formBuilder.array([])
    });
  }

  updatePhone(p): FormGroup {
    return this.formBuilder.group({
      id: [p.id ? p.id : null],
      phoneNumber: [p.phoneNumber ? p.phoneNumber : ""],
      note: [p.note ? p.note : null]
    });
  }

  getSecretary(id) {
    this.initInfoForm();
    this.accountService.getAccountById(id).subscribe(value => {
      this.selectedSecretary = value;
      this.hasImage = true;
      this.getPictureProfile(value.id);

      if (
        this.selectedSecretary?.otherPhones &&
        this.selectedSecretary?.otherPhones.length != 0
      ) {
        this.isLabelShow = true;
        this.selectedSecretary.otherPhones.forEach(p =>
          this.phoneList.push(this.updatePhone(p))
        );
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
      this.infoForm.disable();
    });
  }
  // initialise profile picture
  getPictureProfile(id) {
    this.documentService.getDefaultImage(id).subscribe(
      response => {
        let myReader: FileReader = new FileReader();
        myReader.onloadend = e => {
          this.image = this.sanitizer.bypassSecurityTrustUrl(
            myReader.result as string
          );
        };
        let ok = myReader.readAsDataURL(response);
      },
      error => {
        this.image = this.avatars.secretary;
      }
    );
  }
}
