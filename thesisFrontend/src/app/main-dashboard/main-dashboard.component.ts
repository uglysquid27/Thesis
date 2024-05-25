import { Component, OnInit } from '@angular/core';
import { CountService } from '../service/CountService';
import { NgxSpinnerService } from 'ngx-spinner';
import { ChartOptions, bulanan } from './chart';

interface ForecastData {
  forecast_values: number[];
  forecast_dates: string[];
  original_values: number[];
  mape: number;
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
  forecastDates: string[] = [];
  originalValues: number[] = [];
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
      this.service.getReadPdmAssetoci1().subscribe({
        next: (data) => {
          const forecastData = data as ForecastData;
          this.resolved = true;
          console.log(forecastData);

          // Assign the respective properties to component variables
          this.forecastValues = forecastData.forecast_values;
          this.forecastDates = forecastData.forecast_dates;
          this.originalValues = forecastData.original_values;
          this.mape = forecastData.mape;

          console.log('Forecast Values:', this.forecastValues);
          console.log('Forecast Dates:', this.forecastDates);
          console.log('Original Values:', this.originalValues);
          console.log('MAPE:', this.mape);

          this.bulananChart();  // Proceed with using the separated data

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
          data: this.originalValues // Use the actual forecast values here
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
        categories: this.forecastDates // Use the actual forecast dates here
      }
    };
  }
}
