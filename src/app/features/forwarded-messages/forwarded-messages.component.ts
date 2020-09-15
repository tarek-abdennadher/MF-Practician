import { Component, OnInit, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Subject } from "rxjs";
import { MessageService } from "../services/message.service";
import { takeUntil } from "rxjs/operators";
import { MessageSent } from "@app/shared/models/message-sent";
import { FeaturesService } from "../features.service";
import { MyDocumentsService } from "../my-documents/my-documents.service";
import { NotifierService } from "angular-notifier";
import { GlobalService } from "@app/core/services/global.service";
import { DomSanitizer } from "@angular/platform-browser";
import { PaginationService } from "../services/pagination.service";
import { DialogService } from "../services/dialog.service";

@Component({
  selector: "app-forwarded-messages",
  templateUrl: "./forwarded-messages.component.html",
  styleUrls: ["./forwarded-messages.component.scss"]
})
export class ForwardedMessagesComponent implements OnInit {
  @ViewChild("customNotification", { static: true }) customNotificationTmpl;
  private _destroyed$ = new Subject();
  imageSource: string;
  links = {
    isAllSelect: true,
    isFilter: false,
    isArchieve: true,
    isPagination: true,
    isRefresh: true
  };
  page = "INBOX";
  number = 0;
  topText = "Messages transférés";
  bottomText = "";
  backButton = false;
  itemsList = [];
  selectedObjects: Array<any>;
  filtredItemList: Array<any> = new Array();
  private readonly notifier: NotifierService;
  avatars: {
    doctor: string;
    child: string;
    women: string;
    man: string;
    secretary: string;
    user: string;
    tls: string;
  };
  loading = false;
  constructor(
    notifierService: NotifierService,
    private route: ActivatedRoute,
    private globalService: GlobalService,
    public router: Router,
    private messageService: MessageService,
    private featureService: FeaturesService,
    private documentService: MyDocumentsService,
    private sanitizer: DomSanitizer,
    public pagination: PaginationService,
    private dialogService: DialogService
  ) {
    this.notifier = notifierService;
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.user;
  }

  ngOnInit(): void {
    this.featureService.setActiveChild("sent");
    this.route.queryParams.subscribe(params => {
      if (params["status"] == "archiveSuccess") {
        this.notifier.show({
          message: this.globalService.toastrMessages.archived_message_success,
          type: "info",
          template: this.customNotificationTmpl
        });
      }
    });
    this.countAllMyForwardedMessages();
    this.searchSent();
  }

  countAllMyForwardedMessages() {
    this.messageService.countForwardedMessage().subscribe(messages => {
      this.pagination.init(messages);
      this.loadPage();
    });
  }

  forwardedMessage() {
    this.loading = true;
    this.messageService
      .forwardedMessage(this.pagination.pageNo, this.pagination.direction)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((messages: any) => {
        messages.forEach(message => {
          this.loading = false;
          const messageSent = this.mappingMessage(message);
          messageSent.id = message.id;
          messageSent.users.forEach(user => {
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
          });
          this.itemsList.push(messageSent);
          this.filtredItemList = this.itemsList;
        });
      });
  }

  mappingMessage(message) {
    const messageSent = new MessageSent();
    messageSent.isSeen = true;
    messageSent.progress = {
      name:
        message.messageStatus == "IN_PROGRESS"
          ? "En cours"
          : message.messageStatus == "TREATED"
          ? "répondu"
          : message.toReceivers[0].seen
          ? "Lu"
          : "Envoyé",
      value:
        message.messageStatus == "IN_PROGRESS"
          ? 80
          : message.messageStatus == "TREATED"
          ? 100
          : message.toReceivers[0].seen
          ? 50
          : 20
    };
    messageSent.users = [];
    message.toReceivers.forEach(r => {
      messageSent.users.push({
        fullName: r.fullName,
        img: this.imageSource,
        title: r.jobTitle,
        type: r.role,
        photoId: r.photoId,
        civility: r.civility,
        id: r.receiverId
      });
    });
    messageSent.object = {
      name: message.object,
      isImportant: message.importantObject
    };
    messageSent.time = message.createdAt;
    messageSent.isImportant = message.important;
    messageSent.hasFiles = message.hasFiles;
    messageSent.hasViewDetail = message.hasViewDetail;
    messageSent.isArchieve = true;
    return messageSent;
  }

