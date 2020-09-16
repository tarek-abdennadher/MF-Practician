import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CachedURLs {

  cachedURLs = [
    '/ms-coreapplication/photo/generate/',
    '/ms-filer/node/',
  ];

  getList(): string[] {
    return this.cachedURLs;
  }
}
