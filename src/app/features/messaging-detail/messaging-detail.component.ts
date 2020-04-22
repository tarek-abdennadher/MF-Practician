import { Component, OnInit, ViewChild } from "@angular/core";
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
@Component({
  selector: "app-messaging-detail",
  templateUrl: "./messaging-detail.component.html",
  styleUrls: ["./messaging-detail.component.scss"],
})
export class MessagingDetailComponent implements OnInit {
  private _destroyed$ = new Subject();
  role: string = "MEDICAL";
  imageSource: string = "assets/imgs/user.png";
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
    private dialogService: DialogService
  ) {
    this.notifier = notifierService;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params["context"]) {
        switch (params["context"]) {
          case "sent": {
            this.isFromInbox = false;
            this.showAcceptRefuse = false;
            this.hidefrom = true;
            this.isFromArchive = false;
            this.sentContext = true;
            break;
          }
          case "inbox": {
            this.isFromInbox = false;
            this.IsinboxContext = true;
            this.showAcceptRefuse = this.userRole == "PRACTICIAN";
            this.hideTo = true;
            this.isFromArchive = false;
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
    this.route.params.subscribe((params) => {
      this.idMessage = params["id"];
      this.getMessageDetailById(this.idMessage);
    });
  }

  getMessageDetailById(id) {
    if (this.isFromArchive && this.showAcceptRefuse == false) {
      this.messagingDetailService
        .getMessageArchivedById(id)
        .pipe(takeUntil(this._destroyed$))
        .subscribe((message) => {
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
            isAddNote: true,
          };
          this.messagingDetail.toReceivers.forEach((receiver) => {
            if (receiver.photoId) {
              this.documentService.downloadFile(receiver.photoId).subscribe(
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
              this.documentService.downloadFile(receiver.photoId).subscribe(
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
    } else {
      this.messagingDetailService
        .getMessagingDetailById(id)
        .subscribe((message) => {
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
            isAddNote: true,
          };
          this.messagingDetail.toReceivers.forEach((receiver) => {
            if (receiver.photoId) {
              this.documentService.downloadFile(receiver.photoId).subscribe(
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
              this.documentService.downloadFile(receiver.photoId).subscribe(
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
  }

  hideShowReplyBtn(message) {
    this.messagingDetailService
      .patientsProhibitedByCurrentPractician()
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

  replyAction() {
    this.router.navigate(["/messagerie-repondre/", this.idMessage]);
  }

  acceptAction() {
    this.router.navigate(["/messagerie-repondre/", this.idMessage]);
  }

  refuseAction() {
    this.router.navigate(["/messagerie-repondre/", this.idMessage], {
      queryParams: {
        status: "refus",
      },
    });
  }

  importantAction() {
    let ids = [];
    ids.push(this.idMessage);
    this.messagingDetailService
      .markMessageAsImportant(ids)
      .pipe(takeUntil(this._destroyed$))
      .subscribe(
        (message) => {
          this.links.isImportant = false;
          this.notifier.show({
            message: this.globalService.toastrMessages
              .mark_important_message_success,
            type: "info",
            template: this.customNotificationTmpl,
          });
        },
        (error) => {
          this.notifier.show({
            message: this.globalService.toastrMessages
              .mark_important_message_error,
            type: "error",
            template: this.customNotificationTmpl,
          });
        }
      );
  }

  archieveActionClicked() {
    this.dialogService
      .openConfirmDialog(
        this.globalService.messagesDisplayScreen.archiving_confirmation_message,
        this.globalService.messagesDisplayScreen.archiving_title_message
      )
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          let ids = [];
          ids.push(this.idMessage);
          this.featureService.numberOfArchieve =
            this.featureService.numberOfArchieve + 1;
          this.messagingDetailService.markMessageAsArchived(ids).subscribe(
            (resp) => {
              this.notifier.show({
                message: this.globalService.toastrMessages
                  .archived_message_success,
                type: "info",
                template: this.customNotificationTmpl,
              });
            },
            (error) => {
              this.notifier.show({
                message: this.globalService.toastrMessages
                  .archived_message_error,
                type: "error",
                template: this.customNotificationTmpl,
              });
            }
          );
        }
      });
  }

  goToBack() {
    this._location.back();
  }

  download(nodesId: Array<string>) {
    nodesId.forEach((nodeId) => {
      var nodeDetails;
      this.documentService
        .getNodeDetailsFromAlfresco(nodeId)
        .subscribe((node) => {
          nodeDetails = node;
        });

      this.documentService.downloadFile(nodeId).subscribe((response) => {
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
      nodesId.forEach((id) => {
        this.documentService
          .getNodeDetailsFromAlfresco(id)
          .pipe(takeUntil(this._destroyed$))
          .subscribe((node) => {
            this.attachements.push(node.entry.name);
          });
      });
    }
  }
}