  parseMessages(messages) {
    let parsedMessages = [];
    messages.forEach(message => {
      const messageSent = this.mappingMessage(message);
      messageSent.id = message.id;
      messageSent.users.forEach(user => {
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
            user.img = "assets/imgs/user.png";
          }
        );
      });
      parsedMessages.push(messageSent);
    });
    return parsedMessages;
  }

  cardClicked(item) {
    this.router.navigate(["/messagerie-lire/" + item.id], {
      queryParams: {
        context: "forwarded"
      }
    });
  }

  selectAllActionClicked() {
    this.itemsList.forEach(a => {
      a.isChecked = true;
    });
  }
  deSelectAllActionClicked() {
    this.itemsList.forEach(a => {
      a.isChecked = false;
    });
  }
  seenActionClicked() {
    console.log("seenAction");
  }
  seenAllActionClicked() {
    console.log("seenAllAction");
  }
  importantActionClicked() {
    console.log("importantAction");
  }
  deleteActionClicked() {
    console.log("deleteAction");
  }
  archieveActionClicked() {
    this.dialogService
      .openConfirmDialog(
        this.globalService.messagesDisplayScreen.archive_confirmation_message,
        "Suppression"
      )
      .afterClosed()
      .subscribe(res => {
        if (res) {
          const messagesId = this.filtredItemList
            .filter(e => e.isChecked == true)
            .map(e => e.id);
          if (messagesId.length > 0) {
            this.messageService.markMessageAsArchived(messagesId).subscribe(
              resp => {
                this.itemsList = this.itemsList.filter(
                  elm => !messagesId.includes(elm.id)
                );
                this.filtredItemList = this.filtredItemList.filter(
                  elm => !messagesId.includes(elm.id)
                );
                this.deleteElementsFromInbox(messagesId.slice(0));
                this.featureService.archiveState.next(true);
                this.featureService.numberOfForwarded =
                  this.featureService.numberOfForwarded - messagesId.length;
              },
              error => {
                console.log(
                  "We have to find a way to notify user by this error"
                );
              }
            );
          }
        }
      });
  }
  archieveMessage(event) {
    this.dialogService
      .openConfirmDialog(
        this.globalService.messagesDisplayScreen.archive_confirmation_message,
        "Suppression"
      )
      .afterClosed()
      .subscribe(res => {
        if (res) {
          let messageId = event.id;
          this.messageService.markMessageAsArchived([messageId]).subscribe(
            resp => {
              this.itemsList = this.itemsList.filter(
                elm => messageId != elm.id
              );
              this.filtredItemList = this.filtredItemList.filter(
                elm => messageId != elm.id
              );
              this.deleteElementsFromInbox([messageId]);
              this.featureService.archiveState.next(true);
              this.featureService.numberOfForwarded =
                this.featureService.numberOfForwarded - 1;
            },
            error => {
              console.log("We have to find a way to notify user by this error");
            }
          );
        }
      });
  }
  filterActionClicked(event) {
    this.filtredItemList =
      event == "all"
        ? this.itemsList
        : this.itemsList.filter(
            item =>
              item.users[0].type.toLowerCase() ==
              (event == "doctor"
                ? "medical"
                : event == "secretary"
                ? "telesecretarygroup" || "secretary"
                : event)
          );
  }
  selectItem(event) {
    this.selectedObjects = event.filter(a => a.isChecked == true);
  }

  deleteElementsFromInbox(ids) {
    let searchList = this.featureService.getSearchSentValue();
    searchList = searchList.filter(x => !ids.includes(x.id));
    this.featureService.setSearchSent(searchList);
  }

  searchSent() {
    this.featureService.getFilteredSentSearch().subscribe(res => {
      if (res == null) {
        this.filtredItemList = [];
      } else if (res?.length > 0) {
        this.filtredItemList = res;
      } else {
        this.filtredItemList = this.itemsList;
      }
    });
  }

  // destory any subscribe to avoid memory leak
  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  refreshMessagingList() {
    this.itemsList = [];
    this.filtredItemList = [];
    this.ngOnInit();
  }

  previousPageActionClicked() {
    if (this.pagination.hasPreviousPage()) {
      this.loadPage();
    }
  }

  nextPageActionClicked() {
    if (this.pagination.hasNextPage()) {
      this.loadPage();
    }
  }

  loadPage() {
    this.itemsList = [];
    this.filtredItemList = [];
    this.forwardedMessage();
  }
}
