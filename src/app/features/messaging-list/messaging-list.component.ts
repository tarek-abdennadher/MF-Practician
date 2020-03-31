import { Component, OnInit, ViewChild } from "@angular/core";
import { MessagingListService } from "../services/messaging-list.service";
import { Router, ActivatedRoute } from "@angular/router";
import { NotifierService } from "angular-notifier";
import { GlobalService } from "@app/core/services/global.service";
import { FeaturesService } from '../features.service';

@Component({
  selector: "app-messaging-list",
  templateUrl: "./messaging-list.component.html",
  styleUrls: ["./messaging-list.component.scss"]
})
export class MessagingListComponent implements OnInit {
  imageSource = "assets/imgs/IMG_3944.jpg";
  messages: Array<any>;
  itemsList: Array<any>;
  filtredItemList: Array<any> = new Array();
  selectedObjects: Array<any>;
  links = {
    isAllSelect: true,
    isAllSeen: true,
    isSeen: false,
    isArchieve: true,
    isImportant: false,
    isFilter: true
  };
  page = "INBOX";
  number = 0;
  topText = "Boite de réception";
  bottomText = "nouveaux messages";
  backButton = false;
  @ViewChild("customNotification", { static: true }) customNotificationTmpl;
  private readonly notifier: NotifierService;
  constructor(
    private messagesServ: MessagingListService,
    public router: Router,
    private route: ActivatedRoute,
    notifierService: NotifierService,
    private featureService: FeaturesService,
    private globalService: GlobalService
  ) {
    this.notifier = notifierService;
  }

  ngOnInit(): void {
    this.itemsList = new Array();
    this.getMyInbox();
    this.route.params.subscribe(params => {
      if (params["id"]) {
        this.notifier.show({
          message: this.globalService.toastrMessages.send_message_success,
          type: "info",
          template: this.customNotificationTmpl
        });
      }
    });
  }

  cardClicked(item) {
    this.markMessageAsSeen(item);
    this.router.navigate(["/features/detail/" + item.id]);
  }

  selectAllActionClicked() {
    this.filtredItemList.forEach(a => {
      a.isChecked = true;
    });
  }
  deSelectAllActionClicked() {
    this.filtredItemList.forEach(a => {
      a.isChecked = false;
    });
  }
  seenAllActionClicked() {
    const messagesId = this.filtredItemList.map(e => e.id);
    if (messagesId.length > 0) {
      this.messagesServ.markMessageListAsSeen(messagesId).subscribe(
        resp => {
          if (resp == true) {
            this.itemsList.forEach(item => (item.isSeen = true));
            this.filtredItemList.forEach(item => (item.isSeen = true));
          }
        },
        error => {
          console.log("We have to find a way to notify user by this error");
        }
      );
    }
  }

  archieveActionClicked() {
    const messagesId = this.filtredItemList
      .filter(e => e.isChecked == true)
      .map(e => e.id);
    if (messagesId.length > 0) {
      this.messagesServ.markMessageAsArchived(messagesId).subscribe(
        resp => {
            this.itemsList = this.itemsList.filter(function(elm, ind) {
              return messagesId.indexOf(elm.id) == -1;
            });
            this.filtredItemList = this.filtredItemList.filter(function(elm,ind) {
              return messagesId.indexOf(elm.id) == -1;
            });
        },
        error => {
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
            item =>
              item.users[0].type.toLowerCase() ==
              (event == "doctor" ? "medical" : event)
          );
  }

  getMyInbox() {
    this.messagesServ.getMyInbox().subscribe(retrievedMess => {
      this.messages = retrievedMess;
      this.number = retrievedMess.filter(a => a.seenAsReceiver == false).length;
      this.featureService.numberOfInbox = this.number;
      this.messages.sort(function(m1, m2) {
        return (
          new Date(m2.updatedAt).getTime() - new Date(m1.updatedAt).getTime()
        );
      });
      this.itemsList = this.messages.map(item => this.parseMessage(item));
      this.filtredItemList = this.itemsList;
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
          img: "assets/imgs/IMG_3944.jpg",
          title: message.sender.jobTitle,
          type:
            message.sender.role == "PRACTICIAN"
              ? "MEDICAL"
              : message.sender.role
        }
      ],
      object: {
        name: message.object,
        isImportant: message.importantObject
      },
      time: message.updatedAt,
      isImportant: message.important,
      hasFiles: message.hasFiles,
      isViewDetail: message.hasViewDetail,
      isMarkAsSeen: true,
      isArchieve: true
    };
  }

  markMessageAsSeen(event) {
    let messageId = event.id;
    this.messagesServ.markMessageAsSeen(messageId).subscribe(
      resp => {
        if (resp == true) {
          let index = this.itemsList.findIndex(item => item.id == messageId);
          if (index != -1) {
            this.itemsList[index].isSeen = true;
          }
          let filtredIndex = this.filtredItemList.findIndex(
            item => item.id == messageId
          );
          if (index != -1) {
            this.filtredItemList[filtredIndex].isSeen = true;
          }
        }
      },
      error => {
        console.log("We have to find a way to notify user by this error");
      }
    );
  }

  archieveMessage(event) {
    let messageId = event.id;
    this.messagesServ.markMessageAsArchived([messageId]).subscribe(
      resp => {
          this.itemsList = this.itemsList.filter(function(elm, ind) {
            return elm.id != event.id;
          });
          this.filtredItemList = this.filtredItemList.filter(function(elm, ind) {
            return elm.id != event.id;
          });
      },
      error => {
        console.log("We have to find a way to notify user by this error");
      }
    );
  }
  selectItem(event) {
    this.selectedObjects = event;
    this.filtredItemList.forEach(a => {
      if (event.filter(b => b.id == a.id).length >= 1) {
        a.isChecked = true;
      } else {
        a.isChecked = false;
      }
    });
  }
}
