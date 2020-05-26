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
import { forkJoin } from "rxjs";
import { PracticianSearch } from "./practician-search/practician-search.model";
import { PatientSerch, CitySerch } from "./my-patients/my-patients";
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
  numberOfPending = 0;
  itemsList: any[];
  cityList: any[];
  inboxNumber: any;
  constructor(
    public router: Router,
    private localSt: LocalStorageService,
    public featuresService: FeaturesService,
    private searchService: PracticianSearchService,
    private globalService: GlobalService,
    private messageListService: MessagingListService,
    private documentService: MyDocumentsService,
    private accountService: AccountService,
    private practicianSearchService: PracticianSearchService
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
    this.featuresService.getNumberOfInbox().subscribe(val => {
      this.inboxNumber = val;
    })
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
    this.countMyInboxNotSeen();
    this.countMyArchive();
    this.getPersonalInfo();
    this.countMyPatientPending();
    this.setNumberOfPending();
    this.getPracticians();
  }
  getPracticians() {
    this.practicianSearchService.getAllPracticians().subscribe((list) => {
      if (this.localSt.retrieve("role") == "PRACTICIAN") {
        list = list.filter(
          (a) => a.accountId != this.featuresService.getUserId()
        );
      }
      this.itemsList = [];
      this.cityList = [];

      list.forEach((message) => {
        let practician = this.mappingPracticians(message);
        let speciality = this.mappingSpeciality(message);
        let city = this.mappingCity(message);
        this.itemsList.push(speciality);
        this.itemsList.push(practician);
        this.cityList.push(city);
      });
      this.itemsList.forEach((item) => {
        if (item.photoId && item.photoId != "none") {
          this.documentService.downloadFile(item.photoId).subscribe(
            (response) => {
              let myReader: FileReader = new FileReader();
              myReader.onloadend = (e) => {
                item.img = myReader.result;
              };
              let ok = myReader.readAsDataURL(response.body);
            },
            (error) => {
              item.img = "assets/imgs/user.png";
            }
          );
        } else {
          item.img =
            item.photoId != "none"
              ? "assets/imgs/avatar_docteur.svg"
              : "assets/imgs/user.png";
        }
      });
    });
  }

  mappingPracticians(message) {
    const practician = new PatientSerch();
    practician.fullName = message.fullName;
    practician.img = "assets/imgs/user.png";
    practician.photoId = message.photoId;

    return practician;
  }
  mappingSpeciality(message) {
    const practician = new PatientSerch();
    practician.fullName = message.speciality.name;
    practician.img = "assets/imgs/user.png";
    practician.photoId = "none";

    return practician;
  }
  mappingCity(message) {
    const city = new CitySerch();
    city.name = message.address;

    return city;
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
            if (notification.type == "MESSAGE") {
              that.messageListService.setNotificationObs(notification);
            } else if (notification.type == "MESSAGE_IN_PROGRESS") {
              that.messageListService.setNotificationMessageStateObs(
                notification
              );
            } else if (notification.type == "MESSAGE_TREATED") {
              that.messageListService.setNotificationMessageStateObs(
                notification
              );
            } else if (notification.type == "INVITATION") {
              that.messageListService.setInvitationNotificationObs(
                notification
              );
            } else if (notification.type == "REMOVED") {
              that.messageListService.removeInvitationNotificationObs(
                notification
              );
            }
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
        notifications.forEach((notif) => {
          notificationsFormated.push({
            id: notif.id,
            sender: notif.senderFullName,
            senderId: notif.senderId,
            picture: "assets/imgs/user.png",
            messageId: notif.messageId,
            type: notif.type,
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
        forkJoin(arrayOfObservables).subscribe((result: any[]) => {
          for (let i = 0; i < photoIds.size; i++) {
            let myReader: FileReader = new FileReader();
            myReader.onloadend = (e) => {
              photosMap.set(Array.from(photoIds)[i], myReader.result);
              if (photosMap.size == photoIds.size) {
                notificationsFormated.forEach((notif) => {
                  if (notif.photoId && photosMap.has(notif.photoId)) {
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

  countMyInboxNotSeen() {
    this.messageListService.countMyInboxNotSeen().subscribe((num) => {
      this.featuresService.setNumberOfInbox(num);
    });
  }

  countMyArchive() {
    this.featuresService.getCountOfMyArchieve().subscribe((resp) => {
      this.featuresService.numberOfArchieve = resp;
    });
  }

  countMyPatientPending() {
    this.featuresService.getCountOfMyPatientPending().subscribe((num) => {
      this.featuresService.setNumberOfPending(num);
    });
  }

  setNumberOfPending() {
    this.featuresService.getNumberOfPendingObs().subscribe((num) => {
      this.numberOfPending = num;
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
  displayMyPatientsAction(event) {
    this.router.navigate(["/mes-patients"], {
      queryParams: {
        section: event,
      },
    });
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
  closeNotification() {
    console.log("notifications not seen");
    this.featuresService.markReceivedNotifAsSeen().subscribe((resp) => {
      this.featuresService.listNotifications = this.featuresService.listNotifications.filter(
        (notif) => notif.messageId != null
      );
    });
  }

  searchActionClicked(event) {
    this.searchService.changeSearch(new search(event.search, event.city));
    this.router.navigate(["/praticien-recherche"]);
    jQuery(document).ready(function (e) {
      jQuery(this).find("#dropdownMenuLinkSearch").trigger("click");
    });
  }

  selectNotification(notification) {
    if (notification.type == "MESSAGE") {
      this.featuresService
        .markMessageAsSeenByNotification(notification.messageId)
        .subscribe(() => {
          this.getMyNotificationsNotSeen();
          this.router.navigate(["/messagerie-lire/" + notification.messageId], {
            queryParams: {
              context: "inbox",
            },
          });
          this.featuresService.setNumberOfInbox(
            this.featuresService.getNumberOfInboxValue() - 1
          );
        });
    } else if (
      notification.type == "MESSAGE_IN_PROGRESS" ||
      notification.type == "MESSAGE_TREATED"
    ) {
      this.featuresService
        .markNotificationAsSeen(notification.id)
        .subscribe((resp) => {
          this.getMyNotificationsNotSeen();
          this.router.navigate(["/messagerie-lire/" + notification.messageId], {
            queryParams: {
              context: "sent",
            },
          });
        });
    } else if (notification.type == "INVITATION") {
      this.featuresService
        .markNotificationAsSeen(notification.id)
        .subscribe((resp) => {
          this.getMyNotificationsNotSeen();
          this.router.navigate(["/mes-patients"], {
            queryParams: {
              section: "pending",
            },
          });
        });
    }
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
        } else {
          this.featuresService.imageSource = "assets/imgs/avatar_docteur.svg";
        }
      } else if (account && account.secretary) {
        this.account = account.secretary;
        if (this.account.photoId) {
          this.hasImage = true;
          this.getPictureProfile(this.account.photoId);
        } else {
          this.featuresService.imageSource =
            "assets/imgs/avatar_secrétaire.svg";
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
