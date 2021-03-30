import {
  Component,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
  ViewChild,
} from "@angular/core";
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
import { BehaviorSubject } from "rxjs";
import { JobtitlePipe } from "@app/shared/pipes/jobTitle.pipe";
import { ArchieveMessagesService } from "./archieve-messages/archieve-messages.service";
import { MessageService } from "./services/message.service";
import { MessageSent } from "@app/shared/models/message-sent";
import { MessageArchived } from "./archieve-messages/message-archived";
import { MyPatientsService } from "./services/my-patients.service";
import { DomSanitizer } from "@angular/platform-browser";
import { NewMessageWidgetService } from "./new-message-widget/new-message-widget.service";
import { NotifierService } from "angular-notifier";
import { RoleObjectPipe } from "@app/shared/pipes/role-object";
@Component({
  selector: "app-features",
  templateUrl: "./features.component.html",
  styleUrls: ["./features.component.scss"],
})
export class FeaturesComponent implements OnInit, AfterViewInit {
  @ViewChild("customNotification", { static: true }) customNotificationTmpl;
  collapedSideBar: boolean;
  account: any;
  hasImage: boolean;
  text: string = "";
  city: string = "";
  numberOfPending = 0;
  inboxNumber: any;
  avatars: any;
  practicians: any;
  patients: any;
  secretaryIds: any = [];
  numberOfArchieve: any;
  public messaging: boolean = true;
  private readonly notifier: NotifierService;
  constructor(
    public router: Router,
    private localSt: LocalStorageService,
    public featuresService: FeaturesService,
    private globalService: GlobalService,
    private messageListService: MessagingListService,
    private messageService: MessageService,
    private messageArchiveService: ArchieveMessagesService,
    private documentService: MyDocumentsService,
    private accountService: AccountService,
    private practicianSearchService: PracticianSearchService,
    private jobTitlePipe: JobtitlePipe,
    private patientService: MyPatientsService,
    private sanitizer: DomSanitizer,
    private messageWidgetService: NewMessageWidgetService,
    private cdr: ChangeDetectorRef,
    notifierService: NotifierService,
    public roleObjectPipe: RoleObjectPipe
  ) {
    this.notifier = notifierService;
    this.avatars = this.globalService.avatars;
    this.initializeWebSocketConnection();
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }
  public myPracticians = [];

  user = this.localSt.retrieve("user");
  fullname = this.user["firstName"] + " " + this.user["lastName"];
  userRole = this.localSt.retrieve("role");
  role: string =
    this.localSt.retrieve("role") == "SECRETARY" ? "secretary" : "medical";
  links = {
    isArchieve: true,
    isImportant: true,
    isFilter: true,
  };
  private stompClient;
  private stompClientList = [];

  ngOnInit(): void {
    let firstNameRefactored = this.featuresService.firstLetterUpper(
      this.user?.firstName
    );
    let lastNameRefactored = this.user?.lastName.toUpperCase();
    if (
      !this.featuresService.fullName ||
      this.featuresService.fullName == null
    ) {
      this.featuresService.fullName =
        this.jobTitlePipe.transform(this.user.jobTitle) +
        " " +
        firstNameRefactored +
        " " +
        lastNameRefactored;
    }
    this.fullname = this.featuresService.fullName;
    this.featuresService.getNumberOfInbox().subscribe((val) => {
      this.inboxNumber = val;
    });
    this.featuresService.getNumberOfArchieve().subscribe((val) => {
      this.numberOfArchieve = val;
    });
    this.featuresService.currentSearch.subscribe((data: search) => {
      this.text = data.text;
      this.city = data.city;
    });
    this.getMyNotificationsNotSeen();
    this.countMyInboxNotSeen();
    this.countForwarded();
    this.countMyArchive();
    this.getPersonalInfo();
    this.countMyPatientPending();
    this.setNumberOfPending();
    this.getPracticians();
    this.getAllInbox();
    this.getAllArchive();
    this.sentMessage();
    this.forwardedMessage();
    this.observeState();
    this.subscribeIsMessaging();
    this.countCategories();
    $("#main-container").on("click", function (e) {
      if (e.target.parentElement.id != "sideBar") {
        jQuery("#sidebar").addClass("hidden-side-bar");
      }
    });
  }
  setNotif(msg) {
    this.notifier.show({
      message: msg,
      type: "error",
      template: this.customNotificationTmpl,
    });
  }
  observeState() {
    this.featuresService.inboxState.subscribe((state) => {
      if (state) {
        this.getAllInbox();
        this.featuresService.inboxState.next(false);
      }
    });
    this.featuresService.sentState.subscribe((state) => {
      if (state) {
        this.sentMessage();
        this.featuresService.sentState.next(false);
      }
    });
    this.featuresService.archiveState.subscribe((state) => {
      if (state) {
        this.getAllArchive();
        this.featuresService.archiveState.next(false);
      }
    });
  }

