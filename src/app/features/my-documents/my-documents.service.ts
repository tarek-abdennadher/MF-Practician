import { Injectable } from "@angular/core";
import { GlobalService } from "@app/core/services/global.service";
import { Observable, observable, BehaviorSubject } from "rxjs";
import { RequestType } from "@app/shared/enmus/requestType";
import { HttpEvent, HttpRequest, HttpClient } from "@angular/common/http";
import { OrderDirection } from "@app/shared/enmus/order-direction";

@Injectable({
  providedIn: "root"
})
export class MyDocumentsService {
  public person: any;
  public id = new BehaviorSubject(null);
  constructor(private globalService: GlobalService, private http: HttpClient) {}
  getIdValue() {
    return this.id.getValue();
  }
  getIdObs() {
    return this.id.asObservable();
  }
  setId(id) {
    this.id.next(id);
  }
  getMyAttachements(pageNo: number): Observable<any[]> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.attachements + "/my"
    );
  }

  getMyAttachementsBySenderOrReceiverId(
    id: number,
    pageNo,
    order: OrderDirection = OrderDirection.DESC
  ): Observable<any[]> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.attachements + "/my/" + id,
      {
        params: { pageNo: pageNo, order: order }
      }
    );
  }
  getMyAttachementsByObject(
    id: number,
    object: string,
    pageNo,
    order: OrderDirection = OrderDirection.DESC
  ): Observable<any[]> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.attachements + "/my/" + id + "/object/" + object,
      {
        params: { pageNo: pageNo, order: order }
      }
    );
  }
  getMyAttachementsBySenderForId(
    id: number,
    senderForId: string,
    pageNo,
    order: OrderDirection = OrderDirection.DESC
  ): Observable<any[]> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.attachements +
        "/my/" +
        id +
        "/senderFor/" +
        senderForId,
      {
        params: { pageNo: pageNo, order: order }
      }
    );
  }

  getMyAttachementsBySenderForIdAndObject(
    id: number,
    senderForId: string,
    object: string,
    pageNo,
    order: OrderDirection = OrderDirection.DESC
  ): Observable<any[]> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.attachements +
        "/my/" +
        id +
        "/object/" +
        object +
        "/senderFor/" +
        senderForId,
      {
        params: { pageNo: pageNo, order: order }
      }
    );
  }

  getMySendersAndeceiversDetails(): Observable<any[]> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.attachements + "/mySendersAndReceivers"
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

  getSiteById(id) {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.site + "/" + id
    );
  }

  // get all folders by parent id
  getAllChildFolders(id): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.folderChild + "/" + id
    );
  }

  //Upload file
  uploadFileSelected(nodeId, file: File): Observable<any> {
    const formdata: FormData = new FormData();
    formdata.append("file", file);
    const req = new HttpRequest(
      "POST",
      this.globalService.url.node + "/" + nodeId + "/upload-file",
      formdata,
      {
        reportProgress: true,
        responseType: "text"
      }
    );
    return this.http.request(req);
  }

  getMySendersAndreceiversDetailsByObject(object: string): Observable<any[]> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.attachements +
        "/mySendersAndReceivers/object/" +
        object
    );
  }
  getMySendersAndreceiversDetailsBySenderForId(
    senderForId: string
  ): Observable<any[]> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.attachements +
        "/mySendersAndReceivers/senderFor/" +
        senderForId
    );
  }

  getMySendersAndreceiversDetailsBySenderForIdAndObject(
    senderForId: string,
    object: string
  ): Observable<any[]> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.attachements +
        "/mySendersAndReceivers/object/" +
        object +
        "/senderFor/" +
        senderForId
    );
  }

  getAllObjects(): Observable<Set<string>> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.attachements + "/allObjects"
    );
  }

  getMyObjects(id: number): Observable<Set<string>> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.attachements + "/myObjects/" + id
    );
  }

  getDefaultImage(id) {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.photo + "/" + id,
      { responseType: "blob" }
    );
  }
  getDefaultImageEntity(id, entityType) {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.photo + "/" + id + "?entityType=" + entityType,
      { responseType: "blob" }
    );
  }
}
