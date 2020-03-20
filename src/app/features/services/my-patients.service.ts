import { Injectable } from "@angular/core";
import { GlobalService } from "@app/core/services/global.service";
import { RequestType } from "@app/shared/enmus/requestType";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class MyPatientsService {
  constructor(private globalService: GlobalService) {}

  getPatientsOfCurrentParactician(): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.patient + "my-patients"
    );
  }
}
