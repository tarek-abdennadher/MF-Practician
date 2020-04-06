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
      this.globalService.url.favorite + "myPatient"
    );
  }

  addPatientToMyPatients(patientId: number): Observable<Boolean> {
    return this.globalService.call(RequestType.POST,
      this.globalService.url.favorite + "addPatient/" + patientId);
  }

  deletePatientFromMyPatients(patientId: number): Observable<Boolean> {
    return this.globalService.call(RequestType.DELETE,
      this.globalService.url.favorite + "deletePatient/" + patientId);
  }

  prohibitePatient(patientId: number): Observable<Boolean> {
    return this.globalService.call(RequestType.PUT,
      this.globalService.url.favorite + "prohibite/" + patientId);
  }

  authorizePatient(patientId: number): Observable<Boolean> {
    return this.globalService.call(RequestType.PUT,
      this.globalService.url.favorite + "authorize/" + patientId);
  }
}
