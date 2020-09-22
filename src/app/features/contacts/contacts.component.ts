import { Component, OnInit, ViewChild } from "@angular/core";
import { ContactsService } from "../services/contacts.service";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { Speciality } from "@app/shared/models/speciality";
import { Location } from "@angular/common";
import { AccountService } from "../services/account.service";
import { LocalStorageService } from "ngx-webstorage";
import { MyDocumentsService } from "../my-documents/my-documents.service";
import { NotifierService } from "angular-notifier";
import { GlobalService } from "@app/core/services/global.service";
import { FeaturesService } from "../features.service";
import { DomSanitizer } from "@angular/platform-browser";
import { NewMessageWidgetService } from "../new-message-widget/new-message-widget.service";
import { DialogService } from "../services/dialog.service";
@Component({
  selector: "app-contacts",
  templateUrl: "./contacts.component.html",
  styleUrls: ["./contacts.component.scss"],
})
export class ContactsComponent implements OnInit {
  specialities: Array<Speciality>;
  users: Array<any> = new Array<any>();
  itemsList: Array<any> = new Array<any>();
  filtredItemsList: Array<any> = new Array<any>();
  types: Array<string> = [];
  imageSource: string;
  links = {
    isTypeFilter: true,
    isAdd: this.localSt.retrieve("role") == "PRACTICIAN",
  };
  selectedObjects: Array<any>;
  topText = "Mes contacts Pros";
  addText = "Parrainer un confrère";
  page = "MY_PRACTICIANS";
  backButton = true;
  number = 0;
  @ViewChild("customNotification", { static: true }) customNotificationTmpl;
  private readonly notifier: NotifierService;
  avatars: {
    doctor: string;
    child: string;
    women: string;
    man: string;
    secretary: string;
    user: string;
  };
  constructor(
    public accountService: AccountService,
    private _location: Location,
    private route: ActivatedRoute,
    notifierService: NotifierService,
    private router: Router,
    private contactsService: ContactsService,
    private localSt: LocalStorageService,
    private documentService: MyDocumentsService,
    private globalService: GlobalService,
    private featureService: FeaturesService,
    private sanitizer: DomSanitizer,
    private messageWidgetService: NewMessageWidgetService,
    private dialogService: DialogService
  ) {
    this.notifier = notifierService;
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.user;
  }
  userRole = this.localSt.retrieve("role");
  ngOnInit(): void {
    this.featureService.setActiveChild("practician");
    this.itemsList = new Array();
    this.filtredItemsList = new Array();
    this.types = new Array();
    this.getAllSpeciality();
    if (this.userRole == "PRACTICIAN") {
      this.getAllContacts();
    } else if (this.userRole == "SECRETARY") {
      this.getAllContactsForSecretary();
    }

    this.featureService.setIsMessaging(false);
  }

  getAllContactsForSecretary() {
    this.contactsService.getContactsProForSecretary().subscribe(
      (contacts) => {
        this.users = contacts;
        this.itemsList = this.users.map((elm) => {
          return {
            id: elm.id,
            practicianId: elm.entityId,
            isSeen: true,
            users: [
              {
                id: elm.id,
                fullName: elm.fullName,
                img: this.avatars.user,
                title: elm.speciality ? elm.speciality : elm.title,
                type: "MEDICAL",
                speciality: elm.speciality ? elm.speciality : "Tout",
              },
            ],
            isArchieve: false,
            isImportant: false,
            hasFiles: false,
            isViewDetail: false,
            isMarkAsSeen: false,
            isChecked: false,
            photoId: elm.photoId,
          };
        });
        this.number = this.itemsList.length;
        this.filtredItemsList = this.itemsList;
        this.itemsList.forEach((item) => {
          item.users.forEach((user) => {
            this.documentService
              .getDefaultImageEntity(user.id, "ACCOUNT")
              .subscribe(
                (response) => {
                  let myReader: FileReader = new FileReader();
                  myReader.onloadend = (e) => {
                    user.img = this.sanitizer.bypassSecurityTrustUrl(
                      myReader.result as string
                    );
                  };
                  let ok = myReader.readAsDataURL(response);
                },
                (error) => {
                  user.img = this.avatars.user;
                }
              );
          });
        });
      },
      (error) => {
        console.log("en attendant un model de popup à afficher");
      }
    );
  }
  getAllContacts() {
    this.contactsService.getContactsPro().subscribe(
      (contacts) => {
        this.users = contacts;
        this.itemsList = this.users.map((elm) => {
          return {
            id: elm.id,
            practicianId: elm.entityId,
            isSeen: true,
            users: [
              {
                id: elm.id,
                fullName: elm.fullName,
                img: this.avatars.user,
                title: elm.speciality ? elm.speciality : elm.title,
                type: "MEDICAL",
                speciality: elm.speciality ? elm.speciality : "Tout",
              },
            ],
            isArchieve: true,
            isImportant: false,
            hasFiles: false,
            isViewDetail: false,
            isMarkAsSeen: false,
            isContact: true,
            isChecked: false,
            photoId: elm.photoId,
          };
        });
        this.number = this.itemsList.length;
        this.filtredItemsList = this.itemsList;
        this.itemsList.forEach((item) => {
          item.users.forEach((user) => {
            this.documentService
              .getDefaultImageEntity(user.id, "ACCOUNT")
              .subscribe(
                (response) => {
                  let myReader: FileReader = new FileReader();
                  myReader.onloadend = (e) => {
                    user.img = this.sanitizer.bypassSecurityTrustUrl(
                      myReader.result as string
                    );
                  };
                  let ok = myReader.readAsDataURL(response);
                },
                (error) => {
                  user.img = this.avatars.user;
                }
              );
          });
        });
      },
      (error) => {
        console.log("en attendant un model de popup à afficher");
      }
    );
  }
  listFilter(value: string) {
    this.filtredItemsList =
      value != "Tout" ? this.performFilter(value) : this.itemsList;
  }

