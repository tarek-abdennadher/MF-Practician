import { Injectable } from "@angular/core";
import { RequestType } from "@app/shared/enmus/requestType";
import { GlobalService } from "@app/core/services/global.service";
import { Observable } from "rxjs";
import { Message } from '@app/shared/models/message';

@Injectable({
  providedIn: "root"
})
export class MessageService {
  constructor(private globalService: GlobalService) {}

  ngOnInit() {}


  sentMessage(): Observable<Array<Message>> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.sentMessage
    );
  }
}
