import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NewMessageWidgetService } from "../new-message-widget/new-message-widget.service";

@Component({
  selector: "app-new-message-mobile",
  templateUrl: "./new-message-mobile.component.html",
  styleUrls: ["./new-message-mobile.component.scss"],
})
export class NewMessageMobileComponent implements OnInit {
  constructor(
    private router: Router,
    private messageWidgetService: NewMessageWidgetService
  ) {}

  ngOnInit(): void {}

  displaySendAction() {
    this.messageWidgetService.toggleObs.next();
  }
}
