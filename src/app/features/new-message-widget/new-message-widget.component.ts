import { Component, OnInit } from "@angular/core";
import { speedDialFabAnimations } from "./new-message-widget.animations";
import { GlobalService } from "@app/core/services/global.service";
import { NewMessageWidgetService } from './new-message-widget.service';

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
  toggle: boolean = false;
  minimize = { height: '1.5rem', position: 'fixed', bottom: 0, overflow: 'hidden' }
  maximize = { }
  constructor(
    private globalService: GlobalService,
    private messageWidgetService: NewMessageWidgetService
  ) {
    this.messages = this.globalService.messagesDisplayScreen;
  }
  ngOnInit(): void {
    this.messageWidgetService.toggleObs.subscribe(data => {
      this.onToggleFab();
    })
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

  onToggleFab() {
    this.buttons.length ? this.hideItems() : this.showItems();
  }
}
