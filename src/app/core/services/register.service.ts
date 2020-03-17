import { Injectable } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { Router } from '@angular/router';
import { GlobalService } from './global.service';
import { RequestType } from '@app/shared/enmus/requestType';
import { Observable, BehaviorSubject } from 'rxjs';
import { Account } from '@app/shared/models/account';

@Injectable({
    providedIn: 'root'
})
export class RegisterService {

    private patientAccount = new BehaviorSubject(new Account());
    currentAccount = this.patientAccount.asObservable();

    constructor(
        public router: Router,
        public localSt: LocalStorageService,
        public globalService: GlobalService
    ) { }

    emitAccountChanges(account: Account) {
        this.patientAccount.next(account)
    }
    public messages = {
        new_patient_registration: "Vous êtes déjà inscrit ? ",
        new_practitioner_registration: "Vous êtes professionnel de santé ?",
        connexion: " Se connecter",
        validation_code_error: "Erreur survenue lors de l'envoi du code d'inscription",
        validation_code_error_mail: "Erreur survenue lors de la validation du code d'inscription",
        create_patient_account_success: "Création du compte patient avec succès",
        send_validation_code_success: "Envoi du code d'inscription avec succès ",
        resend_validation_code_error: "Erreue survenue lors du renvoi du code d'inscription",
        resend_validation_code_error_phone: "Veuillez vérifier le numéro de téléphone saisi pour le renvoi du code",
        resend_validation_code_error_mail: "Veuillez vérifier l'email préalablement saisi pour le renvoi du code"

    }
    createAccount(account, code: string) {
        return this.globalService.call(
            RequestType.POST,
            this.globalService.url.account_create_patient + code, account
        );
    }

    sendValidationCode(email: string, phoneNumber: number): Observable<boolean> {
        return this.globalService.call(
            RequestType.POST,
            this.globalService.url.account_validation_sms + email + '/' + phoneNumber
        );
    }
    getValidationCode(email: string): Observable<string> {
        return this.globalService.call(
            RequestType.GET,
            this.globalService.url.account_validation_code + email
        );
    }



}
