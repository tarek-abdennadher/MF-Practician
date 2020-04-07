import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router, Params } from "@angular/router";
import { MessagingDetailService } from "../services/messaging-detail.service";
import { MessageService } from "../services/message.service";
import { FeaturesService } from "../features.service";
import { MessageDto } from "@app/shared/models/message-dto";
import { MessageParent } from "@app/shared/models/message-parent";
import { GlobalService } from "@app/core/services/global.service";
import { Location } from "@angular/common";
import { NotifierService } from "angular-notifier";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { RefuseTypeService } from "../services/refuse-type.service";
@Component({
  selector: "app-messaging-reply",
  templateUrl: "./messaging-reply.component.html",
  styleUrls: ["./messaging-reply.component.scss"],
})
export class MessagingReplyComponent implements OnInit {
  private _destroyed$ = new Subject();
  role: string = "MEDICAL";
  imageSource: string = "assets/imgs/user.png";
  isFromInbox = true;
  senderRolePatient = true;
  messagingDetail: any;
  idMessage: number;
  links = {
    isSeen: true,
    isArchieve: true,
    isImportant: true,
  };
  page = this.globalService.messagesDisplayScreen.inbox;
  number = 0;
  topText = this.globalService.messagesDisplayScreen.Mailbox;
  bottomText =
    this.number > 1
      ? this.globalService.messagesDisplayScreen.newMessages
      : this.globalService.messagesDisplayScreen.newMessage;
  backButton = true;
  selectedFiles: any;
  @ViewChild("customNotification", { static: true }) customNotificationTmpl;
  private readonly notifier: NotifierService;
  refuseResponse = false;
  objectsList = [];
  constructor(
    private _location: Location,
    private featureService: FeaturesService,
    private route: ActivatedRoute,
    private messagingDetailService: MessagingDetailService,
    private messageService: MessageService,
    private router: Router,
    private globalService: GlobalService,
    notifierService: NotifierService,
    private refuseTypeService: RefuseTypeService
  ) {
    this.notifier = notifierService;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params["status"] && params["status"] == "refus") {
        this.refuseResponse = true;
      }
    });
    this.route.params.subscribe((params) => {
      this.idMessage = params["id"];
      this.getMessageDetailById(this.idMessage);
    });
  }
  getMessageDetailById(id) {
    this.messagingDetailService
      .getMessagingDetailById(id)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((message) => {
        message.hasFiles = false;
        if (this.refuseResponse) {
          message.object = [];
          this.getAllRefuseTypes();
        }
        message.body = "";
        this.messagingDetail = message;
      });
  }

  getAllRefuseTypes() {
    return this.refuseTypeService
      .getAllRefuseTypes()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((refuseTypes) => {
        this.objectsList = refuseTypes;
      });
  }

  replyMessage(message) {
    const replyMessage = new MessageDto();
    const parent = new MessageParent();
    parent.id = message.id;
    parent.sender = message.sender;
    replyMessage.parent = parent;
    replyMessage.body = message.body;
    replyMessage.object = !this.refuseResponse
      ? message.object
      : message.object.name;
    replyMessage.sender = {
      senderId: this.featureService.getUserId(),
    };
    replyMessage.toReceivers = [
      { receiverId: message.sender.senderId, seen: 0 },
    ];

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
      this.messageService
        .replyMessageWithFile(formData)
        .pipe(takeUntil(this._destroyed$))
        .subscribe(
          (message) => {
            this.router.navigate(["/features/messageries"], {
              queryParams: {
                status: "sentSuccess",
              },
            });
          },
          (error) => {
            this.notifier.show({
              message: this.globalService.toastrMessages.send_message_error,
              type: "error",
              template: this.customNotificationTmpl,
            });
          }
        );
    } else {
      this.messageService
        .replyMessage(replyMessage)
        .pipe(takeUntil(this._destroyed$))
        .subscribe(
          (message) => {
            this.router.navigate(["/features/messageries"], {
              queryParams: {
                status: "sentSuccess",
              },
            });
          },
          (error) => {
            this.notifier.show({
              message: this.globalService.toastrMessages.send_message_error,
              type: "error",
              template: this.customNotificationTmpl,
            });
          }
        );
    }
  }
  goToBack() {
    this._location.back();
  }

  // destory any subscribe to avoid memory leak
  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
}
