import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { GlobalService } from "@app/core/services/global.service";
import { RequestType } from "@app/shared/enmus/requestType";

@Injectable({
  providedIn: "root",
})
export class PatientFileService {
  constructor(public router: Router, public globalService: GlobalService) {}

  public labels = {
    info: "Informations",
    attached_info: "Personnes rattachées ",
    phone: "Téléphone (*)",
    birthday: "Date de naissance (*)",
    _address: "Adresse ",
    _zip_code: "Code Postal ",
    _city: "Ville ",
    civility: "Civilité (*)",
    last_name: "Nom (*)",
    first_name: "Prénom (*)",
    _email_address: "Adresse e-mail ",
    maiden_name: "Nom de jeune fille",
    additional_address: "Complément d'addresse",
    category: "Catégorie",
    other_phone: "Autre tél",
    correspondence: "Correspondance",
    otherCorrespondence: "Autre correspondance",
    cancel: "Annuler",
    save: "Enregistrer",
    notes: "Notes",
    add_note: "Ajouter une note",
    note_value: "Note",
    note_date: "Date (*)",
    cordonnees: "Coordonnées",
    info_compl: "Informations complémentaires",
    send_invitation:
      "Ne pas envoyer une invitation à votre patient lui permettant de vous contacter via la messagerie Helssy.",
    history: "Historique",
    invite_patient: "Inviter le patient",
    link_patient: "Attacher une personne",
  };
  public errors = {
    required: "Le champ est obligatoire",
    invalid_format: "Le format est invalide",
    invalid_phone: "Le numéro de téléphone saisi est invalide",
    invalid_birthdate: "La date de naissance saisie est invalide",
    age_18: "Votre âge doit étre supérieur à 18 ans ",
    futureDate: "Vous ne pouvez pas saisir une date future",
    email_invalid_format: "Le format de l'e-mail est invalide",
    invalid_date: "Date invalide",
  };

  getCorrespondence() {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.patient + "correspondence"
    );
  }
  getCivility() {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.patient + "civility"
    );
  }
}
