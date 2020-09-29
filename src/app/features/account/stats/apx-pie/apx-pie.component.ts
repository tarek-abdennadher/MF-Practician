import { Component, ViewChild, OnInit, Input, OnDestroy } from "@angular/core";
import { ChartComponent, ApexLegend } from "ng-apexcharts";
import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
} from "ng-apexcharts";
import { Subject } from "rxjs";
import { AccountService } from "@app/features/services/account.service";
import { FeaturesService } from "@app/features/features.service";
import { takeUntil } from "rxjs/operators";
const { detect } = require("detect-browser");
const browser = detect();

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  legend: ApexLegend;
  colors: string[];
};

@Component({
  selector: "app-apx-pie",
  templateUrl: "./apx-pie.component.html",
  styleUrls: ["./apx-pie.component.scss"],
})
export class ApxPieComponent implements OnInit, OnDestroy {
  private _destroyed$ = new Subject();
  @ViewChild("chart", { static: false }) chart: ChartComponent;
  @Input() stats: Subject<any>;
  @Input() position: string;
  loading: boolean = true;
  public emptyData = true;
  public colors = this.accountService.colors;
  public infoMessage = "Aucune valeur à afficher";
  public chartOptions: Partial<ChartOptions>;
  public messages: any;
  constructor(
    private accountService: AccountService,
    private featureService: FeaturesService
  ) {
    this.messages = this.accountService.stats;
  }

  ngOnDestroy(): void {
    this._destroyed$.next(true);
    this._destroyed$.unsubscribe();
  }

  ngOnInit() {
    this.loading = true;
    this.chartOptions = {
      series: [0, 0],
      chart: {
        width: 200,
        type: "donut",
      },
      colors: [
        this.colors.blue,
        this.colors.dark_blue,
        this.colors.light_blue,
        this.colors.light_steel_blue,
      ],
      labels: ["Chargement..", "Chargement.."],
      legend: {
        floating: true,
        horizontalAlign: "left",
        position: this.position == "bottom" ? "bottom" : "right",
        fontSize: "16px",
        fontFamily: "Montserrat",
        fontWeight: "normal",
        labels: {
          colors: ["#4a4a4a"],
        },
      },
    };
    this.stats.subscribe((myMap) => {
      this.loading = true;
      const map: Map<string, number> = new Map(Object.entries(myMap));
      this.chartOptions = {
        series: [...map.values()],
        chart: {
          width: 450,
          type: "donut",
        },
        colors: [
          this.colors.blue,
          this.colors.dark_blue,
          this.colors.light_blue,
          this.colors.light_steel_blue,
        ],
        legend: {
          horizontalAlign: "left",
          position: this.position == "bottom" ? "bottom" : "right",
          fontSize: "14px",
          fontFamily: "Montserrat",
          fontWeight: "normal",
          labels: {
            colors: ["#4a4a4a"],
          },
          width: this.position == "bottom" ? 211 : 285,
        },
        labels: [...map.keys()],
        responsive: [
          // Most Common Mobile Screen Resolution Sizes
          {
            breakpoint: 1921,
            options: {
              chart: {
                width: this.position == "bottom" ? 651 : 751,
              },
              legend: {
                show: true,
              },
            },
          },
          {
            breakpoint: 1601,
            options: {
              chart: {
                width:
                  this.position === "bottom"
                    ? browser && browser.name === "chrome"
                      ? 680
                      : 491
                    : browser && browser.name === "chrome"
                    ? 720
                    : 591,
              },
              legend: {
                show: true,
              },
            },
          },
          {
            breakpoint: 1537,
            options: {
              chart: {
                width:
                  this.position === "bottom"
                    ? browser && browser.name === "chrome"
                      ? 640
                      : 459
                    : browser && browser.name === "chrome"
                    ? 670
                    : 559,
              },
              legend: {
                show: true,
              },
            },
          },
          {
            breakpoint: 1441,
            options: {
              chart: {
                width:
                  this.position === "bottom"
                    ? browser && browser.name === "chrome"
                      ? 580
                      : 411
                    : browser && browser.name === "chrome"
                    ? 610
                    : 511,
              },
              legend: {
                show: true,
              },
            },
          },
          {
            breakpoint: 1367,
            options: {
              chart: {
                width:
                  this.position === "bottom"
                    ? browser && browser.name === "chrome"
                      ? 535
                      : 374
                    : browser && browser.name === "chrome"
                    ? 600
                    : 500,
              },
              legend: {
                show: true,
              },
            },
          },
          // Most Common Tablet Screen Resolution Sizes
          {
            breakpoint: 1281,
            options: {
              chart: {
                width:
                  this.position === "bottom"
                    ? browser && browser.name === "chrome"
                      ? 532
                      : 381
                    : browser && browser.name === "chrome"
                    ? 600
                    : 500,
              },
              legend: {
                show: true,
              },
            },
          },
          {
            breakpoint: 1025,
            options: {
              chart: {
                width:
                  this.position === "bottom"
                    ? browser && browser.name === "chrome"
                      ? 561
                      : 440
                    : browser && browser.name === "chrome"
                    ? 620
                    : 540,
              },
              legend: {
                show: true,
              },
            },
          },
          {
            breakpoint: 801,
            options: {
              chart: {
                width:
                  this.position === "bottom"
                    ? browser && browser.name === "chrome"
                      ? 437
                      : 343
                    : browser && browser.name === "chrome"
                    ? 500
                    : 443,
                height: this.position == "bottom" ? 300 : 150,
              },
              legend: {
                show: true,
              },
            },
          },
          {
            breakpoint: 769,
            options: {
              chart: {
                width:
                  this.position === "bottom"
                    ? browser && browser.name === "chrome"
                      ? 418
                      : 327
                    : browser && browser.name === "chrome"
                    ? 480
                    : 427,
                height: this.position == "bottom" ? 300 : 150,
              },
              legend: {
                show: true,
              },
            },
          },
          {
            breakpoint: 602,
            options: {
              chart: {
                width: browser && browser.name === "chrome" ? 315 : 243,
                height: browser && browser.name === "chrome" ? 315 : 243,
              },
              legend: {
                show: false,
              },
            },
          },
          // Most Common Mobile Screen Resolution Sizes
          {
            breakpoint: 415,
            options: {
              chart: {
                width: browser && browser.name === "chrome" ? 432 : 334,
                height: browser && browser.name === "chrome" ? 432 : 334,
              },
              legend: {
                show: false,
              },
            },
          },
          {
            breakpoint: 376,
            options: {
              chart: {
                width: 295,
                height: 295,
              },
              legend: {
                show: false,
              },
            },
          },
          {
            breakpoint: 361,
            options: {
              chart: {
                width: 280,
                height: 280,
              },
              legend: {
                show: false,
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
      jQuery(document).ready(function () {
        jQuery(".apexcharts-pie-label").attr("fill", "#000000");
        jQuery(".apexcharts-legend.position-bottom").css("margin", "auto");
        jQuery(".apexcharts-legend.position-right").css("height", "100%");
      });
      this.loading = false;
    });
    setTimeout(() => {
      this.featureService.setIsMessaging(false);
    });
  }
}
