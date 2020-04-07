import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MessagingDetailService } from "../services/messaging-detail.service";
import { GlobalService } from "@app/core/services/global.service";
import { Location } from "@angular/common";
import { MyDocumentsService } from '../my-documents/my-documents.service';
import * as FileSaver from "file-saver";

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
    private globalService: GlobalService,
    private documentService:MyDocumentsService
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

  download(nodesId:Array<string>)
  {
    nodesId.forEach(nodeId => {
      var nodeDetails;
      this.documentService.getNodeDetailsFromAlfresco(nodeId).subscribe(node => {
        nodeDetails = node;
      });

      this.documentService
      .downloadFile(nodeId)
      .subscribe(response => {
        const blob = new Blob([response.body]);
        const filename = nodeDetails.entry.name;
        const filenameDisplay = filename;
        const dotIndex = filename.lastIndexOf(".");
        const extension = filename.substring(dotIndex + 1, filename.length);
        let resultname: string;
        if (filenameDisplay !== "") {
          resultname = filenameDisplay.includes(extension)
            ? filenameDisplay
            : filenameDisplay + "." + extension;
        } else {
          resultname = filename;
        }
        FileSaver.saveAs(blob, resultname);
      });
  });
}
}
