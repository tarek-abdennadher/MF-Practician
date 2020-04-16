import { Injectable } from "@angular/core";
import { LocalStorageService } from "ngx-webstorage";
import { Router } from "@angular/router";
import { GlobalService } from "./global.service";
import { RequestType } from "@app/shared/enmus/requestType";
import { ReplaySubject, Subject, from, Observable } from "rxjs";
import { CometChat } from "@cometchat-pro/chat";
import { filter, tap } from "rxjs/operators";
import { environment } from "@env/environment";
@Injectable()
export class LoginService {
  user: any;
  public result;
  private initialized: Subject<boolean> = new ReplaySubject<boolean>();
  private incomingCall$: Subject<any> = new ReplaySubject();
  private outgoingCall$: Subject<any> = new ReplaySubject();
  private ongoingCall$: Subject<any> = new ReplaySubject();
  private users$: Subject<any> = new ReplaySubject();
  private signedIn: string;

  constructor(
    public router: Router,
    public localSt: LocalStorageService,
    public globalService: GlobalService
  ) {
    CometChat.init(environment.appId).then(
      (_) => {
        console.log("Comet Chat initialized.");
        this.initialized.next(true);
      },
      (error) => {
        console.log("Initialization error: " + error);
      }
    );

    this.ongoingCall$.pipe(filter((call) => !!call)).subscribe((call) => {
      CometChat.startCall(
        call.sessionId,
        document.getElementById("callScreen"),
        //@ts-ignore
        new CometChat.OngoingCallListener({
          onCallEnded: (call) => {
            this.ongoingCall$.next(null);
          },
        })
      );
    });
  }
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
    register: "S'inscrire",
    new_patient_registration: "Vous êtes un patient ?",
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

  initializedChat(email) {
    console.log("test 1");

    CometChat.login("SUPERHERO1", environment.apiKey).then(
      (user) => {
        console.log("test");
        this.retrieveUsers();
        CometChat.addCallListener(
          "CALL_LISTENER_ID",
          //@ts-ignore
          new CometChat.CallListener({
            onIncomingCallReceived: (call) => {
              this.incomingCall$.next(call);
            },
            onOutgoingCallAccepted: (call) => {
              this.ongoingCall$.next(call);
              this.outgoingCall$.next(null);
            },
            onOutgoingCallRejected: (_) => {
              this.outgoingCall$.next(null);
              this.incomingCall$.next(null);
            },
            onIncomingCallCancelled: (call) => {
              this.incomingCall$.next(null);
            },
          })
        );

        CometChat.addUserListener(
          "USER_LISTENER_ID",
          //@ts-ignore
          new CometChat.UserListener({
            onUserOnline: (_) => this.retrieveUsers(),
            onUserOffline: (_) => this.retrieveUsers(),
          })
        );
      },
      (error) => {
        console.log("Login failed with exception:", { error });
      }
    );
  }

  private retrieveUsers(): void {
    new CometChat.UsersRequestBuilder()
      .setLimit(20)
      .build()
      .fetchNext()
      .then((response) => {
        this.users$.next(response);
      });
  }

  public getUsers(): Observable<any> {
    return this.users$;
  }

  public startVoiceCall(receiverID: string): Observable<any> {
    const call = new CometChat.Call(
      receiverID,
      CometChat.CALL_TYPE.AUDIO,
      CometChat.RECEIVER_TYPE.USER
    );
    return from(CometChat.initiateCall(call)).pipe(
      tap((call) => this.outgoingCall$.next(call))
    );
  }

  public startVideoCall(receiverID: string): Observable<any> {
    if (!this.signedIn) {
      throw new Error("Not logged in.");
    }
    const call = new CometChat.Call(
      receiverID,
      CometChat.CALL_TYPE.VIDEO,
      CometChat.RECEIVER_TYPE.USER
    );
    return from(CometChat.initiateCall(call));
  }
  public accept(sessionId: string): Observable<any> {
    return from(CometChat.acceptCall(sessionId)).pipe(
      tap((call) => {
        this.incomingCall$.next(null);
        this.ongoingCall$.next(call);
      })
    );
  }
  public reject(sessionId: string): Observable<any> {
    return from(
      CometChat.rejectCall(sessionId, CometChat.CALL_STATUS.REJECTED)
    ).pipe(
      tap((_) => {
        this.incomingCall$.next(null);
      })
    );
  }

  public getSignedIn(): string {
    return this.signedIn;
  }

  public getIncomingCalls(): Observable<any> {
    return this.incomingCall$;
  }

  public getOutgoingCalls(): Observable<any> {
    return this.outgoingCall$;
  }

  public getOngoingCalls(): Observable<any> {
    return this.ongoingCall$;
  }
}
