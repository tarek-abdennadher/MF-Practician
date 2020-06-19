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
  }
  public userRole = this.localSt.retrieve("role");
  ngOnInit(): void {
    this.practicianId = this.featureService.getUserId();
  }

  desactivateAccount() {
    this.dialogService
      .openConfirmDialog(
        this.labels.delete_account_confirm,
        this.labels.title_delete_account
      )
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.accountService.desactivateAccount().subscribe((resp) => {
            if (resp) {
              this.router.navigate(["/connexion"]);
            }
          });
        }
      });
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
}
