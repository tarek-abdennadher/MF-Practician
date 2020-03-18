import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "@env/environment";
import { Observable } from "rxjs";
import { RequestType } from "@app/shared/enmus/requestType";

@Injectable()
export class GlobalService {
  constructor(private httpClient: HttpClient) {}
  public BASE_URL: string = environment.BASE_END_POINT;
  public BASE_URL_CA: string =
    environment.BASE_END_POINT + "/ms-coreapplication";
  public BASE_URL_MA: string = this.BASE_URL + "/ms-messagingapplication";
  private BASE_URL_FL: string = this.BASE_URL + "/filer";
  public BASE_URL_SMS: string =
    environment.BASE_END_POINT + "/ms-smsapplication";
  public url = {
    base: this.BASE_URL,
    authenticate: this.BASE_URL + "/api/authenticate",
    accountlogin: this.BASE_URL_CA + "/account/light/",
    practiciens: this.BASE_URL_CA + "/practician",
    requestTypes: this.BASE_URL_CA + "/requestTypes",
    message: this.BASE_URL_MA + "/messages/produce",
    sentMessage: this.BASE_URL_MA + "/messages/sender",
    node: this.BASE_URL_FL + "/node",
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
    receiver: this.BASE_URL_MA + "/receivers/"
  };
  public toastrMessages = {
    send_message_success: "Message envoyé. ",
    send_message_error: "Votre message n'a pas pu été envoyé"
  };
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
}
