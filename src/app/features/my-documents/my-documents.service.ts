import { Injectable } from "@angular/core";
import { GlobalService } from "@app/core/services/global.service";
import { Observable, observable } from "rxjs";
import { RequestType } from "@app/shared/enmus/requestType";
import { HttpEvent, HttpRequest, HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: "root"
})
export class MyDocumentsService {
  public person:any;
  constructor(private globalService: GlobalService, private http: HttpClient) {}

  getMyAttachements(pageNo:number): Observable<any[]> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.attachements + "/my"
    );
  }

  getMyAttachementsBySenderOrReceiverId(id:number,pageNo): Observable<any[]> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.attachements + "/my/"+id+"?pageNo="+pageNo
    );
  }
  getMyAttachementsByObject(id:number,object:string,pageNo): Observable<any[]> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.attachements + "/my/"+id+"/object/"+object+"?pageNo="+pageNo
    );
  }
  getMyAttachementsBySenderForId(id:number,senderForId:string,pageNo): Observable<any[]> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.attachements + "/my/"+id+"/senderFor/"+senderForId+"?pageNo="+pageNo
    );
  }

  getMyAttachementsBySenderForIdAndObject(id:number,senderForId:string,object:string,pageNo): Observable<any[]> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.attachements + "/my/"+id+"/object/"+object+"/senderFor/"+senderForId+"?pageNo="+pageNo
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
}
