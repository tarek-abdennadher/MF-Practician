import { Injectable } from "@angular/core";
import { Resolve, ActivatedRouteSnapshot, ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { MessagingDetailService } from './messaging-detail.service';

@Injectable()
export class MessagingDetailResolve implements Resolve<any> {
  constructor(private messagingDetailService: MessagingDetailService, private router: ActivatedRoute) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.messagingDetailService.getMessagingDetailById(route.paramMap.get('id'));
  }
}
