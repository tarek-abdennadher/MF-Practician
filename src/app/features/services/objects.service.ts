import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { GlobalService } from "@app/core/services/global.service";
import { RequestType } from "@app/shared/enmus/requestType";

@Injectable({
  providedIn: "root",
})
export class ObjectsService {
  public messages = {
    title: "Intitulé (*)",
    required: "Champs obligatoire",
    validate: "Enregistrer",
    cancel: "Annuler",
    delete_category_confirm:
      "Êtes-vous sûr de vouloir supprimer cette Catégorie d’instructions ?",
    delete_category: "Supprimer",
  };
  constructor(public router: Router, public globalService: GlobalService) { }

  getAllByTLS(tlsgroupId) {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.instruction_object + "/tls/" + tlsgroupId
    );
  }
}
