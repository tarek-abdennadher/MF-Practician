import {
  Component,
  OnInit,
  ViewChild,
  HostListener,
  OnDestroy,
} from "@angular/core";
import { MessagingListService } from "../services/messaging-list.service";
import { Router, ActivatedRoute } from "@angular/router";
import { NotifierService } from "angular-notifier";
import { GlobalService } from "@app/core/services/global.service";
import { FeaturesService } from "../features.service";
import { MyDocumentsService } from "../my-documents/my-documents.service";
import { takeUntil, tap } from "rxjs/operators";
import { DomSanitizer } from "@angular/platform-browser";
import { Subject } from "rxjs";
import { OrderDirection } from "@app/shared/enmus/order-direction";
import { MyPatientsService } from "../services/my-patients.service";
import { PaginationService } from "../services/pagination.service";
import { LocalStorageService } from "ngx-webstorage";
import { DialogService } from "../services/dialog.service";
import { SenderRole } from "@app/shared/enmus/sender-role";

@Component({
  selector: "app-messaging-list",
  templateUrl: "./messaging-list.component.html",
  styleUrls: ["./messaging-list.component.scss"],
})
export class MessagingListComponent implements OnInit, OnDestroy {
  private _destroyed$ = new Subject();
  public selectedTabIndex = 0;
  person;
  showAcceptRefuse = true;
  isMyInbox = true;
  inboxName = "";
  imageSource: string;
  practicianImage: string;
  messages: Array<any>;
  itemsList: Array<any>;
  filtredItemList: Array<any> = new Array();
  selectedObjects: Array<any>;
  myPracticians = [];
  links = {
    isAllSelect: true,
    isAllSeen: true,
    isSeen: false,
    isArchieve: true,
    isImportant: false,
    isFilter: true,
    isMenuDisplay: true,
    isAllSelectCarret: true,
    isRefresh: true,
    isPagination: true,
  };
  page = "INBOX";
  number: number;
  topText: string = this.globalService.messagesDisplayScreen.Mailbox;

  bottomText =
    this.number > 1
      ? this.globalService.messagesDisplayScreen.newMessages
      : this.globalService.messagesDisplayScreen.newMessage;
  backButton = false;
  @ViewChild("customNotification", { static: true }) customNotificationTmpl;
  private readonly notifier: NotifierService;
  color = "red";

  loading = false;
  inboxNumber;
  paramsId;
  avatars: {
    doctor: string;
    child: string;
    women: string;
    man: string;
    secretary: string;
    user: string;
    tls: string;
  };
  searchContext = false;
  listLength = 10;
  userTypeTabsFilter: SenderRole = SenderRole.ALL;
  isSecretary = this.localSt.retrieve("role") == "SECRETARY";
  constructor(
    private messagesServ: MessagingListService,
    public router: Router,
    private route: ActivatedRoute,
    notifierService: NotifierService,
    public featureService: FeaturesService,
    private globalService: GlobalService,
    private documentService: MyDocumentsService,
    private patientService: MyPatientsService,
    private sanitizer: DomSanitizer,
    public pagination: PaginationService,
    private localSt: LocalStorageService,
    private dialogService: DialogService
  ) {
    this.notifier = notifierService;
    this.avatars = this.globalService.avatars;
    this.practicianImage = this.avatars.doctor;
    this.imageSource = this.avatars.user;
  }

