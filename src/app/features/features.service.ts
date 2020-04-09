import { Injectable } from "@angular/core";
import { GlobalService } from "@app/core/services/global.service";
import { RequestType } from "@app/shared/enmus/requestType";
import { Observable } from "rxjs";
import { LocalStorageService } from "ngx-webstorage";
import * as jwt_decode from "jwt-decode";

@Injectable({
  providedIn: "root",
})
export class FeaturesService {
  public listNotifications = [];
  numberOfInbox: number = 0;
  numberOfArchieve: number = 0;
  constructor(
    private globalService: GlobalService,
    private localSt: LocalStorageService
  ) {}

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
}
