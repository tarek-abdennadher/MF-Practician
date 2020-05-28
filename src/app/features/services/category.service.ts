import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { GlobalService } from "@app/core/services/global.service";
import { RequestType } from "@app/shared/enmus/requestType";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CategoryService {
  constructor(public router: Router, public globalService: GlobalService) { }

  addCategory(category): Observable<any> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.category,
      category
    );
  }

  deleteCategory(id): Observable<any> {
    return this.globalService.call(
      RequestType.PUT,
      this.globalService.url.category + "/" + id
    );
  }

  updateCategory(category): Observable<any> {
    return this.globalService.call(
      RequestType.PUT,
      this.globalService.url.category,
      category
    );
  }

  getMyCategories(): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.category + "/my"
    );
  }

  getCategoriesByPractician(id: number) {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.category + "/practician/" + id
    );
  }

  getCategoryById(id): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.category + "/" + id
    );
  }
}
