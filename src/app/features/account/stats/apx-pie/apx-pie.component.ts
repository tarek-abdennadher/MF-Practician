import { Component, ViewChild, OnInit, Input } from "@angular/core";
import { ChartComponent, ApexDataLabels } from "ng-apexcharts";
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
  labels: ApexDataLabels;
  fill: {
    colors: ['#1a56a7', '#008fff', '#82f8ff']
  };
  colors: ['#1a56a7', '#008fff', '#82f8ff'];
  legend: {
    style: {
      font: ["Montserrat"]
    }
  }
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
        width: 600,
        type: "donut",
      },
      labels: {
        style: {
          fontSize: "16px",
          fontFamily: "Montserrat",
          fontWeight: "normal",
          colors: ["4a4a4a"]
        }
      },
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
          width: 550,
          type: "donut",
        },
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
      this.chartOptions.series.forEach((n) => {
        if (n != 0) {
          this.emptyData = false;
        }
      });
    });
    this.featureService.setIsMessaging(false);
  }
}
