import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ArchieveMessagesService } from "./archieve-messages.service";
import { MessageArchived } from "./message-archived";
import { Location } from "@angular/common";
import { FeaturesService } from "../features.service";
import { MyDocumentsService } from "../my-documents/my-documents.service";
import { GlobalService } from "@app/core/services/global.service";
import { OrderDirection } from "@app/shared/enmus/order-direction";
import { DomSanitizer, Title } from "@angular/platform-browser";
import { PaginationService } from "../services/pagination.service";
import { RoleObjectPipe } from "@app/shared/pipes/role-object";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { DialogService } from "../services/dialog.service";
import {SenderRole} from '@enum/sender-role';

@Component({
  selector: "app-archieve-messages",
  templateUrl: "./archieve-messages.component.html",
  styleUrls: ["./archieve-messages.component.scss"],
})
export class ArchieveMessagesComponent implements OnInit, OnDestroy {
  private _destroyed$ = new Subject();
  imageSource: string;
  page = "ARCHIVE";
  public selectedTabIndex = 0;
  number = 0;
  messagesNumber: number = 0;
  topText = "Messages archivés";
  userTypeTabsFilter: SenderRole = SenderRole.ALL;
  bottomText =
    this.number > 1
      ? this.globalService.messagesDisplayScreen.newArchivedMessages
      : this.globalService.messagesDisplayScreen.newArchivedMessage;
  backButton = false;
  selectedObjects: Array<any>;
  itemsList = [];
  links = {
    isRefresh: true,
    isPagination: true,
    isDesarchive: true,
  };
  filtredItemList = [];
  loading = false;
  searchContext: boolean;
  listLength = 0;
  avatars: {
    doctor: string;
    child: string;
    women: string;
    man: string;
    secretary: string;
    user: string;
    tls: string;
  };

  constructor(
    public router: Router,
    private archivedService: ArchieveMessagesService,
    private _location: Location,
    public featureService: FeaturesService,
    private documentService: MyDocumentsService,
    private globalService: GlobalService,
    private sanitizer: DomSanitizer,
    public pagination: PaginationService,
    public roleObjectPipe: RoleObjectPipe,
    private title: Title,
    private dialogService: DialogService
  ) {
    this.title.setTitle(this.topText);
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.user;
  }
  // destory any subscribe to avoid memory leak
  ngOnDestroy(): void {
    this._destroyed$.next(true);
    this._destroyed$.unsubscribe();
    this.pagination.init(null);
  }

  ngOnInit(): void {
    this.featureService.setFilteredArchiveSearch([])
    this.links = {
      isRefresh: true,
      isPagination: true,
      isDesarchive: true,
    };
    this.featureService.setActiveChild("archived");
    setTimeout(() => {
      this.featureService.setIsMessaging(true);
    });
    this.countAllMyArchivedMessages();
    this.searchArchive();
  }

  countAllMyArchivedMessages() {
    this.archivedService
      .countAllMyArchivedMessages()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((messages) => {
        this.messagesNumber = messages;
        this.pagination.init(messages);
      });
    this.loadPage();
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
    this.getMyMessagesArchivedV2();
  }

  getMyMessagesArchivedV2NextPage() {
    this.loading = true;
    this.archivedService
      .getMyArchivedMessagesBySenderRole(this.pagination.pageNo, this.pagination.direction, this.userTypeTabsFilter)
      .pipe(takeUntil(this._destroyed$))
      .subscribe(retrievedMess => {
        this.loading = false;
        retrievedMess.sort(
          (m1, m2) =>
            new Date(m2.updatedAt).getTime() - new Date(m1.updatedAt).getTime()
        );
        this.itemsList.push(
          ...retrievedMess.map(item => this.mappingMessageArchived((item))
        ));
        this.itemsList.forEach((item)=>{
          item.users.forEach((user) => {
            this.loadPhoto(user);
          });
        })
        this.filtredItemList = this.itemsList;
      });
  }
  getMyMessagesArchivedV2() {
    this.resetData();
    this.loading = true;
    const pageNo = this.pagination.pageNo ? this.pagination.pageNo : 0;
    const direction = this.pagination.direction
      ? this.pagination.direction
      : null;
    this.archivedService
      .countMyArchivedMessagesBySenderRole(this.userTypeTabsFilter)
      .pipe(takeUntil(this._destroyed$))
      .subscribe(num => {
        this.pagination.init(num);
        this.messagesNumber = num;
      });
    this.archivedService
      .getMyArchivedMessagesBySenderRole(pageNo, direction, this.userTypeTabsFilter)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((messages) => {
        this.loading = false;
        this.number = this.featureService.numberOfArchieve;
        this.bottomText =
          this.number > 1
            ? this.globalService.messagesDisplayScreen.newArchivedMessages
            : this.globalService.messagesDisplayScreen.newArchivedMessage;
        messages.forEach((message) => {
          const archivedMessage = this.mappingMessageArchived(message);
          archivedMessage.users.forEach((user) => {
            this.loadPhoto(user);
          });
          this.itemsList.push(archivedMessage);
        });
        this.filtredItemList = this.itemsList;
      });
  }
  getMyMessagesArchived() {
    this.loading = true;
    const pageNo = this.pagination.pageNo ? this.pagination.pageNo : 0;
    const direction = this.pagination.direction
      ? this.pagination.direction
      : null;
    this.archivedService
      .getMyArchivedMessages(pageNo, direction)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((messages) => {
        this.loading = false;
        this.number = this.featureService.numberOfArchieve;
        this.bottomText =
          this.number > 1
            ? this.globalService.messagesDisplayScreen.newArchivedMessages
            : this.globalService.messagesDisplayScreen.newArchivedMessage;
        messages.forEach((message) => {
          const archivedMessage = this.mappingMessageArchived(message);
          archivedMessage.users.forEach((user) => {
            this.loadPhoto(user);
          });
          this.itemsList.push(archivedMessage);
        });
        this.filtredItemList = this.itemsList;
      });
  }

