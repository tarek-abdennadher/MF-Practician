import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-messaging-detail-print',
  templateUrl: './messaging-detail-print.component.html',
  styleUrls: ['./messaging-detail-print.component.scss']
})
export class MessagingDetailPrintComponent implements OnInit {
  @Input("messagingDetail") public messagingDetail;
  @Input("role") role: string;
  @Input("imageSource") imageSource: string;
  @Input("isFromInbox") isFromInbox: boolean;
  @Input("senderRolePatient") senderRolePatient: boolean = false;
  @Input("hideTo") hideTo: boolean = false;
  @Input("hidefrom") hidefrom: boolean = false;
  @Input("attachements") attachements: any[] = [];
  @Input("userAccountId") userAccountId: number = 0;
  @Input("isPrinting") isPrinting: boolean = false;
  @Input("showAcceptRefuse") showAcceptRefuse: boolean = true;
  @Input("showRefuseForTls") showRefuseForTls: boolean = false;
  @Input("showReplyActionsForPatient") showReplyActionsForPatient: boolean = false;
  @Input("showReplyActionsForTls") showReplyActionsForTls: boolean = false;
  @Input("hideButtons") hideButtons: boolean = false;
  constructor() { }

  ngOnInit(): void {
  }

}
