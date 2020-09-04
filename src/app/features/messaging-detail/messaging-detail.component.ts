import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  AfterViewChecked
} from "@angular/core";
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
import { AccountService } from "../services/account.service";
import { MyPatientsService } from "../services/my-patients.service";
import { DomSanitizer } from "@angular/platform-browser";
@Component({
  selector: "app-messaging-detail",
  templateUrl: "./messaging-detail.component.html",
  styleUrls: ["./messaging-detail.component.scss"]
})
export class MessagingDetailComponent implements OnInit, AfterViewChecked {
  @ViewChild("reply") private myScrollContainer: ElementRef;
  private _destroyed$ = new Subject();
  previousURL = "";
  role: string = "PRACTICIAN";
  imageSource: string;
  patientFileImage: string | ArrayBuffer;
  isFromInbox: boolean;
  IsinboxContext: boolean = false;
  showAcceptRefuse: boolean;
  isMyMessage: boolean;
  senderRolePatient = false;
  messagingDetail: any;
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
  attachements: string[] = [];
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
    private sanitizer: DomSanitizer
  ) {
    this.notifier = notifierService;
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.user;
  }
  ngAfterViewChecked() {
    this.scrollToBottom();
  }
  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params["context"]) {
        switch (params["context"]) {
          case "sent": {
            this.isFromInbox = false;
            this.showAcceptRefuse = false;
            this.hidefrom = true;
            this.isFromArchive = false;
            this.sentContext = true;
            this.previousURL = "/messagerie-envoyes";
            break;
          }
          case "forwarded": {
            this.isFromInbox = false;
            this.showAcceptRefuse = false;
            this.hidefrom = true;
            this.isFromArchive = false;
            this.sentContext = true;
            this.previousURL = "/messagerie-transferes";
            break;
          }
          case "inbox": {
            this.isFromInbox = false;
            this.IsinboxContext = true;
            this.showAcceptRefuse = this.userRole == "PRACTICIAN";
            this.hideTo = true;
            this.isFromArchive = false;
            this.previousURL = "/messagerie";
            break;
          }
          case "inboxPraticien": {
            this.isFromInbox = false;
            this.showAcceptRefuse = true;
            this.IsinboxContext = true;
            this.hideTo = false;
            this.isFromArchive = true;
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
        }
      }
    });
    this.route.params.subscribe(params => {
      this.idMessage = params["id"];
      this.getMessageDetailById(this.idMessage);
    });
    this.featureService.setIsMessaging(true);
    this.scrollToBottom();
  }

  getMessageDetailById(id) {
    if (this.isFromArchive && this.showAcceptRefuse == false) {
      this.messagingDetailService
        .getMessageArchivedById(id)
        .pipe(takeUntil(this._destroyed$))
        .subscribe(message => {
          this.getAttachements(message.nodesId);
          message.sender = message.senderArchived;
          message.toReceivers = message.toReceiversArchived;
          message.ccReceivers = message.ccReceiversArchived;
          this.messagingDetail = message;
          this.prohibited = message.prohibited;
          this.isFromInbox = true;

          this.links = {
            isArchieve: !this.isFromArchive,
            isImportant: this.isFromInbox ? !message.important : false,
            isAddNote: true
          };
          if (
            this.messagingDetail.sender.senderId ==
            this.featureService.getUserId()
          ) {
            this.isFromInbox = false;
          }
          this.messagingDetail.toReceivers.forEach(receiver => {
            this.documentService.getDefaultImage(receiver.receiverId).subscribe(
              response => {
                let myReader: FileReader = new FileReader();
                myReader.onloadend = e => {
                  receiver.img = this.sanitizer.bypassSecurityTrustUrl(
                    myReader.result as string
                  );
                };
                let ok = myReader.readAsDataURL(response);
              },
              error => {
                receiver.img = this.avatars.user;
              }
            );
          });
          this.messagingDetail.ccReceivers.forEach(receiver => {
            this.documentService.getDefaultImage(receiver.receiverId).subscribe(
              response => {
                let myReader: FileReader = new FileReader();
                myReader.onloadend = e => {
                  receiver.img = this.sanitizer.bypassSecurityTrustUrl(
                    myReader.result as string
                  );
                };
                let ok = myReader.readAsDataURL(response);
              },
              error => {
                receiver.img = this.avatars.user;
              }
            );
          });
          this.documentService
            .getDefaultImage(this.messagingDetail.sender.senderId)
            .subscribe(
              response => {
                let myReader: FileReader = new FileReader();
                myReader.onloadend = e => {
                  this.messagingDetail.sender.img = this.sanitizer.bypassSecurityTrustUrl(
                    myReader.result as string
                  );
                };
                let ok = myReader.readAsDataURL(response);
              },
              error => {
                this.messagingDetail.sender.img = this.avatars.user;
              }
            );
        });
    } else {
      this.messagingDetailService
        .getMessagingDetailById(id)
        .subscribe(message => {
          this.showRefuseForTls =
            (message.sender.role == "TELESECRETARYGROUP" ||
              message.sender.role == "TELESECRETARYGROUP") &&
            message.requestTypeId != null &&
            message.requestTitleId != null;
          this.showAcceptRefuse =
            message.sender.role == "PATIENT" &&
            message.requestTypeId != null &&
            message.requestTitleId != null;
          this.getAttachements(message.nodesId);
          this.senderRolePatient =
            this.sentContext && message.toReceivers.length == 1
              ? message.toReceivers[0].role == "PATIENT"
              : message.sender.role == "PATIENT";
          this.messagingDetail = message;
          this.prohibited = message.prohibited;
          this.isFromInbox = this.IsinboxContext;
          this.links = {
            isArchieve: !this.isFromArchive,
            isImportant: this.isFromInbox ? !message.important : false,
            isAddNote: true
          };
          const filtredReceivers = this.messagingDetail.toReceivers.filter(
            to => to.receiverId != this.featureService.getUserId()
          );
          if (filtredReceivers.length > 0) {
            this.hideTo = false;
            this.messagingDetail.toReceivers = filtredReceivers;
          }
          this.setParentImg(this.messagingDetail.parent);
          this.messagingDetail.toReceivers.forEach(receiver => {
            this.documentService.getDefaultImage(receiver.receiverId).subscribe(
              response => {
                let myReader: FileReader = new FileReader();
                myReader.onloadend = e => {
                  receiver.img = this.sanitizer.bypassSecurityTrustUrl(
                    myReader.result as string
                  );
                };
                let ok = myReader.readAsDataURL(response);
              },
              error => {
                receiver.img = this.avatars.user;
              }
            );
          });
          this.messagingDetail.ccReceivers.forEach(receiver => {
            this.documentService.getDefaultImage(receiver.receiverId).subscribe(
              response => {
                let myReader: FileReader = new FileReader();
                myReader.onloadend = e => {
                  receiver.img = this.sanitizer.bypassSecurityTrustUrl(
                    myReader.result as string
                  );
                };
                let ok = myReader.readAsDataURL(response);
              },
              error => {
                receiver.img = this.avatars.user;
              }
            );
          });
          this.documentService
            .getDefaultImage(this.messagingDetail.sender.senderId)
            .subscribe(
              response => {
                let myReader: FileReader = new FileReader();
                myReader.onloadend = e => {
                  this.messagingDetail.sender.img = this.sanitizer.bypassSecurityTrustUrl(
                    myReader.result as string
                  );
                };
                let ok = myReader.readAsDataURL(response);
              },
              error => {
                this.messagingDetail.sender.img = this.avatars.user;
              }
            );
        });
    }
  }
  setParentImg(parent) {
    if (parent != null) {
      this.documentService.getDefaultImage(parent.sender.senderId).subscribe(
        response => {
          let myReader: FileReader = new FileReader();
          myReader.onloadend = e => {
            parent.sender.img = this.sanitizer.bypassSecurityTrustUrl(
              myReader.result as string
            );
          };
          let ok = myReader.readAsDataURL(response);
        },
        error => {
          parent.sender.img = this.avatars.user;
        }
      );

      this.setParentImg(parent.parent);
    }
  }
  hideShowReplyBtn(message) {
    this.messagingDetailService
      .patientsProhibitedByCurrentPractician()
      .subscribe(resp => {
        this.patientsId = resp;
        this.collectedIds = message.toReceivers.map(r => r.receiverId);
        if (message.ccReceivers.length > 0) {
          this.collectedIds.push(message.ccReceivers.map(r => r.receiverId));
        }
        this.collectedIds.push(message.sender.senderId);
        if (this.patientsId.length > 0) {
          this.prohibited =
            typeof this.collectedIds.find(elm =>
              this.patientsId.includes(elm)
            ) != "undefined";
        }
      });
  }

  replyAction() {
    this.messagingDetailService.setId(this.idMessage);
    this.scrollToBottom();
    this.router.navigate([
      "/messagerie-lire/" + this.idMessage + "/messagerie-repondre/",
      this.idMessage
    ]);
  }

  forwardAction() {
    this.messagingDetailService.setId(this.idMessage);
    this.scrollToBottom();
    this.router.navigate(
      [
        "/messagerie-lire/" + this.idMessage + "/messagerie-repondre/",
        this.idMessage
      ],
      {
        queryParams: {
          context: "forward"
        }
      }
    );
  }

  acceptAction() {
    this.messagingDetailService.setId(this.idMessage);
    this.router.navigate(
      [
        "/messagerie-lire/" + this.idMessage + "/messagerie-repondre/",
        this.idMessage
      ],
      {
        queryParams: {
          status: "accept"
        }
      }
    );
    this.scrollToBottom();
  }

  refuseAction() {
    this.messagingDetailService.setId(this.idMessage);
    this.router.navigate(
      [
        "/messagerie-lire/" + this.idMessage + "/messagerie-repondre/",
        this.idMessage
      ],
      {
        queryParams: {
          status: "refus"
        }
      }
    );
    this.scrollToBottom();
  }

  importantAction() {
    let ids = [];
    ids.push(this.idMessage);
    this.messagingDetailService
      .markMessageAsImportant(ids)
      .pipe(takeUntil(this._destroyed$))
      .subscribe(
        message => {
          this.links.isImportant = false;
          this.notifier.show({
            message: this.globalService.toastrMessages
              .mark_important_message_success,
            type: "info",
            template: this.customNotificationTmpl
          });
        },
        error => {
          this.notifier.show({
            message: this.globalService.toastrMessages
              .mark_important_message_error,
            type: "error",
            template: this.customNotificationTmpl
          });
        }
      );
  }

  archieveActionClicked() {
    let ids = [];
    ids.push(this.idMessage);
    this.messagingDetailService.markMessageAsArchived(ids).subscribe(
      resp => {
        this.router.navigate([this.previousURL], {
          queryParams: {
            status: "archiveSuccess"
          }
        });
        if (this.previousURL == "/messagerie-transferes") {
          this.featureService.numberOfForwarded =
            this.featureService.numberOfForwarded - 1;
        }
      },
      error => {
        this.notifier.show({
          message: this.globalService.toastrMessages.archived_message_error,
          type: "error",
          template: this.customNotificationTmpl
        });
      }
    );
  }

  goToBack() {
    this._location.back();
  }

  download(nodesId: Array<string>) {
    nodesId.forEach(nodeId => {
      var nodeDetails;
      this.documentService
        .getNodeDetailsFromAlfresco(nodeId)
        .subscribe(node => {
          nodeDetails = node;
        });

      this.documentService.downloadFile(nodeId).subscribe(response => {
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
  // destory any subscribe to avoid memory leak
  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  getAttachements(nodesId: string[]) {
    if (nodesId) {
      nodesId.forEach(id => {
        this.documentService
          .getNodeDetailsFromAlfresco(id)
          .pipe(takeUntil(this._destroyed$))
          .subscribe(node => {
            this.attachements.push(node.entry.name);
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
        userRole: "PRACTICIAN"
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

      this.patientService.getAccountIdByPatientId(idAccount).subscribe(res => {
        let info = {
          patientId: res ? res : idAccount,
          practicianId: this.practicianId,
          userRole: "SECRETARY"
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
        userRole: "PRACTICIAN"
      };
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
        userRole: "SECRETARY"
      };
      this.getPatientFile(info);
    }
  }
  getPatientFile(info) {
    // this.dialogService.openPatientFile("Fiche Patient", info);
  }
}
