import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { GlobalService } from "@app/core/services/global.service";
import { RequestType } from "@app/shared/enmus/requestType";

@Injectable({
  providedIn: "root"
})
export class PracticianInvitationService {
  public texts = {
    send_postal: "Envoyer par courrier postal",
    send_email: "Envoyer par email",
    pourquoi: "Pourquoi inviter un confrère sur",
    helssy: "Helssy",
    first_name: "Prénom",
    last_name: "Nom",
    email: "E-mail",
    phone: "Téléphone",
    address: "Adresse",
    title: "Titre *",
    speciality: "Spécialité *",
    phone_invalid: "Le format du numéro de téléphone est invalide",
    email_required: "Le champ email est obligatoire",
    email_invalid_format: "Format email invalide",
    required: "Le champ est obligatoire",
    invite_failure: "Erreur survenue lors de l'invitation' du praticien",
    invite_success: "Invitation envoyée avec succès",
    error_message: "Une erreur est survenue, veuillez réessayer plus tard"
  };
  constructor(private globalService: GlobalService) {}

  invitePractician(body) {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.practician_invitation,
      body
    );
  }
}
