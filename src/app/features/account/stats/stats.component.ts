import { Component, OnInit } from '@angular/core';
import { AccountService } from '@app/features/services/account.service';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FeaturesService } from '@app/features/features.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
  selectedId: Number;
  submitted = false;
  patientMap = new Subject<any>();
  tlsMap = new Subject<any>();
  public messages: any;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: AccountService,
    private featureService: FeaturesService
  ) { }

  ngOnInit(): void {
    this.selectedId = this.featureService.getUserId();
    this.messages = this.service.messages;
    this.featureService.setIsMessaging(false);
    this.service
      .getPatientStats(this.selectedId)
      .subscribe((p: Map<string, number>) => {
        this.service
          .getTlsStats(this.selectedId)
          .subscribe((t: Map<string, number>) => {
            this.patientMap.next(p);
            this.tlsMap.next(t);
          });
      });
  }
}

