import { Injectable } from "@angular/core";
import { GlobalService } from "@app/core/services/global.service";
import { Observable } from "rxjs";
import { HttpEvent, HttpRequest, HttpClient } from "@angular/common/http";
import { RequestType } from '@app/shared/enmus/requestType';
@Injectable({
  providedIn: "root"
})
export class NodeeService {
  constructor(private globalService: GlobalService, private http: HttpClient) {}

  ngOnInit() {}

  saveFileInMemory(uuid, file): Observable<HttpEvent<{}>> {
    return this.globalService.call(RequestType.POST,this.globalService.url.node + "/save-file-create-message"
    ,file,
    {
      reportProgress: true,
      responseType: "text"
    });
}
}
