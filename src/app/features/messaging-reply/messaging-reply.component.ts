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
import { ReplyStatus } from "@app/shared/enmus/reply-status";

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
  receiverId: number;
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
  lastAction = "";
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
  public cryptedId;
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
    this.route.queryParams.subscribe((params) => {
      this.lastAction = this.messagingDetailService.getIdValue();
      this.messagingDetail = window.history.state.data;
      if (!this.receiverId && this.messagingDetail) {
        this.receiverId = this.messagingDetail.toReceivers[0].receiverId;
      }
      if (
        this.messagingDetail?.toReceivers[0].receiverId ==
        this.featureService.getUserId()
      ) {
        this.isMyMessage = true;
      }
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
      this.paramObs.next(params["status"]);
    });
  }
  ngOnInit(): void {
    this.realTime();
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
    this.route.parent.params.subscribe(value => {
        this.cryptedId = value.id
    })
  }

  getParamObs() {
    this.paramObs.subscribe((val) => {
      this.getResponseBody(this.messagingDetail);
    });
  }

  getForwardToList() {
    if (this.isMyMessage) {
      this.messagingDetailService.getTlsSecretaryList().subscribe((list) => {
        list.forEach((receiver) => {
          this.loadPhoto(receiver);
        });
        this.toList.next(list);
      });
    } else {
      this.messagingDetailService
        .getTlsSecretaryListByPracticianId(this.receiverId)
        .subscribe((list) => {
          const filtredList = list.filter(
            (r) => r.id != this.featureService.getUserId()
          );
          filtredList.forEach((receiver) => {
            this.loadPhoto(receiver);
          });
          this.toList.next(filtredList);
        });
    }
  }

  updateMessageDetail() {
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
    let practicianId;
    if (this.isMyMessage) {
      practicianId = this.featureService.getUserId();
    } else {
      practicianId = this.receiverId;
    }
    if (message.requestTypeId && message.requestTitleId) {
      let requestDto;
      if (message.sender.role == "PATIENT") {
        requestDto = {
          patientId: message.sender.senderId,
          patientForId: message.sender.sendedForId,
          practicianId: practicianId,
          requestId: message.requestTypeId,
          titleId: message.requestTitleId,
          websiteOrigin: "PATIENT",
        };
      } else if (
        message.sender.role == "TELESECRETARYGROUP" ||
        message.sender.role == "SUPERVISOR" ||
        message.sender.role == "SUPER_SUPERVISOR"
      ) {
        requestDto = {
          patientId: message.sender.sendedForId,
          patientForId: null,
          patientFileId: message.sender.concernsId,
          practicianId: practicianId,
          requestId: message.requestTypeId,
          titleId: message.requestTitleId,
          websiteOrigin: this.refuseResponse ? "TLS" : "PRACTICIAN_TLS",
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
      if (
        !(this.acceptResponse && this.refuseResponse && this.forwardedResponse)
      ) {
        this.bodyObs.next("");
        this.disableSending.next(false);
      }
    }
  }

  getReplyStatus() {
    if (this.acceptResponse) {
      return ReplyStatus.ACCEPTED;
    } else if (this.refuseResponse) {
      return ReplyStatus.REFUSED;
    } else if (this.forwardedResponse) {
      return ReplyStatus.FORWARDED;
    } else {
      return ReplyStatus.REPLY;
    }
  }

  replyMessage(message) {
    this.spinner.show();
    this.uuid = uuid();
    const replyMessage = new MessageDto();
    const parent = new MessageParent();
    parent.id = message.id;
    parent.messageStatus = "TREATED";
    parent.sendType = message.sendType;
    parent.replyStatus = this.getReplyStatus();
    delete message.sender.img;
    parent.sender = message.sender;
    parent.assignedToId = message.assignedToId;
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
    replyMessage.signature = message.signature ? message.signature : null;
    replyMessage.object = message.object;
    replyMessage.objectId = message.objectId;
    if (message.requestTypeId && message.requestTitleId) {
      replyMessage.requestTypeId = message.requestTypeId;
      replyMessage.requestTitleId = message.requestTitleId;
    }
    if (this.forwardedResponse) {
      replyMessage.toReceivers = [
        { receiverId: message.trReceiver[0].id, seen: 0 },
      ];
    } else {
      replyMessage.toReceivers = [
        { receiverId: message.sender.senderId, seen: 0 },
      ];
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
    // Response to TLS Group or TLS supervisors concerning a patient file
    if (
      (this.acceptResponse || this.refuseResponse) &&
      message.sender.concernsId != null &&
      message.sender.concernsType == "PATIENT_FILE" &&
      (message.sender.role == "TELESECRETARYGROUP" ||
        message.sender.role == "SUPER_SUPERVISOR" ||
        message.sender.role == "SUPERVISOR")
    ) {
      replyMessage.sender.concernsId = message.sender.concernsId;
      replyMessage.sender.concernsCivility = message.sender.concernsCivility
        ? message.sender.concernsCivility
        : null;
      replyMessage.sender.concernsPhotoId = message.sender.concernsPhotoId
        ? message.sender.concernsPhotoId
        : null;
      replyMessage.sender.concernsFullName = message.sender.concernsFullName
        ? message.sender.concernsFullName
        : null;
      replyMessage.sender.concernsType = message.sender.concernsType
        ? message.sender.concernsType
        : null;
    }
    if (
      message.file !== undefined &&
      message.file !== null &&
      message.file !== "" &&
      message.file !== []
    ) {
      this.selectedFiles = message.file;

      const formData = new FormData();
      if (this.selectedFiles) {
        replyMessage.hasFiles = true;
        replyMessage.uuid = this.uuid;
        formData.append("model", JSON.stringify(replyMessage));
        for (var i = 0; i < this.selectedFiles.length; i++) {
          formData.append(
            "file",
            this.selectedFiles[i],
            this.selectedFiles[i].name
          );
        }
      }
      this.nodeService.saveFileInMemoryV2(this.uuid, formData).subscribe(
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
  scrollToTop(): void {
    jQuery([document.documentElement, document.body]).animate(
      {
        scrollTop: $("#msgDetail").offset().top,
      },
      800
    );
  }
  goToBack() {
    if (this.messagingDetail) {
      this.scrollToTop();
        this.router.navigate([
          "/messagerie-lire/" +
          (this.cryptedId ? this.cryptedId : this.featureService.encrypt(this.messagingDetail.id)),
        ]);

    }
  }

  // destory any pipe(takeUntil(this._destroyed$)).subscribe to avoid memory leak
  ngOnDestroy(): void {
    this._destroyed$.next(true);
    this._destroyed$.unsubscribe();
  }
}
