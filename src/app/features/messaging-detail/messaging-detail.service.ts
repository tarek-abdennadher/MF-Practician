import { Injectable } from "@angular/core";
import { GlobalService } from "@app/core/services/global.service";
import { RequestType } from "@app/shared/enmus/requestType";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class MessagingDetailService {
  constructor(private globalService: GlobalService) {}

  getMessagingDetailById(id): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.messages + id
    );
  }
}
