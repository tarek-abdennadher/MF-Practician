import { Injectable } from "@angular/core";
import { LocalStorageService } from "ngx-webstorage";
import * as jwt_decode from "jwt-decode";
@Injectable({
  providedIn: "root"
})
export class FeaturesService {
  public listNotifications = [];

  constructor(private localSt: LocalStorageService) {}

  getUserId(): number {
    const token = this.localSt.retrieve("token");
    var decoded = jwt_decode(token);
    return decoded.cred_key;
  }
}
