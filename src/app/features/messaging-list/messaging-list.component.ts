import { Component, OnInit, ViewChild, Input } from "@angular/core";
import { MessagingListService } from "../services/messaging-list.service";
import { Router, ActivatedRoute } from "@angular/router";
import { NotifierService } from "angular-notifier";
import { GlobalService } from "@app/core/services/global.service";
import { FeaturesService } from "../features.service";
import { MyDocumentsService } from "../my-documents/my-documents.service";
import { BehaviorSubject } from 'rxjs';
import { OrderDirection } from '@app/shared/enmus/order-direction';
import { MyPatientsService } from '../services/my-patients.service';

@Component({
  selector: "app-messaging-list",
  templateUrl: "./messaging-list.component.html",
  styleUrls: ["./messaging-list.component.scss"],
})
export class MessagingListComponent implements OnInit {
  @Input("isPatientFile") isPatientFile = false;
  @Input("patientId") patientId: number;
  @Input("patientFileId") patientFileId: number;
  private patientAccountId: number;
  person;
  showAcceptRefuse = true;
  isMyInbox = true;
  inboxName = "";
  imageSource: string;
  practicianImage: string;
  messages: Array<any>;
  itemsList: Array<any>;
  filtredItemList: Array<any> = new Array();
  selectedObjects: Array<any>;
  myPracticians = [];
  links = {
    isAllSelect: true,
    isAllSeen: true,
    isSeen: false,
    isArchieve: true,
    isImportant: false,
    isFilter: true,
  };
  page = "INBOX";
  number: number;
  topText = "Boîte de réception";
  bottomText =
    this.number > 1
      ? this.globalService.messagesDisplayScreen.newMessages
      : this.globalService.messagesDisplayScreen.newMessage;
  backButton = false;
  @ViewChild("customNotification", { static: true }) customNotificationTmpl;
  private readonly notifier: NotifierService;

  pageNo = 0;
  listLength = 10;
  scroll = false;
  paramsId;
  avatars: { doctor: string; child: string; women: string; man: string; secretary: string; user: string; tls: string; };
  searchContext = false;
  direction: OrderDirection = OrderDirection.DESC;
  constructor(
    private messagesServ: MessagingListService,
    public router: Router,
    private route: ActivatedRoute,
    notifierService: NotifierService,
    private featureService: FeaturesService,
    private globalService: GlobalService,
    private documentService: MyDocumentsService,
    private patientService: MyPatientsService
  ) {
    this.notifier = notifierService;
    this.avatars = this.globalService.avatars;
    this.practicianImage = this.avatars.doctor;
    this.imageSource = this.avatars.user;


  }

