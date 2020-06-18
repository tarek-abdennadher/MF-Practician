import { Injectable } from "@angular/core";
import { RequestType } from "@app/shared/enmus/requestType";
import { GlobalService } from "@app/core/services/global.service";

@Injectable({
    providedIn: "root",
})
export class ContactBookService {
    public messages = {
        my_contacts: "Mes contacts",
        last_name: "Nom (*)",
        first_name: "Prénom (*)",
        function: "Fonction (*)",
        email: "Adresse e-mail (*)",
        phone: "Téléphone (*)",
        other_phone: "Autre tél",
        save: "Enregistrer",
        cancel: "Annuler",
        required: "Le champ est obligatoire",
        email_invalid_format: "Le format de l'e-mail est invalide",
        invalid_phone: "Le numéro de téléphone saisi est invalide",
        add_success: "Contact ajouté avec succès. ",
        add_fail: "Erreur survenue lors de l'ajout du contact.",
        edit_info_success: "Informations du contact modifiées avec succès.",
        failed_update: "Erreur survenue lors de la modification des informations du contact.",
        delete_contact_confirm: "Êtes-vous sûr de vouloir supprimer ce contact ?",
        delete_contact: "Supprimer un contact"

    };
    constructor(private globalService: GlobalService) { }

    getAllContactBookByPracticianId(id) {
        return this.globalService.call(
            RequestType.GET,
            this.globalService.url.contact_book + "/practician/" + id
        );
    }
    addContactBookToPractician(id, model) {
        return this.globalService.call(
            RequestType.POST,
            this.globalService.url.contact_book + "/practician/" + id,
            model
        );
    }
    deleteContactBook(id) {
        return this.globalService.call(
            RequestType.POST,
            this.globalService.url.contact_book + "/delete/" + id
        );
    }
    getContactBookBy(id) {
        return this.globalService.call(
            RequestType.GET,
            this.globalService.url.contact_book + "/" + id
        );
    }
    updateContactBook(model) {
        return this.globalService.call(
            RequestType.PUT,
            this.globalService.url.contact_book,
            model
        );
    }
}
