import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private localSt: LocalStorageService
  ) { }
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
      const token = this.localSt.retrieve('token');
      if (token != null) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      return next.handle(request);
  }
}
