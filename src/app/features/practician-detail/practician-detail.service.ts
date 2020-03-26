import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GlobalService } from '@app/core/services/global.service';
import { RequestType } from '@app/shared/enmus/requestType';

@Injectable({
  providedIn: 'root'
})
export class PracticianDetailService {

  constructor(private globalService: GlobalService) { }
  getPracticiansById(id): Observable<any> {
    return this.globalService.call(
        RequestType.GET,
        this.globalService.url.practician + id
    );
  }
  addPracticianToFavorite(practicianId) {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.patient + 'addFavorite/' + practicianId
    )
  }
  getFavoritePracticians(patientId) {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.patient + patientId + "/favoritesPractician"
    )
  }
}
