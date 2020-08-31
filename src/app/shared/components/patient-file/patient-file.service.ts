import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class PatientFileService {
    constructor() { }

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
        send_invitation: "Une invitation sera envoyée à votre patient l’invitant à créer son compte Helssy et d’être relié automatiquement avec votre cabinet.",
        history: "Historique",
        invite_patient: "Inviter le patient"
    };
    public errors = {
        required: "Le champ est obligatoire",
        invalid_format: "Le format est invalide",
        invalid_phone: "Le numéro de téléphone saisi est invalide",
        invalid_birthdate: "La date de naissance saisie est invalide",
        age_18: "Votre âge doit étre supérieur à 18 ans ",
        futureDate: "Vous ne pouvez pas saisir une date future",
        email_invalid_format: "Le format de l'e-mail est invalide",
    };
}