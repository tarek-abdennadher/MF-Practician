import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MessagingDetailService } from "../services/messaging-detail.service";
import { MessageService } from "../services/message.service";
import { FeaturesService } from "../features.service";
import { MessageDto } from "@app/shared/models/message-dto";
import { MessageParent } from "@app/shared/models/message-parent";
import { GlobalService } from "@app/core/services/global.service";
import { Location } from "@angular/common";
import { takeUntil } from "rxjs/operators";
import { Subject, BehaviorSubject } from "rxjs";
import { RefuseTypeService } from "../services/refuse-type.service";
import { MyDocumentsService } from "../my-documents/my-documents.service";
import { NgxSpinnerService } from "ngx-spinner";
import { DomSanitizer } from "@angular/platform-browser";
import { NodeeService } from "../services/node.service";
import { v4 as uuid } from "uuid";
import { FeaturesComponent } from "../features.component";

@Component({
  selector: "app-messaging-reply",
  templateUrl: "./messaging-reply.component.html",
  styleUrls: ["./messaging-reply.component.scss"],
})
export class MessagingReplyComponent implements OnInit, OnDestroy {
  loadingReply: boolean = true;
  isMyMessage = false;
  private _destroyed$ = new Subject();
  role: string = "MEDICAL";
  imageSource: string;
  isFromInbox = true;
  senderRolePatient = true;
  showRefuseForTls: boolean;
  messagingDetail: any;
  idMessage: number;
  bodyObs = new BehaviorSubject(null);
  disableSending = new BehaviorSubject(false);

  page = this.globalService.messagesDisplayScreen.inbox;
  number = 0;
  topText = this.globalService.messagesDisplayScreen.MailDetail;
  bottomText =
    this.number > 1
      ? this.globalService.messagesDisplayScreen.newMessages
      : this.globalService.messagesDisplayScreen.newMessage;
  backButton = true;
  selectedFiles: any;
  refuseResponse = false;
  acceptResponse = false;
  forwardedResponse = false;
  objectsList = [];
  toList = new BehaviorSubject(null);
  paramObs = new BehaviorSubject("");
  avatars: {
    doctor: string;
    child: string;
    women: string;
    man: string;
    secretary: string;
    user: string;
    tls: string;
  };
  public uuid: string;
  constructor(
    private _location: Location,
    private featureService: FeaturesService,
    private route: ActivatedRoute,
    private messagingDetailService: MessagingDetailService,
    private messageService: MessageService,
    private router: Router,
    private globalService: GlobalService,
    private refuseTypeService: RefuseTypeService,
    private documentService: MyDocumentsService,
    private spinner: NgxSpinnerService,
    private sanitizer: DomSanitizer,
    private nodeService: NodeeService,
    private featureComp: FeaturesComponent
  ) {
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.user;
  }
  realTime() {
    this.messagingDetailService.getIdObs().subscribe((resp) => {
      this.route.queryParams.subscribe((params) => {
        this.forwardedResponse = false;
        this.acceptResponse = false;
        this.refuseResponse = false;
        if (params["status"] && params["status"] == "refus") {
          this.refuseResponse = true;
        } else if (params["status"] && params["status"] == "accept") {
          this.acceptResponse = true;
        } else if (params["context"] && params["context"] == "forward") {
          this.forwardedResponse = true;
          this.getForwardToList();
        }
        if (this.paramObs.getValue() != params["status"]) {
          this.paramObs.next(params["status"]);
        }
      });
    });
  }
  ngOnInit(): void {
    this.realTime();
    this.messagingDetail = window.history.state.data;
      if (!this.messagingDetail) {
        this.goToBack();
      } else {
        this.updateMessageDetail();
        setTimeout(() => {
          this.featureService.setIsMessaging(true);
        });
      }
    jQuery([document.documentElement, document.body]).animate(
      {
        scrollTop: $("#reply").offset().top,
      },
      1000
    );
    this.getParamObs();
  }

getParamObs() {
  this.paramObs.subscribe(val => {
    this.getResponseBody(this.messagingDetail);
  })
}

  getForwardToList() {
    this.messagingDetailService.getTlsSecretaryList().subscribe((list) => {
      list.forEach((receiver) => {
        this.loadPhoto(receiver);
      });
      this.toList.next(list);
    });
  }

  getMessageDetailById(id) {
    this.messagingDetailService
      .getMessagingDetailById(id)
      .subscribe((message) => {
        message.toReceivers.forEach((element) => {
          if (element.receiverId == this.featureService.getUserId()) {
            this.isMyMessage = true;
          }
        });
        this.getResponseBody(message);
        message.hasFiles = false;
        message.body = "";
        this.messagingDetail = message;
        this.loadingReply = false;
      });
  }

  updateMessageDetail() {
    this.messagingDetail.toReceivers.forEach((element) => {
      if (element.receiverId == this.featureService.getUserId()) {
        this.isMyMessage = true;
      }
    });
    this.messagingDetail.hasFiles = false;
    this.messagingDetail.body = "";
    this.messagingDetail = this.messagingDetail;
    this.loadingReply = false;
  }

  loadPhoto(user) {
    this.documentService.getDefaultImage(user.id).subscribe(
      (response) => {
        let myReader: FileReader = new FileReader();
        myReader.onloadend = (e) => {
          user.img = this.sanitizer.bypassSecurityTrustUrl(
            myReader.result as string
          );
        };
        let ok = myReader.readAsDataURL(response);
      },
      (error) => {
        user.img = this.avatars.user;
      }
    );
  }

