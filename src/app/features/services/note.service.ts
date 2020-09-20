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
  public errors = {
    failed_add: "Erreur survenue lors de l'ajout de la note",
    failed_edit: "Erreur survenue lors de la modification de la note",
  };
  public messages = {
    add_success: "Note ajoutée avec succès",
    edit_success: "Note modifiée avec succès ",
    delete_success: "Note supprimée avec succès",
  };

  addNoteforPatientFile(note, patientFileId): Observable<any> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.note + "/add/v2/" + patientFileId,
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
}
