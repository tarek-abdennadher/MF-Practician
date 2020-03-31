import { Component, OnInit } from "@angular/core";
import { takeUntil, tap } from "rxjs/operators";
import { Subject, forkJoin } from "rxjs";
import { RequestTypeService } from "../services/request-type.service";
import { MessageService } from "../services/message.service";
import { GlobalService } from "@app/core/services/global.service";
import { v4 as uuid } from "uuid";
import { NodeeService } from "../services/node.service";
import { Router } from "@angular/router";
import { Message } from "@app/shared/models/message";
import { ContactsService } from "../services/contacts.service";
import { FeaturesService } from "../features.service";
import { Location } from "@angular/common";

@Component({
  selector: "app-send-message",
  templateUrl: "./send-message.component.html",
  styleUrls: ["./send-message.component.scss"]
})
export class SendMessageComponent implements OnInit {
  public uuid: string;
  private _destroyed$ = new Subject();
  imageSource = "assets/imgs/IMG_3944.jpg";
  connectedUserType = "MEDICAL";
  connectedUser = "";
  toList = [];
  objectsList = [];
  practician = [];
  children = [];
  selectedFiles: any;
  angular: any;
  constructor(
    private featureService: FeaturesService,
    private _location: Location,
    private contactsService: ContactsService,
    private requestTypeService: RequestTypeService,
    private messageService: MessageService,
    private globalService: GlobalService,
    private nodeService: NodeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    forkJoin(this.getAllContactsPractician(), this.getAllRequestTypes())
      .pipe(takeUntil(this._destroyed$))
      .subscribe(res => {});
  }

  getAllContactsPractician() {
    return this.contactsService
      .getAllContactsPractician()
      .pipe(takeUntil(this._destroyed$))
      .pipe(
        tap((contactsPractician: any) => {
          this.parseContactsPractician(contactsPractician);
        })
      );
  }

  parseContactsPractician(contactsPractician) {
    contactsPractician.forEach(contactPractician => {
      this.toList.push({
        id: contactPractician.id,
        fullName: contactPractician.fullName,
        type: contactPractician.contactType
      });
    });
  }

  getAllRequestTypes() {
    return this.requestTypeService
      .getAllRequestTypes()
      .pipe(takeUntil(this._destroyed$))
      .pipe(
        tap((requestTypes: any) => {
          this.objectsList = requestTypes;
        })
      );
  }

  sendMessage(message) {
    if (message.to !== "" && message.body != "") {
      this.uuid = uuid();
      const newMessage = new Message();
      message.to.forEach(to => {
        newMessage.toReceivers.push({ receiverId: to.id });
      });
      message.cc.forEach(cc => {
        newMessage.ccReceivers.push({ receiverId: cc.id });
      });
      newMessage.sender = {
        senderId: this.featureService.getUserId()
      };
      newMessage.object = message.object.name;
      newMessage.body = message.body;
      if (message.file !== undefined) {
        newMessage.uuid = this.uuid;
        this.selectedFiles = message.file;

        const formData = new FormData();
        if (this.selectedFiles) {
          formData.append("model", JSON.stringify(newMessage));
          formData.append(
            "file",
            this.selectedFiles.item(0),
            this.selectedFiles.item(0).name
          );
        }

        this.nodeService
          .saveFileInMemory(this.uuid, formData)
          .pipe(takeUntil(this._destroyed$))
          .subscribe(mess => {
            this.router.navigate(["/features/messageries", "success"]);
          });
      } else {
        this.messageService
          .sendMessage(newMessage)
          .pipe(takeUntil(this._destroyed$))
          .subscribe(
            mess => {
              this.router.navigate(["/features/messageries", "success"]);
            },
            error => {
              this.router.navigate(["/features/messageries", "success"]);
            }
          );
      }
    }
  }

  // destory any subscribe to avoid memory leak
  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
}
