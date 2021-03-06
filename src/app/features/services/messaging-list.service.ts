import { Injectable } from "@angular/core";
import { GlobalService } from "@app/core/services/global.service";
import { RequestType } from "@app/shared/enmus/requestType";
import { Observable, Subject, BehaviorSubject } from "rxjs";
import { FeaturesService } from "../features.service";
import * as _ from "lodash";
import { MyDocumentsService } from "../my-documents/my-documents.service";
import { JobtitlePipe } from "@app/shared/pipes/jobTitle.pipe";
import { OrderDirection } from "@app/shared/enmus/order-direction";
import { SenderRole } from "@app/shared/enmus/sender-role";
import { Mutex } from "async-mutex";

@Injectable({
  providedIn: "root",
})
export class MessagingListService {
  private notificationObs = new BehaviorSubject<Object>("");
  private practicianNotifObs = new BehaviorSubject<any>("");
  public practicianNotifPreviousValue = "";
  private mutex = new Mutex();
  public readMessageId = new BehaviorSubject(null);
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
    private globalService: GlobalService,
    private featuresService: FeaturesService,
    private documentService: MyDocumentsService,
    private jobTitlePipe: JobtitlePipe
  ) {
    this.avatars = this.globalService.avatars;
  }

  getNotificationObs(): Observable<any> {
    return this.notificationObs.asObservable();
  }

  setNotificationObs(notification) {
    if (!this.mutex.isLocked()) {
      this.mutex.acquire();
      if (!_.isEqual(notification, this.notificationObs.getValue())) {
        this.notificationObs.next(notification);
        this.mutex.release();
        this.featuresService.listNotifications.unshift({
          id: notification.id,
          sender: notification.jobTitle
            ? this.jobTitlePipe.transform(notification.jobTitle) +
              " " +
              notification.senderFullName
            : notification.senderFullName,
          senderId: notification.senderId,
          picture: null,
          messageId: notification.messageId,
          type: notification.type,
        });
        this.featuresService.setNumberOfInbox(
          this.featuresService.getNumberOfInboxValue() + 1
        );
        let realTimeMessageList = this.featuresService.getSearchInboxValue();
        realTimeMessageList.unshift(notification.message);
        this.featuresService.setSearchInbox(realTimeMessageList);
      }
      this.mutex.release();
    }
  }

  setInvitationNotificationObs(notification) {
    if (!_.isEqual(notification, this.notificationObs.getValue())) {
      this.notificationObs.next(notification);
      this.featuresService.listNotifications.unshift({
        id: notification.id,
        sender: notification.jobTitle
          ? this.jobTitlePipe.transform(notification.jobTitle) +
            " " +
            notification.senderFullName
          : notification.senderFullName,
        senderId: notification.senderId,
        picture: null,
        type: notification.type,
      });
      this.featuresService.setNumberOfPending(
        this.featuresService.getNumberOfPendingValue() + 1
      );
    }
  }

  setNotificationMessageStateObs(notification) {
    if (!_.isEqual(notification, this.notificationObs.getValue())) {
      this.notificationObs.next(notification);

      this.featuresService.listNotifications.unshift({
        id: notification.id,
        sender: notification.jobTitle
          ? this.jobTitlePipe.transform(notification.jobTitle) +
            " " +
            notification.senderFullName
          : notification.senderFullName,
        senderId: notification.senderId,
        picture: null,
        messageId: notification.messageId,
        type: notification.type,
      });
    }
  }

  removeInvitationNotificationObs(notification) {
    if (
      this.featuresService.listNotifications.findIndex(
        (notif) => notif.id == notification.id
      ) != -1
    ) {
      this.featuresService.listNotifications = this.featuresService.listNotifications.filter(
        (notif) => notif.id != notification.id
      );
      this.featuresService.setNumberOfPending(
        this.featuresService.getNumberOfPendingValue() - 1
      );
    }
  }

  setMessageNotificationRead(notification) {
    const list = this.featuresService.listNotifications.filter(notif => notif.messageId != notification.messageId);
    this.featuresService.listNotifications = list;
    this.readMessageId.next(notification.messageId);
  }

  public getMyInbox(): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.messages + "myInbox"
    );
  }

  public getAllInboxMessages(pageSize: number): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.messages + "myInbox?pageSize=" + pageSize
    );
  }

  public countMyInboxNotSeen(): Observable<number> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.messages + "countMyInboxNotSeen"
    );
  }

  public getInboxByAccountId(
    id,
    filter: SenderRole = SenderRole.ALL,
    pageNo,
    order: OrderDirection = OrderDirection.DESC
  ): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.messages + "inbox-by-account/" + id,
      {
        params: { pageNo: pageNo, order: order, senderRole: filter },
      }
    );
  }

  public getFirstInboxMessageByAccountId(
    id,
    size,
    filter: SenderRole = SenderRole.ALL,
    pageNo,
    order: OrderDirection = OrderDirection.DESC
  ): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.messages +
        "inbox-by-account/" +
        id +
        "/listSize/" +
        size,
      {
        params: { pageNo: pageNo, order: order, senderRole: filter },
      }
    );
  }

  public countInboxByAccountId(
    id,
    filter: SenderRole = SenderRole.ALL
  ): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.messages + "inbox-by-account/" + id + "/count",
      {
        params: {
          senderRole: filter,
        },
      }
    );
  }

  public getAllInboxByAccountId(id, pageSize): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.messages +
        "inbox-by-account/" +
        id +
        "?pageSize=" +
        pageSize
    );
  }
  public markMessageAsSeen(id: number): Observable<boolean> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.receiver + "markMessageSeen/" + id
    );
  }
  public markMessageAsSeenByReveiverId(
    id: number,
    idReciever: number
  ): Observable<boolean> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.receiver +
        "seenByReceiver/" +
        id +
        "/" +
        idReciever
    );
  }
  public markMessageListAsSeen(ids: number[]): Observable<boolean> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.receiver + "markMessageSeen/all",
      ids
    );
  }

  public markMessagesListAsNotSeen(ids: number[]): Observable<boolean> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.receiver + "markMessageNotSeen/all",
      ids
    );
  }

  public uncheckMessages(messagesList) {
    for (let message of messagesList) {
      message.isChecked = false;
    }
  }

  public markMessageListAsSeenByReceiverId(
    ids: number[],
    idReciever: number
  ): Observable<boolean> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.receiver + "seenByReceiver/all/" + idReciever,
      ids
    );
  }
  public markMessageAsArchived(ids: number[]): Observable<number> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.messages + "archive/all",
      ids
    );
  }

  changeFlagImportant(obsList, ids) {
    obsList.forEach((elm) => {
      if (ids.includes(elm.id)) {
        elm.isImportant = true;
      }
    });
  }

  changeFlagNotImportant(obsList, ids) {
    obsList.forEach((elm) => {
      if (ids.includes(elm.id)) {
        elm.isImportant = false;
      }
    });
  }

  public getMessagesByPatientFile(
    patientFileId: number,
    pageNo,
    order: OrderDirection = OrderDirection.DESC
  ) {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.messages + "ByPatientFile/" + patientFileId,
      {
        params: { pageNo: pageNo, order: order },
      }
    );
  }

  public markMessageAsImportant(ids: number[]): Observable<boolean> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.messages + "important/all",
      ids
    );
  }

  public markMessageAsNotImportant(ids: number[]): Observable<boolean> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.messages + "removeImportant/all",
      ids
    );
  }

  public checkSeenMessagingList(messagesList) {
    for (let message of messagesList) {
      if (message.isSeen) {
        message.isChecked = true;
      } else {
        message.isChecked = false;
      }
    }
  }

  public checkNotSeenMessagingList(messagesList) {
    for (let message of messagesList) {
      if (!message.isSeen) {
        message.isChecked = true;
      } else {
        message.isChecked = false;
      }
    }
  }

  public checkImportantMessagingList(messagesList) {
    for (let message of messagesList) {
      if (message.isImportant) {
        message.isChecked = true;
      } else {
        message.isChecked = false;
      }
    }
  }
  public countInboxByAccountIdAndCategory(id, category): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.messages +
        "inbox/category/count/" +
        id +
        "/" +
        category
    );
  }
  public getInboxByCategory(
    category,
    pageNo,
    order: OrderDirection = OrderDirection.DESC
  ): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.messages + "myInbox/byCategory/" + category,
      {
        params: { pageNo: pageNo, order: order },
      }
    );
  }
}
