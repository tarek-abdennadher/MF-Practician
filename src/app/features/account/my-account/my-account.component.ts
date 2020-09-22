import { Component, OnInit } from "@angular/core";
import { AccountService } from "@app/features/services/account.service";
import { Router } from "@angular/router";
import { LocalStorageService } from "ngx-webstorage";
import { FeaturesService } from "@app/features/features.service";
declare var $: any;
@Component({
  selector: "app-my-account",
  templateUrl: "./my-account.component.html",
  styleUrls: ["./my-account.component.scss"]
})
export class MyAccountComponent implements OnInit {
  labels;
  topText = "Mon compte";
  page = "MY_ACCOUNT";
  backButton = true;
  practicianId: number;
  public showTls: boolean = false;
  public showLeaves: boolean = false;
  constructor(
    private accountService: AccountService,
    private router: Router,
    private localSt: LocalStorageService,
    private featureService: FeaturesService
  ) {
    this.labels = this.accountService.messages;
    this.practicianId = this.featureService.getUserId();
  }
  public userRole = this.localSt.retrieve("role");
  ngOnInit(): void {
    this.featureService.setActiveChild("account");
    this.featureService.setIsMessaging(false);
    this.getOptionById();
    this.getTls();
  }

  BackButton() {
    this.router.navigate(["/messagerie"]);
  }
  return() {
    this.router.navigate(["/messagerie"]);
  }

  getOptionById() {
    this.accountService.getOptionById(this.practicianId).subscribe(op => {
      if (op.id != null) {
        this.showLeaves = true
      }
    });
  }
  getTls() {
    this.accountService.getPracticianTelesecretary().subscribe(practician => {
      if (practician.group != null) {
        this.showTls = true;
      }
    });
  }
}
