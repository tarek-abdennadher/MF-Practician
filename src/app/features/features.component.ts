import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FeaturesService } from "./features.service";
import { PracticianSearchService } from './practician-search/practician-search.service';
import { search } from './practician-search/search.model';
import { LocalStorageService } from 'ngx-webstorage';
@Component({
  selector: "app-features",
  templateUrl: "./features.component.html",
  styleUrls: ["./features.component.scss"]
})
export class FeaturesComponent implements OnInit {
  collapedSideBar: boolean;
  constructor(public router: Router,
              private localSt: LocalStorageService,
              public featuresService: FeaturesService,
              private searchService: PracticianSearchService) {}
  user = this.localSt.retrieve("user") ;
  fullName = this.user.firstName + " " + this.user.lastName;
  imageSource = "assets/imgs/IMG_3944.jpg";
  role: string = "medical";
  links = {
    isArchieve: true,
    isImportant: true,
    isFilter: true
  };

  ngOnInit(): void {}

  openAccountInterface() {
    this.router.navigate(["/features/account"]);
  }
  signOutAction() {
    this.router.navigate(["/login"]);
  }

  displayInboxAction() {
    this.router.navigate(["/features/list"]);
  }
  displaySendAction() {
    this.router.navigate(["/features/send"]);
  }
  displaySentAction() {
    this.router.navigate(["features/messagerie-envoyes"]);
  }
  displayArchieveAction() {
    this.router.navigate(["/features/archieve"]);
  }
  displayMyPatientsAction() {
    this.router.navigate(["/features/mes-patients"]);
  }
  displayMyMedicalsAction() {
    this.router.navigate(["/features/favorites"]);
  }
  displayMyProContactsAction() {
    this.router.navigate(["features/contacts"]);
  }
  displayMyDocumentsAction() {
    console.log("displayMyDocumentsAction");
  }
  displayHelpAction() {
    console.log("displayHelpAction");
  }
  selectAllActionClicked() {
    console.log("selectAllAction");
  }
  seenActionClicked() {
    console.log("seenAction");
  }
  seenAllActionClicked() {
    console.log("seenAllAction");
  }
  importantActionClicked() {
    console.log("importantAction");
  }
  deleteActionClicked() {
    console.log("deleteAction");
  }
  archieveActionClicked() {
    console.log("archieveAction");
  }
  addNoteActionClicked() {
    console.log("addNoteAction");
  }
  filterActionClicked(event) {
    console.log(event);
  }

  receiveCollapsed($event) {
    this.collapedSideBar = $event;
  }
  openNotifications() {
    console.log("notifications seen");
  }

  searchActionClicked(event) {
     this.searchService.changeSearch(new search(event.search, event.city));
     this.router.navigate(["/features/search"]);
  }

  selectNotification(notification) {
    // console.log(notification);
    // this.featuresService
    //   .markMessageAsSeenByNotification(notification.messageId)
    //   .subscribe(() => {
    //     this.getMyNotificationsNotSeen();
    //     this.router.navigate(["features/detail/" + notification.messageId]);
    //   });
  }
}
