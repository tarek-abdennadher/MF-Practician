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
import { LocalStorageService } from "ngx-webstorage";
import { MyDocumentsService } from '../my-documents/my-documents.service';
@Component({
  selector: "app-messaging-reply",
  templateUrl: "./messaging-reply.component.html",
  styleUrls: ["./messaging-reply.component.scss"],
})
export class MessagingReplyComponent implements OnInit {
  isMyMessage = false;
  private _destroyed$ = new Subject();
  role: string = "MEDICAL";
  imageSource: string = "assets/imgs/user.png";
  isFromInbox = true;
  senderRolePatient = true;
  messagingDetail: any;
  idMessage: number;

  page = this.globalService.messagesDisplayScreen.inbox;
  number = 0;
  topText = this.globalService.messagesDisplayScreen.MailDetail;
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
    private refuseTypeService: RefuseTypeService,
    private localSt: LocalStorageService,
    private documentService: MyDocumentsService
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
        message.toReceivers.forEach((element) => {
          if (element.receiverId == this.featureService.getUserId()) {
            this.isMyMessage = true;
          }
        });
        message.hasFiles = false;
        if (this.refuseResponse) {
          message.object = [];
          this.getAllRefuseTypes();
        }
        message.body = "";
        this.messagingDetail = message;
        this.messagingDetail.toReceivers.forEach((receiver) => {
          if (receiver.photoId) {
            this.documentService
              .downloadFile(receiver.photoId)
              .subscribe(
                (response) => {
                  let myReader: FileReader = new FileReader();
                  myReader.onloadend = (e) => {
                    receiver.img = myReader.result;
                  };
                  let ok = myReader.readAsDataURL(response.body);
                },
                (error) => {
                  receiver.img = "assets/imgs/user.png";
                }
              );
          }
        });
        this.messagingDetail.ccReceivers.forEach((receiver) => {
          if (receiver.photoId) {
            this.documentService
              .downloadFile(receiver.photoId)
              .subscribe(
                (response) => {
                  let myReader: FileReader = new FileReader();
                  myReader.onloadend = (e) => {
                    receiver.img = myReader.result;
                  };
                  let ok = myReader.readAsDataURL(response.body);
                },
                (error) => {
                  receiver.img = "assets/imgs/user.png";
                }
              );
          }
        });
        if (this.messagingDetail.sender.photoId) {
          this.documentService
            .downloadFile(this.messagingDetail.sender.photoId)
            .subscribe(
              (response) => {
                let myReader: FileReader = new FileReader();
                myReader.onloadend = (e) => {
                  this.messagingDetail.sender.img = myReader.result;
                };
                let ok = myReader.readAsDataURL(response.body);
              },
              (error) => {
                this.messagingDetail.sender.img = "assets/imgs/user.png";
              }
            );
        }
        if (this.messagingDetail.sender.senderForPhotoId) {
          this.documentService
            .downloadFile(this.messagingDetail.sender.photoId)
            .subscribe(
              (response) => {
                let myReader: FileReader = new FileReader();
                myReader.onloadend = (e) => {
                  this.messagingDetail.sender.forImg = myReader.result;
                };
                let ok = myReader.readAsDataURL(response.body);
              },
              (error) => {
                this.messagingDetail.sender.forImg = "assets/imgs/user.png";
              }
            );
        }
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
    let sendedFor = null;
    if (!this.isMyMessage) {
      sendedFor =
        this.featureService.selectedPracticianId &&
        this.featureService.selectedPracticianId !== 0
          ? this.featureService.selectedPracticianId
          : null;
    }
    replyMessage.sender = {
      senderId: this.featureService.getUserId(),
      originalSenderId: this.featureService.getUserId(),
      sendedForId: sendedFor,
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
            this.router.navigate(["/messagerie"], {
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
            this.router.navigate(["/messagerie"], {
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
