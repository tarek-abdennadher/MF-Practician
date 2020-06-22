import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FeaturesService } from '@app/features/features.service';

@Injectable()
export class ResponseInterceptor implements HttpInterceptor {
  constructor(
    private localSt: LocalStorageService,
    private router: Router, private featureService: FeaturesService) {
  }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        const token = this.localSt.retrieve("token");
        if (error.status === 401 && (token != null) && (this.featureService.getExpiretime().getTime() <= (new Date()).getTime())) {
          this.router.navigate(["/connexion"]);
        } else {
          return throwError(error);
        }
      })
    );
  }
}
