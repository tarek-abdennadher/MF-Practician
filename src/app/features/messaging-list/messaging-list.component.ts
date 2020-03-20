import { Component, OnInit } from '@angular/core';
import { MessagingListService } from './messaging-list.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-messaging-list',
  templateUrl: './messaging-list.component.html',
  styleUrls: ['./messaging-list.component.scss']
})
export class MessagingListComponent implements OnInit {
  imageSource = "assets/imgs/IMG_3944.jpg";
  messages: Array<any>;
  itemsList: Array<any>;
  links = {
    isAllSeen: true,
    isSeen: true,
    isArchieve: true,
    isImportant: true
    // isFilter: true
  };
  constructor(private messagesServ: MessagingListService, public router: Router) { }

  ngOnInit(): void {
    this.itemsList = new Array();
    this.getMyInbox();
  }

  cardClicked(item) {
    this.markMessageAsSeen(item);
    this.router.navigate(["/features/detail/" + item.id]);
  }

  selectAllActionClicked() {
    console.log("selectAllAction");
  }
  seenActionClicked() {
    console.log("seenAction");
  }
  seenAllActionClicked() {
    console.log("seenAllAction");
  }
  importantActionClicked() {
    console.log("importantAction");
  }
  deleteActionClicked() {
    console.log("deleteAction");
  }
  archieveActionClicked() {
    console.log("archieveAction");
  }
  addNoteActionClicked() {
    console.log("addNoteAction");
  }
  filterActionClicked(event) {
    console.log(event);
  }

  getMyInbox() {
      this.messagesServ.getMyInbox().subscribe(retrievedMess => {
        this.messages = retrievedMess;
        this.messages.sort(function(m1, m2) {
          return new Date(m2.updatedAt).getTime()- new Date(m1.updatedAt).getTime()
        })
        this.itemsList = this.messages.map(item => this.parseMessage(item));
      })
  }

  parseMessage(message): any {
    return {
      id: message.id,
      isSeen: message.seenAsReceiver,
      users: [
        {
          id: message.sender.id,
          fullName: message.sender.fullName,
          img: "assets/imgs/IMG_3944.jpg",
          title: message.sender.jobTitle,
          type: message.sender.title != "" ? "MEDICAL" : "PATIENT"
        }
      ],
      object: {
        name: message.object,
        isImportant: message.importantObject
      },
      time: message.updatedAt,
      isImportant: message.important,
      hasFiles: message.hasFiles,
      isViewDetail: message.hasViewDetail,
      isMarkAsSeen: true,
      isArchieve: true
    };
  }

  markMessageAsSeen(event) {
    let messageId = event.id;
    this.messagesServ.markMessageAsSeen(messageId).subscribe(
      resp => {
        if (resp == true) {
          let index = this.itemsList.findIndex(item => item.id == messageId);
          if (index != -1) {
            this.itemsList[index].isSeen = true;
          }
        }
      },
      error => {
        console.log("We have to find a way to notify user by this error");
      }
    );
  }

  archieveMessage(event) {
    let messageId = event.id;
    this.messagesServ.markMessageAsArchived(messageId).subscribe(
      resp => {
        this.itemsList = this.itemsList.filter(function(elm, ind) {
          return elm.id != event.id;
        });
      },
      error => {
        console.log("We have to find a way to notify user by this error");
      }
    );
  }

}
