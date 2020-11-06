import { Injectable } from "@angular/core";
import { HttpRequest, HttpResponse } from "@angular/common/http";
import { environment } from "./../../../environments/environment";
import { CachedURLs } from "./cachedURLs.service";
const maxAge = 300000;
@Injectable({
  providedIn: "root"
})
export class RequestCache {
  constructor(private urls: CachedURLs) {}
  cache = new Map();

  get(req: HttpRequest<any>): HttpResponse<any> | undefined {
    const url = req.urlWithParams;
    const cached = this.cache.get(url);

    if (!cached) {
      return undefined;
    }

    const isExpired = cached.lastRead < Date.now() - maxAge;
    const expired = isExpired ? "expired " : "";
    return cached.response;
  }

  put(req: HttpRequest<any>, response: HttpResponse<any>): void {
    const url = req.url;
    const entry = { url, response, lastRead: Date.now() };
    this.cache.set(url, entry);

    const expired = Date.now() - maxAge;
    this.cache.forEach(expiredEntry => {
      if (expiredEntry.lastRead < expired) {
        this.cache.delete(expiredEntry.url);
      }
    });
  }

  safeDelete(url: string) {
    if (this.cache.has(url)) {
      this.cache.delete(url);
    }
  }
  safeDeleteAvatar(accountId) {
    this.safeDelete(
      environment.BASE_END_POINT + this.urls.cachedURLs[0] + accountId
    );
  }
}
