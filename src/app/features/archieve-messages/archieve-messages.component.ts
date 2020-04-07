import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ArchieveMessagesService } from "./archieve-messages.service";
import { MessageArchived } from "./message-archived";
import { Location } from "@angular/common";
import { FeaturesService } from "../features.service";

@Component({
  selector: "app-archieve-messages",
  templateUrl: "./archieve-messages.component.html",
  styleUrls: ["./archieve-messages.component.scss"],
})
export class ArchieveMessagesComponent implements OnInit {
  imageSource = "assets/imgs/IMG_3944.jpg";

  page = "INBOX";
  number = 0;
  topText = "Messages archivés";
  bottomText = this.number > 1 ? "messages" : "message";
  backButton = true;
  selectedObjects: Array<any>;
  itemsList = [];
  constructor(
    public router: Router,
    private archivedService: ArchieveMessagesService,
    private _location: Location,
    private featureService: FeaturesService
  ) {}

  ngOnInit(): void {
    this.getMyMessagesArchived();
  }

  getMyMessagesArchived() {
    this.archivedService.getMyArchivedMessages().subscribe((messages) => {
      messages.forEach((message) => {
        this.number = message.length;
        let archivedMessage = this.mappingMessageArchived(message);
        this.itemsList.push(archivedMessage);
      });
      this.bottomText =
        this.featureService.numberOfArchieve + " " + this.bottomText;
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
        type:
          message.senderDetail.role == "PRACTICIAN"
            ? "MEDICAL"
            : message.senderDetail.role,
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
  cardClicked(item) {
    this.markMessageAsSeen(item.id);
    this.router.navigate(["/features/messagerie-lire/" + item.id]);
  }

  BackButton() {
    this._location.back();
  }

  markMessageAsSeen(messageId) {
    this.archivedService.markMessageAsSeen(messageId).subscribe();
  }
}
