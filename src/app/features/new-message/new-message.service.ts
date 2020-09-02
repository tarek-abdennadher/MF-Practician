import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class HlsSendMessageService {
  constructor() { }
  public texts = {
    from: "De : ",
    to: "A : ",
    cc: "CC : ",
    for: "Pour : ",
    address: "Adresse : ",
    object: "Objet",
    free_object: "Objet libre",
    send: "Envoyer mon message",
    send_postal: "Envoyer par courrier postal",
    send_email: "Envoyer par email",
    choose_practition: "Choisir un praticien",
    other: "autre",
    body_error_message: "Le corps du message est obligatoire.",
    to_error_message: "La destination du message est obligatoire.",
    object_error_message: "L'objet du message est obligatoire.",
    empty: " Aucun",
    concerns: "Concerne",
    message_types: "Type d'envoi : ",
    type_error_message: "Le type d'envoi du message est obligatoire.",
    send_instruction: "Envoyer ma consigne",
    attention: "Attention ! ",
    warning_patient_message_1:
      "Cette messagerie, n’a pas pour but de gérer des demandes urgentes, ou de diagnostiquer une pathologie, votre praticien vous répondra dans un délai qui lui semblera opportun et en fonction de ses disponibilités.",
    warning_patient_message_2:
      "En cas d’urgence ou de symptômes inquiétants merci de contacter le cabinet directement au numéro habituel ou le 15 (SAMU - 7j/24h) en cas d’extrême urgence.",
    required: "Champs obligatoire !"
  };

}