  ngOnInit(): void {
    this.featureService.setActiveChild("inbox");
    this.itemsList = new Array();
    this.route.params.subscribe((params) => {
      this.listLength = 10;
      this.itemsList = new Array();
      this.filtredItemList = new Array();
      this.messages = [];
      this.getRealTimeMessage();
      this.getPracticianRealTimeMessage();
      if (params["id"]) {
        this.isMyInbox = false;
        this.featureService.selectedPracticianId = params["id"]
          ? params["id"]
          : this.featureService.selectedPracticianId;
        this.myPracticians = this.featureService.myPracticians.getValue();

        if (this.myPracticians && this.myPracticians.length > 0) {
          this.person = {
            fullName: this.myPracticians.find(
              (p) => p.id == this.featureService.selectedPracticianId
            ).fullName,
            picture: this.practicianImage,
          };

          this.documentService
            .getDefaultImage(
              this.myPracticians.find(
                (p) => p.id == this.featureService.selectedPracticianId
              ).id
            )
            .pipe(takeUntil(this._destroyed$))
            .subscribe(
              (response) => {
                let myReader: FileReader = new FileReader();
                myReader.onloadend = (e) => {
                  this.person.picture = this.sanitizer.bypassSecurityTrustUrl(
                    myReader.result as string
                  );
                };
                let ok = myReader.readAsDataURL(response);
              },
              (error) => {
                this.person.picture = this.practicianImage;
              }
            );
        }

        this.links = {
          isAllSelect: true,
          isAllSeen: true,
          isSeen: false,
          isArchieve: false,
          isImportant: false,
          isFilter: true,
          isMenuDisplay: true,
          isAllSelectCarret: true,
          isRefresh: true,
          isPagination: true,
        };
        this.paramsId = this.featureService.selectedPracticianId;
        this.getMyInbox(this.featureService.selectedPracticianId);
        this.searchInboxPractician(this.featureService.selectedPracticianId);
      } else {
        this.featureService.selectedPracticianId = 0;
        this.featureService.getNumberOfInbox().subscribe((val) => {
          this.number = val;
          this.bottomText =
            this.number > 1
              ? this.globalService.messagesDisplayScreen.newMessages
              : this.globalService.messagesDisplayScreen.newMessage;
        });
        this.links = {
          isAllSelect: true,
          isAllSeen: true,
          isSeen: false,
          isArchieve: true,
          isImportant: false,
          isFilter: true,
          isMenuDisplay: true,
          isAllSelectCarret: true,
          isRefresh: true,
          isPagination: true,
        };
        this.featureService.selectedPracticianId = 0;
        this.isMyInbox = true;
        this.paramsId = this.featureService.getUserId();
        this.getMyInbox(this.featureService.getUserId());
        this.searchInbox();
      }
      this.inboxNumber = this.featureService.getNumberOfInboxValue();
    });

    this.route.queryParams.subscribe((params) => {
      if (params["status"]) {
        let notifMessage = "";
        switch (params["status"]) {
          case "sentSuccess": {
            notifMessage = this.globalService.toastrMessages
              .send_message_success;
            break;
          }
          case "archiveSuccess":
            {
              notifMessage = this.globalService.toastrMessages
                .archived_message_success;
              break;
            }
            this.notifier.show({
              message: notifMessage,
              type: "info",
              template: this.customNotificationTmpl,
            });
        }
        this.notifier.show({
          message: notifMessage,
          type: "info",
          template: this.customNotificationTmpl,
        });
      }
    });
    setTimeout(() => {
      this.featureService.setIsMessaging(true);
    });
    this.displayListMessagesBySizeScreen();
    this.pagination.init(50);
  }

  cardClicked(item) {
    this.markMessageAsSeen(item);
    this.router.navigate(["/messagerie-lire/" + item.id], {
      queryParams: {
        context: this.isMyInbox ? "inbox" : "inboxPraticien",
      },
    });
  }

  selectAllActionClicked() {
    this.filtredItemList.forEach((a) => {
      a.isChecked = true;
    });
  }

