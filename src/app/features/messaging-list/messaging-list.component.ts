import { Component, OnInit, ViewChild } from "@angular/core";
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
  number = 0;
  topText = "Boite de réception";
  bottomText =
    this.number > 1
      ? this.globalService.messagesDisplayScreen.newMessages
      : this.globalService.messagesDisplayScreen.newMessage;
  backButton = false;
  @ViewChild("customNotification", { static: true }) customNotificationTmpl;
  private readonly notifier: NotifierService;
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
    this.topText = "Boite de réception";
    this.itemsList = new Array();
    this.route.params.subscribe((params) => {
      if (params["id"]) {
        this.isMyInbox = false;
        this.featureService.selectedPracticianId = params["id"];
        this.myPracticians = this.featureService.myPracticians.getValue();
        if (this.myPracticians && this.myPracticians.length > 0) {
          this.person = {
            fullName: this.myPracticians.find((p) => p.id == params["id"])
              .fullName,
            picture: this.imageSource,
          };
          let photoId = this.myPracticians.find((p) => p.id == params["id"])
            .photo;
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
        this.links = {
          isAllSelect: true,
          isAllSeen: true,
          isSeen: false,
          isArchieve: false,
          isImportant: false,
          isFilter: true,
        };
        this.getMyInbox(params["id"]);
      } else {
        this.isMyInbox = true;
        this.getMyInbox(this.featureService.getUserId());
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
    let notifLength = this.featureService.listNotifications.length;
    this.featureService.listNotifications = this.featureService.listNotifications.filter(
      (notif) => notif.messageId != item.id
    );
    if (notifLength > this.featureService.listNotifications.length) {
      this.featureService.setNumberOfInbox(
        this.featureService.numberOfInbox - 1
      );
    }
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
              this.itemsList.forEach((item) => (item.isSeen = true));
              this.filtredItemList.forEach((item) => (item.isSeen = true));
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
          let listToArchive = this.itemsList = this.itemsList.filter(function (elm, ind) {
            return messagesId.indexOf(elm.id) != -1;
          });
          listToArchive.forEach(message => {
            if(!message.isSeen){
              this.featureService.numberOfArchieve++
            }
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
              (event == "doctor" ? "medical" : event)
          );
  }

  getMyInbox(accountId) {
    this.messagesServ
      .getInboxByAccountId(accountId)
      .subscribe((retrievedMess) => {
        this.messages = retrievedMess;
        this.number = retrievedMess.filter(
          (a) => a.seenAsReceiver == false
        ).length;
        this.bottomText =
          this.number > 1
            ? this.globalService.messagesDisplayScreen.newMessages
            : this.globalService.messagesDisplayScreen.newMessage;
        if (this.isMyInbox) {
          this.featureService.setNumberOfInbox(this.number);
        } else {
          this.featureService.updateNumberOfInboxForPractician(
            accountId,
            this.number
          );
        }
        this.messages.sort(function (m1, m2) {
          return (
            new Date(m2.updatedAt).getTime() - new Date(m1.updatedAt).getTime()
          );
        });
        this.itemsList = this.messages.map((item) => this.parseMessage(item));
        this.filtredItemList = this.itemsList;
        this.itemsList.forEach((item) => {
          if (item.photoId) {
            item.users.forEach((user) => {
              this.documentService.downloadFile(item.photoId).subscribe(
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
            });
          }
        });
      });
  }

  parseMessage(message): any {
    return {
      id: message.id,
      isSeen: message.seenAsReceiver,
      users: [
        {
          id: message.sender.id,
          fullName: message.sender.fullName,
          img: "assets/imgs/user.png",
          title: message.sender.jobTitle,
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
  }

  markMessageAsSeen(event) {
    let messageId = event.id;
    if (this.isMyInbox) {
      this.messagesServ.markMessageAsSeen(messageId).subscribe(
        (resp) => {
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
    } else {
      this.messagesServ
        .markMessageAsSeenByReveiverId(
          messageId,
          this.featureService.selectedPracticianId
        )
        .subscribe(
          (resp) => {
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
        if(!event.isSeen){
          this.featureService.numberOfArchieve++;
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
          this.itemsList.unshift(this.parseMessage(notif.message));
          this.number++;
          this.bottomText =
            this.number > 1
              ? this.globalService.messagesDisplayScreen.newMessages
              : this.globalService.messagesDisplayScreen.newMessage;
        }
      }
    });
  }
}