  mappingMessageArchived(message) {
    const messageArchived = new MessageArchived();
    const senderRole = message?.senderDetail?.role;
    const senderRolePascalCase = this.roleObjectPipe.transform(senderRole);

    messageArchived.id = message.id;
    messageArchived.isSeen = message.seen;
    messageArchived.users = [
      {
        fullName: message.senderDetail[senderRolePascalCase].fullName,
        img: this.avatars.user,
        title: message.senderDetail.practician
          ? message.senderDetail.practician.title
          : "",
        type: senderRole == "PRACTICIAN" ? "MEDICAL" : senderRole,
        photoId: this.getPhotoId(message.senderDetail),
        civility:
          senderRole == "PATIENT"
            ? message.senderDetail.patient.civility
            : null,
        id: message.senderDetail.id,
      },
    ];
    messageArchived.progress = {
      name: message.senderArchived.closed
        ? "clôturé"
        : message.messageStatus == "TREATED"
        ? "répondu"
        : message.toReceiversArchived[0].seen
        ? "Lu"
        : "Envoyé",
      value: message.senderArchived.closed
        ? 200
        : message.messageStatus == "TREATED"
        ? 100
        : message.toReceiversArchived[0].seen
        ? 50
        : 20,
    };
    messageArchived.object = {
      name: message.object,
      isImportant: message.importantObject,
    };
    messageArchived.time = message.createdAt;
    messageArchived.isImportant = message.important;
    messageArchived.hasFiles = message.hasFiles;
    messageArchived.isViewDetail = message.hasViewDetail;
    messageArchived.isChecked = false;

    messageArchived.automaticallyGenerated = message.automaticallyGenerated;
    return messageArchived;
  }

  loadPhoto(user) {
    this.documentService
      .getDefaultImage(user.id)
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

  cardClicked(item) {
    if (!item.isSeen) {
      this.markMessageAsSeen(item.id);
    }
    this.router.navigate(
      ["/messagerie-lire/" + this.featureService.encrypt(item.id)],
      {
        queryParams: {
          context: "archive",
        },
      }
    );
  }

  BackButton() {
    this._location.back();
  }

  markMessageAsSeen(messageId) {
    this.archivedService.markMessageAsSeen(messageId).subscribe((result) => {
      this.featureService.numberOfArchieve--;
      this.featureService.markAsSeen(this.featureService.searchArchive, [
        messageId,
      ]);
      this.featureService.setNumberOfArchieve(
        this.featureService.getNumberOfArchieveValue() - 1
      );
    });
  }

  getPhotoId(senderDetail): string {
    switch (senderDetail.role) {
      case "PATIENT":
        return senderDetail.patient.photoId;
      case "PRACTICIAN":
        return senderDetail.practician.photoId;
      case "SECRETARY":
        return senderDetail.secretary.photoId;
      case "SUPER_SUPERVISOR" || "SUPERVISOR" || "OPERATOR":
        return senderDetail.telesecretary.photoId;
      case "TELESECRETARYGROUP":
        return senderDetail.telesecretaryGroup.photoId;
      default:
        return null;
    }
  }

  searchArchive() {
    this.featureService.getFilteredArchiveSearch().subscribe((res) => {
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

  mapAllMessages(messages) {
    messages.forEach((message) => {
      const archivedMessage = this.mappingMessageArchived(message);
      archivedMessage.users.forEach((user) => {
        this.loadPhoto(user);
      });
      this.filtredItemList.push(archivedMessage);
    });
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
    this.links = {
      isRefresh: true,
      isPagination: true,
      isDesarchive: true,
    };
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
   resetData() {
    this.itemsList = [];
    this.filtredItemList = [];
  }
  loadPage() {
    this.resetData();
    this.getMyMessagesArchivedV2NextPage();
  }
  desarchiveMessages() {
    let checkedMessages = this.filtredItemList.filter(
      (e) => e.isChecked == true
    );
    const messagesId = checkedMessages.map((e) => e.id);
    if (messagesId && messagesId.length > 0) {
      this.dialogService
        .openConfirmDialog(
          this.globalService.messagesDisplayScreen
            .dearchive_confirmation_message,
          "Désarchivage"
        )
        .afterClosed()
        .subscribe((res) => {
          if (res) {
            this.archivedService
              .markMessageAsNoMoreArchived(messagesId)
              .subscribe(
                (resp) => {
                  this.pagination.init(null);
                  this.refreshMessagingList();
                  checkedMessages.forEach((message)=>{
                    if(!message.isSeen){
                      this.featureService.setNumberOfArchieve(
                        this.featureService.getNumberOfArchieveValue() - 1
                      );
                      this.featureService.setNumberOfInbox(
                        this.featureService.getNumberOfInboxValue() + 1
                      );
                    }
                  })
                },
                (error) => {}
              );
          }
        });
    }
  }
  desarchiveMessagesClicked(){
    this.featureService.setNumberOfInbox(
      this.featureService.getNumberOfInboxValue() + 1
    );
  }
}
