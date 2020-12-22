import { Injectable } from "@angular/core";
import { RequestType } from "@app/shared/enmus/requestType";
import { GlobalService } from "@app/core/services/global.service";
import { Observable, BehaviorSubject } from "rxjs";
import { Speciality } from "@app/shared/models/speciality";

@Injectable({
  providedIn: "root",
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
    email_input: "Adresse e-mail",
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
    validate: "Enregistrer",
    title: "Titre (*)",
    speciality: "Spécialité",
    civility: "Civilité (*)",
    facility_name: "Nom de l'établissement",
    confirm: "Confirmer",
    cancel: "Annuler",
    delete_sec_confirm: "êtes-vous sûr de vouloir supprimer cette secrétaire ?",
    delete_sec_title: "Supprimer une secrétaire",
    birth_date: "Date de naissance (*)",
    phone_error: "      Veuillez vérifier les téléphones saisis",
    note: " Note",
    additionalEmail: "Email secondaire",
    category: "Nom de la catégorie ",
    parrainer_practician:
      "Parrainer un confrère et bénéficiez d'un mois d'abonnement offert",
    parrainer_secretary:
      "Parrainer un praticien et bénéficiez d'un mois d'abonnement offert",
    category_name: "Nom de la catégorie (*)",
    zip_code: "Code postal",
    city: "Ville",
    send: "Envoyer",
    email_exist: "Email déja utilisé",
    edit_failed: "Erreur survenue lors de la modification du contact",
    contact_edit: "Contact modifié avec succès",
    info: "Informations",
  };

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
  getContactsPro() {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.contact_pro_all
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

  getAllContactsPracticianWithSupervisors(): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.contact_pro + "/contactsAndSupervisors"
    );
  }

  getAllContactsPracticianWithAditionalPatient(patientId): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.contact_pro +
        "/contacts-practician/additionalId/" +
        patientId
    );
  }
}
