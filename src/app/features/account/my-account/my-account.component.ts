import { Component, OnInit } from "@angular/core";
import { AccountService } from "@app/features/services/account.service";
import { Router } from "@angular/router";
import { LocalStorageService } from "ngx-webstorage";
import { DialogService } from "@app/features/services/dialog.service";
declare var $: any;
@Component({
  selector: "app-my-account",
  templateUrl: "./my-account.component.html",
  styleUrls: ["./my-account.component.scss"],
})
export class MyAccountComponent implements OnInit {
  labels;
  topText = "Mon compte";
  page = "MY_ACCOUNT";
  backButton = true;
  constructor(
    private accountService: AccountService,
    private router: Router,
    private localSt: LocalStorageService,
    private dialogService: DialogService
  ) {
    this.labels = this.accountService.messages;
  }
  public userRole = this.localSt.retrieve("role");
  ngOnInit(): void { }

  BackButton() {
    this.router.navigate(["/messagerie"]);
  }
  return() {
    this.router.navigate(["/messagerie"]);
  }
}
