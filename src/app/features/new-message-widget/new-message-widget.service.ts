import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewMessageWidgetService {

  toggleObs = new Subject();
  constructor() { }
}
