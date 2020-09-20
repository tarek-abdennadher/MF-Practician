import { Injectable } from "@angular/core";
import { GlobalService } from "@app/core/services/global.service";
import { Observable, BehaviorSubject } from "rxjs";
import { RequestType } from "@app/shared/enmus/requestType";
import { search } from "./search.model";

@Injectable({
  providedIn: "root",
})
export class PracticianSearchService {
  private searchSource = new BehaviorSubject(new search());
  currentSearch = this.searchSource.asObservable();

  text: string;
  city: string;
  texts = {
    searchText: "Nom, prénom, spécialité",
    city: "Ville",
    edit: "Modifier ma recherche",
    question: "Vous ne trouvez pas un praticien ? ",
    response: "Envoyez lui une invitation !",
    return_chat: "Retour à la messagerie",
    add_text: "Vous ne trouvez pas un praticien ? Envoyez lui une invitation !",
  };
  constructor(private globalService: GlobalService) {}
  getPracticiansBytextAndCity(text, city): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.practician + "practicians/" + text + "/" + city
    );
  }
  getPracticiansByCity(city): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.practician + "practicians/address/" + city
    );
  }
  getAllPracticians(): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.practician + "practicians"
    );
  }
  changeSearch(search: search) {
    this.searchSource.next(search);
  }
  getSearchListPractician(): Observable<any> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.practician + "practician-search"
    );
  }
}
