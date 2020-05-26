import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { GlobalService } from "@app/core/services/global.service";
import { RequestType } from "@app/shared/enmus/requestType";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class NoteService {
  constructor(public router: Router, public globalService: GlobalService) {}

  addNote(note, patientId): Observable<any> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.note + "/" + patientId,
      note
    );
  }

  addNoteforPractician(note, patientId, practicianId): Observable<any> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.note + "/" + patientId + "/" + practicianId,
      note
    );
  }

  deleteNote(id): Observable<any> {
    return this.globalService.call(
      RequestType.PUT,
      this.globalService.url.note + "/" + id
    );
  }

  updateNote(note): Observable<any> {
    return this.globalService.call(
      RequestType.PUT,
      this.globalService.url.note,
      note
    );
  }

  getMyNotes(patientId): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.note + "/my/" + patientId
    );
  }

  getPracticianNotes(patientId, practicianId): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.note + "/" + patientId + "/" + practicianId
    );
  }

  getnoteById(id): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.note + "/" + id
    );
  }
}
