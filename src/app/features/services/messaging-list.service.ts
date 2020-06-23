import { Injectable } from "@angular/core";
import { GlobalService } from "@app/core/services/global.service";
import { RequestType } from "@app/shared/enmus/requestType";
import { Observable, Subject, BehaviorSubject } from "rxjs";
import { FeaturesService } from "../features.service";
import * as _ from "lodash";
import { MyDocumentsService } from '../my-documents/my-documents.service';
import { JobtitlePipe } from '@app/shared/pipes/jobTitle.pipe';

@Injectable({
  providedIn: "root",
})
export class MessagingListService {
  private notificationObs = new BehaviorSubject<Object>("");
  private practicianNotifObs = new BehaviorSubject<any>("");
  public practicianNotifPreviousValue = "";
  avatars: { doctor: string; child: string; women: string; man: string; secretary: string; user: string; tls: string; };

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
                  sender: notification.jobTitle? this.jobTitlePipe.transform(notification.jobTitle) + " " + notification.senderFullName:notification.senderFullName,
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
                sender: notification.jobTitle? this.jobTitlePipe.transform(notification.jobTitle) + " " + notification.senderFullName:notification.senderFullName,
                senderId: notification.senderId,
              picture: this.avatars.user,
              messageId: notification.messageId,
              type: notification.type,
              });
            }
          );}else {
            if (notification.message.sender.role == "PRACTICIAN") {
              this.featuresService.listNotifications.unshift({
                id: notification.id,
                sender: notification.jobTitle? this.jobTitlePipe.transform(notification.jobTitle) + " " + notification.senderFullName:notification.senderFullName,
                senderId: notification.senderId,
                picture: this.avatars.doctor,
                messageId: notification.messageId,
                type: notification.type,
              });
            } else if (notification.message.sender.role == "SECRETARY") {
              this.featuresService.listNotifications.unshift({
                id: notification.id,
                sender: notification.jobTitle? this.jobTitlePipe.transform(notification.jobTitle) + " " + notification.senderFullName:notification.senderFullName,
                senderId: notification.senderId,
                picture: this.avatars.secretary,
                messageId: notification.messageId,
                type: notification.type,
              });
            }else if (notification.message.sender.role == "TELESECRETARYGROUP") {
              this.featuresService.listNotifications.unshift({
                id: notification.id,
                sender: notification.jobTitle? this.jobTitlePipe.transform(notification.jobTitle) + " " + notification.senderFullName:notification.senderFullName,
                senderId: notification.senderId,
                picture: this.avatars.tls,
                messageId: notification.messageId,
                type: notification.type,
              });
            } else if (notification.message.sender.role == "PATIENT") {
              if (notification.message.sender.civility == "M") {
                this.featuresService.listNotifications.unshift({
                  id: notification.id,
                  sender: notification.jobTitle? this.jobTitlePipe.transform(notification.jobTitle) + " " + notification.senderFullName:notification.senderFullName,
                  senderId: notification.senderId,
                  picture: this.avatars.man,
                  messageId: notification.messageId,
                  type: notification.type,
                });
              } else if (notification.message.sender.civility == "MME") {
                this.featuresService.listNotifications.unshift({
                  id: notification.id,
                  sender: notification.jobTitle? this.jobTitlePipe.transform(notification.jobTitle) + " " + notification.senderFullName:notification.senderFullName,
                  senderId: notification.senderId,
                  picture: this.avatars.women,
                  messageId: notification.messageId,
                  type: notification.type,
                });
              } else if (notification.message.sender.civility == "CHILD") {
                this.featuresService.listNotifications.unshift({
                  id: notification.id,
                  sender: notification.jobTitle? this.jobTitlePipe.transform(notification.jobTitle) + " " + notification.senderFullName:notification.senderFullName,
                  senderId: notification.senderId,
                  picture: this.avatars.child,
                  messageId: notification.messageId,
                  type: notification.type,
                });
              }
            }

          }

      this.featuresService.setNumberOfInbox(this.featuresService.getNumberOfInboxValue() + 1);
      let realTimeMessageList = this.featuresService.getSearchInboxValue();
      realTimeMessageList.unshift(notification.message);
      this.featuresService.setSearchInbox(realTimeMessageList);
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
                  sender: notification.jobTitle? this.jobTitlePipe.transform(notification.jobTitle) + " " + notification.senderFullName:notification.senderFullName,
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
                sender: notification.jobTitle? this.jobTitlePipe.transform(notification.jobTitle) + " " + notification.senderFullName:notification.senderFullName,
                senderId: notification.senderId,
                picture: this.avatars.user,
                type: notification.type,
              });
            }
          );}
          else {
            if (notification.role == "PRACTICIAN") {
              this.featuresService.listNotifications.unshift({
                id: notification.id,
                sender: notification.jobTitle? this.jobTitlePipe.transform(notification.jobTitle) + " " + notification.senderFullName:notification.senderFullName,
                senderId: notification.senderId,
                picture: this.avatars.doctor,
                messageId: notification.messageId,
                type: notification.type,
              });
            } else if (notification.role == "SECRETARY") {
              this.featuresService.listNotifications.unshift({
                id: notification.id,
                sender: notification.jobTitle? this.jobTitlePipe.transform(notification.jobTitle) + " " + notification.senderFullName:notification.senderFullName,
                senderId: notification.senderId,
                picture: this.avatars.secretary,
                messageId: notification.messageId,
                type: notification.type,
              });
            }else if (notification.role == "TELESECRETARYGROUP") {
              this.featuresService.listNotifications.unshift({
                id: notification.id,
                sender: notification.jobTitle? this.jobTitlePipe.transform(notification.jobTitle) + " " + notification.senderFullName:notification.senderFullName,
                senderId: notification.senderId,
                picture: this.avatars.tls,
                messageId: notification.messageId,
                type: notification.type,
              });
            }  else if (notification.role == "PATIENT") {
              if (notification.civility == "M") {
                this.featuresService.listNotifications.unshift({
                  id: notification.id,
                  sender: notification.jobTitle? this.jobTitlePipe.transform(notification.jobTitle) + " " + notification.senderFullName:notification.senderFullName,
                  senderId: notification.senderId,
                  picture: this.avatars.man,
                  messageId: notification.messageId,
                  type: notification.type,
                });
              } else if (notification.civility == "MME") {
                this.featuresService.listNotifications.unshift({
                  id: notification.id,
                  sender: notification.jobTitle? this.jobTitlePipe.transform(notification.jobTitle) + " " + notification.senderFullName:notification.senderFullName,
                  senderId: notification.senderId,
                  picture: this.avatars.women,
                  messageId: notification.messageId,
                  type: notification.type,
                });
              } else if (notification.civility == "CHILD") {
                this.featuresService.listNotifications.unshift({
                  id: notification.id,
                  sender: notification.jobTitle? this.jobTitlePipe.transform(notification.jobTitle) + " " + notification.senderFullName:notification.senderFullName,
                  senderId: notification.senderId,
                  picture: this.avatars.child,
                  messageId: notification.messageId,
                  type: notification.type,
                });
              }
            }
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
                  sender: notification.jobTitle? this.jobTitlePipe.transform(notification.jobTitle) + " " + notification.senderFullName:notification.senderFullName,
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
                sender: notification.jobTitle? this.jobTitlePipe.transform(notification.jobTitle) + " " + notification.senderFullName:notification.senderFullName,
                senderId: notification.senderId,
              picture: this.avatars.user,
              messageId: notification.messageId,
              type: notification.type,
              });
            }
          );}else {
            if (notification.role == "PRACTICIAN") {
              this.featuresService.listNotifications.unshift({
                id: notification.id,
                sender: notification.jobTitle? this.jobTitlePipe.transform(notification.jobTitle) + " " + notification.senderFullName:notification.senderFullName,
                senderId: notification.senderId,
                picture: this.avatars.doctor,
                messageId: notification.messageId,
                type: notification.type,
              });
            } else if (notification.role == "SECRETARY") {
              this.featuresService.listNotifications.unshift({
                id: notification.id,
                sender: notification.jobTitle? this.jobTitlePipe.transform(notification.jobTitle) + " " + notification.senderFullName:notification.senderFullName,
                senderId: notification.senderId,
                picture: this.avatars.secretary,
                messageId: notification.messageId,
                type: notification.type,
              });
            } else if (notification.role == "TELESECRETARYGROUP") {
              this.featuresService.listNotifications.unshift({
                id: notification.id,
                sender: notification.jobTitle? this.jobTitlePipe.transform(notification.jobTitle) + " " + notification.senderFullName:notification.senderFullName,
                senderId: notification.senderId,
                picture: this.avatars.tls,
                messageId: notification.messageId,
                type: notification.type,
              });
            } else if (notification.role == "PATIENT") {
              if (notification.message.sender.civility == "M") {
                this.featuresService.listNotifications.unshift({
                  id: notification.id,
                  sender: notification.jobTitle? this.jobTitlePipe.transform(notification.jobTitle) + " " + notification.senderFullName:notification.senderFullName,
                  senderId: notification.senderId,
                  picture: this.avatars.man,
                  messageId: notification.messageId,
                  type: notification.type,
                });
              } else if (notification.civility == "MME") {
                this.featuresService.listNotifications.unshift({
                  id: notification.id,
                  sender: notification.jobTitle? this.jobTitlePipe.transform(notification.jobTitle) + " " + notification.senderFullName:notification.senderFullName,
                  senderId: notification.senderId,
                  picture: this.avatars.women,
                  messageId: notification.messageId,
                  type: notification.type,
                });
              } else if (notification.civility == "CHILD") {
                this.featuresService.listNotifications.unshift({
                  id: notification.id,
                  sender: notification.jobTitle? this.jobTitlePipe.transform(notification.jobTitle) + " " + notification.senderFullName:notification.senderFullName,
                  senderId: notification.senderId,
                  picture: this.avatars.child,
                  messageId: notification.messageId,
                  type: notification.type,
                });
              }
            }
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

  getPracticianNotifObs(): Observable<any> {
    return this.practicianNotifObs.asObservable();
  }

  setPracticianNotifObs(notification) {
    if (notification.id != this.practicianNotifObs.getValue().id) {
      this.practicianNotifObs.next(notification);
    }
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

  public getInboxByAccountId(id,pageNo): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.messages + "inbox-by-account/" + id+"?pageNo="+pageNo
    );
  }

  public getAllInboxByAccountId(id, pageSize): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.messages + "inbox-by-account/" + id+"?pageSize=" + pageSize
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
