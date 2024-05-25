import { Component, OnInit } from '@angular/core';
import { CountService } from '../service/CountService';
import { Chart } from 'chart.js/auto';
import { NgxSpinnerService } from 'ngx-spinner';
import { ChartOptions, bulanan } from './chart'
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
  public loaddata: any;

  dataTest : object = {}
  dataTestArr : any = []
  date : any
  forecastData : any
  realData : any
  showSuccessAlert: boolean = true;
  deskripsi: any = 'Loading..';
  closeSuccessAlert() {

  }
  constructor(private service: CountService, private spinner: NgxSpinnerService) { }

  async ngOnInit(): Promise<void> {
    window.scrollTo(0, 0);
    this.loaddata = new Promise(resolve => {

      this.service.getReadPdmAssetoci1().subscribe(data => {
        this.resolved = true;
        // console.log(data);
        
        this.dataTest = data
        console.log(this.dataTest);
        Object.values(this.dataTest).forEach(data => {
          var array = Object.keys(data).map(function (key) {
            return data[key];
          });
          for (let i = 0; i < array.length; i++) {
            this.dataTestArr.splice(this.dataTestArr.lenght, 0, array[i]);
          }
          console.log(this.dataTestArr);
          
        });
        this.bulananChart()
      }, (error: any) => { }, () => {
        this.spinner.hide();
      })
  

    });
    this.spinner.show();
    this.loaddata = await this.loaddata;
  }
  bulananChart() {
    this.bulanan = {
      series: [
        {
          name: "Desktops",
          data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
        }
      ],
      chart: {
        height: 350,
        type: "line",
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "straight"
      },
      title: {
        text: "Product Trends by Month",
        align: "left"
      },
      grid: {
        row: {
          colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
          opacity: 0.5
        }
      },
      xaxis: {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep"
        ]
      }
    };
  }
};
