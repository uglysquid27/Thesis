import { Component, OnInit } from '@angular/core';
import { CountService } from '../service/CountService';
import { NgxSpinnerService } from 'ngx-spinner';
import { monteCarlo, dataSet } from './chart';

interface ForecastResponse {
  forecastedResultsWithTime: Array<{ time: string, Label_Length_AVE: number }>;
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
  forecastDates: string[] = [];
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
        next: (data: ForecastResponse) => {
            console.log(data);

            // Access forecastedResultsWithTime from the response data
            const forecastedResultsWithTime = data.forecastedResultsWithTime;
            const mape = data.mape;

            console.log('Forecasted Results:', forecastedResultsWithTime);
            console.log('MAPE:', mape);

            // Assuming you need to process the forecastedResultsWithTime further
            // Extracting time and values for further processing or charting
            this.forecastValues = forecastedResultsWithTime.map(item => item.Label_Length_AVE);
            this.forecastDates = forecastedResultsWithTime.map(item => item.time);

            console.log('Forecast Values:', this.forecastValues);
            console.log('Forecast Dates:', this.forecastDates);

            // Combine forecasted values with historical values if needed
            this.combinedValues = [...this.realValues, ...this.forecastValues];
            this.combinedDates = [...this.realDates, ...this.forecastDates];

            this.createCombinedChart();
        },
        error: (error) => {
            console.error('Error fetching forecast data', error);
        },
        complete: () => {
            this.spinner.hide();
        }
      });

      resolve(); 
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
      colors: ['#40A2D8'], 
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
        categories: this.realTimes 
      }
    };
  }

  createCombinedChart() {
    this.monteCarlo = {
      series: [
        {
          name: "Real Values",
          data: this.realValues  
        },
        {
          name: "Forecasted Values",
          data: this.forecastValues
        }
      ],
      chart: {
        height: 550,
        type: "line",
        zoom: {
          enabled: false
        }
      },
      colors: ['#40A2D8', '#FF5733'],  
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
        categories: this.combinedDates 
      }
    };
  }
}
