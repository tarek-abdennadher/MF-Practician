import { Component, ViewChild, OnInit, Input } from "@angular/core";
import { ChartComponent } from "ng-apexcharts";
import { ApexNonAxisChartSeries, ApexResponsive, ApexChart } from "ng-apexcharts";
import { Subject } from "rxjs";
import { AccountService } from '@app/features/services/account.service';
import {FeaturesService} from '@app/features/features.service';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
};

@Component({
  selector: 'app-apx-pie',
  templateUrl: './apx-pie.component.html',
  styleUrls: ['./apx-pie.component.scss']
})
export class ApxPieComponent implements OnInit {
  @ViewChild("chart", { static: false }) chart: ChartComponent;
  @Input() stats: Subject<any>;
  public chartOptions: Partial<ChartOptions>;
  public messages: any;
  constructor(private accountService: AccountService, private featureService: FeaturesService) {
    this.messages = this.accountService.stats;
    this.chartOptions = {
      series: [0, 0],
      chart: {
        width: 380,
        type: "pie",
      },
      labels: ["Chargement..", "Chargement.."],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    };
  }
  ngOnInit() {
    this.stats.subscribe((myMap) => {
      const map: Map<string, number> = new Map(Object.entries(myMap));
      this.chartOptions = {
        series: [...map.values()],
        chart: {
          width: 480,
          type: "pie",
        },
        labels: [...map.keys()],
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200,
              },
              legend: {
                position: "bottom",
              },
            },
          },
        ],
      };
    });
    this.featureService.setIsMessaging(false);
  }
}
