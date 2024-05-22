import { Component, OnInit } from '@angular/core';
import { CountService } from '../service/CountService';
import { Chart } from 'chart.js/auto';
import { NgxSpinnerService } from 'ngx-spinner';
import { ChartOptions } from './chart'
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-main-dashboard',
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.css']
})
export class MainDashboardComponent implements OnInit {
  public chartOptions!: Partial<ChartOptions> | any;
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
       
      console.log('here');
      
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

        new Chart('vendor', {
          type: 'bar',
          data: {
            labels: [""],
            datasets: [
              {
                label: 'Total Request',
                data: [this.totalReq],
                backgroundColor: [
                  '#4ECDC4'
                ],
                borderColor: [
                  'white'
                ],
                borderWidth: 1,
                borderRadius: 20,
              },
              {
                label: 'Vendor 1',
                data: [this.totalv1],
                backgroundColor: [
                  '#83c5be'
                ],
                borderColor: [
                  'white'
                ],
                borderWidth: 1,
                borderRadius: 20,
              },
              {
                label: 'Vendor 2',
                data: [this.totalv2],
                backgroundColor: [
                  '#87bba2'
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
        this.spinner.hide();
        this.resolved = true;

      });

    });
    this.spinner.show();
    this.loaddata = await this.loaddata;
  }
};
