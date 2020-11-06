import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotifierService } from 'angular-notifier';
import { GlobalService } from '../services/global.service';

@Injectable()
export class ResponseInterceptor implements HttpInterceptor {
  private readonly notifier: NotifierService;
  private excludedExceptions = [];

  constructor(
    private localSt: LocalStorageService,
    private router: Router,
    private globalService: GlobalService,
    private notifierService: NotifierService,) {
    this.notifier = notifierService;
    this.excludedExceptions = this.globalService.excludedExceptions;
  }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        switch (error.status) {
          case 401:
            if (error && error.error && error.error.apierror && this.excludedExceptions.includes(error.error.apierror.message)) {
              return throwError(error);
            } else {
              this.router.navigate(["/connexion"]);
            }
            break;
          case 403:
            this.router.navigate(["/forbidden"]);
            break;
          case 500:
            this.setNotif("Une erreur s’est produite et l'équipe travail dessus.", "error");
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
