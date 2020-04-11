import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { GlobalService } from "@app/core/services/global.service";
import { RequestType } from "@app/shared/enmus/requestType";

@Injectable({
  providedIn: "root",
})
export class PracticianDetailService {
  constructor(private globalService: GlobalService) {}
  getPracticiansById(id): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.practician + id
    );
  }
  addPracticianToFavorite(practicianId) {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.practician + "proContact/" + practicianId
    );
  }
  addPracticianToSecretaryContactPro(practicianId) {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.practician +
        "secretary-pro-contact/" +
        practicianId
    );
  }
  getFavoritePracticians() {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.practician + "contacts-pro-practicians"
    );
  }
  isPracticianFavorite(id) {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.contact_pro + "/isMyContactPro/" + id
    );
  }
}
