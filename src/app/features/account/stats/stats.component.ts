import { Component, OnInit } from "@angular/core";
import { AccountService } from "@app/features/services/account.service";
import { Subject } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { FeaturesService } from "@app/features/features.service";

@Component({
  selector: "app-stats",
  templateUrl: "./stats.component.html",
  styleUrls: ["./stats.component.scss"]
})
export class StatsComponent implements OnInit {
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

  ngOnInit(): void {
    this.selectedId = this.featureService.getUserId();
    this.messages = this.service.messages;
    this.featureService.setIsMessaging(false);
    this.service
      .getreceivedStats(this.selectedId)
      .subscribe((r: Map<string, number>) => {
        this.service
          .getsentStats(this.selectedId)
          .subscribe((s: Map<string, number>) => {
            this.service
              .getothersStats(this.selectedId)
              .subscribe((o: Map<string, number>) => {
                this.receivedMap.next(r);
                this.sentMap.next(s);
                this.othersMap.next(o);
              });
          });
      });
  }
}