  ngOnInit(): void {
    this.featureService.setActiveChild("inbox");
    this.itemsList = new Array();
    this.route.params.subscribe((params) => {
      this.pageNo = 0;
      this.listLength = 10;
      this.itemsList = new Array();
      this.filtredItemList = new Array();
      this.messages = [];
      this.getRealTimeMessage();
      this.getPracticianRealTimeMessage();
      if (
        params["id"] ||
        (this.isPatientFile &&
          this.featureService.selectedPracticianId != 0 &&
          this.featureService.selectedPracticianId !=
          this.featureService.getUserId())
      ) {
        this.isPatientFile ? (this.topText = "Historique des échanges -")
          : (this.topText = "Boîte de réception");
        this.isMyInbox = false;
        this.featureService.selectedPracticianId = params["id"]
          ? params["id"]
          : this.featureService.selectedPracticianId;
        this.myPracticians = this.featureService.myPracticians.getValue();

        if (this.myPracticians && this.myPracticians.length > 0) {
          this.person = {
            fullName: this.myPracticians.find(
              (p) => p.id == this.featureService.selectedPracticianId
            ).fullName,
            picture: this.practicianImage,
          };


          let photoId = this.myPracticians.find(
            (p) => p.id == this.featureService.selectedPracticianId
          ).photo;
          if (photoId && photoId != null) {
            this.documentService.downloadFile(photoId).subscribe(
              (response) => {
                let myReader: FileReader = new FileReader();
                myReader.onloadend = (e) => {
                  this.person.picture = myReader.result;
                };
                let ok = myReader.readAsDataURL(response.body);
              },
              (error) => {
                this.person.picture = this.practicianImage;
              }
            );
          }
        }

        this.isPatientFile
          ? (this.links = {
            isAllSelect: true,
            isAllSeen: true,
            isSeen: false,
            isArchieve: false,
            isImportant: false,
            isFilter: false,
          })
          : (this.links = {
            isAllSelect: true,
            isAllSeen: true,
            isSeen: false,
            isArchieve: false,
            isImportant: false,
            isFilter: true,
          });
        this.paramsId = this.featureService.selectedPracticianId;
        this.getMyInbox(this.featureService.selectedPracticianId, this.pageNo);
        this.searchInboxPractician(this.featureService.selectedPracticianId);
      } else {
        this.featureService.selectedPracticianId = 0;
        this.featureService.getNumberOfInbox().subscribe(val => {
          this.number = val;
          this.bottomText =
            this.number > 1
              ? this.globalService.messagesDisplayScreen.newMessages
              : this.globalService.messagesDisplayScreen.newMessage;
        });
        this.isPatientFile
          ? (this.links = {
            isAllSelect: true,
            isAllSeen: true,
            isSeen: false,
            isArchieve: true,
            isImportant: false,
            isFilter: false,
          })
          : (this.links = {
            isAllSelect: true,
            isAllSeen: true,
            isSeen: false,
            isArchieve: true,
            isImportant: false,
            isFilter: true,
          });
        this.isPatientFile
          ? (this.topText = "Historique des échanges")
          : (this.topText = "Boîte de réception");
        this.featureService.selectedPracticianId = 0;
        this.isMyInbox = true;
        this.paramsId = this.featureService.getUserId();
        this.getMyInbox(this.featureService.getUserId(), this.pageNo);
        this.searchInbox();
      }
    });

    this.route.queryParams.subscribe((params) => {
      if (params["status"]) {
        let notifMessage = "";
        switch (params["status"]) {
          case "sentSuccess": {
            notifMessage = this.globalService.toastrMessages
              .send_message_success;
            break;
          }
          case "archiveSuccess": {
            notifMessage = this.globalService.toastrMessages
              .archived_message_success;
            break;
          }
        }
        this.notifier.show({
          message: notifMessage,
          type: "info",
          template: this.customNotificationTmpl,
        });
      }
    });
    this.featureService.setIsMessaging(true);
  }

  cardClicked(item) {
    this.markMessageAsSeen(item);
    this.router.navigate(["/messagerie-lire/" + item.id], {
      queryParams: {
        context: this.isMyInbox ? "inbox" : "inboxPraticien",
      },
    });
  }

  selectAllActionClicked() {
    this.filtredItemList.forEach((a) => {
      a.isChecked = true;
    });
  }

  deSelectAllActionClicked() {
    this.filtredItemList.forEach((a) => {
      a.isChecked = false;
    });
  }
  seenAllActionClicked() {
    const messagesId = this.filtredItemList.map((e) => e.id);
    if (messagesId.length > 0) {
      if (this.isMyInbox) {
        this.messagesServ.markMessageListAsSeen(messagesId).subscribe(
          (resp) => {
            if (resp == true) {
              this.filtredItemList.forEach((item) => (item.isSeen = true));
              this.featureService.listNotifications = this.featureService.listNotifications.filter(
                (notification) => notification.type != "MESSAGE"
              );
              this.featureService.setNumberOfInbox(0);
            }
          },
          (error) => {
            console.log("We have to find a way to notify user by this error");
          }
        );
      } else {
        this.messagesServ
          .markMessageListAsSeenByReceiverId(
            messagesId,
            this.featureService.selectedPracticianId
          )
          .subscribe(
            (resp) => {
              if (resp == true) {
                let list: any[] = this.featureService.myPracticians.getValue();
                if (list && list.length > 0) {
                  this.featureService.updateNumberOfInboxForPractician(
                    this.featureService.selectedPracticianId,
                    0
                  );
                }
                this.bottomText = this.globalService.messagesDisplayScreen.newMessage;

                this.itemsList.forEach((item) => (item.isSeen = true));
                this.filtredItemList.forEach((item) => (item.isSeen = true));
              }
            },
            (error) => {
              console.log("We have to find a way to notify user by this error");
            }
          );
      }
      this.featureService.markAsSeen(this.featureService.searchInbox, messagesId);
    }
  }

