import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MessagingDetailService } from "../services/messaging-detail.service";
import { MessageService } from "../services/message.service";
import { FeaturesService } from "../features.service";
import { MessageDto } from "@app/shared/models/message-dto";
import { MessageParent } from "@app/shared/models/message-parent";
import { GlobalService } from "@app/core/services/global.service";
import { Location } from "@angular/common";
import { NotifierService } from "angular-notifier";
@Component({
  selector: "app-messaging-reply",
  templateUrl: "./messaging-reply.component.html",
  styleUrls: ["./messaging-reply.component.scss"]
})
export class MessagingReplyComponent implements OnInit {
  role: string = "MEDICAL";
  imageSource: string = "assets/imgs/user.png";
  isFromInbox = true;
  senderRolePatient = true;
  messagingDetail: any;
  idMessage: number;
  links = {
    isSeen: true,
    isArchieve: true,
    isImportant: true
  };
  page = this.globalService.messagesDisplayScreen.inbox;
  number = 0;
  topText = this.globalService.messagesDisplayScreen.Mailbox;
  bottomText = this.globalService.messagesDisplayScreen.newMessage;
  backButton = true;
  selectedFiles: any;
  @ViewChild("customNotification", { static: true }) customNotificationTmpl;
  private readonly notifier: NotifierService;
  constructor(
    private _location: Location,
    private featureService: FeaturesService,
    private route: ActivatedRoute,
    private messagingDetailService: MessagingDetailService,
    private messageService: MessageService,
    private router: Router,
    private globalService: GlobalService,
    notifierService: NotifierService
  ) {
    this.notifier = notifierService;
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.idMessage = params["id"];
      this.getMessageDetailById(this.idMessage);
    });
  }
  getMessageDetailById(id) {
    this.messagingDetailService
      .getMessagingDetailById(id)
      .subscribe(message => {
        message.hasFiles = false;
        message.body = "";
        this.messagingDetail = message;
      });
  }

  replyMessage(message) {
    const replyMessage = new MessageDto();
    const parent = new MessageParent();
    parent.id = message.id;

    replyMessage.parent = parent;
    replyMessage.body = message.body;
    replyMessage.object = message.object;
    replyMessage.sender = {
      senderId: this.featureService.getUserId()
    };
    replyMessage.toReceivers = [{ receiverId: message.sender.id, seen: 0 }];

    if (message.file !== undefined) {
      this.selectedFiles = message.file;

      const formData = new FormData();
      if (this.selectedFiles) {
        replyMessage.hasFiles = true;
        formData.append("model", JSON.stringify(replyMessage));
        formData.append(
          "file",
          this.selectedFiles.item(0),
          this.selectedFiles.item(0).name
        );
      }
      this.messageService.replyMessageWithFile(formData).subscribe(
        message => {
          this.router.navigate(["/features/messageries", "success"]);
        },
        error => {
          this.notifier.show({
            message: this.globalService.toastrMessages.send_message_error,
            type: "error",
            template: this.customNotificationTmpl
          });
        }
      );
    } else {
      this.messageService.replyMessage(replyMessage).subscribe(
        message => {
          this.router.navigate(["/features/messageries", "success"]);
        },
        error => {
          this.notifier.show({
            message: this.globalService.toastrMessages.send_message_error,
            type: "error",
            template: this.customNotificationTmpl
          });
        }
      );
    }
  }
  goToBack() {
    this._location.back();
  }
}
