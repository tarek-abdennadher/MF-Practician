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
import { forkJoin, BehaviorSubject } from "rxjs";
import { PracticianSearch } from "./practician-search/practician-search.model";
import { PatientSerch, CitySerch } from "./my-patients/my-patients";
import { JobtitlePipe } from '@app/shared/pipes/jobTitle.pipe';
import { ArchieveMessagesService } from './archieve-messages/archieve-messages.service';
import { MessageService } from './services/message.service';
import { MessageSent } from '@app/shared/models/message-sent';
import { MessageArchived } from './archieve-messages/message-archived';
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
  inboxNumber: any;
  avatars:any
  practicians: any;
  secretaryIds: any = [];
  constructor(
    public router: Router,
    private localSt: LocalStorageService,
    public featuresService: FeaturesService,
    private searchService: PracticianSearchService,
    private globalService: GlobalService,
    private messageListService: MessagingListService,
    private messageService: MessageService,
    private messageArchiveService: ArchieveMessagesService,
    private documentService: MyDocumentsService,
    private accountService: AccountService,
    private practicianSearchService: PracticianSearchService,
    private jobTitlePipe: JobtitlePipe
  ) {
    this.initializeWebSocketConnection();
    this.getPracticiansRealTimeMessage();
    this.avatars = this.globalService.avatars;
  }
  public myPracticians = [];

  user = this.localSt.retrieve("user");
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
    this.featuresService.fullName = this.jobTitlePipe.transform(this.user.jobTitle) + " "+ this.user?.firstName + " " + this.user?.lastName;
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
    this.getAllInbox();
    this.getAllArchive();
    this.sentMessage();
    this.observeState();
  }

  observeState() {
    this.featuresService.inboxState.subscribe(state => {
      if(state) {
        this.getAllInbox();
        this.featuresService.inboxState.next(false);
      }
    })
    this.featuresService.sentState.subscribe(state => {
      if(state) {
        this.sentMessage();
        this.featuresService.sentState.next(false);
      }
    })
    this.featuresService.archiveState.subscribe(state => {
      if(state) {
        this.getAllArchive();
        this.featuresService.archiveState.next(false);
      }
    })
  }

  getAllInbox() {
    this.messageListService.getAllInboxMessages(1000000).subscribe(res => {
      let result = res.map(elm => this.parseMessage(elm))
      this.featuresService.setSearchInbox(result);
    });
  }

  getAllInboxByAccountId(id) {
    this.messageListService.getAllInboxByAccountId(id, 1000000).subscribe(res => {
      let result = res.map(elm => this.parseMessage(elm))
      let inboxObs = new BehaviorSubject(result);
      this.featuresService.searchPracticianInbox.set(id,inboxObs);
      this.featuresService.searchPracticianInboxFiltered.set(id,new BehaviorSubject([]));
    })
  }

  getAllArchive() {
    this.messageArchiveService.getAllMyArchivedMessages().subscribe(res => {
      let list = res.map(item => this.mapArchiveMessages(item));
      this.featuresService.setSearchArchive(list);
    })
  }

  sentMessage() {
    this.messageService.sentMessage().subscribe(res => {
      this.featuresService.setSearchSent(this.parseMessages(res));
    })
  }

  getPracticians() {
    this.practicianSearchService.getAllPracticians().subscribe((list) => {
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

  getPracticiansRealTimeMessage() {
    this.featuresService.getSecretaryPracticiansId().subscribe(ids => {
      this.secretaryIds = ids
      this.secretaryIds.forEach(id => {
        this.getAllInboxByAccountId(id);
      });
      for (var i = 0; i < ids.length; i++) {
        let id = ids[i];
        const ws = new SockJS(this.globalService.BASE_URL + "/socket");
        this.stompClientList[i] = Stomp.over(ws);
        this.stompClientList[i].debug = () => {};
        const that = this;
        this.stompClientList[i].connect({}, function (frame) {
          this.subscribe(
            "/topic/notification/" + id,
            (message) => {
              if (message.body) {
                let notification = JSON.parse(message.body);
                if (notification.type == "MESSAGE" || notification.type == "MESSAGE_IN_PROGRESS" ||
                    notification.type == "MESSAGE_TREATED") {
                  that.messageListService.setPracticianNotifObs(notification);
                }
              }
            }
          );
        });
      };
    })
  }

  getMyNotificationsNotSeen() {
    let notificationsFormated = [];
    this.featuresService
      .getMyNotificationsByMessagesNotSeen(false)
      .subscribe((notifications) => {
        notifications.forEach((notif) => {
          notificationsFormated.push({
            id: notif.id,
            sender: notif.jobTitle? this.jobTitlePipe.transform(notif.jobTitle) + " " + notif.senderFullName:notif.senderFullName,
            senderId: notif.senderId,
            picture: this.avatars.user,
            messageId: notif.messageId,
            type: notif.type,
            photoId: notif.senderPhotoId,
            role:notif.role,
            civility:notif.civility
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
                  }else {
                    if (notif.role == "PRACTICIAN") {
                      notif.picture = this.avatars.doctor;
                    } else if (notif.role == "SECRETARY") {
                      notif.picture = this.avatars.secretary;
                    } else if (notif.role == "TELESECRETARYGROUP") {
                      notif.picture = this.avatars.tls;
                    }else if (notif.role == "PATIENT") {
                      if (notif.civility == "M") {
                        notif.picture = this.avatars.man;
                      } else if (notif.civility == "MME") {
                        notif.picture =this.avatars.women;
                      } else if (notif.civility == "CHILD") {
                        notif.picture = this.avatars.child;
                      }
                    }
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
    if (this.featuresService.activeChild.getValue() == "inbox") {
      let practicianId = + this.featuresService.selectedPracticianId
      if (practicianId == 0) {
        if (event) {
          let result = this.featuresService.getSearchInboxValue().filter(x => ((x.users[0].fullName).toLowerCase().includes(event.toLowerCase()) || (x.object.name).toLowerCase().includes(event.toLowerCase())))
          result = result.length > 0 ? result : null;
          this.featuresService.setFilteredInboxSearch(result);
        }
        else {
          this.featuresService.setFilteredInboxSearch([]);
        }
      } else {
          if (event) {
            let result = this.featuresService.searchPracticianInbox.get(practicianId).getValue().filter(x => ((x.users[0].fullName).toLowerCase().includes(event.toLowerCase()) || (x.object.name).toLowerCase().includes(event.toLowerCase())));
            result = result.length > 0 ? result : null;
            this.featuresService.searchPracticianInboxFiltered.get(practicianId).next(result);
          }
          else {
            this.featuresService.searchPracticianInboxFiltered.get(practicianId).next([]);
          }
      }
    } else if (this.featuresService.activeChild.getValue() == "sent") {
      if (event) {
        let result = this.featuresService.getSearchSentValue().filter(x => ((x.users[0].fullName).toLowerCase().includes(event.toLowerCase()) || (x.object.name).toLowerCase().includes(event.toLowerCase())))
        result = result.length > 0 ? result : null;
        this.featuresService.setFilteredSentSearch(result);
      }
      else {
        this.featuresService.setFilteredSentSearch([]);
      }
    } else if (this.featuresService.activeChild.getValue() == "archived") {
      if (event) {
        let result = this.featuresService.getSearchArchiveValue().filter(x => ((x.users[0].fullName).toLowerCase().includes(event.toLowerCase()) || (x.object.name).toLowerCase().includes(event.toLowerCase())))
        result = result.length > 0 ? result : null;
        this.featuresService.setFilteredArchiveSearch(result);
      }
      else {
        this.featuresService.setFilteredArchiveSearch([]);
      }
    } else if (this.featuresService.activeChild.getValue() == "practician") {
      if (event) {
        this.router.navigate(["/praticien-recherche"]);
        let result = this.practicians.filter(x => (x.fullName).toLowerCase().includes(event.toLowerCase()));
        result = result.length > 0 ? result : null;
        this.featuresService.setSearchFiltredPractician(result);
      } else {
        this.router.navigate(["/mes-contacts-pro"]);
      }
    }
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
          this.featuresService.imageSource = this.avatars.doctor;
        }
      } else if (account && account.secretary) {
        this.account = account.secretary;
        if (this.account.photoId) {
          this.hasImage = true;
          this.getPictureProfile(this.account.photoId);
        } else {
          this.featuresService.imageSource =
            this.avatars.secretary;
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
          id: message.sender.id,
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
    if (parsedMessage.photoId) {
      this.documentService.downloadFile(parsedMessage.photoId).subscribe(
        (response) => {
          let myReader: FileReader = new FileReader();
          myReader.onloadend = (e) => {
            parsedMessage.users[0].img = myReader.result.toString();
          };
          let ok = myReader.readAsDataURL(response.body);
        },
        (error) => {
          parsedMessage.users[0].img = this.avatars.user;
        }
      );
    } else {
      parsedMessage.users.forEach((user) => {
        if (user.type == "MEDICAL") {
          user.img = this.avatars.doctor;
        } else if (user.type == "SECRETARY") {
          user.img = this.avatars.secretary;
        } else if (user.type == "TELESECRETARYGROUP") {
          user.img = this.avatars.tls;
        } else if (user.type == "PATIENT") {
          if (user.civility == "M") {
            user.img = this.avatars.man;
          } else if (user.civility == "MME") {
            user.img = this.avatars.women;
          } else if (user.civility == "CHILD") {
            user.img = this.avatars.child;
          }
        }
      });
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
          : message.toReceivers[0].seen
          ? "Lu"
          : "Envoyé",
      value:
        message.messageStatus == "IN_PROGRESS"
          ? 80
          : message.messageStatus == "TREATED"
          ? 100
          : message.toReceivers[0].seen
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
        if (user.photoId) {
          this.documentService.downloadFile(user.photoId).subscribe(
            (response) => {
              let myReader: FileReader = new FileReader();
              myReader.onloadend = (e) => {
                user.img = myReader.result;
              };
              let ok = myReader.readAsDataURL(response.body);
            },
            (error) => {
              user.img = "assets/imgs/user.png";
            }
          );
        } else {
          if (user.type == "PRACTICIAN" || user.type == "MEDICAL") {
            user.img = this.avatars.doctor;
          } else if (user.type == "SECRETARY") {
            user.img = this.avatars.secretary;
          }else if (user.type == "TELESECRETARYGROUP") {
            user.img = this.avatars.tls;
          } else if (user.type == "PATIENT") {
            if (user.civility == "M") {
              user.img = this.avatars.man;
            } else if (user.civility == "MME") {
              user.img = this.avatars.women;
            } else if (user.civility == "CHILD") {
              user.img = this.avatars.child;
            }
          }
        }
      });
      parsedMessages.push(messageSent);
    });
    return parsedMessages;
  }

  // parse archive message
  mappingMessageArchived(message) {
    const messageArchived = new MessageArchived();
    messageArchived.id = message.id;
    messageArchived.isSeen = message.seen;
    messageArchived.users = [
      {
        fullName:
          message.senderDetail[message.senderDetail.role.toLowerCase()]
            .fullName,
        img: this.avatars.user,
        title: message.senderDetail.practician
          ? message.senderDetail.practician.title
          : "",
        type:
          message.senderDetail.role == "PRACTICIAN"
            ? "MEDICAL"
            : message.senderDetail.role,
        photoId: this.getPhotoId(message.senderDetail),
        civility:
          message.senderDetail.role == "PATIENT"
            ? message.senderDetail.patient.civility
            : null,
      },
    ];
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
    if (user.photoId) {
      this.documentService.downloadFile(user.photoId).subscribe(
        (response) => {
          let myReader: FileReader = new FileReader();
          myReader.onloadend = (e) => {
            user.img = myReader.result;
          };
          let ok = myReader.readAsDataURL(response.body);
        },
        (error) => {
          user.img = this.avatars.user;
        }
      );
    } else {
      if (user.type == "MEDICAL") {
        user.img =this.avatars.doctor;
      } else if (user.type == "SECRETARY") {
        user.img = this.avatars.secretary;
      }else if (user.type == "TELESECRETARYGROUP") {
        user.img = this.avatars.tls;
      } else if (user.type == "PATIENT") {
        if (user.civility == "M") {
          user.img = this.avatars.man;
        } else if (user.civility == "MME") {
          user.img = this.avatars.women;
        } else if (user.civility == "CHILD") {
          user.img = this.avatars.child;
        }
      }
    }
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
        return senderDetail.secretary.photoId;
      default:
        return null;
    }
  }

  mapArchiveMessages(message) {
    const archivedMessage = this.mappingMessageArchived(message);
    archivedMessage.users.forEach((user) => {
      this.loadPhoto(user)
    });
    return archivedMessage;
  }
}
