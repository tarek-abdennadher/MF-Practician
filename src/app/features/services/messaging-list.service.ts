import { Injectable } from '@angular/core';
import { GlobalService } from '@app/core/services/global.service';
import { RequestType } from '@app/shared/enmus/requestType';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessagingListService {

  constructor(private globalService: GlobalService) { }

  public getMyInbox(): Observable<any> {
    return this.globalService.call(RequestType.GET, this.globalService.url.messages + "myInbox");
  }

  public markMessageAsSeen(id: number): Observable<boolean> {
    return this.globalService.call(RequestType.POST,
                                   this.globalService.url.receiver + "markMessageSeen/" + id);
  }

  public markMessageAsArchived(id: number): Observable<boolean> {
    return this.globalService.call(RequestType.POST,
                                   this.globalService.url.messages + "archive/" + id);
  }
}
