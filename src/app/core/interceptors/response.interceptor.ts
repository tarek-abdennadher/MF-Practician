import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FeaturesService } from '@app/features/features.service';
import { NotifierService } from 'angular-notifier';

@Injectable()
export class ResponseInterceptor implements HttpInterceptor {
  private readonly notifier: NotifierService;
  constructor(
    private localSt: LocalStorageService,
    private router: Router,
    private notifierService: NotifierService,) {
    this.notifier = notifierService;
  }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        switch (error.status) {
          case 401:
            this.router.navigate(["/connexion"]);
            break;
          case 500 :
            this.setNotif("Une erreur s’est produite et l'équipe travail dessus.", "error");
            // console.log("500");
            // send notification
            break;
          default:
            return throwError(error);
        }
      })
    );
  }

  setNotif(msg, type) {
    this.notifier.notify(type, msg, "0");
  }
}