  archieveActionClicked() {
    const messagesId = this.filtredItemList
      .filter((e) => e.isChecked == true)
      .map((e) => e.id);
    if (messagesId.length > 0) {
      this.messagesServ.markMessageAsArchived(messagesId).subscribe(
        (resp) => {
          let listToArchive = (this.itemsList.slice(0).filter(function (elm, ind) {
            return messagesId.indexOf(elm.id) != -1;
          }));
          listToArchive.forEach((message) => {
            if (!message.isSeen) {
              this.featureService.numberOfArchieve++;
              this.featureService.setNumberOfInbox(
                this.number - 1
              );
            }
            this.featureService.listNotifications = this.featureService.listNotifications.filter(
              (notification) =>
                !listToArchive
                  .map((message) => message.id)
                  .includes(notification.messageId)
            );
          });
          this.itemsList = this.itemsList.filter(elm => !messagesId.includes(elm.id))
          this.filtredItemList = this.filtredItemList.filter(elm => !messagesId.includes(elm.id))
          this.deleteElementsFromInbox(messagesId.slice(0));
          this.featureService.archiveState.next(true);
        },
        (error) => {
          console.log("We have to find a way to notify user by this error");
        }
      );
    }
  }
  filterActionClicked(event) {
    this.filtredItemList =
      event == "all"
        ? this.itemsList
        : this.itemsList.filter(
          (item) => {
            switch (event) {
              case "doctor":
                return item.users[0].type.toLowerCase() == "medical";
              case "secretary":
                return item.users[0].type.toLowerCase() == "secretary" ||
                  item.users[0].type.toLowerCase() == "telesecretarygroup"
              default:
                return item.users[0].type.toLowerCase() == event;

            }

          }

        );
  }

  getMyInbox(accountId, pageNo) {
    this.messagesServ
      .getInboxByAccountId(accountId, pageNo, this.direction)
      .subscribe((retrievedMess) => {
        if (!this.isMyInbox) {
          this.featureService.myPracticians.asObservable().subscribe(list => {
            this.number = list.find(
              (p) => p.id == this.featureService.selectedPracticianId
            ).number
            this.bottomText =
              this.number > 1
                ? this.globalService.messagesDisplayScreen.newMessages
                : this.globalService.messagesDisplayScreen.newMessage;
          })
        }
        if (this.patientFileId) {
          this.messagesServ.getMessagesByPatientFile(this.patientFileId, pageNo, this.direction).subscribe(res => {
            this.messages = res;
          });
          if (this.patientId != null) {
            this.patientService.getAccountIdByPatientId(this.patientId).subscribe(res => {
              this.patientAccountId = res;
              this.messages.push(...retrievedMess.filter(
                (message) => message.sender.senderId == this.patientAccountId));
            });
          }
          this.messages.sort(function (m1, m2) {
            return (
              new Date(m2.updatedAt).getTime() - new Date(m1.updatedAt).getTime()
            );
          });
          this.itemsList.push(
            ...this.messages.map((item) => this.parseMessage(item))
          );
          this.filtredItemList = this.itemsList;
          this.topText = this.globalService.messagesDisplayScreen.history
          this.bottomText = ""
        }
        else {
          this.messages = retrievedMess;
          this.messages.sort(function (m1, m2) {
            return (
              new Date(m2.updatedAt).getTime() - new Date(m1.updatedAt).getTime()
            );
          });
          this.itemsList.push(
            ...this.messages.map((item) => this.parseMessage(item))
          );
          this.filtredItemList = this.itemsList;
        }
      });
  }

