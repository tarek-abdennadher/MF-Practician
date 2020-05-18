import { Component, OnInit, ViewChild, Input } from "@angular/core";
import { MessagingListService } from "../services/messaging-list.service";
import { Router, ActivatedRoute } from "@angular/router";
import { NotifierService } from "angular-notifier";
import { GlobalService } from "@app/core/services/global.service";
import { FeaturesService } from "../features.service";
import { MyDocumentsService } from "../my-documents/my-documents.service";

@Component({
  selector: "app-messaging-list",
  templateUrl: "./messaging-list.component.html",
  styleUrls: ["./messaging-list.component.scss"],
})
export class MessagingListComponent implements OnInit {
  @Input("isPatientFile") isPatientFile = false;
  @Input("idAccount") idAccount: number;
  person;
  showAcceptRefuse = true;
  isMyInbox = true;
  inboxName = "";
  imageSource = "assets/imgs/user.png";
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
  listLength = 0;
  scroll = false;
  paramsId;
  constructor(
    private messagesServ: MessagingListService,
    public router: Router,
    private route: ActivatedRoute,
    notifierService: NotifierService,
    private featureService: FeaturesService,
    private globalService: GlobalService,
    private documentService: MyDocumentsService
  ) {
    this.notifier = notifierService;
  }

  ngOnInit(): void {
    this.featureService.getNumberOfInbox().subscribe(val => {
      this.number = val;
    });
    this.itemsList = new Array();
    this.route.params.subscribe((params) => {
      this.pageNo = 0;
      this.listLength = 0;
      this.itemsList = new Array();
      this.filtredItemList = new Array();
      this.messages = [];
      if (
        params["id"] ||
        (this.isPatientFile &&
          this.featureService.selectedPracticianId != 0 &&
          this.featureService.selectedPracticianId !=
            this.featureService.getUserId())
      ) {
        this.isPatientFile
          ? (this.topText = "Historique des échanges -")
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
            picture: this.imageSource,
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
                this.person.picture = this.imageSource;
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
      } else {
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
      }
    });

    this.getRealTimeMessage();
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
              this.number = 0;
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
                this.number = 0;
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
    }
  }

  archieveActionClicked() {
    const messagesId = this.filtredItemList
      .filter((e) => e.isChecked == true)
      .map((e) => e.id);
    if (messagesId.length > 0) {
      this.messagesServ.markMessageAsArchived(messagesId).subscribe(
        (resp) => {
          let listToArchive = (this.itemsList = this.itemsList.filter(function (
            elm,
            ind
          ) {
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
          this.itemsList = this.itemsList.filter(function (elm, ind) {
            return messagesId.indexOf(elm.id) == -1;
          });
          this.filtredItemList = this.filtredItemList.filter(function (
            elm,
            ind
          ) {
            return messagesId.indexOf(elm.id) == -1;
          });
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
            (item) =>
              item.users[0].type.toLowerCase() ==
              (event == "doctor"
                ? "medical"
                : event == "secretary"
                ? "telesecretarygroup" || "secretary"
                : event)
          );
  }

  getMyInbox(accountId, pageNo) {
    this.messagesServ
      .getInboxByAccountId(accountId, pageNo)
      .subscribe((retrievedMess) => {
        this.messages = this.isPatientFile
          ? retrievedMess.filter(
              (message) => message.sender.senderId == this.idAccount
            )
          : retrievedMess;

        this.messages.sort(function (m1, m2) {
          return (
            new Date(m2.updatedAt).getTime() - new Date(m1.updatedAt).getTime()
          );
        });
        this.itemsList.push(
          ...this.messages.map((item) => this.parseMessage(item))
        );
        this.filtredItemList = this.itemsList;
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
          img: "assets/imgs/user.png",
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
      parsedMessage.users.forEach((user) => {
        this.documentService.downloadFile(parsedMessage.photoId).subscribe(
          (response) => {
            let myReader: FileReader = new FileReader();
            myReader.onloadend = (e) => {
              user.img = myReader.result.toString();
            };
            let ok = myReader.readAsDataURL(response.body);
          },
          (error) => {
            user.img = "assets/imgs/user.png";
          }
        );
      });
    } else {
      parsedMessage.users.forEach((user) => {
        if (user.type == "MEDICAL") {
          user.img = "assets/imgs/avatar_docteur.svg";
        } else if (user.type == "SECRETARY") {
          user.img = "assets/imgs/avatar_secrétaire.svg";
        } else if (user.type == "PATIENT") {
          if (user.civility == "M") {
            user.img = "assets/imgs/avatar_homme.svg";
          } else if (user.civility == "MME") {
            user.img = "assets/imgs/avatar_femme.svg";
          } else if (user.civility == "CHILD") {
            user.img = "assets/imgs/avatar_enfant.svg";
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
                    user.img = "assets/imgs/user.png";
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
    if (this.listLength != this.filtredItemList.length) {
      this.listLength = this.filtredItemList.length;
      this.pageNo++;

      this.getMyInbox(this.paramsId, this.pageNo);
    }
  }
}
