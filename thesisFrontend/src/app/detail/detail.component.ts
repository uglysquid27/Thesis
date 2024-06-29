import { Component, OnInit } from '@angular/core';
import { CountService } from '../service/CountService';
import { NgxSpinnerService } from 'ngx-spinner';
import { monteCarlo, dataSet, monteCarloDetail, arimaDetail } from './chart';

interface ForecastResponse {
  forecastedResultsWithTime: Array<{ time: string, Label_Length_AVE: number }>;
  mape: number;
  steps: any;
}

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {
  public monteCarlo: Partial<monteCarlo> | any;
  public monteCarloDetail: Partial<monteCarloDetail> | any;
  public arimaDetail: Partial<arimaDetail> | any;
  public dataSet: Partial<dataSet> | any;
  public resolved: boolean = false;
  public loaddata: any;

  currentPage: number = 1;
  itemsPerPage: number = 5;

  getPaginatedItems(data: any[], page: number, itemsPerPage: number): any[] {
    const startIndex = (page - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  getTotalPages(data: any[]): number {
    return Math.ceil(data.length / this.itemsPerPage);
  }

  forecastValues: number[] = [];
  forecastDates: string[] = [];
  realValues: number[] = [];
  realDates: string[] = [];
  combinedValues: number[] = [];
  combinedDates: string[] = [];

  forecastValuesA: number[] = [];
  forecastDatesA: string[] = [];
  realValuesA: number[] = [];
  realDatesA: string[] = [];
  combinedValuesA: number[] = [];
  combinedDatesA: string[] = [];
  mape: number | undefined;
  steps: any;

  showSuccessAlert: boolean = true;
  deskripsi: any = 'Loading..';
i: any;

  constructor(private service: CountService, private spinner: NgxSpinnerService) { }

  closeSuccessAlert() {
    this.showSuccessAlert = false;
  }

  getFirstFiveItems(data: any[]): any[] {
    return data.slice(0, 5);
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
        this.realValues = [];
 
        dataArray.forEach(item => {
          if (item.time && item.Label_Length_AVE) {
            this.realDates.push(item.time);
            this.realValues.push(item.Label_Length_AVE);
          }
        });

        console.log(this.realValues);
        console.log(this.realDates);

        this.updateCharts();
      });

      this.service.getMonteCarloTest().subscribe({
        next: (data: ForecastResponse) => {
          console.log(data);

          // Access forecastedResultsWithTime from the response data
          const forecastedResultsWithTime = data.forecastedResultsWithTime;
          const mape = data.mape;
          this.steps = data.steps;

          // Sort the forecastedResultsWithTime array by date
          forecastedResultsWithTime.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

          console.log('Sorted Forecasted Results:', forecastedResultsWithTime);
          console.log('MAPE:', mape);

          // Extracting time and values for further processing or charting
          this.forecastValues = forecastedResultsWithTime.map(item => item.Label_Length_AVE);
          this.forecastDates = forecastedResultsWithTime.map(item => item.time);

          console.log('Forecast Values:', this.forecastValues);
          console.log('Forecast Dates:', this.forecastDates);

          // Combine forecasted values with historical values if needed
          this.combinedValues = [...this.realValues, ...this.forecastValues];
          this.combinedDates = [...this.realDates, ...this.forecastDates];

          this.updateCharts();
          this.monteCarloChartDetail();
        },
        error: (error) => {
          console.error('Error fetching forecast data', error);
        },
        complete: () => {
          this.spinner.hide();
        }
      });

      this.service.getArimaTest().subscribe({
        next: (data: ForecastResponse) => {
          console.log(data);

          // Access forecastedResultsWithTime from the response data
          const forecastedResultsWithTime = data.forecastedResultsWithTime;
          const mape = data.mape;

          // Sort the forecastedResultsWithTime array by date
          forecastedResultsWithTime.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

          console.log('Sorted Forecasted Results:', forecastedResultsWithTime);
          console.log('MAPE:', mape);

          // Extracting time and values for further processing or charting
          this.forecastValuesA = forecastedResultsWithTime.map(item => item.Label_Length_AVE);
          this.forecastDatesA = forecastedResultsWithTime.map(item => item.time);

          console.log('Forecast Values:', this.forecastValuesA);
          console.log('Forecast Dates:', this.forecastDatesA);

          // Combine forecasted values with historical values if needed
          this.combinedValuesA = [...this.realValues, ...this.forecastValuesA];
          this.combinedDatesA = [...this.realDates, ...this.forecastDatesA];

          this.updateCharts();
          this.ArimaChartDetail();
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

  updateCharts() {
    this.realValueChart();
    this.monteCarloChart();
  }

  realValueChart() {
    this.dataSet = {
      series: [
        {
          name: "Real Data",
          data: this.realValues
        },
        {
          name: "Monte Carlo",
          data: [...Array(this.realValues.length - 10).fill(null), ...this.forecastValues] // Pad with null values
        },
        {
          name: "Arima",
          data: [...Array(this.realValues.length - 10).fill(null), ...this.forecastValuesA] // Pad with null values
        }
      ],
      chart: {
        height: 550,
        type: "line",
        zoom: {
          enabled: false
        }
      },
      colors: ['#40A2D8', '#f24333', '#57cc99'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "straight"
      },
      title: {
        text: "Real and Forecasted Values",
        align: "left"
      },
      grid: {
        row: {
          colors: ["#254336", "transparent"],
          opacity: 0.5
        }
      },
      xaxis: {
        categories: this.combinedDates // Use combined dates for x-axis
      }
    };
  }

  monteCarloChart() {
    this.monteCarlo = {
      series: [
        {
          name: "Forecasted Values",
          data: [...Array(this.realValues.length - 10).fill(null), ...this.forecastValues] // Pad with null values
        }
      ],
      chart: {
        height: 550,
        type: "line",
        zoom: {
          enabled: false
        }
      },
      colors: ['#f24333'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "straight"
      },
      title: {
        text: "Forecasted Values",
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

  monteCarloChartDetail() {
    this.monteCarloDetail = {
       series: [
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
      colors: ['#f24333'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "straight"
      },
      title: {
        text: "Forecasted Values",
        align: "left"
      },
      grid: {
        row: {
          colors: ["#254336", "transparent"],
          opacity: 0.5
        }
      },
      xaxis: {
        categories: this.forecastDates
      }
    };
  }

  ArimaChartDetail() {
    this.arimaDetail = {
       series: [
        {
          name: "Forecasted Values",
          data: this.forecastValuesA
        }
      ],
      chart: {
        height: 550,
        type: "line",
        zoom: {
          enabled: false
        }
      },
      colors: ['#57cc99'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "straight"
      },
      title: {
        text: "Forecasted Values",
        align: "left"
      },
      grid: {
        row: {
          colors: ["#57cc99", "transparent"],
          opacity: 0.5
        }
      },
      xaxis: {
        categories: this.forecastDatesA,
      },
    };
  }
}