  deSelectAllActionClicked() {
    this.filtredItemList.forEach((a) => {
      a.isChecked = false;
    });
  }
  seenAllActionClicked() {
    let checkedMessages = this.filtredItemList.filter(
      (e) => e.isChecked == true
    );
    const messagesId = checkedMessages.map((e) => e.id);
    if (messagesId.length > 0) {
      if (this.isMyInbox) {
        this.messagesServ.markMessageListAsSeen(messagesId).subscribe(
          (resp) => {
            if (resp == true) {
              this.featureService.markAsSeenById(
                this.filtredItemList,
                messagesId
              );
              this.featureService.removeNotificationByIdMessage(messagesId);
              this.messagesServ.uncheckMessages(checkedMessages);
            }
          },
          (error) => {
            //We have to find a way to notify user by this error
          }
        );
      } else {
        this.messagesServ
          .markMessageListAsSeenByReceiverId(
            messagesId,
            this.featureService.selectedPracticianId
          )
          .subscribe(
            (resp) => {
              if (resp == true) {
                let list: any[] = this.featureService.myPracticians.getValue();
                if (list && list.length > 0) {
                  this.featureService.updateNumberOfInboxForPractician(
                    this.featureService.selectedPracticianId,
                    0
                  );
                }
                this.bottomText = this.globalService.messagesDisplayScreen.newMessage;

                this.itemsList.forEach((item) => (item.isSeen = true));
                this.filtredItemList.forEach((item) => (item.isSeen = true));
              }
            },
            (error) => {
              //We have to find a way to notify user by this error
            }
          );
      }
      this.featureService.markAsSeen(
        this.featureService.searchInbox,
        messagesId
      );
    }
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
          let checkedMessages = this.filtredItemList.filter(
            (e) => e.isChecked == true
          );
          const messagesId = checkedMessages.map((e) => e.id);
          if (messagesId.length > 0) {
            this.getFirstMessageInNextPage(
              this.featureService.getUserId(),
              messagesId.length
            )
              .pipe(takeUntil(this._destroyed$))
              .subscribe();
            this.messagesServ.markMessageAsArchived(messagesId).subscribe(
              (resp) => {
                let listToArchive = this.itemsList
                  .slice(0)
                  .filter(function (elm, ind) {
                    return messagesId.indexOf(elm.id) != -1;
                  });
                listToArchive.forEach((message) => {
                  if (!message.isSeen) {
                    this.featureService.numberOfArchieve++;
                    this.featureService.setNumberOfInbox(this.number - 1);
                    this.inboxNumber--;
                  }
                  this.featureService.listNotifications = this.featureService.listNotifications.filter(
                    (notification) =>
                      !listToArchive
                        .map((message) => message.id)
                        .includes(notification.messageId)
                  );
                });
                this.itemsList = this.itemsList.filter(
                  (elm) => !messagesId.includes(elm.id)
                );
                this.filtredItemList = this.filtredItemList.filter(
                  (elm) => !messagesId.includes(elm.id)
                );
                this.deleteElementsFromInbox(messagesId.slice(0));
                this.featureService.archiveState.next(true);
                this.messagesServ.uncheckMessages(checkedMessages);
              },
              (error) => {
                //We have to find a way to notify user by this error
              }
            );
          }
        }
      });
  }
  filterActionClicked(event) {
    this.filtredItemList =
      event == "all"
        ? this.itemsList
        : this.itemsList.filter((item) => {
            switch (event) {
              case "doctor":
                return item.users[0].type.toLowerCase() == "medical";
              case "secretary":
                return (
                  item.users[0].type.toLowerCase() == "secretary" ||
                  item.users[0].type.toLowerCase() == "telesecretarygroup"
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
    this.getMyInbox(this.paramsId);
  }

  getMyInbox(accountId) {
    this.loading = true;
    this.messagesServ
      .countInboxByAccountId(accountId, this.userTypeTabsFilter)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((num) => {
        this.pagination.init(num);
        this.messagesServ
          .getInboxByAccountId(
            accountId,
            this.userTypeTabsFilter,
            this.pagination.pageNo,
            this.pagination.direction
          )
          .pipe(takeUntil(this._destroyed$))
          .subscribe((retrievedMess) => {
            this.loading = false;
            if (!this.isMyInbox) {
              this.featureService.myPracticians
                .asObservable()
                .subscribe((list) => {
                  this.number = list.find(
                    (p) => p.id == this.featureService.selectedPracticianId
                  ).number;
                  this.bottomText =
                    this.number > 1
                      ? this.globalService.messagesDisplayScreen.newMessages
                      : this.globalService.messagesDisplayScreen.newMessage;
                });
            }
            retrievedMess.sort(
              (m1, m2) =>
                new Date(m2.updatedAt).getTime() - new Date(m1.updatedAt).getTime()
            );
            this.itemsList.push(
              ...retrievedMess.map((item) => this.parseMessage(item))
            );
            this.filtredItemList = this.itemsList;
          });
      });
  }

  getMyInboxNextPage(accountId) {
    this.loading = true;
    this.messagesServ
      .getInboxByAccountId(
        accountId,
        this.userTypeTabsFilter,
        this.pagination.pageNo,
        this.pagination.direction
      )
      .pipe(takeUntil(this._destroyed$))
      .subscribe((retrievedMess) => {
        this.loading = false;
        retrievedMess.sort(
          (m1, m2) =>
            new Date(m2.updatedAt).getTime() - new Date(m1.updatedAt).getTime()
        );
        this.itemsList.push(
          ...retrievedMess.map((item) => this.parseMessage(item))
        );
      });
  }

  parseMessage(message): any {
    let parsedMessage = {
      id: message.id,
      isSeen: message.seenAsReceiver,
      users: [
        {
          id: message.sender.id,
          fullName: message.sender.fullName,
          img: null,
          title: message.sender.jobTitle,
          civility: message.sender.civility,
          type:
            message.sender.role == "PRACTICIAN"
              ? "MEDICAL"
              : message.sender.role,
        },
      ],
      object: {
        name: message.object,
        isImportant: message.importantObject,
      },
      time: message.updatedAt,
      isImportant: message.important,
      hasFiles: message.hasFiles,
      isViewDetail: message.hasViewDetail,
      isMarkAsSeen: true,
      isArchieve: this.isMyInbox,
      photoId: message.sender.photoId,
    };
    this.documentService
      .getDefaultImage(message.sender.senderId)
      .pipe(takeUntil(this._destroyed$))
      .subscribe(
        (response) => {
          let myReader: FileReader = new FileReader();
          myReader.onloadend = (e) => {
            parsedMessage.users[0].img = this.sanitizer.bypassSecurityTrustUrl(
              myReader.result as string
            );
          };
          let ok = myReader.readAsDataURL(response);
        },
        (error) => {
          parsedMessage.users[0].img = this.avatars.user;
        }
      );
    return parsedMessage;
  }

  markMessageAsSeen(event) {
    let messageId = event.id;
    if (this.isMyInbox) {
      this.messagesServ.markMessageAsSeen(messageId).subscribe(
        (resp) => {
          if (resp == true) {
            if (!event.isSeen) {
              this.bottomText =
                this.number > 1
                  ? this.globalService.messagesDisplayScreen.newMessages
                  : this.globalService.messagesDisplayScreen.newMessage;
              let notifLength = this.featureService.listNotifications.length;
              this.featureService.listNotifications = this.featureService.listNotifications.filter(
                (notif) => notif.messageId != event.id
              );
              this.featureService.setNumberOfInbox(
                this.featureService.getNumberOfInboxValue() - 1
              );
              this.inboxNumber -= 1;

              this.featureService.markAsSeen(this.featureService.searchInbox, [
                messageId,
              ]);
            }

            let filtredIndex = this.filtredItemList.findIndex(
              (item) => item.id == messageId
            );
            if (filtredIndex != -1) {
              this.filtredItemList[filtredIndex].isSeen = true;
            }
          }
          (error) => {
            //We have to find a way to notify user by this error
          };
        },
        (error) => {
          //We have to find a way to notify user by this error
        }
      );
    } else {
      this.messagesServ
        .markMessageAsSeenByReveiverId(
          messageId,
          this.featureService.selectedPracticianId
        )
        .subscribe(
          (resp) => {
            if (!event.isSeen) {
              let list: any[] = this.featureService.myPracticians.getValue();
              let selectedInboxNumber;
              if (list && list.length > 0) {
                selectedInboxNumber = list.find(
                  (p) => p.id == this.featureService.selectedPracticianId
                ).number;
                this.featureService.updateNumberOfInboxForPractician(
                  this.featureService.selectedPracticianId,
                  selectedInboxNumber - 1
                );
              }
              this.bottomText =
                this.number > 1
                  ? this.globalService.messagesDisplayScreen.newMessages
                  : this.globalService.messagesDisplayScreen.newMessage;
            }
            if (resp == true) {
              let index = this.itemsList.findIndex(
                (item) => item.id == messageId
              );
              if (index != -1) {
                this.itemsList[index].isSeen = true;
              }
              let filtredIndex = this.filtredItemList.findIndex(
                (item) => item.id == messageId
              );
              if (index != -1) {
                this.filtredItemList[filtredIndex].isSeen = true;
              }
            }
          },
          (error) => {
            //We have to find a way to notify user by this error
          }
        );
    }
  }

  archieveMessage(event) {
    this.dialogService
      .openConfirmDialog(
        this.globalService.messagesDisplayScreen.archive_confirmation_message,
        "Suppression"
      )
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          let messageId = event.id;
          this.messagesServ.markMessageAsArchived([messageId]).subscribe(
            (resp) => {
              this.itemsList = this.itemsList.filter(function (elm, ind) {
                return elm.id != event.id;
              });
              this.filtredItemList = this.filtredItemList.filter(function (
                elm,
                ind
              ) {
                return elm.id != event.id;
              });
              this.deleteElementsFromInbox([messageId]);
              this.featureService.archiveState.next(true);
              if (!event.isSeen) {
                this.featureService.numberOfArchieve++;
                this.featureService.setNumberOfInbox(
                  this.featureService.getNumberOfInboxValue() - 1
                );
                this.inboxNumber--;
                this.featureService.listNotifications = this.featureService.listNotifications.filter(
                  (notification) => notification.messageId != event.id
                );
              }
              this.refreshCurrentPage();
            },
            (error) => {
              //We have to find a way to notify user by this error
            }
          );
        }
      });
  }
  selectItem(event) {
    this.selectedObjects = event.filter((a) => a.isChecked == true);
  }

  getFirstMessageInNextPage(accountId, size) {
    return this.messagesServ
      .getFirstInboxMessageByAccountId(
        accountId,
        size,
        this.userTypeTabsFilter,
        this.pagination.pageNo + 1,
        this.pagination.direction
      )
      .pipe(takeUntil(this._destroyed$))
      .pipe(
        tap((messages) => {
          messages.sort(
            (m1, m2) =>
              new Date(m2.updatedAt).getTime() - new Date(m1.updatedAt).getTime()
          );
          const parsedMessages = messages.map((message) =>
            this.parseMessage(message)
          );
          this.filtredItemList.push(...parsedMessages);
          this.itemsList.push(...parsedMessages);
        })
      );
  }

  getRealTimeMessage() {
    this.messagesServ.getNotificationObs().subscribe((notif) => {
      if (notif != "") {
        if (this.isMyInbox) {
          let message = this.parseMessage(notif.message);
          this.documentService
            .getDefaultImage(notif.message.sender.senderId)
            .pipe(takeUntil(this._destroyed$))
            .subscribe(
              (response) => {
                let myReader: FileReader = new FileReader();
                myReader.onloadend = (e) => {
                  message.users.forEach((user) => {
                    user.img = this.sanitizer.bypassSecurityTrustUrl(
                      myReader.result as string
                    );
                  });
                };
                let ok = myReader.readAsDataURL(response);
              },
              (error) => {
                message.users.forEach((user) => {
                  user.img = this.avatars.user;
                });
              }
            );
          this.filtredItemList.unshift(message);

          this.bottomText =
            this.number > 1
              ? this.globalService.messagesDisplayScreen.newMessages
              : this.globalService.messagesDisplayScreen.newMessage;
        }
      }
    });
  }

  getPracticianRealTimeMessage() {
    this.messagesServ.getPracticianNotifObs().subscribe((notif) => {
      if (
        notif != "" &&
        this.messagesServ.practicianNotifPreviousValue != notif.id
      ) {
        let num = this.featureService.myPracticians
          .getValue()
          .find((elm) => elm.id == notif.receiverId).number;
        this.featureService.updateNumberOfInboxForPractician(
          notif.receiverId,
          num + 1
        );
        this.messagesServ.practicianNotifPreviousValue = notif.id;
        if (
          notif != "" &&
          this.messagesServ.practicianNotifPreviousValue != notif.id
        ) {
          let message = this.parseMessage(notif.message);
          this.documentService
            .getDefaultImage(notif.message.sender.senderId)
            .pipe(takeUntil(this._destroyed$))
            .subscribe(
              (response) => {
                let myReader: FileReader = new FileReader();
                myReader.onloadend = (e) => {
                  message.users.forEach((user) => {
                    user.img = this.sanitizer.bypassSecurityTrustUrl(
                      myReader.result as string
                    );
                  });
                };
                let ok = myReader.readAsDataURL(response);
              },
              (error) => {
                message.users.forEach((user) => {
                  user.img = this.avatars.user;
                });
              }
            );

          this.filtredItemList.unshift(message);

          this.bottomText =
            this.number > 1
              ? this.globalService.messagesDisplayScreen.newMessages
              : this.globalService.messagesDisplayScreen.newMessage;
        }
      }
    });
  }

  deleteElementsFromInbox(ids) {
    let searchList = this.featureService.getSearchInboxValue();
    searchList = searchList.filter((x) => !ids.includes(x.id));
    this.featureService.setSearchInbox(searchList);
  }

  searchInbox() {
    this.featureService.getFilteredInboxSearch().subscribe((res) => {
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

  searchInboxPractician(id: number) {
    const numb = +id;
    if (
      this.featureService.searchPracticianInboxFiltered &&
      this.featureService.searchPracticianInboxFiltered.get(numb)
    ) {
      this.featureService.searchPracticianInboxFiltered
        .get(numb)
        .subscribe((res) => {
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
    } else {
      setTimeout(() => {
        this.searchInboxPractician(id);
      }, 1000);
    }
  }

  upSortClicked() {
    this.pagination.direction = OrderDirection.ASC;
    this.loadPage();
  }

  downSortClicked() {
    this.pagination.direction = OrderDirection.DESC;
    this.loadPage();
  }

  refreshMessagingList() {
    this.itemsList = [];
    this.filtredItemList = [];
    this.ngOnInit();
  }

  importantAction() {
    const checkedMessages = this.filtredItemList.filter(
      (e) => e.isChecked == true
    );
    let ids = [];
    for (let message of checkedMessages) {
      ids.push(message.id);
    }
    this.messagesServ.markMessageAsImportant(ids).subscribe(
      (message) => {
        this.links.isImportant = false;
        this.notifier.show({
          message: this.globalService.toastrMessages
            .mark_important_message_success,
          type: "info",
          template: this.customNotificationTmpl,
        });
        this.messagesServ.uncheckMessages(checkedMessages);
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

    this.messagesServ.changeFlagImportant(this.filtredItemList, ids);
  }

  notSeenActionClicked() {
    const checkedMessages = this.filtredItemList.filter(
      (e) => e.isChecked == true
    );
    const messagesId = checkedMessages.map((e) => e.id);
    if (messagesId.length > 0) {
      if (this.isMyInbox) {
        this.messagesServ.markMessagesListAsNotSeen(messagesId).subscribe(
          (resp) => {
            if (resp == true) {
              this.featureService.markAsNotSeenById(
                this.filtredItemList,
                messagesId
              );
              this.featureService.addNotificationByIdMessage(
                this.filtredItemList,
                messagesId
              );
              this.messagesServ.uncheckMessages(checkedMessages);
            }
          },
          (error) => {
            //We have to find a way to notify user by this error
          }
        );
      }
    }
  }

  public checkSeenMessagingList() {
    this.messagesServ.checkSeenMessagingList(this.filtredItemList);
  }

  public checkNotSeenMessagingList() {
    this.messagesServ.checkNotSeenMessagingList(this.filtredItemList);
  }

  public checkImportantMessagingList() {
    this.messagesServ.checkImportantMessagingList(this.filtredItemList);
  }

  public selectedTab($event) {
    if ($event.index === 0) {
      this.filterActionClicked("all");
    } else if ($event.index === 1) {
      this.filterActionClicked("secretary");
    } else if ($event.index === 2) {
      this.filterActionClicked("patient");
    } else if ($event.index === 3) {
      this.filterActionClicked("doctor");
    }
  }

  private displayListMessagesBySizeScreen() {
    let innerWidth = window.innerWidth;
    if (innerWidth < 769) {
      this.filterActionClicked("all");
      this.selectedTabIndex = 0;
    }
  }

  @HostListener("window:resize", ["$event"])
  private onResizeScreen() {
    if (window.innerWidth < 769) {
      this.filterActionClicked("all");
      this.selectedTabIndex = 0;
    }
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

  private resetData() {
    this.itemsList = [];
    this.filtredItemList = [];
  }

  loadPage() {
    this.resetData();
    this.getMyInboxNextPage(this.paramsId);
  }

  ngOnDestroy(): void {
    this._destroyed$.next(true);
    this._destroyed$.unsubscribe();
  }
}
