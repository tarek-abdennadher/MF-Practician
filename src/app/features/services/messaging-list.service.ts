import { Injectable } from "@angular/core";
import { GlobalService } from "@app/core/services/global.service";
import { RequestType } from "@app/shared/enmus/requestType";
import { Observable, Subject, BehaviorSubject } from "rxjs";
import { FeaturesService } from "../features.service";
import * as _ from "lodash";
import { MyDocumentsService } from '../my-documents/my-documents.service';

@Injectable({
  providedIn: "root",
})
export class MessagingListService {
  private notificationObs = new BehaviorSubject<Object>("");

  constructor(
    private globalService: GlobalService,
    private featuresService: FeaturesService,
    private documentService: MyDocumentsService
  ) {}

  getNotificationObs(): Observable<any> {
    return this.notificationObs.asObservable();
  }

  setNotificationObs(notification) {
    if (!_.isEqual(notification, this.notificationObs.getValue())) {
      this.notificationObs.next(notification);
      if (notification.message.sender.photoId) {
        this.documentService
          .downloadFile(notification.message.sender.photoId)
          .subscribe(
            (response) => {
              let myReader: FileReader = new FileReader();
              myReader.onloadend = (e) => {
                this.featuresService.listNotifications.unshift({
                  id: notification.id,
                  sender: notification.senderFullName,
                  senderId: notification.senderId,
                  picture: myReader.result,
                  messageId: notification.messageId,
                  type: notification.type,
                });
              };
              let ok = myReader.readAsDataURL(response.body);
            },
            (error) => {
              this.featuresService.listNotifications.unshift({
                id: notification.id,
              sender: notification.senderFullName,
              senderId: notification.senderId,
              picture: "assets/imgs/user.png",
              messageId: notification.messageId,
              type: notification.type,
              });
            }
          );}else {
            this.featuresService.listNotifications.unshift({
              id: notification.id,
              sender: notification.senderFullName,
              senderId: notification.senderId,
              picture: "assets/imgs/user.png",
              messageId: notification.messageId,
              type: notification.type,
            });
          }

      this.featuresService.setNumberOfInbox(this.featuresService.numberOfInbox + 1);
    }
  }

  setInvitationNotificationObs(notification) {
    if (!_.isEqual(notification, this.notificationObs.getValue())) {
      this.notificationObs.next(notification);
      if (notification.senderPhotoId) {
      this.documentService
          .downloadFile(notification.senderPhotoId)
          .subscribe(
            (response) => {
              let myReader: FileReader = new FileReader();
              myReader.onloadend = (e) => {
                this.featuresService.listNotifications.unshift({
                  id: notification.id,
                  sender: notification.senderFullName,
                  senderId: notification.senderId,
                  picture: myReader.result,
                  type: notification.type,
                });
              };
              let ok = myReader.readAsDataURL(response.body);
            },
            (error) => {
              this.featuresService.listNotifications.unshift({
                id: notification.id,
                sender: notification.senderFullName,
                senderId: notification.senderId,
                picture: "assets/imgs/user.png",
                type: notification.type,
              });
            }
          );}
          else {
            this.featuresService.listNotifications.unshift({
              id: notification.id,
              sender: notification.senderFullName,
              senderId: notification.senderId,
              picture: "assets/imgs/user.png",
              type: notification.type,
            });
          }

      this.featuresService.setNumberOfPending(this.featuresService.getNumberOfPendingValue()+1)
    }
  }

  setNotificationMessageStateObs(notification) {
    if (!_.isEqual(notification, this.notificationObs.getValue())) {
      this.notificationObs.next(notification);
      if (notification.senderPhotoId) {
        this.documentService
          .downloadFile(notification.senderPhotoId)
          .subscribe(
            (response) => {
              let myReader: FileReader = new FileReader();
              myReader.onloadend = (e) => {
                this.featuresService.listNotifications.unshift({
                  id: notification.id,
                  sender: notification.senderFullName,
                  senderId: notification.senderId,
                  picture: myReader.result,
                  messageId: notification.messageId,
                  type: notification.type,
                });
              };
              let ok = myReader.readAsDataURL(response.body);
            },
            (error) => {
              this.featuresService.listNotifications.unshift({
                id: notification.id,
              sender: notification.senderFullName,
              senderId: notification.senderId,
              picture: "assets/imgs/user.png",
              messageId: notification.messageId,
              type: notification.type,
              });
            }
          );}else {
            this.featuresService.listNotifications.unshift({
              id: notification.id,
              sender: notification.senderFullName,
              senderId: notification.senderId,
              picture: "assets/imgs/user.png",
              messageId: notification.messageId,
              type: notification.type,
            });
          }
    }
  }

  removeInvitationNotificationObs(notification) {
    if (this.featuresService.listNotifications.findIndex(notif => notif.id == notification.id) !=-1) {
      this.featuresService.listNotifications = this.featuresService.listNotifications.filter(notif =>
        notif.id != notification.id
      )
      this.featuresService.setNumberOfPending(this.featuresService.getNumberOfPendingValue()-1)
    }
  }

  public getMyInbox(): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.messages + "myInbox"
    );
  }

  public countMyInboxNotSeen(): Observable<number> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.messages + "countMyInboxNotSeen"
    );
  }

  public getInboxByAccountId(id,pageNo): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.messages + "inbox-by-account/" + id+"?pageNo="+pageNo
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

  public markMessageListAsImportant(ids: number[]): Observable<boolean> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.messages + "important/all",
      ids
    );
  }
}
