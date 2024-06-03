import { Component, OnInit } from '@angular/core';
import { CountService } from '../service/CountService';
import { NgxSpinnerService } from 'ngx-spinner';
import { monteCarlo, dataSet } from './chart';

interface ForecastData {
  forecastedAverages: number[];
  forecast_dates: string[];
  mape: number;
}


@Component({
  selector: 'app-main-dashboard',
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.css']
})
export class MainDashboardComponent implements OnInit {
  public monteCarlo: Partial<monteCarlo> | any;
  public dataSet: Partial<dataSet> | any;
  public resolved: boolean = false;
  public loaddata: any;

  forecastValues: number[] = [];
  realValues: number[] = [];
  realDates: string[] = [];
  realTimes: string[] = [];
  combinedValues: number[] = [];
  combinedDates: string[] = [];
  mape: number | undefined;


  showSuccessAlert: boolean = true;
  deskripsi: any = 'Loading..';

  constructor(private service: CountService, private spinner: NgxSpinnerService) { }

  closeSuccessAlert() {
    this.showSuccessAlert = false;
  }

  async ngOnInit(): Promise<void> {
    window.scrollTo(0, 0);
    this.spinner.show();

    this.loaddata = new Promise<void>((resolve, reject) => {

      this.service.getDataSet().subscribe(data => {
        console.log(data);
        
        const dataArray = Object.values(data);
        
        dataArray.sort((a, b) => {
          const dateA = new Date(a.time.split('/').reverse().join('-')).getTime();
          const dateB = new Date(b.time.split('/').reverse().join('-')).getTime();
          return dateA - dateB;
        });
        
        this.realDates = [];
        this.realTimes = [];
        this.realValues = [];
        
        dataArray.forEach(item => {
          if (item.time && item.Label_Length_AVE) {
            const [date, time] = item.time.split(' '); // Assuming time is space-separated from date
            this.realDates.push(date);
            this.realTimes.push(time);
            this.realValues.push(item.Label_Length_AVE);
          }
        });
        
        console.log(this.realValues);
        console.log(this.realDates);
        console.log(this.realTimes);
        
        this.realValueChart();
      });
      
      


      this.service.getMonteCarloTest().subscribe({
        next: (data) => {
          console.log(data);
          
          const forecastData = data as ForecastData;
          this.forecastValues = forecastData.forecastedAverages;
          this.mape = forecastData.mape;

          this.combinedValues = [...this.realValues, ...this.forecastValues];
          this.combinedDates = [...this.realDates, ...forecastData.forecast_dates];

          this.createCombinedChart();
          resolve();
        },
        error: (error) => {
          console.error('Error fetching forecast data', error);
          reject(error);
        },
        complete: () => {
          this.spinner.hide();
        }
      });

    });

    await this.loaddata;
  }

  realValueChart() {
    this.dataSet = {
      series: [
        {
          name: "Desktops",
          data: this.realValues  
        }
      ],
      chart: {
        height: 550,
        type: "line",
        zoom: {
          enabled: false
        }
      },
      colors: ['#254336'],  // Add this line to change the series color
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
          colors: ["#254336", "transparent"], // This changes the row background colors
          opacity: 0.5
        }
      },
      xaxis: {
        categories: this.realTimes 
      }
    };
  }
  

  createCombinedChart() {
    this.monteCarlo = {
      series: [
        {
          name: "Actual",
          data: this.realValues
        },
        {
          name: "Forecast",
          data: this.forecastValues
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
          colors: ["#254336", "transparent"],
          opacity: 0.5
        }
      },
      xaxis: {
        categories: this.combinedDates
      }
    };
  }
}
