import { Injectable } from "@angular/core";
import { GlobalService } from "@app/core/services/global.service";
import { RequestType } from "@app/shared/enmus/requestType";
import { Observable, BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class MessagingDetailService {
  public id = new BehaviorSubject(null);
  constructor(private globalService: GlobalService) {}

  getIdValue() {
    return this.id.getValue();
  }
  getIdObs() {
    return this.id.asObservable();
  }
  setId(id) {
    this.id.next(id);
  }
  getMessagingDetailById(id): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.messages + id
    );
  }
  getMessageContactDetailById(id): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.messages + "contact/" + id
    );
  }
  getMessageArchivedById(id): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.archived_messages + id
    );
  }

  patientsProhibitedByCurrentPractician(): Observable<number[]> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.favorite + "currentPractician/prohibitedPatientId"
    );
  }
  public markMessageAsImportant(ids: number[]): Observable<boolean> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.messages + "important/all",
      ids
    );
  }

  public markMessageAsArchived(ids: number[]): Observable<number> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.messages + "archive/all",
      ids
    );
  }

  public getRefuseRequest(request): Observable<any> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.requestType + "/refuse/body",
      request
    );
  }

  public getAcceptRequest(request): Observable<any> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.requestType + "/accept/body",
      request
    );
  }

  public getTlsSecretaryList(): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.contact_pro + "/allSecretaries"
    );
  }
}
