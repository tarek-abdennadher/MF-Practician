import { Component, OnInit } from "@angular/core";
import { speedDialFabAnimations } from "./new-message-widget.animations";
import { GlobalService } from "@app/core/services/global.service";
import { NewMessageWidgetService } from "./new-message-widget.service";

@Component({
  selector: "app-new-message-widget",
  templateUrl: "./new-message-widget.component.html",
  styleUrls: ["./new-message-widget.component.scss"],
  animations: speedDialFabAnimations,
})
export class NewMessageWidgetComponent implements OnInit {
  fabButtons = [
    {
      icon: "lock",
    },
  ];
  buttons = [];
  fabTogglerState = "inactive";
  messages: any;
  id: number;
  isContact: boolean = false;

  toggle: boolean = false;
  minimize = {
    height: "1.5rem",
    position: "fixed",
    bottom: 0,
    overflow: "hidden",
  };
  isReceiverPatient:boolean;
  maximize = {};
  constructor(
    private globalService: GlobalService,
    private messageWidgetService: NewMessageWidgetService
  ) {
    this.messages = this.globalService.messagesDisplayScreen;
  }
  ngOnInit(): void {
    this.messageWidgetService.toggleObs.subscribe((data: any) => {
      if (typeof data === 'object' && data.isContact) {
        this.isContact = data.isContact;
        this.onToggleFab(data.id);
      } else {
        this.onToggleFab(data);
      }
    });
     this.messageWidgetService.isPatientFileNewMessageWidget.subscribe((data:boolean) => {
      this.isReceiverPatient = data ;});
  }

  showItems() {
    this.fabTogglerState = "active";
    this.buttons = this.fabButtons;
  }

  hideItems() {
    this.fabTogglerState = "inactive";
    this.buttons = [];
    this.toggle = false;
  }

  onToggleFab(id?) {
    this.buttons.length ? this.hideItems() : this.showItems();
    this.id = id;
  }
}
