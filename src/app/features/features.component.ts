import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FeaturesService } from "./features.service";
import { PracticianSearchService } from "./practician-search/practician-search.service";
import { search } from "./practician-search/search.model";
import { LocalStorageService } from "ngx-webstorage";
import * as Stomp from "stompjs";
import * as SockJS from "sockjs-client";
import { GlobalService } from "@app/core/services/global.service";
import { MessagingListService } from "./services/messaging-list.service";
import { MyDocumentsService } from "./my-documents/my-documents.service";
import { AccountService } from "./services/account.service";
import { forkJoin } from 'rxjs';
@Component({
  selector: "app-features",
  templateUrl: "./features.component.html",
  styleUrls: ["./features.component.scss"],
})
export class FeaturesComponent implements OnInit {
  collapedSideBar: boolean;
  account: any;
  hasImage: boolean;
  text: string = "";
  city: string = "";
  constructor(
    public router: Router,
    private localSt: LocalStorageService,
    public featuresService: FeaturesService,
    private searchService: PracticianSearchService,
    private globalService: GlobalService,
    private messageListService: MessagingListService,
    private documentService: MyDocumentsService,
    private accountService: AccountService
  ) {
    this.initializeWebSocketConnection();
  }
  public myPracticians = [];

  user = this.localSt.retrieve("user");
  userRole = this.localSt.retrieve("role");
  fullName = this.user?.firstName + " " + this.user?.lastName;
  role: string =
    this.localSt.retrieve("role") == "SECRETARY" ? "secretary" : "medical";
  links = {
    isArchieve: true,
    isImportant: true,
    isFilter: true,
  };
  private stompClient;

  ngOnInit(): void {
    if (this.userRole && this.userRole == "SECRETARY") {
      this.featuresService.getSecretaryPracticians().subscribe((value) => {
        this.featuresService.myPracticians.next(value);
        this.myPracticians = this.featuresService.myPracticians.getValue();
      });
    }
    this.featuresService.currentSearch.subscribe((data: search) => {
      this.text = data.text;
      this.city = data.city;
    });
    this.getMyNotificationsNotSeen();
    this.countMyArchive();
    this.getPersonalInfo();
  }
  initializeWebSocketConnection() {
    const ws = new SockJS(this.globalService.BASE_URL + "/socket");
    this.stompClient = Stomp.over(ws);
    this.stompClient.debug = () => {};
    const that = this;
    this.stompClient.connect({}, function (frame) {
      that.stompClient.subscribe(
        "/topic/notification/" + that.featuresService.getUserId(),
        (message) => {
          if (message.body) {
            let notification = JSON.parse(message.body);
            that.messageListService.setNotificationObs(notification);
            that.featuresService.numberOfInbox++;
          }
        }
      );
    });
  }

  getMyNotificationsNotSeen() {
    let notificationsFormated = [];
    this.featuresService
      .getMyNotificationsByMessagesNotSeen(false)
      .subscribe((notifications) => {
        console.log(notifications)
        notifications.forEach((notif) => {
          notificationsFormated.push({
            id: notif.id,
            sender: notif.senderFullName,
            picture: "assets/imgs/user.png",
            messageId: notif.messageId,
            photoId: notif.senderPhotoId,
          });
        });
        let photoIds: Set<string> = new Set();
        notifications.forEach((notif) => {
          photoIds.add(notif.senderPhotoId);
        });
        let photosMap: Map<string, string | ArrayBuffer> = new Map();
        let arrayOfObservables = [];
        photoIds.forEach((id) => {
          arrayOfObservables.push(this.documentService.downloadFile(id));
        });
        forkJoin(arrayOfObservables).subscribe((result:any[]) => {
          for (let i = 0; i < photoIds.size; i++) {
            let myReader: FileReader = new FileReader();
            myReader.onloadend = (e) => {
              photosMap.set(Array.from(photoIds)[i], myReader.result);
              if(photosMap.size == photoIds.size){
                notificationsFormated.forEach((notif) => {
                  if(photosMap.has(notif.photoId)){
                    notif.picture = photosMap.get(notif.photoId);
                  }
                });
              }
            };
            let ok = myReader.readAsDataURL(result[i].body);
          }


        });

        this.featuresService.listNotifications = notificationsFormated;
      });
  }
  countMyArchive() {
    this.featuresService.getCountOfMyArchieve().subscribe((resp) => {
      this.featuresService.numberOfArchieve = resp;
    });
  }
  openAccountInterface() {
    this.router.navigate(["/compte/mes-informations"]);
  }
  signOutAction() {
    this.router.navigate(["/connexion"]);
  }

  displayInboxAction() {
    this.router.navigate(["/messagerie"]);
  }
  displaySendAction() {
    this.router.navigate(["/messagerie-ecrire"]);
  }
  displaySentAction() {
    this.router.navigate(["/messagerie-envoyes"]);
  }
  displayArchieveAction() {
    this.router.navigate(["/messagerie-archives"]);
  }
  displayMyPatientsAction() {
    this.router.navigate(["/mes-patients"]);
  }
  displayMyMedicalsAction() {
    this.router.navigate(["/favorites"]);
  }
  displayMyProContactsAction() {
    this.router.navigate(["/mes-contacts-pro"]);
  }
  displayMyDocumentsAction() {
    this.router.navigate(["/mes-documents"]);
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
    this.router.navigate(["/messagerie"]);
  }
  receiveCollapsed($event) {
    this.collapedSideBar = $event;
  }
  openNotifications() {
    console.log("notifications seen");
  }

  searchActionClicked(event) {
    this.searchService.changeSearch(new search(event.search, event.city));
    this.router.navigate(["/praticien-recherche"]);
    jQuery(document).ready(function (e) {
      jQuery(this).find("#dropdownMenuLinkSearch").trigger("click");
    });
  }

  selectNotification(notification) {
    this.featuresService
      .markMessageAsSeenByNotification(notification.messageId)
      .subscribe(() => {
        this.getMyNotificationsNotSeen();
        this.router.navigate(["/messagerie-lire/" + notification.messageId], {
          queryParams: {
            context: "inbox",
          },
        });
        this.featuresService.numberOfInbox--;
      });
  }
  displayInboxOfPracticiansAction(event) {
    this.router.navigate(["/messagerie/" + event]);
  }

  getPersonalInfo() {
    this.accountService.getCurrentAccount().subscribe((account) => {
      if (account && account.practician) {
        this.account = account.practician;
        if (this.account.photoId) {
          this.hasImage = true;
          this.getPictureProfile(this.account.photoId);
        }
      } else if (account && account.secretary) {
        this.account = account.secretary;
        if (this.account.photoId) {
          this.hasImage = true;
          this.getPictureProfile(this.account.photoId);
        }
      }
    });
  }
  // initialise profile picture
  getPictureProfile(nodeId) {
    this.documentService.downloadFile(nodeId).subscribe(
      (response) => {
        let myReader: FileReader = new FileReader();
        myReader.onloadend = (e) => {
          this.featuresService.imageSource = myReader.result;
        };
        let ok = myReader.readAsDataURL(response.body);
      },
      (error) => {
        this.featuresService.imageSource = "assets/imgs/user.png";
      }
    );
  }
  resetInputs() {
    this.featuresService.changeSearch(new search("", ""));
  }
}
