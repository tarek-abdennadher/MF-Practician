import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MessagingDetailService } from "../services/messaging-detail.service";
import { GlobalService } from "@app/core/services/global.service";
import { Location } from "@angular/common";
import { MyDocumentsService } from "../my-documents/my-documents.service";
import * as FileSaver from "file-saver";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { NotifierService } from "angular-notifier";
import { FeaturesService } from "../features.service";
import { LocalStorageService } from "ngx-webstorage";
import { DialogService } from "../services/dialog.service";
import { MyPatientsService } from "../services/my-patients.service";
import { DomSanitizer, Title } from "@angular/platform-browser";
import { FeaturesComponent } from "../features.component";
import { MessageService } from "@app/features/services/message.service";
import { checkIsValidImageExtensions } from "@app/shared/functions/functions";
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: "app-messaging-detail",
  templateUrl: "./messaging-detail.component.html",
  styleUrls: ["./messaging-detail.component.scss"],
})

export class MessagingDetailComponent implements OnInit, OnDestroy {
  message: any;
  isMessageImportant: boolean;
  loading: boolean = false;
  showReplyActionsForTls: boolean = false;
  showReplyActionsForPatient: boolean = false;
  patientFileAccountId: number;
  private _destroyed$ = new Subject();
  previousURL = "";
  role: string = "PRACTICIAN";
  imageSource: string;
  patientFileImage: string | ArrayBuffer;
  isFromInbox: boolean;
  IsinboxContext: boolean = false;
  showAcceptRefuse: boolean;
  isNotMyMessage: boolean = false;
  senderRolePatient = false;
  messagingDetail: any;
  originalMessageNode: any;
  newMessage: any;
  prohibited = false;
  patientsId: number[];
  collectedIds: number[];
  idMessage: number;
  links: any;
  hideTo = false;
  hidefrom = false;
  isFromArchive = false;
  practicianId: number;
  patientId: number;
  page = this.globalService.messagesDisplayScreen.inbox;
  loadingText = this.globalService.messagesDisplayScreen.loading;
  number = 0;
  topText = this.globalService.messagesDisplayScreen.MailDetail;
  bottomText =
    this.number > 1
      ? this.globalService.messagesDisplayScreen.newMessages
      : this.globalService.messagesDisplayScreen.newMessage;
  backButton = true;
  private readonly notifier: NotifierService;
  userRole = this.localSt.retrieve("role");
  @ViewChild("customNotification", { static: true }) customNotificationTmpl;
  sentContext = false;
  attachements: any[] = [];
  avatars: {
    doctor: string;
    child: string;
    women: string;
    man: string;
    secretary: string;
    user: string;
    tls: string;
  };
  showRefuseForTls: boolean;
  public patientFileId: number;
  context: string;
  file = {
    fileName: "",
    src: null,
    isImage: false,
    isPdf:false
  };
  shownSpinner = false;
  constructor(
    private _location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private messagingDetailService: MessagingDetailService,
    private globalService: GlobalService,
    private documentService: MyDocumentsService,
    private featureService: FeaturesService,
    notifierService: NotifierService,
    private localSt: LocalStorageService,
    private dialogService: DialogService,
    private patientService: MyPatientsService,
    private sanitizer: DomSanitizer,
    private featureComp: FeaturesComponent,
    private title: Title,
    private messageService: MessageService,
    private spinner: NgxSpinnerService
  ) {
    this.title.setTitle(this.topText);
    this.loading = false;
    this.notifier = notifierService;
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.user;
  }
  scrollToBottom(): void {
    jQuery([document.documentElement, document.body]).animate(
      {
        scrollTop: $("#reply").offset().top - 100,
      },
      1000
    );
  }
  ngOnInit(): void {
    this.loading = false;
    this.route.queryParams.subscribe((params) => {
      if (params["context"]) {
        this.context = params["context"];
        switch (params["context"]) {
          case "sent": {
            this.isFromInbox = false;
            this.showAcceptRefuse = false;
            this.hidefrom = false;
            this.isFromArchive = false;
            this.sentContext = true;
            this.previousURL = "/messagerie-envoyes";
            break;
          }
          case "forwarded": {
            this.isFromInbox = false;
            this.showAcceptRefuse = false;
            this.hidefrom = false;
            this.isFromArchive = false;
            this.sentContext = true;
            this.previousURL = "/messagerie-transferes";
            break;
          }
          case "inbox": {
            this.isFromInbox = true;
            this.IsinboxContext = true;
            this.showAcceptRefuse = this.userRole == "PRACTICIAN";
            this.hideTo = false;
            this.isFromArchive = false;
            this.previousURL = "/messagerie";
            break;
          }
          case "inboxPraticien": {
            this.isFromInbox = true;
            this.showAcceptRefuse = true;
            this.IsinboxContext = true;
            this.hideTo = false;
            this.isFromArchive = true;
            this.isNotMyMessage = true;
            break;
          }
          case "archive": {
            this.isFromInbox = false;
            this.showAcceptRefuse = false;
            this.hideTo = false;
            this.hidefrom = false;
            this.isFromArchive = true;
            break;
          }
          case "patient": {
            this.isFromInbox = false;
            this.showAcceptRefuse = false;
            this.hidefrom = false;
            this.hideTo = false;
            this.isFromArchive = false;
            this.sentContext = true;
            this.message = null;
            this.messagingDetail = null;
            this.previousURL = "/mes-patients";
            break;
          }
        }
      }
      this.route.params.subscribe((params) => {
        this.patientFileAccountId = null;
        if (this.originalMessageNode && this.originalMessageNode != null) {
          if (
            this.originalMessageNode.sender &&
            (this.originalMessageNode.sender.role == "TELESECRETARYGROUP" ||
              this.originalMessageNode.sender.role == "SUPERVISOR" ||
              this.originalMessageNode.sender.role == "SUPER_SUPERVISOR" ||
              this.originalMessageNode.sender.role == "OPERATOR") &&
            this.originalMessageNode.sender.concernsType &&
            this.originalMessageNode.sender.concernsType == "PATIENT_FILE"
          ) {
            if (this.originalMessageNode.receiveDocument == true) {
              this.showReplyActionsForTls = true;
              if (
                this.originalMessageNode.sender.concernsId &&
                this.originalMessageNode.sender.concernsId != null
              ) {
                this.patientService
                  .getAccountIdByPatientFileId(
                    this.originalMessageNode.sender.concernsId
                  )
                  .pipe(takeUntil(this._destroyed$))
                  .subscribe((res) => {
                    this.showReplyActionsForPatient = true;
                    this.patientFileAccountId = res;
                  });
              }
            } else {
              this.showReplyActionsForPatient = false;
              this.showReplyActionsForTls = true;
            }
          }
          this.showRefuseForTls =
            (this.originalMessageNode.sender.role == "TELESECRETARYGROUP" ||
              this.originalMessageNode.sender.role == "TELESECRETARYGROUP") &&
            this.originalMessageNode.requestTypeId != null &&
            this.originalMessageNode.requestTitleId != null;
          this.showAcceptRefuse =
            this.originalMessageNode.sender.role == "PATIENT" &&
            this.originalMessageNode.requestTypeId != null &&
            this.originalMessageNode.requestTitleId != null;
          if (this.isFromArchive && this.showAcceptRefuse == false) {
            this.isFromInbox = true;
          } else {
            this.isFromInbox = this.IsinboxContext;
          }
        }
        if (this.idMessage !== this.featureService.decrypt(params["id"])) {
          this.idMessage = this.featureService.decrypt(params["id"]);
          this.getMessageDetailById(this.idMessage, this.context);
        }
      });
      setTimeout(() => {
        this.featureService.setIsMessaging(true);
      });
    });
  }
  checkContect(context) {}

