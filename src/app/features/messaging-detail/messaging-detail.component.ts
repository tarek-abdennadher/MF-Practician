import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MessagingDetailService } from "./messaging-detail.service";

@Component({
  selector: "app-messaging-detail",
  templateUrl: "./messaging-detail.component.html",
  styleUrls: ["./messaging-detail.component.scss"]
})
export class MessagingDetailComponent implements OnInit {
  role: string = "MEDICAL";
  imageSource: string = "assets/imgs/user.png";
  isFromInbox = true;
  messagingDetail: any;
  links = {
    isSeen: true,
    isArchieve: true,
    isImportant: true
  };
  constructor(
    private route: ActivatedRoute,
    private messagingDetailService: MessagingDetailService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.getMessageDetailById(params["id"]);
    });
  }
  getMessageDetailById(id) {
    this.messagingDetailService
      .getMessagingDetailById(id)
      .subscribe(message => {
        this.messagingDetail = message;
      });
  }
}
