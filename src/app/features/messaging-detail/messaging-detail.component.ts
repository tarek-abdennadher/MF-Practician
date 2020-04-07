import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MessagingDetailService } from "../services/messaging-detail.service";
import { GlobalService } from "@app/core/services/global.service";
import { Location } from "@angular/common";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { FeaturesService } from "../features.service";
import { NotifierService } from "angular-notifier";
@Component({
  selector: "app-messaging-detail",
  templateUrl: "./messaging-detail.component.html",
  styleUrls: ["./messaging-detail.component.scss"],
})
export class MessagingDetailComponent implements OnInit {
  private _destroyed$ = new Subject();
  role: string = "MEDICAL";
  imageSource: string = "assets/imgs/user.png";
  isFromInbox = true;
  senderRolePatient = true;
  messagingDetail: any;
  idMessage: number;
  links: any;

  page = this.globalService.messagesDisplayScreen.inbox;
  number = 0;
  topText = this.globalService.messagesDisplayScreen.Mailbox;
  bottomText =
    this.number > 1
      ? this.globalService.messagesDisplayScreen.newMessages
      : this.globalService.messagesDisplayScreen.newMessage;
  backButton = true;
  private readonly notifier: NotifierService;
  @ViewChild("customNotification", { static: true }) customNotificationTmpl;
  constructor(
    private _location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private messagingDetailService: MessagingDetailService,
    private globalService: GlobalService,
    private featureService: FeaturesService,
    notifierService: NotifierService
  ) {
    this.notifier = notifierService;
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.idMessage = params["id"];
      this.getMessageDetailById(this.idMessage);
    });
  }

  getMessageDetailById(id) {
    this.messagingDetailService
      .getMessagingDetailById(id)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((message) => {
        this.messagingDetail = message;
        this.links = {
          isArchieve: true,
          isImportant: !message.important,
          isAddNote: true,
        };
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
        status: "refus",
      },
    });
  }

  importantAction() {
    let ids = [];
    ids.push(this.idMessage);
    this.messagingDetailService
      .markMessageAsImportant(ids)
      .pipe(takeUntil(this._destroyed$))
      .subscribe(
        (message) => {
          this.notifier.show({
            message: this.globalService.toastrMessages
              .mark_important_message_success,
            type: "info",
            template: this.customNotificationTmpl,
          });
        },
        (error) => {
          this.notifier.show({
            message: this.globalService.toastrMessages
              .mark_important_message_error,
            type: "error",
            template: this.customNotificationTmpl,
          });
        }
      );
  }

  archieveActionClicked() {
    console.log("te");
    let ids = [];
    ids.push(this.idMessage);
    this.featureService.numberOfArchieve =
      this.featureService.numberOfArchieve + 1;
    this.messagingDetailService.markMessageAsArchived(ids).subscribe(
      (resp) => {
        this.notifier.show({
          message: this.globalService.toastrMessages.archived_message_success,
          type: "info",
          template: this.customNotificationTmpl,
        });
      },
      (error) => {
        this.notifier.show({
          message: this.globalService.toastrMessages.archived_message_error,
          type: "error",
          template: this.customNotificationTmpl,
        });
      }
    );
  }

  goToBack() {
    this._location.back();
  }

  // destory any subscribe to avoid memory leak
  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
}
