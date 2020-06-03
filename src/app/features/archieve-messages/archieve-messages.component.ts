import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ArchieveMessagesService } from "./archieve-messages.service";
import { MessageArchived } from "./message-archived";
import { Location } from "@angular/common";
import { FeaturesService } from "../features.service";
import { MyDocumentsService } from "../my-documents/my-documents.service";
import { GlobalService } from "@app/core/services/global.service";

@Component({
  selector: "app-archieve-messages",
  templateUrl: "./archieve-messages.component.html",
  styleUrls: ["./archieve-messages.component.scss"],
})
export class ArchieveMessagesComponent implements OnInit {
  imageSource : string;

  page = "INBOX";
  number = 0;
  topText = "Messages archivés";
  bottomText =
    this.number > 1
      ? this.globalService.messagesDisplayScreen.newArchivedMessages
      : this.globalService.messagesDisplayScreen.newArchivedMessage;
  backButton = true;
  selectedObjects: Array<any>;
  itemsList = [];
  pageNo = 0;
  scroll = false;
  listLength = 0;
  avatars: { doctor: string; child: string; women: string; man: string; secretary: string; user: string; };
  constructor(
    public router: Router,
    private archivedService: ArchieveMessagesService,
    private _location: Location,
    private featureService: FeaturesService,
    private documentService: MyDocumentsService,
    private globalService: GlobalService
  ) {
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.user;
  }

  ngOnInit(): void {
    this.getMyMessagesArchived(this.pageNo);
  }

  getMyMessagesArchived(pageNo: number) {
    this.archivedService.getMyArchivedMessages(pageNo).subscribe((messages) => {
      this.number = this.featureService.numberOfArchieve;
      this.bottomText =
        this.number > 1
          ? this.globalService.messagesDisplayScreen.newArchivedMessages
          : this.globalService.messagesDisplayScreen.newArchivedMessage;
      messages.forEach((message) => {
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
                user.img = this.avatars.user;
              }
            );
          } else {
            if (user.type == "MEDICAL") {
              user.img =this.avatars.doctor;
            } else if (user.type == "SECRETARY") {
              user.img = this.avatars.secretary;
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
  cardClicked(item) {
    if (!item.isSeen) {
      this.markMessageAsSeen(item.id);
    }
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
    this.archivedService.markMessageAsSeen(messageId).subscribe((result) => {
      this.featureService.numberOfArchieve--;
    });
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

  onScroll() {
    if (this.listLength != this.itemsList.length) {
      this.listLength = this.itemsList.length;
      this.pageNo++;
      this.getMyMessagesArchived(this.pageNo);
    }
  }
}
