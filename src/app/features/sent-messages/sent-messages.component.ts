import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { MessageService } from "../services/message.service";
import { takeUntil } from "rxjs/operators";
import { MessageSent } from '@app/shared/models/message-sent';


@Component({
  selector: "app-sent-messages",
  templateUrl: "./sent-messages.component.html",
  styleUrls: ["./sent-messages.component.scss"]
})
export class SentMessagesComponent implements OnInit {
  private _destroyed$ = new Subject();
  imageSource = "assets/imgs/user.png";
  links = {
    isFilter: true
  };

  itemsList = [];

  constructor(public router: Router, private messageService: MessageService) {}

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

    return messageSent;
  }

  cardClicked(item) {
    this.router.navigate(["/features/detail/" + item.id]);
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

  // destory any subscribe to avoid memory leak
  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
}