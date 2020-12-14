import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "@env/environment";
import { Observable } from "rxjs";
import { RequestType } from "@app/shared/enmus/requestType";

@Injectable()
export class GlobalService {
  constructor(private httpClient: HttpClient) {}
  public BASE_URL: string = environment.BASE_END_POINT;
  public PATIENT_SITE: string = environment.PATIENT_SITE;
  public SHOWCASE_SITE: string = environment.SHOWCASE_SITE;
  public SITE_MAP: string = environment.site_Map;
  public WHO_ARE_WE_SITE: string = environment.WHOAREWE_SITE;
  public OUR_SOLUTION_SITE: string = environment.OURSOLUTION_SITE;
  public OUR_BLOG_SITE: string = environment.OURBLOG_SITE;
  public CONTACT_SITE: string = environment.CONTACT_SITE;
  public HELSSY_SITE: string = environment.HELSSY_SITE;
  public CGU_SITE: string = environment.CGU_SITE;
  public RGPD_SITE: string = environment.RGPD_SITE;
  public COOKIES_SITE: string = environment.COOKIES_SITE;
  public BASE_URL_CA: string =
    environment.BASE_END_POINT + "/ms-coreapplication";
  public BASE_URL_MA: string = this.BASE_URL + "/ms-messagingapplication";
  private BASE_URL_FL: string = this.BASE_URL + "/ms-filer";
  public BASE_URL_SMS: string =
    environment.BASE_END_POINT + "/ms-smsapplication";
  public encyptionKey = environment.encryptKey;
  public url = {
    base: this.BASE_URL,
    patient_connexion: this.PATIENT_SITE + "/connexion",
    showcase_site: this.SHOWCASE_SITE,
    authenticatePractician: this.BASE_URL + "/api/authPractician",
    accountlogin: this.BASE_URL_CA + "/account/light/",
    accountRole: this.BASE_URL_CA + "/account/role/",
    practiciens: this.BASE_URL_CA + "/practician",
    requestTypes: this.BASE_URL_CA + "/requestTypes",
    requestType: this.BASE_URL_MA + "/requestType",
    practicianObject: this.BASE_URL_MA + "/practicianObject",
    produce: this.BASE_URL_MA + "/messages/produce",
    message: this.BASE_URL_MA + "/messages",
    replyMessage: this.BASE_URL_MA + "/messages/createWithAttachement",
    sentMessage: this.BASE_URL_MA + "/messages/sender",
    forwardedMessage: this.BASE_URL_MA + "/messages/forwarded",
    node: this.BASE_URL_FL + "/node",
    attachements: this.BASE_URL_FL + "/attachement",
    site: this.BASE_URL_FL + "/directories",
    folderChild: this.BASE_URL_FL + "/node/fils",
    account_create_patient: this.BASE_URL_CA + "/account/patient/",
    account_validation_sms: this.BASE_URL_SMS + "/validation/sendCode/",
    account_validation_code: this.BASE_URL_CA + "/validation/byEmail/",
    password_reset: this.BASE_URL_CA + "/password/reset/",
    password_validate_token: this.BASE_URL_CA + "/password/validate/",
    password_change: this.BASE_URL_CA + "/password/change",
    account_update: this.BASE_URL_CA + "/account/update",
    practician: this.BASE_URL_CA + "/practician/",
    patient: this.BASE_URL_CA + "/patient/",
    spaciality: this.BASE_URL_CA + "/speciality/",
    account_authenticated: this.BASE_URL_CA + "/account/authenticated",
    account_password_update: this.BASE_URL_CA + "/account/password",
    //Messaging Application URLs
    archived_messages: this.BASE_URL_MA + "/messagesArchived/",
    messages: this.BASE_URL_MA + "/messages/",
    receiver: this.BASE_URL_MA + "/receivers/",
    receiverArchived: this.BASE_URL_MA + "/receiversArchived/",
    contact_pro: this.BASE_URL_CA + "/contact",
    contact_pro_by_session: this.BASE_URL_CA + "/contact/pro/bysession",
    contact_pro_delete: this.BASE_URL_CA + "/contact/deleteMultiple",
    secretary: this.BASE_URL_CA + "/secretary",
    secretaries_practicien:
      this.BASE_URL_CA + "/secretary/contacts-pro-practicians",
    contact_pro_practicien:
      this.BASE_URL_CA + "/practician/contacts-pro-practicians",
    practicien_contact_pro_detach:
      this.BASE_URL_CA + "/practician/contacts-pro-practicians-detach",
    account: this.BASE_URL_CA + "/account",
    account_update_secretary: this.BASE_URL_CA + "/account/update-secretary",
    favorite: this.BASE_URL_CA + "/favorite/",
    patientFile: this.BASE_URL_CA + "/patientFile/",
    RefuseTypes: this.BASE_URL_MA + "/refuseType",
    contact_pro_all: this.BASE_URL_CA + "/contact/contacts-practician-all",
    practician_invitation: this.BASE_URL_CA + "/account/invitePractician",
    category: this.BASE_URL_CA + "/category",
    note: this.BASE_URL_CA + "/note",
    contact_book: this.BASE_URL_CA + "/contact-book",
    option: this.BASE_URL_CA + "/option",
    practician_object: this.BASE_URL_MA + "/practicianObject",
    documentModel: this.BASE_URL_MA + "/model",
    instruction: this.BASE_URL_MA + "/instruction",
    instruction_object: this.BASE_URL_CA + "/instruction-object",
    instruction_category: this.BASE_URL_CA + "/instruction-category",
    photo: this.BASE_URL_CA + "/photo/generate"
  };
  public toastrMessages = {
    send_message_success: "Message envoyé !",
    send_message_error: "Votre message n'a pas pu être envoyé",
    archived_message_success: "Message archivé !",
    archived_message_error: "Votre message n'a pas pu être archivé",
    mark_important_message_success: "Message marqué comme important !",
    mark_not_important_message_success: "Message marqué comme non important !",
    mark_important_message_error:
      "Votre message n'a pas pu être marqué comme important",
    mark_not_important_message_error:
      "Votre message n'a pas pu être marqué comme non important",
    send_message_to_myself:
      "Vous ne pouvez pas répondre à un message que vous avez envoyé"
  };

