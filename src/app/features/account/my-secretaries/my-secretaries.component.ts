import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
} from "@angular/forms";
import { Router } from "@angular/router";
import { AccountService } from "@app/features/services/account.service";
import { ContactsService } from "@app/features/services/contacts.service";
import { DialogService } from "@app/features/services/dialog.service";
import { MyDocumentsService } from '@app/features/my-documents/my-documents.service';
import { GlobalService } from '@app/core/services/global.service';
import { FeaturesService } from '@app/features/features.service';
declare var $: any;
@Component({
  selector: "app-my-secretaries",
  templateUrl: "./my-secretaries.component.html",
  styleUrls: ["./my-secretaries.component.scss"],
})
export class MySecretariesComponent implements OnInit {
  selectedSecretary: number = null;
  isList = true;
  isEdit: boolean;
  users: Array<any>;
  errorMessage = "";
  successMessage = "";
  public messages: any;
  public labels: any;
  public errors: any;
  submitted = false;
  isLabelShow: boolean;
  image: string | ArrayBuffer;
  imageSource; string;
  avatars: { doctor: string; child: string; women: string; man: string; secretary: string; user: string; };
  itemsList: Array<any> = [];
  constructor(
    public router: Router,
    public accountService: AccountService,
    private contactsService: ContactsService,
    private dialogService: DialogService,
    private documentService: MyDocumentsService,
    private formBuilder: FormBuilder,
    private globalService: GlobalService,
    private featureService: FeaturesService,

  ) {
    this.messages = this.accountService.messages;
    this.labels = this.contactsService.messages;
    this.errors = this.accountService.errors;
    this.isLabelShow = false;
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.secretary;

  }

  ngOnInit(): void {
    this.getMySecretaries();
    this.featureService.setIsMessaging(false);
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
          img: this.avatars.secretary,
          type: "SECRETARY",
        },
      ],
      isArchieve: false,
      isImportant: false,
      hasFiles: false,
      isViewDetail: false,
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
            user.img = this.avatars.secretary;
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
        this.image = this.avatars.secretary;
      }
    );
  }
  cardClicked(item) {
    this.selectedSecretary = item.id;
  }
}
