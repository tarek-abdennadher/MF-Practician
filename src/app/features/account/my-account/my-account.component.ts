import { Component, OnDestroy, OnInit } from "@angular/core";
import { AccountService } from "@app/features/services/account.service";
import { Router } from "@angular/router";
import { LocalStorageService } from "ngx-webstorage";
import { FeaturesService } from "@app/features/features.service";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { Title } from '@angular/platform-browser';
declare var $: any;
@Component({
  selector: "app-my-account",
  templateUrl: "./my-account.component.html",
  styleUrls: ["./my-account.component.scss"],
})
export class MyAccountComponent implements OnInit, OnDestroy {
  private _destroyed$ = new Subject();
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
    private featureService: FeaturesService,
    private title: Title
  ) {
    this.title.setTitle(this.topText);
    this.labels = this.accountService.messages;
    this.practicianId = this.featureService.getUserId();
  }

  ngOnDestroy(): void {
    this._destroyed$.next(true);
    this._destroyed$.unsubscribe();
  }

  public userRole = this.localSt.retrieve("role");
  ngOnInit(): void {
    this.featureService.setActiveChild("account");
    setTimeout(() => {
      this.featureService.setIsMessaging(false);
    });
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
    this.accountService
      .getOptionById(this.practicianId)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((op) => {
        if (op && op.id != null) {
          this.showLeaves = true;
        }
      });
  }
  getTls() {
    this.accountService
      .getPracticianTelesecretary()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((practician) => {
        if (practician && practician.group != null) {
          this.showTls = true;
        }
      });
  }
}
