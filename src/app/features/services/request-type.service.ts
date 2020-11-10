import { Injectable } from "@angular/core";
import { RequestType } from "@app/shared/enmus/requestType";
import { GlobalService } from "@app/core/services/global.service";

@Injectable({
  providedIn: "root"
})
export class RequestTypeService {
  constructor(private globalService: GlobalService) {}

  ngOnInit() {}

  getAllObjects() {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.practicianObject + "/myObject"
    );
  }

  getObjectBody(objectDto) {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.practicianObject + "/body", objectDto
    );
  }

  getDocument(request) {
    return this.globalService.call(RequestType.POST, this.globalService.url.practicianObject + "/generatePdf"
    , request, { observe: "response", responseType: "blob" })
  }

  getDocumentAsHtml(request) {
    return this.globalService.call(RequestType.POST, this.globalService.url.practicianObject + "/generateHtml"
    , request)
  }

  getDocumentField(request) {
    return this.globalService.call(RequestType.POST, this.globalService.url.practicianObject + "/documentField"
    , request)
  }
}
