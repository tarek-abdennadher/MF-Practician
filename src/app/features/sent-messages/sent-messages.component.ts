import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { MessageService } from "../services/message.service";
import { takeUntil } from "rxjs/operators";
import { MessageSent } from "@app/shared/models/message-sent";
import { FeaturesService } from "../features.service";

@Component({
  selector: "app-sent-messages",
  templateUrl: "./sent-messages.component.html",
  styleUrls: ["./sent-messages.component.scss"]
})
export class SentMessagesComponent implements OnInit {
  private _destroyed$ = new Subject();
  imageSource = "assets/imgs/user.png";
  links = {
    isFilter: true,
    isAllSelect: true,
    isArchieve: true
  };
  page = "INBOX";
  number = 0;
  topText = "Messages envoyés";
  bottomText = "";
  backButton = false;
  itemsList = [];
  selectedObjects: Array<any>;
  filtredItemList: Array<any> = new Array();
  constructor(
    public router: Router,
    private messageService: MessageService,
    private featureService: FeaturesService
  ) {}

  ngOnInit(): void {
    this.sentMessage();
  }

  sentMessage() {
    this.messageService
      .sentMessage()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((messages: any) => {
        messages.forEach(message => {
          const messageSent = this.mappingMessage(message);
          messageSent.id = message.id;
          this.itemsList.push(messageSent);
          this.filtredItemList = this.itemsList;
        });
      });
  }

  mappingMessage(message) {
    const messageSent = new MessageSent();
    messageSent.isSeen = true;
    messageSent.users = [];
    message.toReceivers.forEach(r => {
      messageSent.users.push({
        fullName: r.fullName,
        img: this.imageSource,
        title: r.jobTitle,
        type: r.role
      });
    });
    messageSent.object = {
      name: message.object,
      isImportant: message.importantObject
    };
    messageSent.time = message.createdAt;
    messageSent.isImportant = message.important;
    messageSent.hasFiles = message.hasFiles;
    messageSent.hasViewDetail = message.hasViewDetail;
    messageSent.isArchieve = true;
    return messageSent;
  }

  cardClicked(item) {
    this.router.navigate(["/features/messagerie-lire/" + item.id]);
  }

  selectAllActionClicked() {
    this.itemsList.forEach(a => {
      a.isChecked = true;
    });
  }
  deSelectAllActionClicked() {
    this.itemsList.forEach(a => {
      a.isChecked = false;
    });
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
    const messagesId = this.filtredItemList
      .filter(e => e.isChecked == true)
      .map(e => e.id);
    console.log(messagesId);
    if (messagesId.length > 0) {
      this.featureService.numberOfArchieve =
        this.featureService.numberOfArchieve + messagesId.length;
      this.messageService.markMessageAsArchived(messagesId).subscribe(
        resp => {
          this.itemsList = this.itemsList.filter(function(elm, ind) {
            return messagesId.indexOf(elm.id) == -1;
          });
          this.filtredItemList = this.filtredItemList.filter(function(
            elm,
            ind
          ) {
            return messagesId.indexOf(elm.id) == -1;
          });
        },
        error => {
          console.log("We have to find a way to notify user by this error");
        }
      );
    }
  }
  archieveMessage(event) {
    let messageId = event.id;
    this.messageService.markMessageAsArchived([messageId]).subscribe(
      resp => {
        this.itemsList = this.itemsList.filter(function(elm, ind) {
          return elm.id != event.id;
        });
        this.filtredItemList = this.filtredItemList.filter(function(elm, ind) {
          return elm.id != event.id;
        });
        this.featureService.numberOfArchieve++;
      },
      error => {
        console.log("We have to find a way to notify user by this error");
      }
    );
  }
  addNoteActionClicked() {
    console.log("addNoteAction");
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
  selectItem(event) {
    this.selectedObjects = event.filter(a => a.isChecked == true);
  }
  // destory any subscribe to avoid memory leak
  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
}
