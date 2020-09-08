import { Injectable } from '@angular/core';
import { HttpEvent, HttpRequest, HttpResponse, HttpInterceptor, HttpHandler } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { RequestCache } from '../services/request-cache.service';
import { CachedURLs } from '../services/cachedURLs.service';
import { UtilsService } from '../services/utils.service';

@Injectable()
export class CachingInterceptor implements HttpInterceptor {
  private cachedURLList: string[];

  constructor(private cache: RequestCache, private cachedURLs: CachedURLs, private utils: UtilsService) {
    this.cachedURLList = this.cachedURLs.getList();
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if ('GET'.includes(req.method)) {
      const cachedResponse = this.cache.get(req);
      // return the cached response if there is one othewise send new request and cache its response
      return cachedResponse ? of(cachedResponse) : this.sendRequest(req, next, this.cache);
    } else {
      return this.sendRequest(req, next, this.cache);
    }
  }

  sendRequest(
    req: HttpRequest<any>,
    next: HttpHandler,
    cache: RequestCache): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          const fullPathNames = this.utils.parseURL(req.url).pathname;
          const getMatches = this.matchesCachedList(fullPathNames, "[0-9]+$");
          if (getMatches && 'GET'.includes(req.method)) {
            cache.put(req, event);
          }
        }
      }));
  }

  private matchesCachedList(fullPathNames: string, regExpSuffix: string) {
    return this.cachedURLList.some(
      path => {
        const results = fullPathNames.match("^" + path + regExpSuffix);
        return (typeof results != 'undefined' && results instanceof Array)
      });
  }

}
