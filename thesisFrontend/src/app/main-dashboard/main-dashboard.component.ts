import { Component, OnInit } from '@angular/core';
import { CountService } from '../service/CountService';
import { Chart } from 'chart.js/auto';
import { NgxSpinnerService } from 'ngx-spinner';
import { ChartOptions } from './chart'
import { bulanan } from './chart'
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-main-dashboard',
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.css']
})
export class MainDashboardComponent implements OnInit {
  public chartOptions!: Partial<ChartOptions> | any;
  public bulanan!: Partial<bulanan> | any;
  public resolved: boolean = false;

  const: object = {};
  const2: any = [];
  currentDate = new Date();
  Setting: number = 0;
  Replacement: number = 0;
  Improvement: number = 0;
  totalkategori: object = {};
  totalvendr1: object = {};
  totalvend2: object = {};
  totalkategoriarr: any = [];
  public loaddata: any;
  donut: any = [];
  coba: any = [];
  pendingexecute: number = 0;
  finishexecute: number = 0;
  readyexecute: number = 0;
  Preventive: number = 0;
  totalReq: number = 0;
  totalReqNoNum: number = 0;
  totalReqNum: number = 0;
  totalv1: number = 0;
  totalv2: number = 0;
  showSuccessAlert: boolean = true;
  deskripsi: any = 'Loading..';
  closeSuccessAlert() {

  }
  constructor(private service: CountService, private spinner: NgxSpinnerService) { }

  async ngOnInit(): Promise<void> {
    window.scrollTo(0, 0);
    this.loaddata = new Promise(resolve => {

      
  
      forkJoin([
        this.service.getReadPdmAssetoci1(),
      ]).subscribe(([dataReq]) => {
        console.log(dataReq);
        //////console.log(dataNum);
        //////console.log(dataV1);
        //////console.log(dataV2);
        this.totalkategori = dataReq
        Object.values(this.totalkategori).forEach(data => {
          ////////console.log(data);
          var array = Object.keys(data).map(function (key) {
            return data[key];
          });
          array.forEach(element => {
            this.totalReq++
          });
          ////////console.log(this.totalReq);

        })
        Object.values(this.const).forEach(data => {
          ////////console.log(data);
          var array = Object.keys(data).map(function (key) {
            return data[key];
          });
          array.forEach(element => {
            this.totalReqNum++
          });
          ////////console.log(this.totalReqNum);
        })

        Object.values(this.totalvendr1).forEach(data => {
          ////////console.log(data);
          var array = Object.keys(data).map(function (key) {
            return data[key];
          });
          array.forEach(element => {
            this.totalv1++
          });
          ////////console.log(this.totalv1);
          
      })
        Object.values(this.totalvend2).forEach(data => {
          ////////console.log(data);
          var array = Object.keys(data).map(function (key) {
            return data[key];
          });
          array.forEach(element => {
            this.totalv2++
          });
          ////////console.log(this.totalv2);
          
      })

        this.totalReqNoNum = this.totalReq - this.totalReqNum
        new Chart('dum', {
          type: 'bar',
          data: {
            labels: [""],
            datasets: [
              {
                label: 'Total Request',
                data: [this.totalReq],
                backgroundColor: [
                  '#8ecae6'
                ],
                borderColor: [
                  'white'
                ],
                borderWidth: 1,
                borderRadius: 20,
              },
              {
                label: 'PR Number',
                data: [this.totalReqNum],
                backgroundColor: [
                  '#219ebc'
                ],
                borderColor: [
                  'white'
                ],
                borderWidth: 1,
                borderRadius: 20,
              },
            ]
          },
        });
        this.bulananChart()
        
      
        this.spinner.hide();
        this.resolved = true;

      });

    });
    this.spinner.show();
    this.loaddata = await this.loaddata;
  }
  bulananChart() {
    this.bulanan = {
      series: [
        {
          name: "Total Finding Per Bulan",
          data: this.totalReq
        },
      ],
      chart: {
        type: "bar",
        height: 500,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "60%",
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        axixTicks: {
          show: false,
        },
        crosshairs: {
          show: false,
        },
        categories: [
          "January", "February", "Maret", "April", "May", "June", "July", "August", "September", "October", "November", "December",
        ]
      },
      yaxis: {
        axixTicks: {
          show: false,
        },
        crosshairs: {
          show: false,
        },
        title: {
          text: ""
        }
      },
      fill: {
        opacity: 1,
        colors: ['#007bff']
      }, legend: {
      }, colors: ['#007bff']
    };
  }
};
