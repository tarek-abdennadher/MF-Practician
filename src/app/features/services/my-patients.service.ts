import { Injectable } from "@angular/core";
import { GlobalService } from "@app/core/services/global.service";
import { RequestType } from "@app/shared/enmus/requestType";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class MyPatientsService {
  constructor(private globalService: GlobalService) { }
  public errors = {
    failed_update: "Erreur survenue lors de la modification de la fiche patient"
  };
  public messages = {
    edit_info_success: "Informations personnelles modifiées avec succès"
  }

  getPatientsOfCurrentParactician(pageNo: number): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.patientFile + "my?pageNo=" + pageNo
    );
  }
  getPatientsOfCurrentParacticianByCategory(pageNo: number, categoryId: number): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.patientFile + "my/byCategory/" + categoryId + "?pageNo=" + pageNo
    );
  }

  getPatientsProhibitedOfCurrentParactician(pageNo): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.favorite + "myPatient/prohibited?pageNo=" + pageNo
    );
  }

  getPatientsPendingOfCurrentParactician(pageNo): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.favorite + "myPatient/pending?pageNo=" + pageNo
    );
  }

  getPatientsArchivedOfCurrentParactician(pageNo): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.favorite + "myPatient/archived?pageNo=" + pageNo
    );
  }

  addPatientToMyPatients(patientId: number): Observable<Boolean> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.favorite + "addPatient/" + patientId
    );
  }

  deletePatientFromMyPatients(patientId: number): Observable<Boolean> {
    return this.globalService.call(
      RequestType.DELETE,
      this.globalService.url.favorite + "deletePatient/" + patientId
    );
  }

  prohibitePatient(patientId: number): Observable<Boolean> {
    return this.globalService.call(
      RequestType.PUT,
      this.globalService.url.favorite + "prohibite/" + patientId
    );
  }

  authorizePatient(patientId: number): Observable<Boolean> {
    return this.globalService.call(
      RequestType.PUT,
      this.globalService.url.favorite + "authorize/" + patientId
    );
  }

  archivePatient(patientId: number): Observable<Boolean> {
    return this.globalService.call(
      RequestType.PUT,
      this.globalService.url.favorite + "archive/" + patientId
    );
  }

  activatePatient(patientId: number): Observable<Boolean> {
    return this.globalService.call(
      RequestType.PUT,
      this.globalService.url.favorite + "activate/" + patientId
    );
  }

  acceptPatientInvitation(patientId: number): Observable<Boolean> {
    return this.globalService.call(
      RequestType.PUT,
      this.globalService.url.favorite + "acceptPatient/" + patientId
    );
  }

  declinePatientInvitation(patientId: number): Observable<Boolean> {
    return this.globalService.call(
      RequestType.PUT,
      this.globalService.url.favorite + "declinePatient/" + patientId
    );
  }

  getPatientWithPeopleAttached(id) {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.patient + id + "/withLinkedPatients"
    );
  }

  getMyPatientCategory(patientId) {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.patientFile + "my/category/" + patientId
    );
  }

  getPatientCategoryByPractician(patientId, practicianId) {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.patientFile +
      "my/category/" +
      patientId +
      "/" +
      practicianId
    );
  }
  getPatientFileByPracticianId(patientId: number, practicianId: number) {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.patientFile + patientId + "/" + practicianId
    );
  }
  getPatientsByParentId(patientId: number) {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.patient + patientId + "/parent"
    );
  }
  updatePatientFile(patientFile) {
    return this.globalService.call(
      RequestType.PUT,
      this.globalService.url.patientFile,
      patientFile
    );
  }
}
