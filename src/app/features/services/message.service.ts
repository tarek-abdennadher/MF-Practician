import { Injectable } from "@angular/core";
import { RequestType } from "@app/shared/enmus/requestType";
import { GlobalService } from "@app/core/services/global.service";
import { Observable } from "rxjs";
import { Message } from "@app/shared/models/message";
import { OrderDirection } from "@app/shared/enmus/order-direction";

@Injectable({
  providedIn: "root"
})
export class MessageService {
  constructor(private globalService: GlobalService) {}

  ngOnInit() {}

  sentMessage(pageNo?, order?: OrderDirection): Observable<Array<Message>> {
    let params = {};
    if (pageNo && order) {
      params = { params: { pageNo: pageNo, order: order } };
    }
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.sentMessage,
      params
    );
  }

  sentFirstMessage(listSize: number, pageNo?, order?: OrderDirection): Observable<Array<Message>> {
    let params = {};
    if (pageNo && order) {
      params = { params: { 'pageNo': pageNo, 'order': order } }
    }
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.sentMessage+"/listSize/" + listSize, params
    );
  }

  forwardedMessage(
    pageNo?,
    order?: OrderDirection
  ): Observable<Array<Message>> {
    let params = {};
    if (pageNo != undefined && order != undefined) {
      params = { params: { pageNo: pageNo, order: order } };
    }
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.forwardedMessage,
      params
    );
  }

  forwardedFirstMessage(listSize: number, pageNo?, order?: OrderDirection): Observable<Array<Message>> {
    let params = {};
    if (pageNo && order) {
      params = { params: { 'pageNo': pageNo, 'order': order } }
    }
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.forwardedMessage+"/listSize/" + listSize, params
    );
  }

  countForwardedMessage(): Observable<number> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.messages + "countForwarded"
    );
  }

  countSentMessage(): Observable<number> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.messages + "countSentInBox"
    );
  }

  replyMessageWithFile(formData): Observable<any> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.replyMessage,
      formData,
      {
        reportProgress: true,
        responseType: "text"
      }
    );
  }
  replyMessage(formData): Observable<any> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.message,
      formData
    );
  }

  sendMessage(message: Message): Observable<Message> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.message,
      message
    );
  }

  public markMessageAsArchived(ids: number[]): Observable<number> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.url.messages + "archive/all",
      ids
    );
  }
}
