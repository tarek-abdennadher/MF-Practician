import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class CachedURLs {
  //do not change index of these two urls
  cachedURLs = ["/ms-coreapplication/photo/generate/", "/ms-filer/node/"];

  getList(): string[] {
    return this.cachedURLs;
  }
}
