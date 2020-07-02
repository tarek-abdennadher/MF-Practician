import { Component, OnInit } from "@angular/core";
import { AccountService } from "@app/features/services/account.service";
import { Router } from "@angular/router";
import { LocalStorageService } from "ngx-webstorage";
import { DialogService } from "@app/features/services/dialog.service";
import { FeaturesService } from '@app/features/features.service';
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
  practicianId: number;
  public showLeaves: boolean = false;
  constructor(
    private accountService: AccountService,
    private router: Router,
    private localSt: LocalStorageService,
    private dialogService: DialogService,
    private featureService: FeaturesService
  ) {
    this.labels = this.accountService.messages;
    this.practicianId = this.featureService.getUserId();

  }
  public userRole = this.localSt.retrieve("role");
  ngOnInit(): void {
    this.getOptionById();
  }

  BackButton() {
    this.router.navigate(["/messagerie"]);
  }
  return() {
    this.router.navigate(["/messagerie"]);
  }

  getOptionById() {
    this.accountService.getOptionById(this.practicianId).subscribe((op) => {
      if (op != null && op.activateLeaveAutoMessage) {
        this.showLeaves = true
      }
    });
  }
  displaySendAction() {
    this.router.navigate(["/messagerie-ecrire"]);
  }
}
