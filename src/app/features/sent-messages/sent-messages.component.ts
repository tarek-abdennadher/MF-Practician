import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Subject } from "rxjs";
import { MessageService } from "../services/message.service";
import { takeUntil, tap } from "rxjs/operators";
import { MessageSent } from "@app/shared/models/message-sent";
import { FeaturesService } from "../features.service";
import { MyDocumentsService } from "../my-documents/my-documents.service";
import { NotifierService } from "angular-notifier";
import { GlobalService } from "@app/core/services/global.service";
import { DomSanitizer, Title } from "@angular/platform-browser";
import { PaginationService } from "../services/pagination.service";
import { DialogService } from "../services/dialog.service";
import { Role } from "@app/shared/enmus/role";
import {SenderRole} from '@enum/sender-role';

@Component({
  selector: "app-sent-messages",
  templateUrl: "./sent-messages.component.html",
  styleUrls: ["./sent-messages.component.scss"]
})
export class SentMessagesComponent implements OnInit, OnDestroy {
  @ViewChild("customNotification", { static: true }) customNotificationTmpl;
  private _destroyed$ = new Subject();
  imageSource: string;
  messagesNumber: number = 0;
  public selectedTabIndex = 0;

  links = {
    isAllSelect: true,
    isFilter: true,
    isRefresh: true,
    isArchieve: true,
    isPagination: true
  };
  page = "INBOX";
  number = 0;
  topText = "Messages envoyés";
  bottomText = "";
  backButton = false;
  itemsList = [];
  selectedObjects: Array<any>;
  filtredItemList: Array<any> = new Array();
  private readonly notifier: NotifierService;
  userTypeTabsFilter: SenderRole = SenderRole.ALL;
  avatars: {
    doctor: string;
    child: string;
    women: string;
    man: string;
    secretary: string;
    user: string;
    tls: string;
  };
  paramsId;
  searchContext = false;
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
    private dialogService: DialogService,
    private title: Title
  ) {
    this.title.setTitle(this.topText);
    this.notifier = notifierService;
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.user;
  }

  ngOnInit(): void {
    this.featureService.setFilteredSentSearch([])
    this.featureService.setActiveChild("sent");
    this.paramsId = this.featureService.getUserId();
    this.route.queryParams.subscribe(params => {
      if (params["status"] == "archiveSuccess") {
        this.notifier.show({
          message: this.globalService.toastrMessages.archived_message_success,
          type: "info",
          template: this.customNotificationTmpl
        });
      }
    });
    this.countSentMessage();
    this.searchSent();
    setTimeout(() => {
      this.featureService.setIsMessaging(true);
    });
    this.loadPage();
  }

  countSentMessage() {
    this.messageService
      .countSentMessage()
      .pipe(takeUntil(this._destroyed$))
      .subscribe(messages => {
        this.messagesNumber = messages;
        this.pagination.init(messages);
      });
  }

  getSentMessage(accountId) {
    this.loading = true;
    this.messageService
      .countSentByAccountId(accountId, this.userTypeTabsFilter)
      .pipe(takeUntil(this._destroyed$))
      .subscribe(num => {
        this.pagination.init(num);
        this.messagesNumber = num;
      });
    this.messageService
      .getSentAccountId(
        accountId,
        this.userTypeTabsFilter,
        0
      )
      .pipe(takeUntil(this._destroyed$))
      .subscribe(retrievedMess => {
        this.loading = false;
        this.itemsList = new Array();
        this.filtredItemList = new Array();
        this.itemsList.push(
          ...this.parseMessages(retrievedMess)
        );
        this.filtredItemList = this.itemsList;
      });
  }
  sentMessage() {
    this.loading = true;
    this.messageService
      .sentMessage(this.pagination.pageNo, this.pagination.direction)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((messages: any) => {
        this.loading = false;
        messages.forEach(message => {
          const messageSent = this.mappingMessage(message);
          messageSent.id = message.id;
          messageSent.users.forEach(user => {
            this.documentService
              .getDefaultImage(user.id)
              .pipe(takeUntil(this._destroyed$))
              .subscribe(
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
        message.messageStatus == "TREATED" ||
        (message.toReceivers[0].archived &&
          (message.toReceivers[0].role == "TELESECRETARYGROUP" ||
            message.toReceivers[0].role == "SUPER_SUPERVISOR" ||
            message.toReceivers[0].role == "SUPERVISOR"))
          ? 100
          : message.messageStatus == "IN_PROGRESS"
          ? 80
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
    messageSent.isPostal = message.sendType == "SEND_POSTAL" ? true : false;
    return messageSent;
  }

  parseMessages(messages) {
    let parsedMessages = [];
    messages.forEach(message => {
      const messageSent = this.mappingMessage(message);
      messageSent.id = message.id;
      messageSent.users.forEach(user => {
        this.documentService
          .getDefaultImage(user.id)
          .pipe(takeUntil(this._destroyed$))
          .subscribe(
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
    this.router.navigate(
      ["/messagerie-lire/" + this.featureService.encrypt(item.id)],
      {
        queryParams: {
          context: "sent"
        }
      }
    );
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
  seenActionClicked() {}
  seenAllActionClicked() {}
  importantActionClicked() {}
  deleteActionClicked() {}
  archieveActionClicked() {
    const messagesId = this.filtredItemList
      .filter(e => e.isChecked == true)
      .map(e => e.id);
    if (messagesId && messagesId.length > 0) {
      this.dialogService
        .openConfirmDialog(
          this.globalService.messagesDisplayScreen.archive_confirmation_message,
          "Suppression"
        )
        .afterClosed()
        .subscribe(res => {
          if (res) {
            this.getFirstMessageInNextPage(messagesId.length).subscribe();
            this.messageService.markMessageAsArchived(messagesId).subscribe(
              resp => {
                this.itemsList = this.itemsList.filter(
                  elm => !messagesId.includes(elm.id)
                );
                this.filtredItemList = this.filtredItemList.filter(
                  elm => !messagesId.includes(elm.id)
                );
                if (this.filtredItemList.length == 0) {
                  this.loading = true;
                  this.refreshMessagingList();
                }
                this.deleteElementsFromInbox(messagesId.slice(0));
                this.featureService.archiveState.next(true);
              },
              error => {
                //We have to find a way to notify user by this error
              }
            );
            this.messagesNumber--;
            this.pagination.init(this.messagesNumber);
            this.loading = false;
          }
        });
    }
  }
  public selectedTab($event) {
    if ($event.index === 0) {
      this.filterActionClickedV2("all");
    } else if ($event.index === 1) {
      this.filterActionClickedV2("secretary");
    } else if ($event.index === 2) {
      this.filterActionClickedV2("patient");
    } else if ($event.index === 3) {
      this.filterActionClickedV2("doctor");
    }
  }
  filterActionClickedV2(event) {
    this.filtredItemList =
      event == "all"
        ? this.itemsList
        : this.itemsList.filter(item => {
          switch (event) {
            case "doctor":
              return item.users[0].type.toLowerCase() == "medical";
            case "secretary":
              return (
                item.users[0].type.toLowerCase() == "secretary" ||
                item.users[0].type.toLowerCase() == "telesecretarygroup" ||
                item.users[0].type.toLowerCase() == "supervisor" ||
                item.users[0].type.toLowerCase() == "super_supervisor"
              );
            default:
              return item.users[0].type.toLowerCase() == event;
          }
        });
    switch (event) {
      case "all":
        this.userTypeTabsFilter = SenderRole.ALL;
        break;
      case "doctor":
        this.userTypeTabsFilter = SenderRole.PRACTICIAN;
        break;
      case "secretary":
        this.userTypeTabsFilter = SenderRole.SECRETARY;
        break;
      default:
        this.userTypeTabsFilter = SenderRole.PATIENT;
        break;
    }
    this.refreshCurrentPage();
  }
  private refreshCurrentPage() {
    this.resetData();
    this.getSentMessage(this.paramsId);
  }
  private resetData() {
    this.itemsList = [];
    this.filtredItemList = [];
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
            },
            error => {
              //We have to find a way to notify user by this error
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
        this.searchContext = true;
      } else if (res?.length > 0) {
        this.filtredItemList = res;
        this.searchContext = true;
      } else {
        this.filtredItemList = this.itemsList;
        this.searchContext = false;
      }
    });
  }

  // destory any pipe(takeUntil(this._destroyed$)).subscribe to avoid memory leak
  ngOnDestroy(): void {
    this._destroyed$.next(true);
    this._destroyed$.unsubscribe();
    this.pagination.init(null);
  }

  refreshMessagingList() {
    this.itemsList = [];
    this.filtredItemList = [];
    this.ngOnInit();
  }

  previousPageActionClicked() {
    if (this.pagination.hasPreviousPage() && !this.searchContext) {
      this.loadPage();
    }
  }

  nextPageActionClicked() {
    if (this.pagination.hasNextPage() && !this.searchContext) {
      this.loadPage();
    }
  }
  getSentNextPage(accountId) {
    this.loading = true;
    this.messageService
      .getSentAccountId(
        accountId,
        this.userTypeTabsFilter,
        this.pagination.pageNo,
        this.pagination.direction
      )
      .pipe(takeUntil(this._destroyed$))
      .subscribe(retrievedMess => {
        this.loading = false;
        retrievedMess.sort(
          (m1, m2) =>
            new Date(m2.updatedAt).getTime() - new Date(m1.updatedAt).getTime()
        );
        this.itemsList.push(
          ...this.parseMessages(retrievedMess)
        );
        this.filtredItemList = this.itemsList;
      });
  }
  loadPage() {
    this.itemsList = [];
    this.filtredItemList = [];
    this.getSentNextPage(this.paramsId);
  }

  getFirstMessageInNextPage(size) {
    return this.messageService
      .sentFirstMessage(
        size,
        this.pagination.pageNo + 1,
        this.pagination.direction
      )
      .pipe(takeUntil(this._destroyed$))
      .pipe(
        tap(messages => {
          let parsedList = new Array();
          messages.forEach(message => {
            const messageSent = this.mappingMessage(message);
            messageSent.id = message.id;
            messageSent.users.forEach(user => {
              this.documentService
                .getDefaultImage(user.id)
                .pipe(takeUntil(this._destroyed$))
                .subscribe(
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
            parsedList.push(messageSent);
          });
          this.filtredItemList.push(...parsedList);
          this.itemsList.push(...parsedList);
        })
      );
  }
}
