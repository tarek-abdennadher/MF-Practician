import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { GlobalService } from "@app/core/services/global.service";
import { RequestType } from "@app/shared/enmus/requestType";
import { Observable } from "rxjs";

@Injectable()
export class AccountService {
  constructor(public router: Router, public globalService: GlobalService) { }
  public messages = {
    edit_info_success: "Informations personnelles modifiées avec succès",
    edit_password_success: "Mot de passe modifié avec succès",
    edit_password_failure: "Erreur lors de la modification du mot de passe",
    my_account: "Mon compte",
    my_info: "Mes informations personnelles",
    patient_info: "informations personnelles",
    civilite: "Civilité (*)",
    civility: "Civilité",
    nom: "Nom (*)",
    prenom: "Prénom (*)",
    first_name: "Prénom",
    last_name: "Nom ",
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
    categories_tab: "Mes catégories",
    add_secretary: "Ajouter secrétaire",
    add_secretary_success: "Secrétaire ajoutée avec succès",
    my_secretaries: "Mes Secrétaires",
    edit_secretary_success: "Secrétaire modifiée avec succès",
    confirm: "Confirmer",
    delete_account_confirm: "Êtes-vous sûr de vouloir supprimer votre compte ?",
    delete: "Supprimer",
    phone_error: "      Veuillez vérifier les téléphones saisis",
    update_error: "      Une erreur s'est produite",
    title_delete_account: "supprimer un compte",
    notes: "Mes notes",
    date: "Date (*)",
    website: "Site web",
    my_contacts: "Mes contacts",
    patients: "Patients",
    tls: "TLS",
    leaves: "Mes congés",
    birthday: "Date de naissance",
    add_address: "Complément d'addresse",
    category: "Catégorie",
    other_phone: "Autre tél",
    start_date_leave: "Date de début des congés",
    end_date_leave: "Date de fin des congés",
    date_error: "Veuillez vérifier la date saisie",
    validate: "Enregistrer",
    required: "Le champ est obligatoire",
    update_leaves_success: "Infromations modifiées avec succès",
    update_leaves_fail: "Erreur survenue lors de la mise à jour des congés.",
    is_deleted: " Le compte patient a été désactivé  !",
    personal_info: "Informations personnelles",
    cordonnees: "Coordonnées",
    info_compl: "Informations complémentaires",
    my_object: "Mes objets",
    cible: "Cible",
    practician: "Praticien",
    secretary_tls: "Secretaire/Télésecretaire",
    patient: "Patient",
    other: "Autre",
    object: "Objet",
    content: "Message",
    docBody: "Corps du document",
    docModel: "Modèle de document",
    allowDocument: "Génération automatique d’un document",
    select_object: "Selectionnez un objet",
    title: "Model de document",
    info:
      "Vous pouvez à partir de cet onglet, définir tous vos types objets qui vous servirons lors de la rédaction d'un message.",
    add_Object: "Ajouter un objet",
    add_Category: "Ajouter une catégorie",
    info2:
      "Vous pouvez à partir de cet onglet, définir les catégories des patients",
    resp: "Responsable",
    activate_auto_resp: "Activer la réponse automatique en cas de congés ?",
    sec_detail: "Détails du secrétaire"
  };
  public errors = {
    required: "Le champ est obligatoire",
    invalid_format: "Le format saisi est invalide",
    min_length: "Minimun 8 caractères",
    must_match: "Mot de passe non identique",
    invalid_phone: "Le numéro de téléphone saisi est invalide"
  };
  public stats = {
    patient_title: "Patients",
    patient_m_1: "Messages reçus des patients",
    patient_m_2: "Messages envoyés aux patients"
  };
  updateAccount(account) {
    return this.globalService.call(
      RequestType.PUT,
      this.globalService.url.account_update,
      account
    );
  }
  updateSecretaryAccount(account) {
    return this.globalService.call(
      RequestType.PUT,
      this.globalService.url.account_update_secretary,
      account
    );
  }
  getCurrentAccount() {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.account_authenticated
    );
  }
  getAccountById(id) {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.account + "/min/" + id
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
  updatePasswordV2(pass) {
    return this.globalService.call(
      RequestType.PUT,
      this.globalService.url.account_password_update + "/v2",
      pass
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
  desactivateMultipleAccount(ids) {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.account + "/desactivate-multiple",
      ids
    );
  }
  detachSecretaryFronAccount(id) {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.secretary + "/detach/" + id
    );
  }
  detachMultipleSecretaryFromAccount(ids) {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.secretary + "/detach-multiple",
      ids
    );
  }
  getAccountDetails(id: number) {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.account + "/detail/" + id
    );
  }

  getJobTiles() {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.practician + "jobTitles"
    );
  }

  getPracticianTelesecretary() {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.practician + "tls"
    );
  }

  getPatientStats(id): Observable<Map<string, number>> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.messages + "patientStat/" + id
    );
  }
  getTlsStats(id): Observable<Map<string, number>> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.messages + "groupStat/" + id
    );
  }

  getOptionById(id) {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.option + "/" + id
    );
  }
  updateLeavesInOptionByPractician(
    activateLeaveAutoMessage: boolean,
    leaveStartDate,
    leaveEndDate
  ) {
    return this.globalService.call(
      RequestType.PUT,
      this.globalService.url.option + "/leaves/" + activateLeaveAutoMessage,
      {
        params: {
          leaveStartDate: leaveStartDate,
          leaveEndDate: leaveEndDate
        }
      }
    );
  }

  getPracticianObjectList() {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.practician_object + "/myObject"
    );
  }

  getPracticianObjectById(id) {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.practician_object + "/" + id
    );
  }

  createPracticianObject(object) {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.practician_object,
      object
    );
  }

  updatePracticianObject(object) {
    return this.globalService.call(
      RequestType.PUT,
      this.globalService.url.practician_object,
      object
    );
  }

  deletePracticianObject(id) {
    return this.globalService.call(
      RequestType.DELETE,
      this.globalService.url.practician_object + "/" + id
    );
  }

  getAllDocumentModel(): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.documentModel + "/my"
    );
  }

  getObjectSearchList() {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.practician_object + "/mySearchList"
    );
  }

  clonePracticianObject(id) {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.practician_object + "/cloneToMine/" + id
    );
  }
}
