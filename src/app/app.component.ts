import { Component } from "@angular/core";
import { CometChat } from "@cometchat-pro/chat";
import { environment } from "@env/environment";
import { ReplaySubject, Subject } from "rxjs";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "practician";

  constructor() {}
}