  getMessageDetailById(id, context) {
    this.loading = true;
    if (this.isFromArchive && this.showAcceptRefuse == false) {
      this.messagingDetailService
        .getMessageArchivedById(id)
        .pipe(takeUntil(this._destroyed$))
        .subscribe((message) => {
          this.findOriginalMessageNode(message, id);
          this.message = message;
          this.getAttachements(message.nodesId);
          this.messagingDetail = message;
          this.prohibited = message.prohibited;
          this.isFromInbox = true;

          this.links = {
            isArchieve: !this.isFromArchive,
            isImportant: this.isFromInbox ? !message.important : false,
            isAddNote: true,
            isDesarchive: true,
          };
          if (
            this.messagingDetail.sender.senderId ==
            this.featureService.getUserId()
          ) {
            this.isFromInbox = false;
          }
          this.messagingDetail.toReceivers.forEach((receiver) => {
            this.getDefaultImage(receiver, receiver.receiverId);
          });
          this.messagingDetail.ccReceivers.forEach((receiver) => {
            this.getDefaultImage(receiver, receiver.receiverId);
          });
          this.getDefaultImage(
            this.messagingDetail.sender,
            this.messagingDetail.sender.senderId
          );
          this.setParentImg(this.messagingDetail.parent);
          this.loading = false;
        });
    } else {
      this.messagingDetailService
        .getMessagingDetailById(id)
        .pipe(takeUntil(this._destroyed$))
        .subscribe((message) => {
          this.findOriginalMessageNode(message, id);
          if (context && context == "patient") {
            this.message = message;
            this.isMessageImportant = message.important;

            this.showReplyActionsForPatient = false;
            this.showReplyActionsForTls = false;
            this.showRefuseForTls = false;
            this.showAcceptRefuse = false;
            this.getAttachements(message.nodesId);
            this.senderRolePatient = false;
            this.messagingDetail = message;
            this.prohibited = message.prohibited;
            this.isFromInbox = false;
            this.links = {
              isArchieve: true,
              isImportant: this.isFromInbox ? !message.important : false,
              isAddNote: true,
            };
            const filtredReceivers = this.messagingDetail.toReceivers.filter(
              (to) => to.receiverId != this.featureService.getUserId()
            );
            if (filtredReceivers.length > 0) {
              this.hideTo = false;
              this.messagingDetail.toReceivers = filtredReceivers;
            }
            this.setParentImg(this.messagingDetail.parent);
            this.messagingDetail.toReceivers.forEach((receiver) => {
              this.getDefaultImage(receiver, receiver.receiverId);
            });
            this.getDefaultImage(
              this.messagingDetail.sender,
              this.messagingDetail.sender.senderId
            );
            this.loading = false;
          } else {
            this.message = message;
            this.isMessageImportant = message.important;

            if (
              this.originalMessageNode.sender &&
              (this.originalMessageNode.sender.role == "TELESECRETARYGROUP" ||
                this.originalMessageNode.sender.role == "SUPERVISOR" ||
                this.originalMessageNode.sender.role == "SUPER_SUPERVISOR" ||
                this.originalMessageNode.sender.role == "OPERATOR") &&
              this.originalMessageNode.sender.concernsType &&
              this.originalMessageNode.sender.concernsType == "PATIENT_FILE"
            ) {
              if (this.originalMessageNode.receiveDocument == true) {
                this.showReplyActionsForTls = true;
                if (
                  this.originalMessageNode.sender.concernsId &&
                  this.originalMessageNode.sender.concernsId != null
                ) {
                  this.patientService
                    .getAccountIdByPatientFileId(
                      this.originalMessageNode.sender.concernsId
                    )
                    .pipe(takeUntil(this._destroyed$))
                    .subscribe((res) => {
                      this.showReplyActionsForPatient = true;
                      this.patientFileAccountId = res;
                    });
                }
              } else {
                this.showReplyActionsForPatient = false;
                this.showReplyActionsForTls = true;
              }
            }
            this.showRefuseForTls =
              (this.originalMessageNode.sender.role == "TELESECRETARYGROUP" ||
                this.originalMessageNode.sender.role == "TELESECRETARYGROUP") &&
              this.originalMessageNode.requestTypeId != null &&
              this.originalMessageNode.requestTitleId != null;
            this.showAcceptRefuse =
              this.originalMessageNode.sender.role == "PATIENT" &&
              this.originalMessageNode.requestTypeId != null &&
              this.originalMessageNode.requestTitleId != null;
            this.getAttachements(message.nodesId);
            this.senderRolePatient =
              this.sentContext &&
              this.originalMessageNode.toReceivers.length == 1
                ? this.originalMessageNode.toReceivers[0].role == "PATIENT"
                : this.originalMessageNode.sender.role == "PATIENT";
            this.messagingDetail = message;
            this.prohibited = this.originalMessageNode.prohibited;
            this.isFromInbox = this.IsinboxContext;
            this.links = {
              isArchieve: !this.isFromArchive,
              isImportant: this.isFromInbox ? !message.important : false,
              isAddNote: true,
              isNotMyMessage: this.isNotMyMessage,
              isMenuMoveToInbox:
                this.isFromInbox && this.message.category != null,
              isMenuMoveToDemand:
                this.isFromInbox && this.message.category != "DEMAND",
              isMenuMoveToPhones:
                this.isFromInbox && this.message.category != "PHONES",
              isMenuMoveToAppointment:
                this.isFromInbox && this.message.category != "APPOINTMENT",
              isMenuMoveToConfreres:
                this.isFromInbox && this.message.category != "CONFRERES",
              isMenuMoveToDivers:
                this.isFromInbox && this.message.category != "DIVERS",
            };
            const filtredReceivers = this.messagingDetail.toReceivers.filter(
              (to) => to.receiverId != this.featureService.getUserId()
            );
            if (filtredReceivers.length > 0) {
              this.hideTo = false;
              this.messagingDetail.toReceivers = filtredReceivers;
            }
            this.setParentImg(this.messagingDetail.parent);
            this.messagingDetail.toReceivers.forEach((receiver) => {
              this.getDefaultImage(receiver, receiver.receiverId);
            });
            this.messagingDetail.ccReceivers.forEach((receiver) => {
              this.getDefaultImage(receiver, receiver.receiverId);
            });
            this.getDefaultImage(
              this.messagingDetail.sender,
              this.messagingDetail.sender.senderId
            );
            this.loading = false;
          }
        });
    }
  }
  setParentImg(parent) {
    if (parent != null) {
      this.getDefaultImage(parent.sender, parent.sender.senderId);
      if (parent.hasFiles) {
        if (parent.nodesId) {
          parent.attachements = [];
          parent.nodesId.forEach((id) => {
            this.documentService
              .getNodeDetailsFromAlfresco(id)
              .pipe(takeUntil(this._destroyed$))
              .subscribe((node) => {
                parent.attachements.push({
                  name: node.entry.name,
                  visualize: checkIsValidImageExtensions(node.entry.name)
                    .isValid,
                });
              });
          });
        }
      }
      this.setParentImg(parent.parent);
    }
  }
  removeImportantAction() {
    this.messageService
      .removeMarkMessageAsImportant([this.idMessage])
      .pipe(takeUntil(this._destroyed$))
      .subscribe(
        (message) => {
          this.isMessageImportant = false;
          this.links.isImportant = true;
          this.notifier.show({
            message: this.globalService.toastrMessages
              .remove_mark_important_message_success,
            type: "info",
            template: this.customNotificationTmpl,
          });
        },
        (error) => {
          this.notifier.show({
            message: this.globalService.toastrMessages
              .remove_mark_important_message_error,
            type: "error",
            template: this.customNotificationTmpl,
          });
        }
      );
  }
  getDefaultImage(user, userId) {
    this.documentService
      .getDefaultImage(userId)
      .pipe(takeUntil(this._destroyed$))
      .subscribe(
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
  hideShowReplyBtn(message) {
    this.messagingDetailService
      .patientsProhibitedByCurrentPractician()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((resp) => {
        this.patientsId = resp;
        this.collectedIds = message.toReceivers.map((r) => r.receiverId);
        if (message.ccReceivers.length > 0) {
          this.collectedIds.push(message.ccReceivers.map((r) => r.receiverId));
        }
        this.collectedIds.push(message.sender.senderId);
        if (this.patientsId.length > 0) {
          this.prohibited =
            typeof this.collectedIds.find((elm) =>
              this.patientsId.includes(elm)
            ) != "undefined";
        }
      });
  }

  findOriginalMessageNode(message, id) {
    if (message.id == id) {
      this.originalMessageNode = JSON.parse(JSON.stringify(message));
    } else {
      message.parent ? this.findOriginalMessageNode(message.parent, id) : null;
    }
  }

  replyAction() {
    this.loading = false;
    this.scrollToBottom();
    let messageToReply = JSON.parse(JSON.stringify(this.originalMessageNode));
    messageToReply.id = this.messagingDetail.id;
    if (this.showReplyActionsForPatient === true) {
      this.router.navigate(["messagerie-repondre"], {
        queryParams: {
          status: "accept",
          context: "TLS",
        },
        relativeTo: this.route.parent,
        state: { data: messageToReply },
      });
    } else {
      this.router.navigate(["messagerie-repondre"], {
        relativeTo: this.route.parent,
        state: { data: messageToReply },
      });
    }
  }
  replyActionTLS() {
    this.loading = false;
    this.scrollToBottom();
    let messageToReply = JSON.parse(JSON.stringify(this.originalMessageNode));
    messageToReply.documentBody = null;
    messageToReply.documentFooter = null;
    messageToReply.documentHeader = null;
    messageToReply.body = null;
    messageToReply.id = this.messagingDetail.id;
    if (this.showReplyActionsForPatient === true) {
      this.router.navigate(["messagerie-repondre"], {
        queryParams: {
          status: "",
          context: "TLS",
        },
        relativeTo: this.route.parent,
        state: { data: messageToReply },
      });
    } else {
      this.router.navigate(["messagerie-repondre"], {
        relativeTo: this.route.parent,
        state: { data: messageToReply },
      });
    }
  }
  replyActionPatient() {
    this.newMessage = JSON.parse(JSON.stringify(this.originalMessageNode));
    this.newMessage.id = this.messagingDetail.id;
    this.newMessage.sender.fullName = this.originalMessageNode.sender.concernsFullName;
    this.newMessage.sender.role = "PATIENT";
    this.newMessage.sender.senderId = this.patientFileAccountId;
    this.newMessage.sender.civility = this.originalMessageNode.sender.concernsCivility;
    this.newMessage.sender.concernsFullName = null;
    this.newMessage.documentBody = null;
    this.newMessage.documentFooter = null;
    this.newMessage.documentHeader = null;
    this.newMessage.body = null;
    this.loading = false;
    this.router.navigate(["messagerie-repondre"], {
      queryParams: {
        status: "",
        context: "PATIENT",
      },
      relativeTo: this.route.parent,
      state: {
        data: this.newMessage,
      },
    });
    this.scrollToBottom();
  }

  forwardAction() {
    this.loading = false;
    this.scrollToBottom();
    let messageToReply = JSON.parse(JSON.stringify(this.originalMessageNode));
    messageToReply.id = this.messagingDetail.id;
    this.router.navigate(["messagerie-repondre"], {
      queryParams: {
        context: "forward",
      },
      relativeTo: this.route.parent,
      state: { data: messageToReply },
    });
  }

  acceptAction() {
    let messageToReply = JSON.parse(JSON.stringify(this.originalMessageNode));
    this.newMessage = JSON.parse(JSON.stringify(this.originalMessageNode));
    this.newMessage.id = this.messagingDetail.id;
    messageToReply.id = this.messagingDetail.id;
    if (this.showReplyActionsForPatient === true) {
      this.newMessage.sender.fullName = this.originalMessageNode.sender.concernsFullName;
      this.newMessage.sender.role = "PATIENT";
      this.newMessage.sender.senderId = this.patientFileAccountId;
      this.newMessage.sender.civility = this.originalMessageNode.sender.concernsCivility;
      this.newMessage.sender.concernsFullName = null;
    }
    this.loading = false;

    this.router.navigate(["messagerie-repondre"], {
      queryParams: {
        status: "accept",
        context: "PATIENT",
      },
      relativeTo: this.route.parent,
      state: {
        data:
          this.showReplyActionsForPatient === true
            ? this.newMessage
            : messageToReply,
      },
    });
    this.scrollToBottom();
  }
  refuseToPatientAction() {
    this.newMessage = JSON.parse(JSON.stringify(this.originalMessageNode));
    this.newMessage.id = this.messagingDetail.id;
    if (this.showReplyActionsForPatient === true) {
      this.newMessage.sender.fullName = this.originalMessageNode.sender.concernsFullName;
      this.newMessage.sender.role = "PATIENT";
      this.newMessage.sender.senderId = this.patientFileAccountId;
      this.newMessage.sender.civility = this.originalMessageNode.sender.concernsCivility;
      this.newMessage.sender.concernsFullName = null;
    }
    this.router.navigate(["messagerie-repondre"], {
      queryParams: {
        status: "refus",
        context: "PATIENT",
      },
      relativeTo: this.route.parent,
      state: { data: this.newMessage },
    });
    this.scrollToBottom();
  }
  refuseAction() {
    let messageToReply = JSON.parse(JSON.stringify(this.originalMessageNode));
    messageToReply.id = this.messagingDetail.id;
    this.router.navigate(["messagerie-repondre"], {
      queryParams: {
        status: "refus",
        context: "TLS",
      },
      relativeTo: this.route.parent,
      state: { data: messageToReply },
    });
    this.scrollToBottom();
  }

  importantAction() {
    let ids = [];
    ids.push(this.idMessage);
    this.messagingDetailService.markMessageAsImportant(ids).subscribe(
      (message) => {
        this.isMessageImportant = true;
        this.links.isImportant = false;
        this.featureComp.setNotif(
          this.globalService.toastrMessages.mark_important_message_success
        );
      },
      (error) => {
        this.featureComp.setNotif(
          this.globalService.toastrMessages.mark_important_message_error
        );
      }
    );
  }

  archieveActionClicked() {
    this.dialogService
      .openConfirmDialog(
        this.globalService.messagesDisplayScreen.archive_confirmation_message,
        "Suppression"
      )
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          let ids = [];
          ids.push(this.idMessage);
          this.messagingDetailService.markMessageAsArchived(ids).subscribe(
            (resp) => {
              this.router.navigate([this.previousURL]);
              this.featureComp.setNotif(
                this.globalService.toastrMessages.archived_message_success
              );
              if (this.previousURL == "/messagerie-transferes") {
                this.featureService.numberOfForwarded =
                  this.featureService.numberOfForwarded - 1;
              }
            },
            (error) => {
              this.featureComp.setNotif(
                this.globalService.toastrMessages.archived_message_error
              );
            }
          );
        }
      });
  }

  goToBack() {
    this.router.navigate(["/messagerie"]);
  }

  download(nodesId: Array<string>) {
    nodesId.forEach((nodeId) => {
      var nodeDetails;
      this.documentService
        .getNodeDetailsFromAlfresco(nodeId)
        .pipe(takeUntil(this._destroyed$))
        .subscribe((node) => {
          nodeDetails = node;
        });

      this.documentService
        .downloadFile(nodeId)
        .pipe(takeUntil(this._destroyed$))
        .subscribe((response) => {
          const blob = new Blob([response.body]);
          const filename = nodeDetails.entry.name;
          const filenameDisplay = filename;
          const dotIndex = filename.lastIndexOf(".");
          const extension = filename.substring(dotIndex + 1, filename.length);
          let resultname: string;
          if (filenameDisplay !== "") {
            resultname = filenameDisplay.includes(extension)
              ? filenameDisplay
              : filenameDisplay + "." + extension;
          } else {
            resultname = filename;
          }
          FileSaver.saveAs(blob, resultname);
        });
    });
  }

  hideSpinner() {
    this.shownSpinner =false;
    this.spinner.hide();
    this.file = {
      fileName: "",
      src: null,
      isImage: false,
      isPdf: false
    };
  }

  visualizeFile(nodesId: Array<string>) {
    this.shownSpinner = true;
    this.spinner.show();
    nodesId.forEach((nodeId) => {
      var nodeDetails;
      this.documentService
        .getNodeDetailsFromAlfresco(nodeId)
        .pipe(takeUntil(this._destroyed$))
        .subscribe((node) => {
          nodeDetails = node;
        });
      this.documentService
        .downloadFile(nodeId)
        .pipe(takeUntil(this._destroyed$))
        .subscribe((response) => {
          const checked = checkIsValidImageExtensions(nodeDetails.entry.name);
          if (checked.isValid) {
            this.file = {
              ...this.file,
              ...checked,
            }
            this.file.fileName = nodeDetails.entry.name;
            let myReader: FileReader = new FileReader();
            myReader.onloadend = (e) => {
              if (checked.isSvg)
                this.file.src = this.sanitizer.bypassSecurityTrustUrl(
                  myReader.result as string
                );
              else if (checked.isPdf) this.file.src = myReader.result.toString().split(",")[1];
              else this.file.src = myReader.result;
            };
            let ok = myReader.readAsDataURL(response.body);
          }
        });
    });
  }

  ngOnDestroy(): void {
    this._destroyed$.next(true);
    this._destroyed$.unsubscribe();
  }

  getAttachements(nodesId: string[]) {
    if (nodesId) {
      this.attachements = [];

      nodesId.forEach((id) => {
        this.documentService
          .getNodeDetailsFromAlfresco(id)
          .pipe(takeUntil(this._destroyed$))
          .subscribe((node) => {
            this.attachements.push({
              name: node.entry.name,
              visualize: checkIsValidImageExtensions(node.entry.name).isValid,
            });
          });
      });
    }
  }

  // Display patient file using patientid and practician id
  displayPatientFile(idAccount) {
    if (this.localSt.retrieve("role") == "PRACTICIAN") {
      let info = {
        patientId: idAccount,
        practicianId: this.featureService.getUserId(),
        userRole: "PRACTICIAN",
      };
      this.getPatientFile(info);
    } else {
      if (
        this.featureService.selectedPracticianId == null ||
        this.featureService.selectedPracticianId == 0
      ) {
        if (this.messagingDetail.sender.role == "PRACTICIAN") {
          this.practicianId = this.messagingDetail.sender.senderId;
        } else {
          this.practicianId = this.localSt.retrieve("practicianId");
        }
      } else {
        this.practicianId = this.featureService.selectedPracticianId;
      }

      this.patientService
        .getAccountIdByPatientId(idAccount)
        .pipe(takeUntil(this._destroyed$))
        .subscribe((res) => {
          let info = {
            patientId: res ? res : idAccount,
            practicianId: this.practicianId,
            userRole: "SECRETARY",
          };
          this.getPatientFile(info);
        });
    }
  }
  // Display patient file using patient file id
  displayForPatientFile(patientFileId) {
    if (this.localSt.retrieve("role") == "PRACTICIAN") {
      let info = {
        patientFileId: patientFileId,
        practicianId: this.featureService.getUserId(),
        userRole: "PRACTICIAN",
        disabled: false,
      };
      if (
        this.messagingDetail.sender.role == "PRACTICIAN" &&
        this.messagingDetail.sender.senderId !== this.featureService.getUserId()
      ) {
        info = {
          patientFileId: patientFileId,
          practicianId: this.featureService.getUserId(),
          userRole: "PRACTICIAN",
          disabled: true,
        };
      }
      this.getPatientFile(info);
    } else {
      if (
        this.featureService.selectedPracticianId == null ||
        this.featureService.selectedPracticianId == 0
      ) {
        this.practicianId = this.messagingDetail.sender.senderId;
      } else {
        this.practicianId = this.featureService.selectedPracticianId;
      }
      let info = {
        patientFileId: patientFileId,
        practicianId: this.practicianId,
        userRole: "SECRETARY",
      };
      this.getPatientFile(info);
    }
  }
  getPatientFile(info) {
    this.dialogService.openPatientFile("Fiche Patient", info);
  }
  displayContact(contactId) {
    this.dialogService.openContactDetail("Détails Contact", contactId);
  }
  desarchiveMessages() {
    this.dialogService
      .openConfirmDialog(
        this.globalService.messagesDisplayScreen.dearchive_confirmation_message,
        "Désarchivage"
      )
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          let ids = [];
          ids.push(this.idMessage);
          this.messagingDetailService
            .markMessageAsNoMoreArchived(ids)
            .subscribe(
              (resp) => {
                this.router.navigate([this.previousURL]);
                this.featureComp.setNotif(
                  this.globalService.toastrMessages.desarchived_message_success
                );
                if (this.previousURL == "/messagerie-transferes") {
                  this.featureService.numberOfForwarded =
                    this.featureService.numberOfForwarded - 1;
                }
              },
              (error) => {
                this.featureComp.setNotif(
                  this.globalService.toastrMessages.desarchived_message_error
                );
              }
            );
        }
      });
  }
  changeCategory(category) {
    this.messagingDetailService
      .changeCategory(this.idMessage, category)
      .subscribe((result) => {
        this.router.navigate([this.previousURL]);
      });
  }
}
