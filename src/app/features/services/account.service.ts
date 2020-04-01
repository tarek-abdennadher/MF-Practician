import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { GlobalService } from "@app/core/services/global.service";
import { RequestType } from "@app/shared/enmus/requestType";

@Injectable()
export class AccountService {
  constructor(public router: Router, public globalService: GlobalService) {}
  public messages = {
    edit_info_success: "Informations personnelles modifiées avec succès",
    edit_password_success: "Mot de passe modifié avec succès",
    edit_password_failure: "Erreur lors de la modification du mot de passe",
    my_account: "Mon compte",
    my_info: "Mes informations personnelles",
    civilite: "Civilité (*)",
    nom: "Nom (*)",
    prenom: "Prénom (*)",
    nom_jeune_fille: "Nom de jeune fille ",
    address: "Adresse (*)",
    _address: "Adresse ",
    zip_code: "Code Postal (*)",
    _zip_code: "Code Postal ",
    city: "Ville (*)",
    _city: "Ville ",
    email_address: "Adresse e-mail (*)",
    _email_address: "Adresse e-mail ",
    phone: "Téléphone (*)",
    _phone: "Téléphone ",
    add_phone: "Ajouter un tél",
    edit_img: "Modifier la photo",
    delete_img: "Supprimer la photo",
    add_img: "Ajouter une photo",
    save: "Enregistrer",
    linked_patients: "Personnes Rattachées à mon compte",
    link_patient: "Attacher une personne",
    reset_pwd: "Réinitialisation du mot de passe",
    new_pwd: "Nouveau mot de passe",
    confirm_pwd: "Confirmer le mot de passe",
    return_chat: "Retour à la messagerie",
    delete_account: "Supprimer mon compte",
    cancel: "Annuler",
    info_tab: "Mes informations",
    my_secretaries_tab: "Mes secrétaires",
    tele_secretariat_tab: "Mon télésecrétariat",
    factures_tab: "Mes factures",
    stats_tab: "Mes stats",
    add_secretary: "Ajouter secrétaire",
    add_secretary_success: "Secrétaire ajoutée avec succès",
    my_secretaries: "Mes Secrétaires"
  };
  public errors = {
    required: "Champs obligatoire",
    invalid_format: "Format invalide",
    min_length: "Minimun 8 caractères",
    must_match: "Mot de passe non identique"
  };
  updateAccount(account) {
    return this.globalService.call(
      RequestType.PUT,
      this.globalService.url.account_update,
      account
    );
  }
  getCurrentAccount() {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.account_authenticated
    );
  }
  updatePassword(pass) {
    return this.globalService.call(
      RequestType.PUT,
      this.globalService.url.account_password_update +
        "/" +
        encodeURIComponent(pass)
    );
  }

  addSecretary(body) {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.secretary,
      body
    );
  }
  getMySecretaries() {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.secretaries_practicien
    );
  }
  getMyPracticianProContact() {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.contact_pro_practicien
    );
  }
  desactivateAccount() {
    return this.globalService.call(
      RequestType.GET,

      this.globalService.url.account + "/desactivate"
    );
  }
}
