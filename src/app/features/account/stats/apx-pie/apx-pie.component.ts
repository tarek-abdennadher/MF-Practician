import { Component, ViewChild, OnInit, Input } from "@angular/core";
import { ChartComponent, ApexLegend } from "ng-apexcharts";
import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
} from "ng-apexcharts";
import { Subject } from "rxjs";
import { AccountService } from "@app/features/services/account.service";
import { FeaturesService } from "@app/features/features.service";

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  legend: ApexLegend
};

@Component({
  selector: "app-apx-pie",
  templateUrl: "./apx-pie.component.html",
  styleUrls: ["./apx-pie.component.scss"],
})
export class ApxPieComponent implements OnInit {
  @ViewChild("chart", { static: false }) chart: ChartComponent;
  @Input() stats: Subject<any>;
  public emptyData = true;
  public infoMessage = "Aucune valeur à afficher";
  public chartOptions: Partial<ChartOptions>;
  public messages: any;
  constructor(
    private accountService: AccountService,
    private featureService: FeaturesService
  ) {
    this.messages = this.accountService.stats;
    this.chartOptions = {
      series: [0, 0],
      chart: {
        width: 200,
        type: "donut",
      },
      labels: ["Chargement..", "Chargement.."],
      legend: {
        floating: true,
        horizontalAlign: 'center',
        position: 'bottom',
        fontSize: '16px',
        fontFamily: 'Montserrat',
        fontWeight: 'normal',
      },
      responsive: [
        {
          options: {
            breakpoint: 1000,
            chart: {
              width: 100,
              type: "donut",
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
          width: 430,
          type: "donut",
        },
        legend: {
          horizontalAlign: 'center',
          position: 'bottom',
          fontSize: '14px',
          fontFamily: 'Montserrat',
          fontWeight: 'normal'
        },
        labels: [...map.keys()],
        responsive: [
          {
            options: {
              breakpoint: 1000,
              chart: {
                width: 100,
                type: "donut",
              },
            },
          },
        ],
      };
      this.chartOptions.series.forEach((n) => {
        if (n != 0) {
          this.emptyData = false;
        }
      });
    });
    this.featureService.setIsMessaging(false);
  }
}