  public messagesDisplayScreen = {
    inbox: "INBOX",
    Mailbox: "Boîte de réception",
    MailDetail: "Détails du message",
    newMessage: "nouveau message",
    newMessages: "nouveaux messages",
    writeMessage: "Ecrire un nouveau message",
    other: "autre",
    patient: "patient",
    patients: "patients",
    my_patients: "Mes patients",
    documents: "Documents reçus",
    delete_confirmation_patient: "Voulez vous vraiment supprimer ce patient ?",
    archive_confirmation_patient:
      "Êtes vous sur de bien vouloir archiver ce patient ?",
    delete_confirmation_contact: "Voulez vous vraiment archiver ce contact ?",
    archive_confirmation_message:
      "Voulez vous vraiment archiver ce(s) message(s) ?",
    delete_confirmation_phone: "Voulez vous vraiment supprimer ce téléphone ?",
    delete_title_patient: "Supprimer le patient",
    newArchivedMessage: "message non lu",
    newArchivedMessages: "messages non lus",
    attachedPersonnes: "Personnes Rattachées au patient",
    notes: "Mes notes",
    history: "Historique des messages",
    newMessageCapital: "Nouveau message",
    required: "Champs obligatoire",
    free_object: "Objet libre",
    invitations: "Mes invitations",
    blocked_patients: "Patients Bloqués",
    archived_patients: "Patients Archivés"
  };

  public avatars = {
    doctor: "assets/imgs/avatar_docteur.svg",
    child: "assets/imgs/avatar_enfant.svg",
    women: "assets/imgs/avatar_femme.svg",
    man: "assets/imgs/avatar_homme.svg",
    secretary: "assets/imgs/avatar_secrétaire.svg",
    tls: "assets/imgs/avatar_tls.svg",
    user: "assets/imgs/user.png",
    telesecretary: "assets/imgs/etablissement.svg"
  };

  public excludedExceptions = ["Le mot de passe saisi est invalide"];
  public call(
    method: RequestType,
    url: string,
    ...args: any[]
  ): Observable<any> {
    switch (method) {
      case RequestType.GET: {
        return this.httpClient.get<any>(url, args[0]);
      }
      case RequestType.POST: {
        return this.httpClient.post<any>(url, args[0], args[1]);
      }
      case RequestType.PUT: {
        return this.httpClient.put<any>(url, args[0], args[1]);
      }
      case RequestType.DELETE: {
        args[0] = {
          responseType: "text"
        };
        return this.httpClient.delete<any>(url, args[0]);
      }
      default: {
        return null;
      }
    }
  }

  getSelector(id) {
    return "#main-container > app-my-account > app-my-leaves > div > form > div:nth-child(8) > div.col-12.col-sm-8.col-lg-8.col-md-8.col-xl-8 > hls-ckeditor > ckeditor > div.ck.ck-reset.ck-editor.ck-rounded-corners > div.ck.ck-editor__top.ck-reset_all > div > div.ck.ck-sticky-panel__content > div > div.ck.ck-toolbar__items > div:nth-child(2) > div > ul > li:nth-child";
  }

  LeavesTags = [
    "(1)",
    "(1)",
    "(1)",
    "(1)",
    "(1)",
    "(1)",
    "(1)",
    "(1)",
    "(3)",
    "(3)",
    "(3)",
    "(3)",
    "(3)",
    "(3)",
    "(3)",
    "(3)",
    "(3)",
    "(3)",
    "(3)"
  ];
}
