import { Component, OnInit } from "@angular/core";
import { ContactsService } from "../services/contacts.service";
import { Router } from "@angular/router";
import { Speciality } from "@app/shared/models/speciality";
import { Location } from "@angular/common";
import { AccountService } from "../services/account.service";
import { LocalStorageService } from "ngx-webstorage";
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
  imageSource = "assets/imgs/IMG_3944.jpg";
  links = {
    isAllSelect: this.localSt.retrieve("role") == "PRACTICIAN",
    isDelete: this.localSt.retrieve("role") == "PRACTICIAN",
    isTypeFilter: true,
    isAdd: true,
  };
  selectedObjects: Array<any>;
  topText = "Mes contacts PRO";
  page = "MY_PRO_CONTACTS";
  backButton = true;
  constructor(
    public accountService: AccountService,
    private _location: Location,
    private router: Router,
    private contactsService: ContactsService,
    private localSt: LocalStorageService
  ) {}
  userRole = this.localSt.retrieve("role");
  ngOnInit(): void {
    this.itemsList = new Array();
    this.filtredItemsList = new Array();
    this.types = new Array();
    this.getAllSpeciality();
    if (this.userRole == "PRACTICIAN") {
      this.getAllContacts();
    } else if (this.userRole == "SECRETARY") {
      this.getAllContactsForSecretary();
    }
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
                img: "assets/imgs/IMG_3944.jpg",
                title: elm.title,
                type: "MEDICAL",
                speciality: elm.speciality ? elm.speciality : "Tout",
                canEdit: elm.contactType == "CONTACT" ? true : false,
                contactType: elm.contactType,
              },
            ],
            isArchieve: elm.contactType != "CABINET" ? true : false,
            isImportant: false,
            hasFiles: false,
            isViewDetail: true,
            isMarkAsSeen: elm.contactType != "CONTACT" ? true : false,
            isChecked: false,
          };
        });
        this.filtredItemsList = this.itemsList;
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
                img: "assets/imgs/IMG_3944.jpg",
                title: elm.title,
                type: "MEDICAL",
                speciality: elm.speciality ? elm.speciality : "Tout",
                canEdit: elm.contactType == "CONTACT" ? true : false,
                contactType: elm.contactType,
              },
            ],
            isArchieve: true,
            isImportant: false,
            hasFiles: false,
            isViewDetail: true,
            isMarkAsSeen: elm.contactType != "CONTACT" ? true : false,
            isChecked: false,
          };
        });
        this.filtredItemsList = this.itemsList;
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
    const ids = [];
    const practicianIds = [];
    const secretariesIds = [];
    this.itemsList.forEach((a) => {
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
      this.contactsService.deleteMultiple(ids).subscribe((res) => {
        this.deleteItemFromList(ids);
      });
    }
    if (practicianIds.length > 0) {
      this.contactsService
        .deleteMultiplePracticianContactPro(practicianIds)
        .subscribe((res) => {
          this.deleteItemFromList(practicianIds);
        });
    }
    if (secretariesIds.length > 0) {
      this.accountService
        .detachMultipleSecretaryFromAccount(secretariesIds)
        .subscribe((res) => {
          this.deleteItemFromList(secretariesIds);
        });
    }
  }

  cardClicked(item) {
    if (item.users[0].contactType == "CONTACT") {
      this.router.navigate(["/features/contact-detail/" + item.id]);
    } else if (
      item.users[0].contactType == "MEDICAL" ||
      item.users[0].contactType == "CABINET"
    ) {
      this.router.navigate([
        "/features/practician-detail/" + item.practicianId,
      ]);
    } else if (item.users[0].contactType == "SECRETARY") {
      this.router.navigate(["/features/secretaire-detail/" + item.id]);
    }
  }
  markAsSeenClicked(item) {
    this.router.navigate(["/features/messagerie-ecrire"], {
      queryParams: {
        id: item.id,
      },
    });
  }
  archieveClicked(event) {
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
      this.contactsService.deleteMultiple(ids).subscribe((res) => {
        this.deleteItemFromList(ids);
      });
    }
    if (practicianIds.length > 0) {
      this.contactsService
        .deleteMultiplePracticianContactPro(practicianIds)
        .subscribe((res) => {
          this.deleteItemFromList(practicianIds);
        });
    }
    if (secretariesIds.length > 0) {
      this.accountService
        .detachMultipleSecretaryFromAccount(secretariesIds)
        .subscribe((res) => {
          this.deleteItemFromList(secretariesIds);
        });
    }
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
    this.router.navigate(["/features/contact-detail/add"]);
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
