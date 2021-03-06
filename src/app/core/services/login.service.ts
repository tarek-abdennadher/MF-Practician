import { Injectable } from "@angular/core";
import { LocalStorageService } from "ngx-webstorage";
import { Router } from "@angular/router";
import { GlobalService } from "./global.service";
import { RequestType } from "@app/shared/enmus/requestType";

@Injectable()
export class LoginService {
  user: any;
  public result;

  constructor(
    public router: Router,
    public localSt: LocalStorageService,
    public globalService: GlobalService
  ) {}
  public messages = {
    bad_credentials: "Email et mot de passe non valides",
    reset_password_failure:
      "L'email choisi ne figure pas dans notre application",
    reset_password_success: `Un mail vient de vous être envoyé
    Cliquez sur le lien contenu dans cet email afin de réinitialiser votre mot de passe`,
    change_password_success: "Mot de passe modifié avec succès",
    change_password_failure: "Erreur lors de la modification du mot de passe",
    card_title: "Accès praticien",
    connexion: " Se connecter",
    new_account: "Vous n'avez pas de compte Helssy ?",
    register: "Demander une démo",
    new_patient_registration: "Vous êtes un patient ?",
    acces_denied:
      "Le compte utilisé n'est pas autorisé à accéder au site praticien",
    error_message: "Une erreur est survenue, veuillez réessayer plus tard"
  };
  authenticate(body) {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.authenticatePractician,
      body
    );
  }
  getAccountInfo(email: string) {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.accountlogin + email
    );
  }

  resetPassword(email: string) {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.password_reset + email
    );
  }
  validateToken(token) {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.password_validate_token + token
    );
  }
  changePassword(body) {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.password_change,
      body
    );
  }
  getRoleByEmail(email: string) {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.accountRole + email
    );
  }
}
