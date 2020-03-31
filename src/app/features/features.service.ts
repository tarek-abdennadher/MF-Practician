import { Injectable } from "@angular/core";
import { LocalStorageService } from "ngx-webstorage";
import * as jwt_decode from "jwt-decode";
import { GlobalService } from '@app/core/services/global.service';
import { RequestType } from '@app/shared/enmus/requestType';
@Injectable({
  providedIn: "root"
})
export class FeaturesService {
  public listNotifications = [];
  numberOfInbox: number = 0;
  numberOfArchieve: number = 0;
  constructor(private globalService: GlobalService, private localSt: LocalStorageService) {}

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
}