  getMyInboxNextPage(accountId, pageNo) {
    this.messagesServ
      .getInboxByAccountId(accountId, pageNo, this.direction)
      .subscribe((retrievedMess) => {
        this.listLength = retrievedMess.length
        if (retrievedMess.length > 0) {
          if (this.patientFileId) {
            this.messagesServ.getMessagesByPatientFile(this.patientFileId, pageNo, this.direction).subscribe(res => {
              this.messages = res;
            });
            if (this.patientId != null) {
              this.patientService.getAccountIdByPatientId(this.patientId).subscribe(res => {
                this.patientAccountId = res;
                this.messages.push(...retrievedMess.filter(
                  (message) => message.sender.senderId == this.patientAccountId));
              })
            }
            this.messages.sort(function (m1, m2) {
              return (
                new Date(m2.updatedAt).getTime() - new Date(m1.updatedAt).getTime()
              );
            });
            this.itemsList.push(
              ...this.messages.map((item) => this.parseMessage(item))
            );
            this.filtredItemList = this.itemsList;
            this.topText = this.globalService.messagesDisplayScreen.history
            this.bottomText = ""
          }

          else {
            this.messages = retrievedMess;
            this.messages.sort(function (m1, m2) {
              return (
                new Date(m2.updatedAt).getTime() - new Date(m1.updatedAt).getTime()
              );
            });
            this.itemsList.push(
              ...this.messages.map((item) => this.parseMessage(item))
            );
            if (this.filtredItemList.length != this.itemsList.length) {
              this.filtredItemList = this.itemsList.filter(item => item.users[0].type.toLowerCase() == this.filtredItemList[0].users[0].type.toLowerCase());
            }
          }
        }
      });
  }

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
      isArchieve: this.isMyInbox,
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

  markMessageAsSeen(event) {
    let messageId = event.id;
    if (this.isMyInbox) {
      this.messagesServ.markMessageAsSeen(messageId).subscribe(
        (resp) => {
          if (resp == true) {
            if (!event.isSeen) {
              this.bottomText =
                this.number > 1
                  ? this.globalService.messagesDisplayScreen.newMessages
                  : this.globalService.messagesDisplayScreen.newMessage;
              let notifLength = this.featureService.listNotifications.length;
              this.featureService.listNotifications = this.featureService.listNotifications.filter(
                (notif) => notif.messageId != event.id
              );
              this.featureService.setNumberOfInbox(
                this.featureService.getNumberOfInboxValue() - 1
              );
              this.featureService.markAsSeen(this.featureService.searchInbox, [messageId]);
            }

            let filtredIndex = this.filtredItemList.findIndex(
              (item) => item.id == messageId
            );
            if (filtredIndex != -1) {
              this.filtredItemList[filtredIndex].isSeen = true;
            }
          }
        },
        (error) => {
          console.log("We have to find a way to notify user by this error");
        }
      );
    } else {
      this.messagesServ
        .markMessageAsSeenByReveiverId(
          messageId,
          this.featureService.selectedPracticianId
        )
        .subscribe(
          (resp) => {
            if (!event.isSeen) {
              let list: any[] = this.featureService.myPracticians.getValue();
              let selectedInboxNumber;
              if (list && list.length > 0) {
                selectedInboxNumber = list.find(
                  (p) => p.id == this.featureService.selectedPracticianId
                ).number;
                this.featureService.updateNumberOfInboxForPractician(
                  this.featureService.selectedPracticianId,
                  selectedInboxNumber - 1
                );
              }
              this.bottomText =
                this.number > 1
                  ? this.globalService.messagesDisplayScreen.newMessages
                  : this.globalService.messagesDisplayScreen.newMessage;
            }
            if (resp == true) {
              let index = this.itemsList.findIndex(
                (item) => item.id == messageId
              );
              if (index != -1) {
                this.itemsList[index].isSeen = true;
              }
              let filtredIndex = this.filtredItemList.findIndex(
                (item) => item.id == messageId
              );
              if (index != -1) {
                this.filtredItemList[filtredIndex].isSeen = true;
              }
            }
          },
          (error) => {
            console.log("We have to find a way to notify user by this error");
          }
        );
    }
  }

  archieveMessage(event) {
    let messageId = event.id;
    this.messagesServ.markMessageAsArchived([messageId]).subscribe(
      (resp) => {
        this.itemsList = this.itemsList.filter(function (elm, ind) {
          return elm.id != event.id;
        });
        this.filtredItemList = this.filtredItemList.filter(function (elm, ind) {
          return elm.id != event.id;
        });
        this.deleteElementsFromInbox([messageId]);
        this.featureService.archiveState.next(true);
        if (!event.isSeen) {
          this.featureService.numberOfArchieve++;
          this.featureService.setNumberOfInbox(
            this.featureService.getNumberOfInboxValue() - 1
          );
          this.featureService.listNotifications = this.featureService.listNotifications.filter(
            (notification) => notification.messageId != event.id
          );
        }
      },
      (error) => {
        console.log("We have to find a way to notify user by this error");
      }
    );
  }
  selectItem(event) {
    this.selectedObjects = event.filter((a) => a.isChecked == true);
  }

