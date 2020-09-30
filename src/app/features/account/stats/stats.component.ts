import { Component, OnDestroy, OnInit } from "@angular/core";
import { AccountService } from "@app/features/services/account.service";
import { Subject } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { FeaturesService } from "@app/features/features.service";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-stats",
  templateUrl: "./stats.component.html",
  styleUrls: ["./stats.component.scss"],
})
export class StatsComponent implements OnInit, OnDestroy {
  private _destroyed$ = new Subject();
  selectedId: Number;
  submitted = false;
  othersMap = new Subject<any>();
  receivedMap = new Subject<any>();
  sentMap = new Subject<any>();
  public messages: any;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: AccountService,
    private featureService: FeaturesService
  ) {}

  ngOnDestroy(): void {
    this._destroyed$.next(true);
    this._destroyed$.unsubscribe();
  }

  ngOnInit(): void {
    this.selectedId = this.featureService.getUserId();
    this.messages = this.service.messages;
    setTimeout(() => {
      this.featureService.setIsMessaging(false);
    });
    this.service
      .getreceivedStats(this.selectedId)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((r: Map<string, number>) => {
        this.service
          .getsentStats(this.selectedId)
          .pipe(takeUntil(this._destroyed$))
          .subscribe((s: Map<string, number>) => {
            this.service
              .getothersStats(this.selectedId)
              .pipe(takeUntil(this._destroyed$))
              .subscribe((o: Map<string, number>) => {
                this.receivedMap.next(r);
                this.sentMap.next(s);
                this.othersMap.next(o);
              });
          });
      });
  }
}