  loadSenderForPhoto(message) {
    this.documentService.getDefaultImage(message.sender.senderForId).subscribe(
      (response) => {
        let myReader: FileReader = new FileReader();
        myReader.onloadend = (e) => {
          message.sender.forImg = this.sanitizer.bypassSecurityTrustUrl(
            myReader.result as string
          );
        };
        let ok = myReader.readAsDataURL(response);
      },
      (error) => {
        message.sender.forImg = this.avatars.user;
      }
    );
  }

  getAllRefuseTypes() {
    return this.refuseTypeService
      .getAllRefuseTypes()
      .subscribe((refuseTypes) => {
        this.objectsList = refuseTypes;
      });
  }

  getResponseBody(message) {
    if (this.isMyMessage && message.requestTypeId && message.requestTitleId) {
      let requestDto;
      if (message.sender.role == "PATIENT") {
        requestDto = {
          patientId: message.sender.senderId,
          patientForId: message.sender.sendedForId,
          practicianId: this.featureService.getUserId(),
          requestId: message.requestTypeId,
          titleId: message.requestTitleId,
          websiteOrigin: "PATIENT",
        };
      } else if (
        message.sender.role == "TELESECRETARYGROUP" ||
        message.sender.role == "SUPERVISOR"
      ) {
        requestDto = {
          patientId: message.sender.sendedForId,
          patientForId: null,
          practicianId: this.featureService.getUserId(),
          requestId: message.requestTypeId,
          titleId: message.requestTitleId,
          websiteOrigin: "TLS",
        };
      }
      if (this.refuseResponse) {
        this.disableSending.next(true);
        this.messagingDetailService
          .getRefuseRequest(requestDto)
          .subscribe((resp) => {
            this.bodyObs.next(resp.body);
            this.disableSending.next(false);
          });
      }
      if (this.acceptResponse) {
        this.disableSending.next(true);
        this.messagingDetailService
          .getAcceptRequest(requestDto)
          .subscribe((resp) => {
            this.bodyObs.next(resp.body);
            this.disableSending.next(false);
          });
      }
      if (this.forwardedResponse) {
        this.disableSending.next(true);
        requestDto.websiteOrigin = "TLS";
        this.messagingDetailService
          .getAcceptRequest(requestDto)
          .subscribe((resp) => {
            this.bodyObs.next(resp.body);
            this.disableSending.next(false);
          });
      }
    }
  }
  replyMessage(message) {
    this.spinner.show();
    this.uuid = uuid();
    const replyMessage = new MessageDto();
    const parent = new MessageParent();
    parent.id = message.id;
    parent.messageStatus = "TREATED";
    delete message.sender.img;
    parent.sender = message.sender;
    replyMessage.parent = parent;
    replyMessage.body = message.body;
    replyMessage.showFileToPatient = true;
    replyMessage.documentHeader = message.documentHeader
      ? message.documentHeader
      : null;
    replyMessage.documentBody = message.documentBody
      ? message.documentBody
      : null;
    replyMessage.documentFooter = message.documentFooter
      ? message.documentFooter
      : null;
    replyMessage.object = message.object;
    if (message.requestTypeId && message.requestTitleId) {
      replyMessage.requestTypeId = message.requestTypeId;
      replyMessage.requestTitleId = message.requestTitleId;
    }
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
      forwarded: this.forwardedResponse,
    };
    if (this.forwardedResponse) {
      replyMessage.toReceivers = [
        { receiverId: message.trReceiver[0].id, seen: 0 },
      ];
    } else {
      replyMessage.toReceivers = [
        { receiverId: message.sender.senderId, seen: 0 },
      ];
    }

    if (message.file !== undefined) {
      this.selectedFiles = message.file;

      const formData = new FormData();
      if (this.selectedFiles) {
        replyMessage.hasFiles = true;
        replyMessage.uuid = this.uuid;
        formData.append("model", JSON.stringify(replyMessage));
        formData.append(
          "file",
          this.selectedFiles.item(0),
          this.selectedFiles.item(0).name
        );
      }
      this.nodeService.saveFileInMemory(this.uuid, formData).subscribe(
        (message) => {
          if (this.forwardedResponse) {
            this.featureService.numberOfForwarded =
              this.featureService.numberOfForwarded + 1;
          }
          this.spinner.hide();
          this.featureComp.setNotif(
            this.globalService.toastrMessages.send_message_success
          );
          this.router.navigate(["/messagerie"]);
        },
        (error) => {
          this.spinner.hide();
          this.featureComp.setNotif(
            this.globalService.toastrMessages.send_message_error
          );
        }
      );
    } else {
      this.messageService.replyMessage(replyMessage).subscribe(
        (message) => {
          if (this.forwardedResponse) {
            this.featureService.numberOfForwarded =
              this.featureService.numberOfForwarded + 1;
          }
          this.spinner.hide();
          this.featureComp.setNotif(
            this.globalService.toastrMessages.send_message_success
          );
          this.router.navigate(["/messagerie"]);
        },
        (error) => {
          this.spinner.hide();
          this.featureComp.setNotif(
            this.globalService.toastrMessages.send_message_error
          );
        }
      );
    }
  }
  goToBack() {
    this._location.back();
  }

  // destory any pipe(takeUntil(this._destroyed$)).subscribe to avoid memory leak
  ngOnDestroy(): void {
    this._destroyed$.next(true);
    this._destroyed$.unsubscribe();
  }
}
