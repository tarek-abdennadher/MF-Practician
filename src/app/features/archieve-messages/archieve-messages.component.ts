import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ArchieveMessagesService } from "./archieve-messages.service";
import { MessageArchived } from "./message-archived";
import { Location } from "@angular/common";
import { FeaturesService } from "../features.service";
import { MyDocumentsService } from "../my-documents/my-documents.service";

@Component({
  selector: "app-archieve-messages",
  templateUrl: "./archieve-messages.component.html",
  styleUrls: ["./archieve-messages.component.scss"],
})
export class ArchieveMessagesComponent implements OnInit {
  imageSource = "assets/imgs/user.png";

  page = "INBOX";
  number = 0;
  topText = "Messages archivés";
  bottomText = "messages";
  backButton = true;
  selectedObjects: Array<any>;
  itemsList = [];
  constructor(
    public router: Router,
    private archivedService: ArchieveMessagesService,
    private _location: Location,
    private featureService: FeaturesService,
    private documentService: MyDocumentsService
  ) {}

  ngOnInit(): void {
    this.getMyMessagesArchived();
  }

  getMyMessagesArchived() {
    this.archivedService.getMyArchivedMessages().subscribe((messages) => {
      this.number = this.featureService.numberOfArchieve;
      this.bottomText = this.number > 1 ? "messages" : "message";
      messages.forEach((message) => {
        this.bottomText = this.number > 1 ? "messages" : "message";
        let archivedMessage = this.mappingMessageArchived(message);
        archivedMessage.users.forEach((user) => {
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
          }
        });
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
        fullName:
          message.senderDetail[message.senderDetail.role.toLowerCase()]
            .fullName,
        img: "assets/imgs/user.png",
        title: message.senderDetail.practician
          ? message.senderDetail.practician.title
          : "",
        type:
          message.senderDetail.role == "PRACTICIAN"
            ? "MEDICAL"
            : message.senderDetail.role,
        photoId: this.getPhotoId(message.senderDetail),
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
    this.router.navigate(["/messagerie-lire/" + item.id], {
      queryParams: {
        context: "archive",
      },
    });
  }

  BackButton() {
    this._location.back();
  }

  markMessageAsSeen(messageId) {
    this.archivedService.markMessageAsSeen(messageId).subscribe();
  }

  getPhotoId(senderDetail): string {
    switch (senderDetail.role) {
      case "PATIENT":
        return senderDetail.patient.photoId;
      case "PRACTICIAN":
        return senderDetail.practician.photoId;
      case "SECRETARY":
        return senderDetail.secretary.photoId;
      default:
        return null;
    }
  }
}
