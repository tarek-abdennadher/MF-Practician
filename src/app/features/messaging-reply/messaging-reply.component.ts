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
import { Subject, BehaviorSubject } from "rxjs";
import { RefuseTypeService } from "../services/refuse-type.service";
import { LocalStorageService } from "ngx-webstorage";
import { MyDocumentsService } from '../my-documents/my-documents.service';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: "app-messaging-reply",
  templateUrl: "./messaging-reply.component.html",
  styleUrls: ["./messaging-reply.component.scss"],
})
export class MessagingReplyComponent implements OnInit {
  isMyMessage = false;
  private _destroyed$ = new Subject();
  role: string = "MEDICAL";
  imageSource: string;
  isFromInbox = true;
  senderRolePatient = true;
  showRefuseForTls : boolean;
  messagingDetail: any;
  idMessage: number;
  bodyObs = new BehaviorSubject(null);

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
  acceptResponse = false;
  objectsList = [];
  avatars: { doctor: string; child: string; women: string; man: string; secretary: string; user: string; tls: string; };
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
    private documentService: MyDocumentsService,
    private spinner: NgxSpinnerService

  ) {
    this.notifier = notifierService;
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.user;

  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params["status"] && params["status"] == "refus") {
        this.refuseResponse = true;
      } else if(params["status"] && params["status"] == "accept") {
        this.acceptResponse = true
      }
    });
    this.route.params.subscribe((params) => {
      this.idMessage = params["id"];
      this.messagingDetail = this.route.snapshot.data.messagingdetail;
      this.getMessageDetailById(this.idMessage);
    });
  }

  getMessageDetailById(id) {
    this.messagingDetailService
      .getMessagingDetailById(id)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((message) => {
        console.log(this.showRefuseForTls);
        message.toReceivers.forEach((element) => {
          if (element.receiverId == this.featureService.getUserId()) {
            this.isMyMessage = true;
          }
        });
        this.getResponseBody(message);
        message.hasFiles = false;
        // if (this.refuseResponse) {
        //   message.object = [];
        // }
        message.body = "";
        this.messagingDetail = message;
        this.messagingDetail.toReceivers.forEach((receiver) => {
          this.loadPhoto(receiver);
        });
        this.messagingDetail.ccReceivers.forEach((receiver) => {
          this.loadPhoto(receiver);
        });
        this.loadPhoto(this.messagingDetail.sender);
        this.loadSenderForPhoto(this.messagingDetail);
      });
  }

  loadPhoto(user) {
    if (user.photoId) {
      this.documentService
        .downloadFile(user.photoId)
        .subscribe(
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
    }else{
      if (user.role == "PRACTICIAN") {
        user.img = this.avatars.doctor;
      } else if (user.role == "SECRETARY") {
        user.img = this.avatars.secretary;
      }else if (user.role == "TELESECRETARYGROUP") {
        user.img = this.avatars.tls;
      } else if (user.role == "PATIENT") {
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

  loadSenderForPhoto(message) {
    if (message.sender.senderForPhotoId) {
      this.documentService
        .downloadFile(message.sender.senderForPhotoId)
        .subscribe(
          (response) => {
            let myReader: FileReader = new FileReader();
            myReader.onloadend = (e) => {
              message.sender.forImg = myReader.result;
            };
            let ok = myReader.readAsDataURL(response.body);
          },
          (error) => {
            message.sender.forImg = this.avatars.user;
          }
        );
    } else {
        if (message.sender.senderForCivility == "M") {
          message.sender.forImg =
            this.avatars.man;
        } else if (message.sender.senderForCivility == "MME") {
          message.sender.forImg =
            this.avatars.women;
        } else if (message.sender.senderForCivility == "CHILD") {
          message.sender.forImg =
            this.avatars.child;
        }
      }
  }

  getAllRefuseTypes() {
    return this.refuseTypeService
      .getAllRefuseTypes()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((refuseTypes) => {
        this.objectsList = refuseTypes;
      });
  }

  getResponseBody(message) {
    if (this.isMyMessage && message.requestTypeId && message.requestTitleId) {
      let requestDto;
      if (message.sender.role == 'PATIENT') {
        requestDto = {
          patientId: message.sender.senderId,
          patientForId: message.sender.sendedForId,
          practicianId: this.featureService.getUserId(),
          requestId: message.requestTypeId,
          titleId: message.requestTitleId,
          websiteOrigin: "PATIENT"
        }
      } else if (message.sender.role == "TELESECRETARYGROUP" || message.sender.role == "SUPERVISOR") {
        requestDto = {
          patientId: message.sender.sendedForId,
          patientForId: null,
          practicianId: this.featureService.getUserId(),
          requestId: message.requestTypeId,
          titleId: message.requestTitleId,
          websiteOrigin: "TLS"
        }
      }
      if (this.refuseResponse) {
        this.messagingDetailService.getRefuseRequest(requestDto).subscribe(resp => {
          this.bodyObs.next(resp.body);
        })
      }
      if (this.acceptResponse) {
        this.messagingDetailService.getAcceptRequest(requestDto).subscribe(resp => {
          this.bodyObs.next(resp.body);
        })
      }
    }
  }

  replyMessage(message) {
    this.spinner.show();
    const replyMessage = new MessageDto();
    const parent = new MessageParent();
    parent.id = message.id;
    parent.messageStatus = "TREATED";
    delete message.sender.img
    parent.sender = message.sender;
    replyMessage.parent = parent;
    replyMessage.body = message.body;
    replyMessage.object = message.object;
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
            this.spinner.hide();
            this.router.navigate(["/messagerie"], {
              queryParams: {
                status: "sentSuccess",
              },
            });
          },
          (error) => {
            this.spinner.hide();
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
            this.spinner.hide();
            this.router.navigate(["/messagerie"], {
              queryParams: {
                status: "sentSuccess",
              },
            });
          },
          (error) => {
            this.spinner.hide();
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
