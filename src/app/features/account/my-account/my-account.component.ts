import { Component, OnInit } from "@angular/core";
import { AccountService } from "@app/features/services/account.service";
import { Router } from "@angular/router";
import { LocalStorageService } from "ngx-webstorage";
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
    private localSt: LocalStorageService
  ) {
    this.labels = this.accountService.messages;
  }
  public userRole = this.localSt.retrieve("role");
  ngOnInit(): void {}
  desactivateAccountModal() {
    $("#deleteAccountModal").appendTo("body").modal("toggle");
  }
  desactivateAccount() {
    this.accountService.desactivateAccount().subscribe((resp) => {
      if (resp) {
        $("#deleteAccountModal").modal("toggle");
        this.router.navigate(["/connexion"]);
      }
    });
  }
  BackButton() {
    this.router.navigate(["/messagerie"]);
  }
  return() {
    this.router.navigate(["/messagerie"]);
  }
}
