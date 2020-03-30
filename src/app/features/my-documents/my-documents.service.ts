import { Injectable } from "@angular/core";
import { GlobalService } from "@app/core/services/global.service";
import { Observable, observable } from "rxjs";
import { RequestType } from "@app/shared/enmus/requestType";

@Injectable({
  providedIn: "root"
})
export class MyDocumentsService {
  constructor(private globalService: GlobalService) {}

  getMyAttachements(): Observable<any[]> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.attachements + "/my"
    );
  }

  getNodeDetailsFromAlfresco(nodeId: string): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.node + "/" + nodeId
    );
  }

  downloadFile(nodeId: String): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.node + "/" + nodeId + "/download-file",
      { observe: "response", responseType: "blob" }
    );
  }
}
