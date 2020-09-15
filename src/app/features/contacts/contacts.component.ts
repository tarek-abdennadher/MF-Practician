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
import { filter } from "rxjs/operators";
import { DomSanitizer } from "@angular/platform-browser";
import { NewMessageWidgetService } from "../new-message-widget/new-message-widget.service";
import { DialogService } from "../services/dialog.service";
@Component({
  selector: "app-contacts",
  templateUrl: "./contacts.component.html",
  styleUrls: ["./contacts.component.scss"]
})
export class ContactsComponent implements OnInit {
  selectedSecretary: number = null;
  specialities: Array<Speciality>;
  users: Array<any> = new Array<any>();
  itemsList: Array<any> = new Array<any>();
  filtredItemsList: Array<any> = new Array<any>();
  types: Array<string> = [];
  imageSource: string;
  links = {
    isTypeFilter: true,
    isAdd: true
  };
  selectedObjects: Array<any>;
  topText = "Mes contacts Pros";
  addText = "Ajouter contact";
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
    this.route.queryParams.subscribe(params => {
      if (params["status"]) {
        let notifMessage = "";
        switch (params["status"]) {
          case "add": {
            notifMessage = "Contact pro ajouté avec succès";
            break;
          }
          case "edit": {
            notifMessage = "Contact pro modifié avec succès";
            break;
          }
        }
        this.notifier.show({
          message: notifMessage,
          type: "info",
          template: this.customNotificationTmpl
        });
      }
    });
    this.itemsList = new Array();
    this.filtredItemsList = new Array();
    this.types = new Array();
    this.getAllSpeciality();
    if (this.userRole == "PRACTICIAN") {
      this.getAllContacts();
    } else if (this.userRole == "SECRETARY") {
      this.getAllContactsForSecretary();
    }
    // update contacts after detail view
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        let currentRoute = this.route;
        while (currentRoute.firstChild) currentRoute = currentRoute.firstChild;
        if (this.userRole == "PRACTICIAN") {
          this.getAllContacts();
        } else if (this.userRole == "SECRETARY") {
          this.getAllContactsForSecretary();
        }
      });
    this.featureService.setIsMessaging(false);
  }

  getAllContactsForSecretary() {
    this.contactsService.getContactsProForSecretary().subscribe(
      contacts => {
        this.users = contacts;
        this.itemsList = this.users.map(elm => {
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
                canEdit: elm.contactType == "CONTACT" ? true : false,
                contactType: elm.contactType
              }
            ],
            isArchieve: elm.contactType != "CABINET" ? true : false,
            isImportant: false,
            hasFiles: false,
            isViewDetail: false,
            isMarkAsSeen: elm.contactType != "CONTACT" ? true : false,
            isChecked: false,
            photoId: elm.photoId
          };
        });
        this.number = this.itemsList.length;
        this.filtredItemsList = this.itemsList;
        this.itemsList.forEach(item => {
          item.users.forEach(user => {
            this.documentService
              .getDefaultImageEntity(
                user.id,
                user.contactType == "CONTACT" ? "CONTACT" : "ACCOUNT"
              )
              .subscribe(
                response => {
                  let myReader: FileReader = new FileReader();
                  myReader.onloadend = e => {
                    user.img = this.sanitizer.bypassSecurityTrustUrl(
                      myReader.result as string
                    );
                  };
                  let ok = myReader.readAsDataURL(response);
                },
                error => {
                  user.img = this.avatars.user;
                }
              );
          });
        });
      },
      error => {
        console.log("en attendant un model de popup à afficher");
      }
    );
  }
  getAllContacts() {
    this.contactsService.getContactsPro().subscribe(
      contacts => {
        this.users = contacts;
        this.itemsList = this.users.map(elm => {
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
                canEdit: elm.contactType == "CONTACT" ? true : false,
                contactType: elm.contactType
              }
            ],
            isArchieve: true,
            isImportant: false,
            hasFiles: false,
            isViewDetail: false,
            isMarkAsSeen: elm.contactType != "CONTACT" ? true : false,
            isContact: true,
            isChecked: false,
            photoId: elm.photoId
          };
        });
        this.number = this.itemsList.length;
        this.filtredItemsList = this.itemsList;
        this.itemsList.forEach(item => {
          item.users.forEach(user => {
            this.documentService
              .getDefaultImageEntity(
                user.id,
                user.contactType == "CONTACT" ? "CONTACT" : "ACCOUNT"
              )
              .subscribe(
                response => {
                  let myReader: FileReader = new FileReader();
                  myReader.onloadend = e => {
                    user.img = this.sanitizer.bypassSecurityTrustUrl(
                      myReader.result as string
                    );
                  };
                  let ok = myReader.readAsDataURL(response);
                },
                error => {
                  user.img = this.avatars.user;
                }
              );
          });
        });
      },
      error => {
        console.log("en attendant un model de popup à afficher");
      }
    );
  }
  listFilter(value: string) {
    this.filtredItemsList =
      value != "Tout" ? this.performFilter(value) : this.itemsList;
  }

  performFilter(filterBy: string) {
    return this.itemsList.filter(item =>
      item.users[0].speciality.includes(filterBy)
    );
  }

  selectAllActionClicked() {
    this.itemsList.forEach(a => {
      a.isChecked = true;
    });
  }
  deselectAllActionClicked() {
    this.itemsList.forEach(a => {
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
      .subscribe(res => {
        if (res) {
          const ids = [];
          const practicianIds = [];
          const secretariesIds = [];
          this.itemsList.forEach(a => {
            if (a.isChecked && a.users[0].contactType == "CONTACT") {
              ids.push(a.id);
            }
            if (
              a.isChecked &&
              (a.users[0].contactType == "MEDICAL" ||
                a.users[0].contactType == "CABINET")
            ) {
              practicianIds.push(a.id);
            }
            if (a.isChecked && a.users[0].contactType == "SECRETARY") {
              secretariesIds.push(a.id);
            }
          });
          if (ids.length > 0) {
            this.contactsService.deleteMultiple(ids).subscribe(res => {
              this.deleteItemFromList(ids);
            });
          }
          if (practicianIds.length > 0) {
            this.contactsService
              .deleteMultiplePracticianContactPro(practicianIds)
              .subscribe(res => {
                this.deleteItemFromList(practicianIds);
              });
          }
          if (secretariesIds.length > 0) {
            this.accountService
              .detachMultipleSecretaryFromAccount(secretariesIds)
              .subscribe(res => {
                this.deleteItemFromList(secretariesIds);
              });
          }
        }
      });
  }

  cardClicked(item) {
    if (item.users[0].contactType == "CONTACT") {
      this.router.navigate(["mes-contacts-pro/contact-detail/" + item.id]);
    } else if (
      item.users[0].contactType == "MEDICAL" ||
      item.users[0].contactType == "CABINET"
    ) {
      this.router.navigate([
        "mes-contacts-pro/praticien-detail/" + item.practicianId
      ]);
    } else if (item.users[0].contactType == "SECRETARY") {
      this.router.navigate(["mes-contacts-pro/secretaire-detail/" + item.id]);
    }
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
      .subscribe(res => {
        if (res) {
          const ids = [];
          const practicianIds = [];
          const secretariesIds = [];
          if (event.users[0].contactType == "CONTACT") {
            ids.push(event.id);
          }
          if (
            event.users[0].contactType == "MEDICAL" ||
            event.users[0].contactType == "CABINET"
          ) {
            practicianIds.push(event.id);
          }
          if (event.users[0].contactType == "SECRETARY") {
            secretariesIds.push(event.id);
          }
          if (ids.length > 0) {
            this.contactsService.deleteMultiple(ids).subscribe(res => {
              this.deleteItemFromList(ids);
            });
          }
          if (practicianIds.length > 0) {
            this.contactsService
              .deleteMultiplePracticianContactPro(practicianIds)
              .subscribe(res => {
                this.deleteItemFromList(practicianIds);
              });
          }
          if (secretariesIds.length > 0) {
            this.accountService
              .detachMultipleSecretaryFromAccount(secretariesIds)
              .subscribe(res => {
                this.deleteItemFromList(secretariesIds);
              });
          }
        }
      });
  }
  getAllSpeciality() {
    this.contactsService.getAllSpecialities().subscribe(
      specialitiesList => {
        this.specialities = specialitiesList;
        this.types = this.specialities.map(s => s.name);
        this.types.unshift("Tout");
      },
      error => {
        console.log("en attendant un model de popup à afficher");
      }
    );
  }
  addContact() {
    this.router.navigate(["mes-contacts-pro/contact-detail/add"]);
  }
  selectItem(event) {
    this.selectedObjects = event.filter(a => a.isChecked == true);
  }
  BackButton() {
    this._location.back();
  }
  deleteItemFromList(ids) {
    if (ids && ids.length > 0) {
      this.itemsList = this.itemsList.filter(item => ids.includes(item.id));
      this.filtredItemsList = this.filtredItemsList.filter(
        item => !ids.includes(item.id)
      );
    }
  }
}
