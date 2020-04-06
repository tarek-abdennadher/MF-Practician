import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MessagingDetailService } from "../services/messaging-detail.service";
import { GlobalService } from "@app/core/services/global.service";
import { Location } from "@angular/common";
@Component({
  selector: "app-messaging-detail",
  templateUrl: "./messaging-detail.component.html",
  styleUrls: ["./messaging-detail.component.scss"]
})
export class MessagingDetailComponent implements OnInit {
  role: string = "MEDICAL";
  imageSource: string = "assets/imgs/user.png";
  isFromInbox = true;
  senderRolePatient = true;
  messagingDetail: any;
  idMessage: number;
  links = {
    isSeen: true,
    isArchieve: true,
    isImportant: true
  };

  page = this.globalService.messagesDisplayScreen.inbox;
  number = 0;
  topText = this.globalService.messagesDisplayScreen.Mailbox;
  bottomText = this.globalService.messagesDisplayScreen.newMessage;
  backButton = true;
  constructor(
    private _location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private messagingDetailService: MessagingDetailService,
    private globalService: GlobalService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.idMessage = params["id"];
      this.getMessageDetailById(this.idMessage);
    });
  }

  getMessageDetailById(id) {
    this.messagingDetailService
      .getMessagingDetailById(id)
      .subscribe(message => {
        this.messagingDetail = message;
      });
  }

  replyAction() {
    this.router.navigate(["/features/messagerie-repondre/", this.idMessage]);
  }

  acceptAction() {
    this.router.navigate(["/features/messagerie-repondre/", this.idMessage]);
  }

  refuseAction() {
    this.router.navigate(["/features/messagerie-repondre/", this.idMessage], {
      queryParams: {
        status: "refus"
      }
    });
  }

  goToBack() {
    this._location.back();
  }
}
