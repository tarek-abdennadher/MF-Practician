import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ArchieveMessagesService } from "./archieve-messages.service";
import { MessageArchived } from "./message-archived";
import { Location } from "@angular/common";
import { FeaturesService } from "../features.service";
import { MyDocumentsService } from "../my-documents/my-documents.service";
import { GlobalService } from "@app/core/services/global.service";
import { OrderDirection } from "@app/shared/enmus/order-direction";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-archieve-messages",
  templateUrl: "./archieve-messages.component.html",
  styleUrls: ["./archieve-messages.component.scss"]
})
export class ArchieveMessagesComponent implements OnInit {
  imageSource: string;

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
  links = {
    isRefresh: true,
    isPagination: true
  };
  filtredItemList = [];
  pageNo = 0;
  scroll = false;
  searchContext: boolean;
  listLength = 0;
  avatars: {
    doctor: string;
    child: string;
    women: string;
    man: string;
    secretary: string;
    user: string;
    tls: string;
  };
  direction: OrderDirection = OrderDirection.DESC;

  constructor(
    public router: Router,
    private archivedService: ArchieveMessagesService,
    private _location: Location,
    private featureService: FeaturesService,
    private documentService: MyDocumentsService,
    private globalService: GlobalService,
    private sanitizer: DomSanitizer
  ) {
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.user;
  }

  ngOnInit(): void {
    this.featureService.setActiveChild("archived");
    this.featureService.setIsMessaging(true);
    this.getMyMessagesArchived(this.pageNo);
    this.searchArchive();
  }

  getMyMessagesArchived(pageNo: number) {
    this.scroll = true;
    this.archivedService
      .getMyArchivedMessages(pageNo, this.direction)
      .subscribe(messages => {
        this.scroll = false;
        this.number = this.featureService.numberOfArchieve;
        this.bottomText =
          this.number > 1
            ? this.globalService.messagesDisplayScreen.newArchivedMessages
            : this.globalService.messagesDisplayScreen.newArchivedMessage;
        messages.forEach(message => {
          let archivedMessage = this.mappingMessageArchived(message);
          archivedMessage.users.forEach(user => {
            this.loadPhoto(user);
          });
          this.itemsList.push(archivedMessage);
        });
        this.filtredItemList = this.itemsList;
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
        id: message.senderDetail.id
      }
    ];
    messageArchived.progress = {
      name:
        message.messageStatus == "TREATED"
          ? "répondu"
          : message.toReceiversArchived[0].seen
          ? "Lu"
          : "Envoyé",
      value:
        message.messageStatus == "TREATED"
          ? 100
          : message.toReceiversArchived[0].seen
          ? 50
          : 20
    };
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

  loadPhoto(user) {
    if (user.photoId) {
      this.documentService.getDefaultImage(user.id).subscribe(
        response => {
          let myReader: FileReader = new FileReader();
          myReader.onloadend = e => {
            user.img = this.sanitizer.bypassSecurityTrustUrl(
              myReader.result as string
            );
          };
          let ok = myReader.readAsDataURL(response);
        },
        error => {
          user.img = this.avatars.user;
        }
      );
    } else {
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
    }
  }

  cardClicked(item) {
    if (!item.isSeen) {
      this.markMessageAsSeen(item.id);
    }
    this.router.navigate(["/messagerie-lire/" + item.id], {
      queryParams: {
        context: "archive"
      }
    });
  }

  BackButton() {
    this._location.back();
  }

  markMessageAsSeen(messageId) {
    this.archivedService.markMessageAsSeen(messageId).subscribe(result => {
      this.featureService.numberOfArchieve--;
      this.featureService.markAsSeen(this.featureService.searchArchive, [
        messageId
      ]);
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
      case "TELESECRETARYGROUP":
        return senderDetail.secretary.photoId;
      default:
        return null;
    }
  }

  onScroll() {
    if (this.listLength != this.itemsList.length && !this.searchContext) {
      this.listLength = this.itemsList.length;
      this.pageNo++;
      this.getMyMessagesArchived(this.pageNo);
    }
  }

  searchArchive() {
    this.featureService.getFilteredArchiveSearch().subscribe(res => {
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
    });
  }

  mapAllMessages(messages) {
    messages.forEach(message => {
      const archivedMessage = this.mappingMessageArchived(message);
      archivedMessage.users.forEach(user => {
        this.loadPhoto(user);
      });
      this.filtredItemList.push(archivedMessage);
    });
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
    this.getMyMessagesArchived(this.pageNo);
  }

  refreshMessagingList() {
    this.pageNo = 0;
    this.itemsList = [];
    this.filtredItemList = [];
    this.ngOnInit();
  }
}