  getRealTimeMessage() {
    this.messagesServ.getNotificationObs().subscribe((notif) => {
      if (notif != "") {
        if (this.isMyInbox) {
          let message = this.parseMessage(notif.message);
          if (notif.message.sender.photoId) {
            this.documentService
              .downloadFile(notif.message.sender.photoId)
              .subscribe(
                (response) => {
                  let myReader: FileReader = new FileReader();
                  myReader.onloadend = (e) => {
                    message.users.forEach((user) => {
                      user.img = myReader.result;
                    });
                  };
                  let ok = myReader.readAsDataURL(response.body);
                },
                (error) => {
                  message.users.forEach((user) => {
                    user.img = this.avatars.user;
                  });
                }
              );
          }

          this.filtredItemList.unshift(message);

          this.bottomText =
            this.number > 1
              ? this.globalService.messagesDisplayScreen.newMessages
              : this.globalService.messagesDisplayScreen.newMessage;
        }
      }
    });
  }

  getPracticianRealTimeMessage() {
    this.messagesServ.getPracticianNotifObs().subscribe((notif) => {
      if (notif != "" && this.messagesServ.practicianNotifPreviousValue != notif.id) {
        let num = this.featureService.myPracticians.getValue().find(elm => elm.id == notif.receiverId).number;
        this.featureService.updateNumberOfInboxForPractician(
          notif.receiverId,
          num + 1
        );
        this.messagesServ.practicianNotifPreviousValue = notif.id;
        if (!this.isMyInbox && this.featureService.selectedPracticianId == notif.receiverId) {
          let message = this.parseMessage(notif.message);
          if (notif.message.sender.photoId) {
            this.documentService
              .downloadFile(notif.message.sender.photoId)
              .subscribe(
                (response) => {
                  let myReader: FileReader = new FileReader();
                  myReader.onloadend = (e) => {
                    message.users.forEach((user) => {
                      user.img = myReader.result;
                    });
                  };
                  let ok = myReader.readAsDataURL(response.body);
                },
                (error) => {
                  message.users.forEach((user) => {
                    user.img = this.avatars.user;
                  });
                }
              );
          }

          this.filtredItemList.unshift(message);

          this.bottomText =
            this.number > 1
              ? this.globalService.messagesDisplayScreen.newMessages
              : this.globalService.messagesDisplayScreen.newMessage;
        }
      }
    });
  }

  onScroll() {
    if (this.listLength > 9 && !this.searchContext) {
      this.pageNo++;
      this.getMyInboxNextPage(this.paramsId, this.pageNo);
    }
  }

  deleteElementsFromInbox(ids) {
    let searchList = this.featureService.getSearchInboxValue();
    searchList = searchList.filter(x => !ids.includes(x.id))
    this.featureService.setSearchInbox(searchList);
  }

  searchInbox() {
    this.featureService.getFilteredInboxSearch().subscribe(res => {
      if (res == null) {
        this.filtredItemList = [];
        this.searchContext = true;
      } else if (res?.length > 0) {
        this.filtredItemList = res;
        this.searchContext = true;
      } else {
        this.filtredItemList = this.itemsList;
        this.searchContext = false;
      }
    })
  }

  searchInboxPractician(id: number) {
    const numb = +id;
    if (this.featureService.searchPracticianInboxFiltered && this.featureService.searchPracticianInboxFiltered.get(numb)) {
      this.featureService.searchPracticianInboxFiltered.get(numb).subscribe(res => {
        if (res == null) {
          this.filtredItemList = [];
          this.searchContext = true;
        } else if (res?.length > 0) {
          this.filtredItemList = res;
          this.searchContext = true;
        } else {
          this.filtredItemList = this.itemsList;
          this.searchContext = false;
        }
      })
    } else {
      setTimeout(() => {
        this.searchInboxPractician(id)
      }, 1000);
    }
  }

  upSortClicked() {
    this.direction = OrderDirection.ASC;
    this.resetList();
  }

  downSortClicked() {
    this.direction = OrderDirection.DESC;
    this.resetList();
  }

  resetList() {
    this.pageNo = 0;
    this.itemsList = [];
    this.filtredItemList = [];
    this.getMyInbox(this.paramsId, this.pageNo);
  }

   public refreshMessagingList() {
     this.filtredItemList = [];
     this.ngOnInit();
   }

}