  private subscribeIsMessaging() {
    this.featuresService.getIsMessaging().subscribe((isMessaging) => {
      this.messaging = isMessaging;
    });
  }

  getAllInbox() {
    this.messageListService.getAllInboxMessages(1000000).subscribe((res) => {
      let result = res.map((elm) => this.parseMessage(elm));
      this.featuresService.setSearchInbox(result);
    });
  }

  getAllInboxByAccountId(id) {
    this.messageListService
      .getAllInboxByAccountId(id, 1000000)
      .subscribe((res) => {
        let result = res.map((elm) => this.parseMessage(elm));
        let inboxObs = new BehaviorSubject(result);
        this.featuresService.searchPracticianInbox.set(id, inboxObs);
        this.featuresService.searchPracticianInboxFiltered.set(
          id,
          new BehaviorSubject([])
        );
      });
  }

  getAllArchive() {
    this.messageArchiveService.getAllMyArchivedMessages().subscribe((res) => {
      let list = res.map((item) => this.mapArchiveMessages(item));
      this.featuresService.setSearchArchive(list);
    });
  }

  sentMessage() {
    this.messageService.sentMessageFullSize().subscribe((res) => {
      this.featuresService.setSearchSent(this.parseMessages(res));
    });
  }
  forwardedMessage() {
    this.messageService.forwardedMessage().subscribe((res) => {
      this.featuresService.setSearchForwarded(this.parseMessages(res));
    });
  }

