import { Component, OnInit } from '@angular/core';
import { CountService } from '../service/CountService';
import { NgxSpinnerService } from 'ngx-spinner';
import { ChartOptions, bulanan } from './chart';

interface ForecastData {
  forecastedAverages: number[];
  forecast_dates: string[];
  mape: number;
}

interface OriginalValue {
  historicalValues: { time: string; Label_Length_AVE: number }[];
}

@Component({
  selector: 'app-main-dashboard',
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.css']
})
export class MainDashboardComponent implements OnInit {
  public bulanan: Partial<bulanan> | any;
  public resolved: boolean = false;
  public loaddata: any;

  forecastValues: number[] = [];
  realValues: number[] = [];
  realDates: string[] = [];
  originalValues: { time: string; Label_Length_AVE: number }[] = [];
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
      this.service.getMonteCarloTest().subscribe({
        next: (data) => {
          const forecastData = data as ForecastData;
          const orgValue = data as OriginalValue
          this.resolved = true;
          console.log(forecastData.forecastedAverages );
          this.forecastValues = forecastData.forecastedAverages;
          this.originalValues = orgValue.historicalValues;
          this.mape = forecastData.mape;

          console.log('Forecast Values:', this.forecastValues);
          console.log('Original Values:', this.originalValues);
          console.log('MAPE:', this.mape);

          this.originalValues.forEach((value, index) => {
            this.realValues.unshift(value.Label_Length_AVE)
            this.realDates.push(value.time)
          });

          this.bulananChart(); 

          resolve();
        },
        error: (error) => {
          console.error('Error fetching data', error);
          reject(error);
        },
        complete: () => {
          this.spinner.hide();
        }
      });
    });

    await this.loaddata;
  }

  bulananChart() {
    this.bulanan = {
      series: [
        {
          name: "Desktops",
          data: this.realValues // Use the actual forecast values here
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
        categories: this.realDates // Use the actual forecast dates here
      }
    };
  }
}
