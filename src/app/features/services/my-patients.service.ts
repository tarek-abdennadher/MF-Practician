import { Injectable } from "@angular/core";
import { GlobalService } from "@app/core/services/global.service";
import { RequestType } from "@app/shared/enmus/requestType";
import { Observable } from "rxjs";
import { OrderDirection } from "@app/shared/enmus/order-direction";

@Injectable({
  providedIn: "root",
})
export class MyPatientsService {
  constructor(private globalService: GlobalService) { }
  public errors = {
    failed_update:
      "Erreur survenue lors de la modification de la fiche patient",
    failed_add: "Erreur survenue lors de l'ajout de la fiche patient",
    failed_invitation: "Erreur survenue lors de l'envoi de l'invitation au patient"
  };
  public messages = {
    edit_info_success: "Informations personnelles modifiées avec succès",
    add_info_success: "Fiche Patient créée avec succès",
    invitation_success: "Invitation envoyée avec succès "
  };

  getPatientsOfCurrentParactician(
    pageNo: number,
    order: OrderDirection = OrderDirection.DESC
  ): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.patientFile + "my",
      {
        params: { pageNo: pageNo, order: order },
      }
    );
  }
  getPatientsOfCurrentParacticianByCategory(
    pageNo: number,
    categoryId: number,
    order: OrderDirection = OrderDirection.DESC
  ): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.patientFile + "my/byCategory/" + categoryId,
      {
        params: { pageNo: pageNo, order: order },
      }
    );
  }

  getPatientsProhibitedOfCurrentParactician(
    pageNo,
    order: OrderDirection = OrderDirection.DESC
  ): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.favorite + "myPatient/prohibited",
      {
        params: { pageNo: pageNo, order: order },
      }
    );
  }

  getPatientsPendingOfCurrentParactician(
    pageNo,
    order: OrderDirection = OrderDirection.DESC
  ): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.favorite + "myPatient/pending",
      {
        params: { pageNo: pageNo, order: order },
      }
    );
  }

  getPendingInvitations(
    pageNo,
    order: OrderDirection = OrderDirection.DESC
  ): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.favorite + "invitations",
      {
        params: { pageNo: pageNo, order: order },
      }
    );
  }

  getPatientsArchivedOfCurrentParactician(
    pageNo,
    order: OrderDirection = OrderDirection.DESC
  ): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.favorite + "myPatient/archived",
      {
        params: { pageNo: pageNo, order: order },
      }
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
  getPatientFileById(id) {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.patientFile + "v2/" + id
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
  createPatientFile(patientFile) {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.patientFile,
      patientFile
    );
  }

  getPatientsOfCurrentParacticianV2(
    id,
    pageNo: number,
    order: OrderDirection = OrderDirection.DESC
  ): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.patientFile + "my/v2/" + id,
      {
        params: { pageNo: pageNo, order: order },
      }
    );
  }
  getAllPatientFilesByPracticianId(practicianId: number) {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.patientFile + "all/" + practicianId
    );
  }
  getAccountIdByPatientId(accountId: number) {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.patient + "account/" + accountId
    );
  }
  sendPatientInvitation(patientFileId: number) {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.patientFile + "sendInvitation/" + patientFileId
    );
  }
}
