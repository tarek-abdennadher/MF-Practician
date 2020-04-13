import { Injectable } from "@angular/core";
import { GlobalService } from "@app/core/services/global.service";
import { RequestType } from "@app/shared/enmus/requestType";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ArchieveMessagesService {
  constructor(private globalService: GlobalService) {}

  getMyArchivedMessages(): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.archived_messages + "my"
    );
  }

  public markMessageAsSeen(id: number): Observable<boolean> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.receiverArchived + "markMessageSeen/" + id
    );
  }
}
