import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ArchieveMessagesService } from "./archieve-messages.service";
import { MessageArchived } from "./message-archived";

@Component({
  selector: "app-archieve-messages",
  templateUrl: "./archieve-messages.component.html",
  styleUrls: ["./archieve-messages.component.scss"]
})
export class ArchieveMessagesComponent implements OnInit {
  imageSource = "assets/imgs/IMG_3944.jpg";
  links = {
    isAllSelect: true,
    isAllSeen: true,
    isDelete: true,
    isFilter: true
  };
  page = "INBOX";
  number = 0;
  topText = "Messages archivés";
  bottomText = "messages";
  backButton = false;
  selectedObjects: Array<any>;
  itemsList = [];
  constructor(
    public router: Router,
    private archivedService: ArchieveMessagesService
  ) {}

  ngOnInit(): void {
    this.getMyMessagesArchived();
  }

  getMyMessagesArchived() {
    this.archivedService.getMyArchivedMessages().subscribe(messages => {
      messages.forEach(message => {
        this.number = message.length;
        let archivedMessage = this.mappingMessageArchived(message);
        this.itemsList.push(archivedMessage);
      });
    });
  }
  mappingMessageArchived(message) {
    const messageArchived = new MessageArchived();
    messageArchived.id = message.id;
    messageArchived.isSeen = message.seen;
    messageArchived.users = [
      {
        fullName: message.senderDetail.patient
          ? message.senderDetail.patient.fullName
          : message.senderDetail.practician.fullName,
        img: message.senderDetail.patient
          ? "assets/imgs/IMG_3944.jpg"
          : "assets/imgs/user.png",
        title: message.senderDetail.patient
          ? ""
          : message.senderDetail.practician.title,
        type: message.senderDetail.role
      }
    ];
    messageArchived.object = {
      name: message.object,
      isImportant: message.importantObject
    };
    messageArchived.time = message.createdAt;
    messageArchived.isImportant = message.important;
    messageArchived.hasFiles = message.hasFiles;
    messageArchived.isViewDetail = message.hasViewDetail;
    messageArchived.isChecked = false;

    return messageArchived;
  }
  cardClicked(item) {
    this.router.navigate(["/features/detail/" + item.id]);
  }
  selectAllActionClicked() {
    this.itemsList.forEach(a=> {
      a.isChecked = true;
    });
  }
  deSelectAllActionClicked() {
    this.itemsList.forEach(a=> {
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
    console.log("archieveAction");
  }
  addNoteActionClicked() {
    console.log("addNoteAction");
  }
  filterActionClicked(event) {
    console.log(event);
  }
  selectItem(event) {
    this.selectedObjects = event.filter(a => a.isChecked == true);
  }
}
