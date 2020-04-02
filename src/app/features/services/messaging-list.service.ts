import { Injectable } from '@angular/core';
import { GlobalService } from '@app/core/services/global.service';
import { RequestType } from '@app/shared/enmus/requestType';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessagingListService {

  private notificationObs: Subject<any> = new Subject();

  constructor(private globalService: GlobalService) { }

  getNotificationObs(): Observable<any> {
    return this.notificationObs.asObservable();
  }

  setNotificationObs(notif) {
    this.notificationObs.next(notif);
  }
  public getMyInbox(): Observable<any> {
    return this.globalService.call(RequestType.GET, this.globalService.url.messages + "myInbox");
  }

  public markMessageAsSeen(id: number): Observable<boolean> {
    return this.globalService.call(RequestType.POST,
                                   this.globalService.url.receiver + "markMessageSeen/" + id);
  }

  public markMessageListAsSeen(ids: number[]): Observable<boolean> {
    return this.globalService.call(RequestType.POST,
                                   this.globalService.url.receiver + "markMessageSeen/all", ids);
  }

  public markMessageAsArchived(ids: number[]): Observable<number> {
    return this.globalService.call(RequestType.POST,
                                   this.globalService.url.messages + "archive/all", ids);
  }

  public markMessageListAsImportant(ids: number[]): Observable<boolean> {
    return this.globalService.call(RequestType.POST,
                                   this.globalService.url.messages + "important/all", ids);
  }
}