  performFilter(filterBy: string) {
    return this.itemsList.filter((item) =>
      item.users[0].speciality.includes(filterBy)
    );
  }

  selectAllActionClicked() {
    this.itemsList.forEach((a) => {
      a.isChecked = true;
    });
  }
  deselectAllActionClicked() {
    this.itemsList.forEach((a) => {
      a.isChecked = false;
    });
  }
  deleteActionClicked() {
    this.dialogService
      .openConfirmDialog(
        this.globalService.messagesDisplayScreen.delete_confirmation_contact,
        "Suppression"
      )
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          const practicianIds = [];
          this.itemsList.forEach((a) => {
            if (a.isChecked) {
              practicianIds.push(a.id);
            }
          });
          if (practicianIds.length > 0) {
            this.contactsService
              .deleteMultiplePracticianContactPro(practicianIds)
              .subscribe((res) => {
                this.deleteItemFromList(practicianIds);
              });
          }
        }
      });
  }

  cardClicked(item) {
    jQuery([document.documentElement, document.body]).animate(
      { scrollTop: $("#contactPro").offset().top },
      1000
    );
    this.router.navigate([
      "mes-contacts-pro/praticien-detail/" + item.practicianId,
    ]);
  }
  markAsSeenClicked(item) {
    this.messageWidgetService.toggleObs.next(item.id);
  }
  archieveClicked(event) {
    this.dialogService
      .openConfirmDialog(
        this.globalService.messagesDisplayScreen.delete_confirmation_contact,
        "Suppression"
      )
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          const practicianIds = [];
          practicianIds.push(event.id);
          if (practicianIds.length > 0) {
            this.contactsService
              .deleteMultiplePracticianContactPro(practicianIds)
              .subscribe((res) => {
                this.deleteItemFromList(practicianIds);
              });
          }
        }
      });
  }
  getAllSpeciality() {
    this.contactsService.getAllSpecialities().subscribe(
      (specialitiesList) => {
        this.specialities = specialitiesList;
        this.types = this.specialities.map((s) => s.name);
        this.types.unshift("Tout");
      },
      (error) => {
        console.log("en attendant un model de popup à afficher");
      }
    );
  }
  addContact() {
    jQuery([document.documentElement, document.body]).animate(
      { scrollTop: $("#contactPro").offset().top },
      1000
    );
    this.router.navigate(["mes-contacts-pro/invitation"]);
  }
  selectItem(event) {
    this.selectedObjects = event.filter((a) => a.isChecked == true);
  }
  BackButton() {
    this._location.back();
  }
  deleteItemFromList(ids) {
    if (ids && ids.length > 0) {
      this.itemsList = this.itemsList.filter((item) => ids.includes(item.id));
      this.filtredItemsList = this.filtredItemsList.filter(
        (item) => !ids.includes(item.id)
      );
    }
  }
}
