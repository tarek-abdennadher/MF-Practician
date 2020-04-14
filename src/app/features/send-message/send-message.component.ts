import { Component, OnInit, ViewChild } from "@angular/core";
import { takeUntil, tap } from "rxjs/operators";
import { Subject, forkJoin } from "rxjs";
import { RequestTypeService } from "../services/request-type.service";
import { MessageService } from "../services/message.service";
import { GlobalService } from "@app/core/services/global.service";
import { v4 as uuid } from "uuid";
import { NodeeService } from "../services/node.service";
import { Router, ActivatedRoute } from "@angular/router";
import { Message } from "@app/shared/models/message";
import { ContactsService } from "../services/contacts.service";
import { FeaturesService } from "../features.service";
import { Location } from "@angular/common";
import { LocalStorageService } from "ngx-webstorage";
import { NotifierService } from "angular-notifier";

@Component({
  selector: "app-send-message",
  templateUrl: "./send-message.component.html",
  styleUrls: ["./send-message.component.scss"],
})
export class SendMessageComponent implements OnInit {
  public uuid: string;
  private _destroyed$ = new Subject();
  imageSource = "assets/imgs/IMG_3944.jpg";
  connectedUserType = "MEDICAL";
  user = this.localSt.retrieve("user");
  connectedUser = "PR " + this.user?.firstName + " " + this.user?.lastName;
  toList: Subject<any[]> = new Subject<any[]>();
  forList = [];
  objectsList = [];
  selectedFiles: any;
  links = {};
  page = this.globalService.messagesDisplayScreen.inbox;
  topText = this.globalService.messagesDisplayScreen.writeMessage;
  backButton = true;
  selectedPracticianId: number;
  @ViewChild("customNotification", { static: true }) customNotificationTmpl;
  private readonly notifier: NotifierService;
  constructor(
    private globalService: GlobalService,
    private localSt: LocalStorageService,
    private featureService: FeaturesService,
    private _location: Location,
    private contactsService: ContactsService,
    private requestTypeService: RequestTypeService,
    private messageService: MessageService,
    private nodeService: NodeeService,
    private router: Router,
    public route: ActivatedRoute,
    notifierService: NotifierService
  ) {
    this.route.queryParams.subscribe((params) => {
      this.selectedPracticianId = params["id"] || null;
    });
    this.notifier = notifierService;
  }

  ngOnInit(): void {
    if (this.localSt.retrieve("role") == "SECRETARY") {
      this.featureService.myPracticians.subscribe(
        (val) => (this.forList = val)
      );
    }
    forkJoin(this.getAllContactsPractician(), this.getAllRequestTypes())
      .pipe(takeUntil(this._destroyed$))
      .subscribe((res) => {});
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
    let myList = [];
    contactsPractician.forEach((contactPractician) => {
      myList.push({
        id: contactPractician.id,
        fullName: contactPractician.fullName,
        type: contactPractician.contactType,
        isSelected:
          this.selectedPracticianId == contactPractician.id ? true : false,
      });
    });
    this.toList.next(myList);
    console.log(myList);
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
    this.uuid = uuid();
    const newMessage = new Message();
    message.to.forEach((to) => {
      newMessage.toReceivers.push({ receiverId: to.id });
    });
    message.cc
      ? message.cc.forEach((cc) => {
          newMessage.ccReceivers.push({ receiverId: cc.id });
        })
      : null;

    newMessage.sender = {
      senderId: this.featureService.getUserId(),
      originalSenderId: this.featureService.getUserId(),
      sendedForId: message.for && message.for.id ? message.for.id : null,
    };
    message.object != "" &&
    message.object.name.toLowerCase() !=
      this.globalService.messagesDisplayScreen.other
      ? (newMessage.object = message.object.name)
      : (newMessage.object = message.freeObject);
    newMessage.body = message.body;
    if (message.file !== undefined) {
      newMessage.uuid = this.uuid;
      this.selectedFiles = message.file;

      const formData = new FormData();
      if (this.selectedFiles) {
        newMessage.hasFiles = true;
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
        .subscribe(
          (mess) => {
            this.router.navigate(["/features/messageries"], {
              queryParams: {
                status: "sentSuccess",
              },
            });
          },
          (error) => {
            this.notifier.show({
              message: this.globalService.toastrMessages.send_message_error,
              type: "error",
              template: this.customNotificationTmpl,
            });
          }
        );
    } else {
      this.messageService
        .sendMessage(newMessage)
        .pipe(takeUntil(this._destroyed$))
        .subscribe(
          (mess) => {
            this.router.navigate(["/features/messageries"], {
              queryParams: {
                status: "sentSuccess",
              },
            });
          },
          (error) => {
            this.notifier.show({
              message: this.globalService.toastrMessages.send_message_error,
              type: "error",
              template: this.customNotificationTmpl,
            });
          }
        );
    }
  }
  addProContactAction() {
    this.router.navigate(["/features/search"]);
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