  getPracticians() {
    this.practicianSearchService.getSearchListPractician().subscribe((list) => {
      if (this.localSt.retrieve("role") == "PRACTICIAN") {
        list = list.filter(
          (a) => a.accountId != this.featuresService.getUserId()
        );
      }
      this.featuresService.setSearchFiltredPractician(list);
      this.practicians = list;
    });
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
            if (
              notification.type == "MESSAGE" ||
              notification.type == "MESSAGE_FAILED"
            ) {
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
            } else if (notification.type == "MESSAGE_READ") {
              that.messageListService.setMessageNotificationRead(notification);
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
            sender: notif.jobTitle
              ? this.jobTitlePipe.transform(notif.jobTitle) +
                " " +
                notif.senderFullName
              : notif.senderFullName,
            senderId: notif.senderId,
            picture: this.avatars.user,
            messageId: notif.messageId,
            type: notif.type,
            photoId: notif.senderPhotoId,
            role: notif.role,
            civility: notif.civility,
          });
        });
        this.featuresService.listNotifications = notificationsFormated;
      });
  }

  countMyInboxNotSeen() {
    this.messageListService.countMyInboxNotSeen().subscribe((num) => {
      this.featuresService.setNumberOfInbox(num);
    });
  }

  countForwarded() {
    this.featuresService.getCountOfForwarded().subscribe((resp) => {
      this.featuresService.numberOfForwarded = resp;
    });
  }

  countMyArchive() {
    this.featuresService.getCountOfMyArchieve().subscribe((resp) => {
      this.featuresService.setNumberOfArchieve(resp);
    });
  }

  countMyPatientPending() {
    this.featuresService.countPendingInvitations().subscribe((num) => {
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
    jQuery("#sidebar").addClass("hidden-side-bar");
    this.scrolToTop();
    this.router.navigate(["/messagerie"]);
  }
  displaySendAction() {
    jQuery("#sidebar").addClass("hidden-side-bar");
    this.scrolToTop();
    this.messageWidgetService.toggleObs.next();
  }
  displaySentAction() {
    jQuery("#sidebar").addClass("hidden-side-bar");
    this.scrolToTop();
    this.router.navigate(["/messagerie-envoyes"]);
  }
  displayForwardedAction() {
    jQuery("#sidebar").addClass("hidden-side-bar");
    this.scrolToTop();
    this.router.navigate(["/messagerie-transferes"]);
  }
  displayArchieveAction() {
    jQuery("#sidebar").addClass("hidden-side-bar");
    this.scrolToTop();
    this.router.navigate(["/messagerie-archives"]);
  }

  displayMyPatientsAction(event) {
    jQuery("#sidebar").addClass("hidden-side-bar");
    this.scrolToTop();
    switch (event) {
      case "accepted": {
        this.router.navigate(["/mes-patients"]);
        break;
      }
      case "pending": {
        this.router.navigate(["/mes-invitations"]);
        break;
      }
      case "prohibit": {
        this.router.navigate(["/mes-patients-bloques"]);
        break;
      }
      case "archived": {
        this.router.navigate(["/mes-patients-archives"]);
        break;
      }
    }
  }
  displayMyMedicalsAction() {
    jQuery("#sidebar").addClass("hidden-side-bar");
    this.scrolToTop();
    this.router.navigate(["/favorites"]);
  }
  displayMyProContactsAction() {
    jQuery("#sidebar").addClass("hidden-side-bar");
    this.scrolToTop();
    this.router.navigate(["/mes-contacts-pro"]);
  }
  displayMyDocumentsAction() {
    jQuery("#sidebar").addClass("hidden-side-bar");
    this.scrolToTop();
    this.router.navigate(["/mes-documents"]);
  }
  displayHelpAction() {}
  selectAllActionClicked() {}
  seenActionClicked() {}
  seenAllActionClicked() {}
  importantActionClicked() {}
  deleteActionClicked() {}
  archieveActionClicked() {}
  filterActionClicked(event) {}
  logoClicked() {
    jQuery("a").removeClass("active");
    jQuery("#inbox").addClass("active");
    jQuery("#sidebar").addClass("hidden-side-bar");
    this.scrolToTop();
    this.router.navigate(["/messagerie"]);
  }

  openNotifications() {}
  closeNotification() {
    this.getMyNotificationsNotSeen();
  }

  searchActionClicked(event) {
    if (event.length >= 3) {
      if (this.featuresService.activeChild.getValue() == "inbox") {
        let practicianId = +this.featuresService.selectedPracticianId;
        if (practicianId == 0) {
          if (event) {
            let result = this.featuresService
              .getSearchInboxValue()
              .filter(
                (x) =>
                  x.users[0].fullName
                    .toLowerCase()
                    .includes(event.toLowerCase()) ||
                  x.object.name.toLowerCase().includes(event.toLowerCase())
              );

            result = result.length > 0 ? result : null;
            this.featuresService.setFilteredInboxSearch(result);
          } else {
            this.featuresService.setFilteredInboxSearch([]);
          }
        } else {
          if (event) {
            let result = this.featuresService.searchPracticianInbox
              .get(practicianId)
              .getValue()
              .filter(
                (x) =>
                  x.users[0].fullName
                    .toLowerCase()
                    .includes(event.toLowerCase()) ||
                  x.object.name.toLowerCase().includes(event.toLowerCase())
              );
            result = result.length > 0 ? result : null;
            this.featuresService.searchPracticianInboxFiltered
              .get(practicianId)
              .next(result);
          } else {
            this.featuresService.searchPracticianInboxFiltered
              .get(practicianId)
              .next([]);
          }
        }
      } else if (this.featuresService.activeChild.getValue() == "sent") {
        if (event) {
          let result = this.featuresService
            .getSearchSentValue()
            .filter(
              (x) =>
                (x.users[0].fullName
                  ? x.users[0].fullName
                      .toLowerCase()
                      .includes(event.toLowerCase())
                  : x.object.name
                      .toLowerCase()
                      .includes(event.toLowerCase())) ||
                x.object.name.toLowerCase().includes(event.toLowerCase())
            );
          result = result.length > 0 ? result : null;
          this.featuresService.setFilteredSentSearch(result);
        } else {
          this.featuresService.setFilteredSentSearch([]);
        }
      } else if (this.featuresService.activeChild.getValue() == "forwarded") {
        if (event) {
          let result = this.featuresService
            .getSearchForwardedValue()
            .filter(
              (x) =>
                x.users[0].fullName
                  .toLowerCase()
                  .includes(event.toLowerCase()) ||
                x.object.name.toLowerCase().includes(event.toLowerCase())
            );
          result = result.length > 0 ? result : null;
          this.featuresService.setFilteredForwardedSearch(result);
        } else {
          this.featuresService.setFilteredForwardedSearch([]);
        }
      } else if (this.featuresService.activeChild.getValue() == "archived") {
        if (event) {
          let result = this.featuresService
            .getSearchArchiveValue()
            .filter(
              (x) =>
                x.users[0].fullName
                  .toLowerCase()
                  .includes(event.toLowerCase()) ||
                x.object.name.toLowerCase().includes(event.toLowerCase())
            );
          result = result.length > 0 ? result : null;
          this.featuresService.setFilteredArchiveSearch(result);
        } else {
          this.featuresService.setFilteredArchiveSearch([]);
        }
      } else if (this.featuresService.activeChild.getValue() == "practician") {
        if (event) {
          let result = this.practicians.filter((x) =>
            x.fullName.toLowerCase().includes(event.toLowerCase())
          );
          result = result.length > 0 ? result : null;
          this.featuresService.setSearchFiltredPractician(result);
          this.router.navigate(["/praticien-recherche"]);
        } else {
          this.router.navigate(["/mes-contacts-pro"]);
        }
      } else if (
        this.featuresService.activeChild.getValue() == "practician-search"
      ) {
        if (event) {
          let result = this.practicians.filter(
            (x) =>
              x.fullName.toLowerCase().includes(event.toLowerCase()) ||
              x.title.toLowerCase().includes(event.toLowerCase())
          );
          result = result && result.length > 0 ? result : null;
          this.featuresService.setSearchFiltredPractician(result);
          this.router.navigate(["/praticien-recherche"]);
        } else {
          this.featuresService.setSearchFiltredPractician([]);
          this.router.navigate(["/mes-contacts-pro"]);
        }
      } else if (this.featuresService.activeChild.getValue() == "patient") {
        if (event) {
          let result = [];
          result.push(event.toLowerCase());
          this.featuresService.setFilteredPatientsSearch(result);
        } else {
          this.featuresService.setFilteredPatientsSearch([]);
        }
      }
    } else {
      if (this.featuresService.activeChild.getValue() == "inbox") {
        let practicianId = +this.featuresService.selectedPracticianId;
        if (practicianId == 0) {
          this.featuresService.setFilteredInboxSearch([]);
        } else {
          this.featuresService.searchPracticianInboxFiltered
            .get(practicianId)
            .next([]);
        }
      } else if (this.featuresService.activeChild.getValue() == "sent") {
        this.featuresService.setFilteredSentSearch([]);
      } else if (this.featuresService.activeChild.getValue() == "forwarded") {
        this.featuresService.setFilteredForwardedSearch([]);
      } else if (this.featuresService.activeChild.getValue() == "archived") {
        this.featuresService.setFilteredArchiveSearch([]);
      } else if (this.featuresService.activeChild.getValue() == "practician") {
        this.router.navigate(["/mes-contacts-pro"]);
      } else if (
        this.featuresService.activeChild.getValue() == "practician-search"
      ) {
        this.featuresService.setSearchFiltredPractician([]);
        this.router.navigate(["/mes-contacts-pro"]);
      } else if (this.featuresService.activeChild.getValue() == "patient") {
        this.featuresService.setFilteredPatientsSearch([]);
      }
    }
  }
  markNotificationsAsViewed(notifications) {
    notifications.forEach((notification) => {
      if (
        notification.type == "MESSAGE_IN_PROGRESS" ||
        notification.type == "MESSAGE_TREATED" ||
        notification.type == "MESSAGE_FAILED" ||
        notification.type == "INVITATION" ||
        notification.type == "INSTRUCTION_TREATED" ||
        notification.type == "ACCEPTED_REQUEST"
      ) {
        this.featuresService
          .markNotificationAsSeen(notification.id)
          .subscribe((resp) => {});
      }
    });
  }

  selectNotification(notification) {
    if (notification.type == "MESSAGE") {
      this.featuresService
        .markMessageAsSeenByNotification(notification.messageId)

        .subscribe(() => {
          this.getMyNotificationsNotSeen();
          this.router.navigate(
            [
              "/messagerie-lire/" +
                this.featuresService.encrypt(notification.messageId),
            ],
            {
              queryParams: {
                context: "inbox",
              },
            }
          );
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
          this.router.navigate(
            [
              "/messagerie-lire/" +
                this.featuresService.encrypt(notification.messageId),
            ],
            {
              queryParams: {
                context: "sent",
              },
            }
          );
        });
    } else if (notification.type == "INVITATION") {
      this.featuresService
        .markNotificationAsSeen(notification.id)

        .subscribe((resp) => {
          this.getMyNotificationsNotSeen();
          this.router.navigate(["/mes-invitations"]);
        });
    } else if (notification.type == "INSTRUCTION_TREATED") {
      this.featuresService
        .markNotificationAsSeen(notification.id)
        .subscribe((resp) => {
          this.getMyNotificationsNotSeen();
          this.router.navigate(
            [
              "/messagerie-lire/" +
                this.featuresService.encrypt(notification.messageId),
            ],
            {
              queryParams: {
                section: "sent",
              },
            }
          );
        });
    } else if (notification.type == "MESSAGE_FAILED") {
      this.featuresService
        .markNotificationAsSeen(notification.id)

        .subscribe((resp) => {
          this.getMyNotificationsNotSeen();
        });
    }
  }
  displayInboxOfPracticiansAction(event) {
    jQuery("#sidebar").addClass("hidden-side-bar");
    this.localSt.store("practicianId", event);
    this.scrolToTop();
    this.router.navigate([
      "/messagerie/" + this.featuresService.encrypt(event),
    ]);
  }

  getPersonalInfo() {
    this.accountService.getCurrentAccount().subscribe((account) => {
      if (account && account.practician) {
        this.account = account.practician;
        this.hasImage = true;
        this.getPictureProfile(account.id);
      } else if (account && account.secretary) {
        this.account = account.secretary;
        this.hasImage = true;
        this.getPictureProfile(account.id);
      }
    });
  }
  // initialise profile picture
  getPictureProfile(id) {
    this.documentService.getDefaultImage(id).subscribe(
      (response) => {
        let myReader: FileReader = new FileReader();
        myReader.onloadend = (e) => {
          this.featuresService.imageSource = this.sanitizer.bypassSecurityTrustUrl(
            myReader.result as string
          );
        };
        let ok = myReader.readAsDataURL(response);
      },
      (error) => {
        this.featuresService.imageSource = this.avatars.user;
      }
    );
  }
  resetInputs() {
    this.featuresService.changeSearch(new search("", ""));
  }

  // parse inbox
  parseMessage(message): any {
    let parsedMessage = {
      id: message.id,
      isSeen: message.seenAsReceiver,
      users: [
        {
          id: message.sender.senderId,
          fullName: message.sender.fullName,
          img: this.avatars.user,
          title: message.sender.jobTitle,
          civility: message.sender.civility,
          type:
            message.sender.role == "PRACTICIAN"
              ? "MEDICAL"
              : message.sender.role,
        },
      ],
      object: {
        name: message.object,
        isImportant: message.importantObject,
      },
      time: message.updatedAt,
      isImportant: message.important,
      hasFiles: message.hasFiles,
      isViewDetail: message.hasViewDetail,
      isMarkAsSeen: true,
      isArchieve: true,
      photoId: message.sender.photoId,
    };
    if (!this.featuresService.photosArray.has(message?.sender?.senderId)) {
      this.featuresService.photosArray.set(message?.sender?.senderId, null);
      this.documentService.getDefaultImage(message?.sender?.senderId).subscribe(
        (response) => {
          let myReader: FileReader = new FileReader();
          myReader.onloadend = (e) => {
            parsedMessage.users[0].img = this.sanitizer.bypassSecurityTrustUrl(
              myReader.result as string
            );
            this.featuresService.photosArray.set(
              parsedMessage.users[0].id,
              parsedMessage.users[0].img
            );
            this.updateImageOfParsedMessages(parsedMessage.users[0].id);
          };
          let ok = myReader.readAsDataURL(response);
        },
        (error) => {
          parsedMessage.users[0].img = this.avatars.user;
        }
      );
    } else {
      parsedMessage.users[0].img = this.featuresService.photosArray.get(
        message?.sender?.senderId
      );
    }
    return parsedMessage;
  }

  // parse sent messages
  mappingMessage(message) {
    const messageSent = new MessageSent();
    messageSent.isSeen = true;
    messageSent.progress = {
      name:
        message.messageStatus == "IN_PROGRESS"
          ? "En cours"
          : message.messageStatus == "TREATED"
          ? "répondu"
          : message.toReceivers[0] && message.toReceivers[0].seen
          ? "Lu"
          : "Envoyé",
      value:
        message.messageStatus == "IN_PROGRESS"
          ? 80
          : message.messageStatus == "TREATED"
          ? 100
          : message.toReceivers[0] && message.toReceivers[0].seen
          ? 50
          : 20,
    };
    messageSent.users = [];
    message.toReceivers.forEach((r) => {
      messageSent.users.push({
        fullName: r.fullName,
        img: this.avatars.user,
        title: r.jobTitle,
        type: r.role,
        photoId: r.photoId,
        civility: r.civility,
        id: r.receiverId ? r.receiverId : null,
      });
    });
    messageSent.object = {
      name: message.object,
      isImportant: message.importantObject,
    };
    messageSent.time = message.createdAt;
    messageSent.isImportant = message.important;
    messageSent.hasFiles = message.hasFiles;
    messageSent.hasViewDetail = message.hasViewDetail;
    messageSent.isArchieve = true;
    return messageSent;
  }

  parseMessages(messages) {
    let parsedMessages = [];
    messages.forEach((message) => {
      const messageSent = this.mappingMessage(message);
      messageSent.id = message.id;
      messageSent.users.forEach((user) => {
        if (!this.featuresService.photosArray.has(user.id)) {
          this.featuresService.photosArray.set(user.id, null);
          this.documentService.getDefaultImage(user.id).subscribe(
            (response) => {
              let myReader: FileReader = new FileReader();
              myReader.onloadend = (e) => {
                user.img = this.sanitizer.bypassSecurityTrustUrl(
                  myReader.result as string
                );
                this.featuresService.photosArray.set(user.id, user.img);
                this.updateImageOfParsedMessages(user.id);
              };
              let ok = myReader.readAsDataURL(response);
            },
            (error) => {
              user.img = "assets/imgs/user.png";
            }
          );
        } else {
          user.img = this.featuresService.photosArray.get(user.id);
        }
      });
      parsedMessages.push(messageSent);
    });
    return parsedMessages;
  }
  updateImageOfParsedMessages(id) {
    this.featuresService
      .getSearchSentValue()
      .filter((e) => e.users[0].id == id)
      .forEach((e) => {
        e.users[0].img = this.featuresService.photosArray.get(id);
      });
    this.featuresService
      .getSearchForwardedValue()
      .filter((e) => e.users.length > 0 && e.users[0].id == id)
      .forEach((e) => {
        e.users[0].img = this.featuresService.photosArray.get(id);
      });
    this.featuresService
      .getSearchArchiveValue()
      .filter((e) => e.users[0].id == id)
      .forEach((e) => {
        e.users[0].img = this.featuresService.photosArray.get(id);
      });
    this.featuresService
      .getSearchInboxValue()
      .filter((e) => e.users[0].id == id)
      .forEach((e) => {
        e.users[0].img = this.featuresService.photosArray.get(id);
      });
  }

  // parse archive message
  mappingMessageArchived(message) {
    const messageArchived = new MessageArchived();
    const senderRole = message?.senderDetail?.role;
    const senderRolePascalCase = this.roleObjectPipe.transform(senderRole);

    messageArchived.id = message.id;
    messageArchived.isSeen = message.seen;
    messageArchived.users = [
      {
        fullName: message.senderDetail[senderRolePascalCase].fullName,
        img: this.avatars.user,
        title: message.senderDetail.practician
          ? message.senderDetail.practician.title
          : "",
        type: senderRole == "PRACTICIAN" ? "MEDICAL" : senderRole,
        photoId: this.getPhotoId(message.senderDetail),
        civility:
          senderRole == "PATIENT"
            ? message.senderDetail.patient.civility
            : null,
        id: message.senderDetail.id,
      },
    ];
    messageArchived.progress = {
      name:
        message.messageStatus == "TREATED"
          ? "répondu"
          : message.toReceiversArchived[0].seen
          ? "Lu"
          : "Envoyé",
      value:
        message.messageStatus == "TREATED"
          ? 100
          : message.toReceiversArchived[0].seen
          ? 50
          : 20,
    };
    messageArchived.object = {
      name: message.object,
      isImportant: message.importantObject,
    };
    messageArchived.time = message.createdAt;
    messageArchived.isImportant = message.important;
    messageArchived.hasFiles = message.hasFiles;
    messageArchived.isViewDetail = message.hasViewDetail;
    messageArchived.isChecked = false;

    return messageArchived;
  }

  loadPhoto(user) {
    this.documentService.getDefaultImage(user.id).subscribe(
      (response) => {
        let myReader: FileReader = new FileReader();
        myReader.onloadend = (e) => {
          user.img = this.sanitizer.bypassSecurityTrustUrl(
            myReader.result as string
          );
          this.featuresService.photosArray.set(user.id, user.img);
          this.updateImageOfParsedMessages(user.id);
        };
        let ok = myReader.readAsDataURL(response);
      },
      (error) => {
        user.img = "assets/imgs/user.png";
      }
    );
  }

  getPhotoId(senderDetail): string {
    switch (senderDetail.role) {
      case "PATIENT":
        return senderDetail.patient.photoId;
      case "PRACTICIAN":
        return senderDetail.practician.photoId;
      case "SECRETARY":
        return senderDetail.secretary.photoId;
      case "TELESECRETARYGROUP":
        return senderDetail.telesecretaryGroup.photoId;
      case "SUPERVISOR" || "SUPER_SUPERVISOR" || "OPERATOR":
        return senderDetail.telesecretary.photoId;
      default:
        return null;
    }
  }

  mapArchiveMessages(message) {
    const archivedMessage = this.mappingMessageArchived(message);
    archivedMessage.users.forEach((user) => {
      if (!this.featuresService.photosArray.has(user.id)) {
        this.featuresService.photosArray.set(user.id, null);
        this.loadPhoto(user);
      } else {
        user.img = this.featuresService.photosArray.get(user.id);
      }
    });
    return archivedMessage;
  }

  myObjects() {
    jQuery("#sidebar").addClass("hidden-side-bar");
    this.scrolToTop();
    this.router.navigate(["mes-objets"]);
  }
  myCategories() {
    jQuery("#sidebar").addClass("hidden-side-bar");
    this.scrolToTop();
    this.router.navigate(["mes-categories"]);
  }
  scrolToTop() {
    jQuery([document.documentElement, document.body]).animate(
      {
        scrollTop: $("#main-container").offset().top - 100,
      },
      1000
    );
  }
  displayMySubCategoriesAction(event) {
    jQuery("#sidebar").addClass("hidden-side-bar");
    this.scrolToTop();
    this.router.navigate(["/messagerie"], {
      queryParams: {
        category: event,
      },
    });
  }
  countCategories() {
    this.featuresService.countCategories();
  }
}
