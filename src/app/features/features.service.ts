import { Injectable } from "@angular/core";
import { GlobalService } from "@app/core/services/global.service";
import { RequestType } from "@app/shared/enmus/requestType";
import { Observable, BehaviorSubject } from "rxjs";
import { LocalStorageService } from "ngx-webstorage";
import * as jwt_decode from "jwt-decode";
import { search } from "./practician-search/search.model";

@Injectable({
  providedIn: "root"
})
export class FeaturesService {
  public listNotifications = [];
  public selectedPracticianId = 0;
  numberOfInbox: number = 0;
  numberOfArchieve: number = 0;
  myPracticians: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public imageSource: string | ArrayBuffer = "assets/imgs/user.png";
  private searchSource = new BehaviorSubject(new search());
  currentSearch = this.searchSource.asObservable();
  constructor(
    private globalService: GlobalService,
    private localSt: LocalStorageService
  ) {}
  updateNumberOfInboxForPractician(accountId, inboxNumber) {
    let list: any[] = this.myPracticians.getValue();
    if (list && list.length > 0) {
      list.find(p => p.id == accountId).number = inboxNumber;
    }
    this.myPracticians.next(list);
  }
  getMyNotificationsByMessagesNotSeen(seen: boolean): Observable<[any]> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.BASE_URL_MA + "/notifications/messagesNotSeen"
    );
  }

  markMessageAsSeenByNotification(messageId: number): Observable<boolean> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.BASE_URL_MA + "/receivers/markMessageSeen/" + messageId
    );
  }

  getUserId(): number {
    const token = this.localSt.retrieve("token");
    var decoded = jwt_decode(token);
    return decoded.cred_key;
  }

  getCountOfMyArchieve() {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.archived_messages + "countMine"
    );
  }
  getSecretaryPracticians() {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.secretary + "/my-practicians"
    );
  }
  changeSearch(search: search) {
    this.searchSource.next(search);
  }
}
