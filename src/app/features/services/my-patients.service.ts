import { Injectable } from "@angular/core";
import { GlobalService } from "@app/core/services/global.service";
import { RequestType } from "@app/shared/enmus/requestType";
import { Observable, Subject } from "rxjs";
import { OrderDirection } from "@app/shared/enmus/order-direction";

@Injectable({
  providedIn: "root",
})
export class MyPatientsService {
  constructor(private globalService: GlobalService) {}
  public errors = {
    failed_update:
      "Erreur survenue lors de la modification de la fiche patient",
    failed_add: "Erreur survenue lors de l'ajout de la fiche patient",
    failed_invitation:
      "Erreur survenue lors de l'envoi de l'invitation au patient",
    error_message: "Une erreur est survenue, veuillez réessayer plus tard",
    failed_add_patient: "Erreur survenue lors de l'ajout du patient rattaché",
    failed_edit_patient:
      "Erreur survenue lors de la modification du patient rattaché",
  };
  public messages = {
    edit_info_success: "La fiche patient est modifiée avec succès",
    add_info_success: "La fiche patient est créée avec succès",
    invitation_success: "Invitation envoyée avec succès ",
    add_success: "Le patient rattaché est ajouté avec succès ",
    update_sucess: "Le patient rattaché est modifié avec succès ",
    loading_add_attached: "Ajout de la personne rattachée en cours...",
    loading_edit_attached: "Modification de la personne rattachée en cours...",
  };
  refreshPatientFileListObs = new Subject();
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
    order: OrderDirection = OrderDirection.ASC
  ): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.patientFile + "my/byCategory/" + categoryId,
      {
        params: { pageNo: pageNo, order: order },
      }
    );
  }

  getPatientsOfCurrentParacticianByCategoryV1(
    categoryId: number,
  ): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.patientFile + "my/byCategory/v1/" + categoryId
    );
  }
  // Sorted first Name then last name
  getPatientsProhibitedOfCurrentParactician(
    pageNo,
    order: OrderDirection = OrderDirection.DESC
  ): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.favorite + "myPatient/prohibitedV2",
      {
        params: { pageNo: pageNo, order: order },
      }
    );
  }
  // Sorted last name then first name
  getPatientsProhibitedOfCurrentParacticianV3(
    pageNo,
    order: OrderDirection = OrderDirection.DESC
  ): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.favorite + "myPatient/prohibitedV3",
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
      this.globalService.url.favorite + "invitationsV2",
      {
        params: { pageNo: pageNo, order: order },
      }
    );
  }

  getPendingInvitationsV3(
    pageNo,
    order: OrderDirection = OrderDirection.DESC
  ): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.favorite + "invitationsV3",
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
    order: OrderDirection = OrderDirection.ASC
  ): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.patientFile + "my/v3/" + id,
      {
        params: { pageNo: pageNo, order: order },
      }
    );
  }

  getPatientsOfCurrentParacticianV5(
    id,
    pageNo: number,
    order: OrderDirection = OrderDirection.ASC
  ): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.patientFile + "my/v5/" + id,
      {
        params: { pageNo: pageNo, order: order },
      }
    );
  }

  getPatientsOfCurrentParacticianV4(
    id,
    pageNo: number,
    order: OrderDirection = OrderDirection.ASC
  ): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.patientFile + "my/v4/" + id,
      {
        params: { pageNo: pageNo, order: order },
      }
    );
  }

  getPatientsOfCurrentParacticianSearch(
    id,
    query: String
  ): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.patientFile + "all/search/" + id,
      {
        params: { searchPatientFile: query },
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

  deletePatientFile(patientFileId: number) {
    return this.globalService.call(
      RequestType.PUT,
      this.globalService.url.patientFile + "delete/" + patientFileId
    );
  }

  activatePatientFile(patientFileId: number) {
    return this.globalService.call(
      RequestType.PUT,
      this.globalService.url.patientFile + "activate/" + patientFileId
    );
  }

  getPatientFilesArchived(
    pageNo,
    order: OrderDirection = OrderDirection.DESC
  ): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.patientFile + "archivedV2",
      {
        params: { pageNo: pageNo, order: order },
      }
    );
  }

  getPatientFilesArchivedV3(
    pageNo,
    order: OrderDirection = OrderDirection.DESC
  ): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.patientFile + "archivedV3",
      {
        params: { pageNo: pageNo, order: order },
      }
    );
  }
  addLinkedPatient(patientFileId: number, patientFile) {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.patientFile +
        "add-linked-patient/" +
        patientFileId,
      patientFile
    );
  }
  updateLinkedPatient(linkedPatient) {
    return this.globalService.call(
      RequestType.PUT,
      this.globalService.url.patientFile + "update-linked-patient/",
      linkedPatient
    );
  }
  getAccountIdByPatientFileId(id) {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.patientFile + "patientAccount/" + id
    );
  }
}
