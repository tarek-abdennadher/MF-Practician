import { Injectable } from "@angular/core";
import { GlobalService } from "@app/core/services/global.service";
import { RequestType } from "@app/shared/enmus/requestType";
import { Observable } from "rxjs";
import { OrderDirection } from "@app/shared/enmus/order-direction";

@Injectable({
  providedIn: "root",
})
export class ArchieveMessagesService {
  constructor(private globalService: GlobalService) {}

  getMyArchivedMessages(
    pageNo: number,
    order: OrderDirection = OrderDirection.DESC
  ): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.archived_messages + "my",
      {
        params: { pageNo: pageNo, order: order },
      }
    );
  }

  getAllMyArchivedMessages(): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.archived_messages + "my?pageSize=" + 1000000
    );
  }

  countAllMyArchivedMessages(): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.archived_messages + "myCount"
    );
  }

  public markMessageAsSeen(id: number): Observable<boolean> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.receiverArchived + "markMessageSeen/" + id
    );
  }
  public markMessageAsNoMoreArchived(ids: number[]): Observable<number> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.messages + "desarchive/all",
      ids
    );
  }
}
