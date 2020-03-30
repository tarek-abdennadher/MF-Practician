import { Injectable } from "@angular/core";
import { GlobalService } from "@app/core/services/global.service";
import { Observable } from "rxjs";
import { HttpEvent, HttpRequest, HttpClient } from "@angular/common/http";
@Injectable({
  providedIn: "root"
})
export class NodeeService {
  constructor(private globalService: GlobalService, private http: HttpClient) {}

  ngOnInit() {}

  saveFileInMemory(uuid, file): Observable<HttpEvent<{}>> {
    const req = new HttpRequest(
      "POST",
      this.globalService.url.node + "/save-file-create-message",
      file,
      {
        reportProgress: true,
        responseType: "text"
      }
    );
    return this.http.request(req);
  }
}
