import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  constructor() { }

  public getDate(object: any): string {
    let day = object.getDate() + '';
    let month = object.getMonth() + 1 + '';
    const year = object.getFullYear() + '';
    if (month.length < 2) {
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }
    const result = [day, month, year].join('/');
    return result;
  }

  public parseURL(url) {
    let parser = document.createElement('a'),
      searchObject = {},
      queries, split, i;
    // Let the browser do the work
    parser.href = url;
    // Convert query string to object
    queries = parser.search.replace(/^\?/, '').split('&');
    for (i = 0; i < queries.length; i++) {
      split = queries[i].split('=');
      searchObject[split[0]] = split[1];
    }
    return {
      protocol: parser.protocol,
      host: parser.host,
      hostname: parser.hostname,
      port: parser.port,
      pathname: parser.pathname,
      search: parser.search,
      searchObject: searchObject,
      hash: parser.hash
    };
  }

  public removeIdFromUrl(url) {
    // delete the /id of the end of the string
    return url.substring(0, url.lastIndexOf('/'));
  }
}
