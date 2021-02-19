import { Injectable } from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewMessageWidgetService {

  toggleObs = new Subject();
  isPatientFileNewMessageWidget = new BehaviorSubject(false);
  constructor() { }
}
