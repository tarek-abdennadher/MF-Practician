import { Injectable } from "@angular/core";
import { RequestType } from "@app/shared/enmus/requestType";
import { GlobalService } from "@app/core/services/global.service";
import { Observable } from "rxjs";
import { Speciality } from "@app/shared/models/speciality";

@Injectable({
  providedIn: "root"
})
export class ContactsService {
  public messages = {
    type_contact: "Type de contact (*)",
    phone_required: "Le champ téléphone est obligatoire",
    phone_invalid: "Le format du numéro de téléphone est invalide",
    email_required: "Le champ email est obligatoire",
    email_invalid_format: "Format email invalide",
    email_not_same: "L 'email ne correspond pas",
    required: "Le champ est obligatoire",
    email_input: "Email (*)",
    phone_input: "Téléphone mobile ou fixe (*)",
    firstname: "Prénom (*)",
    name: "Nom (*)",
    email: "Email",
    phone: "Téléphone (*)",
    address: "Adresse",
    first_name: "Prénom (*)",
    last_name: "Nom (*)",
    additional_address: "Complément d'adresse",
    other_phone: "Autre tél",
    validate: "Valider",
    title: "Titre",
    speciality: "Spécialité",
    facility_name: "Nom de l'établissement"
  };
  constructor(private globalService: GlobalService) {}

  getContactsPro() {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.contact_pro_by_session
    );
  }
  getAllSpecialities(): Observable<Array<Speciality>> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.spaciality
    );
  }
  deleteMultiple(ids) {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.contact_pro_delete,
      ids
    );
  }
  deleteMultiplePracticianContactPro(ids) {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.practicien_contact_pro_detach,
      ids
    );
  }
  public getContactById(id: number) {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.contact_pro + "/" + id
    );
  }

  addContact(contact) {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.contact_pro,
      contact
    );
  }

  updateContact(contact) {
    return this.globalService.call(
      RequestType.PUT,
      this.globalService.url.contact_pro,
      contact
    );
  }

  getAllContactsPractician(): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.contact_pro + "/contacts-practician"
    );
  }
}
