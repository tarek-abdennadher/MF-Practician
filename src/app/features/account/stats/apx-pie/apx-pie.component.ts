import { Component, ViewChild, OnInit, Input } from "@angular/core";
import { ChartComponent, ApexLegend, ApexFill } from "ng-apexcharts";
import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart
} from "ng-apexcharts";
import { Subject } from "rxjs";
import { AccountService } from "@app/features/services/account.service";
import { FeaturesService } from "@app/features/features.service";

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
  styleUrls: ["./apx-pie.component.scss"]
})
export class ApxPieComponent implements OnInit {
  @ViewChild("chart", { static: false }) chart: ChartComponent;
  @Input() stats: Subject<any>;
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
  ngOnInit() {
    this.chartOptions = {
      series: [0, 0],
      chart: {
        width: 200,
        type: "donut"
      },
      colors: [
        this.colors.blue,
        this.colors.dark_blue,
        this.colors.light_blue,
        this.colors.light_steel_blue
      ],
      labels: ["Chargement..", "Chargement.."],
      legend: {
        floating: true,
        horizontalAlign: "left",
        position: "bottom",
        fontSize: "16px",
        fontFamily: "Montserrat",
        fontWeight: "normal",
        labels: {
          colors: ["#4a4a4a"]
        }
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            }
          }
        }
      ]
    };
    this.stats.subscribe(myMap => {
      const map: Map<string, number> = new Map(Object.entries(myMap));
      this.chartOptions = {
        series: [...map.values()],
        chart: {
          width: 450,
          type: "donut"
        },
        colors: [
          this.colors.blue,
          this.colors.dark_blue,
          this.colors.light_blue,
          this.colors.light_steel_blue
        ],
        legend: {
          horizontalAlign: "center",
          position: "bottom",
          fontSize: "14px",
          fontFamily: "Montserrat",
          fontWeight: "normal",
          labels: {
            colors: ["#4a4a4a"]
          }
        },
        labels: [...map.keys()],
        responsive: [
          {
            breakpoint: 1901,
            options: {
              chart: {
                width: 643
              },
              legend: {
                show: true
              }
            }
          },
          {
            breakpoint: 1801,
            options: {
              chart: {
                width: 593
              },
              legend: {
                show: true
              }
            }
          },
          {
            breakpoint: 1701,
            options: {
              chart: {
                width: 543
              },
              legend: {
                show: true
              }
            }
          },
          {
            breakpoint: 1601,
            options: {
              chart: {
                width: 493
              },
              legend: {
                show: true
              }
            }
          },
          {
            breakpoint: 1501,
            options: {
              chart: {
                width: 443
              },
              legend: {
                show: true
              }
            }
          },
          {
            breakpoint: 1401,
            options: {
              chart: {
                width: 393
              },
              legend: {
                show: false
              }
            }
          },
          {
            breakpoint: 1301,
            options: {
              chart: {
                width: 343
              },
              legend: {
                show: false
              }
            }
          },
          {
            breakpoint: 1201,
            options: {
              chart: {
                width: 293
              },
              legend: {
                show: false
              }
            }
          },
          {
            breakpoint: 1101,
            options: {
              chart: {
                width: 430
              },
              legend: {
                show: true
              }
            }
          },
          {
            breakpoint: 1001,
            options: {
              chart: {
                width: 380
              },
              legend: {
                show: false
              }
            }
          },
          {
            breakpoint: 901,
            options: {
              chart: {
                width: 330
              },
              legend: {
                show: false
              }
            }
          },
          {
            breakpoint: 801,
            options: {
              chart: {
                width: 295
              },
              legend: {
                show: false
              }
            }
          },
          {
            breakpoint: 701,
            options: {
              chart: {
                width: 293
              },
              legend: {
                show: false
              }
            }
          },
          {
            breakpoint: 601,
            options: {
              chart: {
                width: 245
              },
              legend: {
                show: false
              }
            }
          },
          {
            breakpoint: 576,
            options: {
              chart: {
                width: 495
              },
              legend: {
                show: true
              }
            }
          },
          {
            breakpoint: 501,
            options: {
              chart: {
                width: 420
              },
              legend: {
                show: true
              }
            }
          },
          {
            breakpoint: 401,
            options: {
              chart: {
                width: 320
              },
              legend: {
                show: false
              }
            }
          },
          {
            breakpoint: 301,
            options: {
              chart: {
                width: 220
              },
              legend: {
                show: false
              }
            }
          }
        ]
      };
      this.chartOptions.series.forEach(n => {
        if (n != 0) {
          this.emptyData = false;
        }
      });
      jQuery(document).ready(function() {
        jQuery(".apexcharts-pie-label").attr("fill", "#000000");
      });
    });
    this.featureService.setIsMessaging(false);
  }
}
