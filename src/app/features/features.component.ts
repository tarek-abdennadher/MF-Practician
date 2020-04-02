import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FeaturesService } from "./features.service";
import { PracticianSearchService } from "./practician-search/practician-search.service";
import { search } from "./practician-search/search.model";
import { LocalStorageService } from "ngx-webstorage";
import * as Stomp from "stompjs";
import * as SockJS from "sockjs-client";
import { GlobalService } from '@app/core/services/global.service';
import { MessagingListService } from './services/messaging-list.service';
@Component({
  selector: "app-features",
  templateUrl: "./features.component.html",
  styleUrls: ["./features.component.scss"]
})
export class FeaturesComponent implements OnInit {
  collapedSideBar: boolean;
  constructor(
    public router: Router,
    private localSt: LocalStorageService,
    public featuresService: FeaturesService,
    private searchService: PracticianSearchService,
    private globalService: GlobalService,
    private messageListService: MessagingListService
  ) {
    this.initializeWebSocketConnection();
  }
  user = this.localSt.retrieve("user");
  fullName = this.user?.firstName + " " + this.user?.lastName;
  imageSource = "assets/imgs/IMG_3944.jpg";
  role: string = "medical";
  links = {
    isArchieve: true,
    isImportant: true,
    isFilter: true
  };
  private stompClient;

  ngOnInit(): void {
    this.getMyNotificationsNotSeen();
    this.countMyArchive();
  }
  initializeWebSocketConnection() {
    const ws = new SockJS(this.globalService.BASE_URL + "/socket");
    this.stompClient = Stomp.over(ws);
    this.stompClient.debug = () => { };
    const that = this;
    this.stompClient.connect({}, function (frame) {
      that.stompClient.subscribe("/topic/notification/" + that.featuresService.getUserId(), message => {
        if (message.body) {
          let notification = JSON.parse(message.body);
          that.messageListService.setNotificationObs(notification);
          that.featuresService.numberOfInbox++;
            that.featuresService.listNotifications.unshift({
            id: notification.id,
            sender: notification.senderFullName,
            picture: "assets/imgs/user.png",
            messageId: notification.messageId
          });
        }
      });
    });
  }

  getMyNotificationsNotSeen() {
    let notificationsFormated = [];
    this.featuresService
      .getMyNotificationsByMessagesNotSeen(false)
      .subscribe(notifications => {
        notifications.forEach(notif => {
          notificationsFormated.push({
            id: notif.id,
            sender: notif.senderFullName,
            picture: "assets/imgs/user.png",
            messageId: notif.messageId
          });
        });
        this.featuresService.listNotifications = notificationsFormated;
      });
    }
  countMyArchive() {
    this.featuresService.getCountOfMyArchieve().subscribe(resp => {
      this.featuresService.numberOfArchieve = resp;
    })
  }
  openAccountInterface() {
    this.router.navigate(["/features/compte/mes-informations"]);
  }
  signOutAction() {
    this.router.navigate(["/connexion"]);
  }

  displayInboxAction() {
    this.router.navigate(["/features/messageries"]);
  }
  displaySendAction() {
    this.router.navigate(["/features/messagerie-ecrire"]);
  }
  displaySentAction() {
    this.router.navigate(["features/messagerie-envoyes"]);
  }
  displayArchieveAction() {
    this.router.navigate(["/features/archive"]);
  }
  displayMyPatientsAction() {
    this.router.navigate(["/features/mes-patients"]);
  }
  displayMyMedicalsAction() {
    this.router.navigate(["/features/favorites"]);
  }
  displayMyProContactsAction() {
    this.router.navigate(["features/contacts"]).then(() => window.location.reload());
  }
  displayMyDocumentsAction() {
    this.router.navigate(["features/documents"]);
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
  logoClicked() {
    this.router.navigate(["/features/messageries"]);
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
    jQuery(document).ready(function (e) {
      jQuery(this)
        .find("#dropdownMenuLinkSearch")
        .trigger("click");
    });
  }

  selectNotification(notification) {
    this.featuresService
      .markMessageAsSeenByNotification(notification.messageId)
      .subscribe(() => {
        this.getMyNotificationsNotSeen();
        this.router.navigate(["features/detail/"+notification.messageId]);
        this.featuresService.numberOfInbox--;
      });
  }

}
