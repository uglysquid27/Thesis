import { Component, OnInit } from '@angular/core';
import { CountService } from '../service/CountService';
import { NgxSpinnerService } from 'ngx-spinner';
import { monteCarlo, dataSet, monteCarloDetail } from './chart';

interface ForecastResponse {
  forecastedResultsWithTime: Array<{ time: string, value: number }>;
  mape: number;
}

interface ForecastResult {
  time: string;
  value: number;
  
}

interface ForecastResponse {
  forecastedResultsWithTime: ForecastResult[];
  mape: number;
  steps: any;
  
}

@Component({
  selector: 'app-main-dashboard',
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.css']
})
export class MainDashboardComponent implements OnInit {
  public monteCarlo: Partial<monteCarlo> | any;
  public monteCarloDetail: Partial<monteCarloDetail> | any;
  public dataSet: Partial<dataSet> | any;
  public resolved: boolean = false;
  public loaddata: any;

  forecastValues: number[] = [];
  forecastDates: string[] = [];
  realValues: number[] = [];
  lastRealValues: number[] = [];
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

  showSuccessAlert: boolean = true;
  deskripsi: any = 'Loading..';

  constructor(private service: CountService, private spinner: NgxSpinnerService) { }

  closeSuccessAlert() {
    this.showSuccessAlert = false;
  }

  getErrorPercentage(realValue: number, forecastValue: number): number {
    return Math.abs((realValue - forecastValue) / realValue) * 100;
  }

  calculateMAPE(realValues: number[], forecastValues: number[]): number {
    if (realValues.length !== forecastValues.length) {
      return NaN; 
    }
    let totalError = 0;
    for (let i = 0; i < realValues.length; i++) {
      totalError += Math.abs((realValues[i] - forecastValues[i]) / realValues[i]);
    }
    return (totalError / realValues.length) * 100;
  }

  get mapeMc(): number {
    return this.calculateMAPE(this.lastRealValues, this.forecastValues);
  }

  get mapeA(): number {
    return this.calculateMAPE(this.lastRealValues, this.forecastValuesA);
  }

  fetchMonteCarloData(attributeName: string) {
    this.spinner.show();

    this.service.getMonteCarloTest(attributeName).subscribe({
      next: (data: ForecastResponse) => {
        console.log(data);
        
        const forecastedResultsWithTime = data.forecastedResultsWithTime;
        const mape = data.mape;

        forecastedResultsWithTime.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

        console.log('Sorted Forecasted Results:', forecastedResultsWithTime);
        console.log('MAPE:', mape);

        this.forecastValues = forecastedResultsWithTime.map(item => item.value);
        this.forecastDates = forecastedResultsWithTime.map(item => item.time);

        console.log('Forecast Values:', this.forecastValues);
        console.log('Forecast Dates:', this.forecastDates);

        this.combinedValues = [...this.realValues, ...this.forecastValues];
        this.combinedDates = [...this.realDates, ...this.forecastDates];

        this.updateCharts();
      },
      error: (error) => {
        console.error('Error fetching forecast data', error);
      },
      complete: () => {
        this.spinner.hide();
      }
    });
  }

  fetchData(attributeName: string) {
    this.service.getDataSet(attributeName).subscribe((data: any) => {
      const dataArray = Object.values(data) as any[];
  
      // console.log('Data Array:', dataArray); // Log the entire dataArray
  
      dataArray.sort((a, b) => {
        const dateA = new Date(a.time.split('/').reverse().join('-')).getTime();
        const dateB = new Date(b.time.split('/').reverse().join('-')).getTime();
        return dateA - dateB;
      });
  
      this.realDates = [];
      this.realValues = [];
  
      dataArray.forEach((item: any) => {
        // console.log('Item structure:', item);
  
        // Check if item is an array
        if (Array.isArray(item)) {
          item.forEach(subItem => {
            // console.log('SubItem structure:', subItem);
            
            const time = subItem.time;
            const value = subItem[attributeName];
            
            // console.log('Time:', time);
            // console.log('Value:', value);
  
            if (time && value) {
              // console.log('Entered if condition');
              this.realDates.push(time);
              this.realValues.push(value);
            }
          });
        } else {
          const time = item.time;
          const value = item[attributeName];
          
          // console.log('Time:', time);
          // console.log('Value:', value);
  
          if (time && value) {
            console.log('Entered if condition');
            this.realDates.push(time);
            this.realValues.push(value);
          }
        }
      });
  
      this.lastRealValues = this.realValues.slice(-10);
      // console.log(this.realValues);
      // console.log(this.realDates);
  
      this.updateCharts();
    }, error => {
      console.error('Error fetching data', error);
    });
  }
  
  

  fetchArimaForecast(attributeName: string) {
    this.spinner.show();

    this.service.getArimaTest(attributeName).subscribe({
      next: (data: any) => { // Use 'any' instead of a specific type
        console.log(data);
        
        // Access forecastedResultsWithTime from the response data
        const forecastedResultsWithTime = data.forecastedResultsWithTime;
        const mape = data.mape;

        // Sort the forecastedResultsWithTime array by date
        forecastedResultsWithTime.sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime());

        console.log('Sorted Forecasted Results:', forecastedResultsWithTime);
        console.log('MAPE:', mape);

        // Extracting time and values for further processing or charting
        this.forecastValuesA = forecastedResultsWithTime.map((item: any) => item[attributeName]);
        this.forecastDatesA = forecastedResultsWithTime.map((item: any) => item.time);

        console.log('Forecast Values:', this.forecastValuesA);
        console.log('Forecast Dates:', this.forecastDatesA);

        // Combine forecasted values with historical values if needed
        this.combinedValuesA = [...this.realValues, ...this.forecastValuesA];
        this.combinedDatesA = [...this.realDates, ...this.forecastDatesA];

        this.updateCharts();
      },
      error: (error) => {
        console.error('Error fetching forecast data', error);
      },
      complete: () => {
        this.spinner.hide();
      }
    });
}

  async ngOnInit(): Promise<void> {
    window.scrollTo(0, 0);
    this.spinner.show();

    this.loaddata = new Promise<void>((resolve, reject) => {
      this.fetchArimaForecast('Label_Length_AVE')
      this.fetchData('Label_Length_AVE')
      this.fetchMonteCarloData('Label_Length_AVE')
      // this.service.getDataSet().subscribe(data => {
      //   // console.log(data);

      //   const dataArray = Object.values(data);

      //   dataArray.sort((a, b) => {
      //     const dateA = new Date(a.time.split('/').reverse().join('-')).getTime();
      //     const dateB = new Date(b.time.split('/').reverse().join('-')).getTime();
      //     return dateA - dateB;
      //   });

      //   this.realDates = [];
      //   this.realValues = [];
 
      //   dataArray.forEach(item => {
      //     if (item.time && item.value) {
      //       this.realDates.push(item.time);
      //       this.realValues.push(item.value);
      //     }
      //   });
      //   this.lastRealValues = this.realValues.slice(-10);
      //   console.log(this.realValues);
      //   // console.log(this.realDates);

      //   this.updateCharts();
      // });

     

      // this.service.getMonteCarloTest().subscribe({
      //   next: (data: ForecastResponse) => {
      //     // console.log(data);

      //     // Access forecastedResultsWithTime from the response data
      //     const forecastedResultsWithTime = data.forecastedResultsWithTime;
      //     const mape = data.mape;

      //     // Sort the forecastedResultsWithTime array by date
      //     forecastedResultsWithTime.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

      //     console.log('Sorted Forecasted Results:', forecastedResultsWithTime);
      //     console.log('MAPE:', mape);

      //     // Extracting time and values for further processing or charting
      //     this.forecastValues = forecastedResultsWithTime.map(item => item.value);
      //     this.forecastDates = forecastedResultsWithTime.map(item => item.time);

      //     console.log('Forecast Values:', this.forecastValues);
      //     console.log('Forecast Dates:', this.forecastDates);

      //     // Combine forecasted values with historical values if needed
      //     this.combinedValues = [...this.realValues, ...this.forecastValues];
      //     this.combinedDates = [...this.realDates, ...this.forecastDates];

      //     this.updateCharts();
      //   },
      //   error: (error) => {
      //     console.error('Error fetching forecast data', error);
      //   },
      //   complete: () => {
      //     this.spinner.hide();
      //   }
      // });

    //   this.service.getArimaTest().subscribe({
    //     next: (data: ForecastResponse) => {
    //         console.log(data);
    
    //         // Access forecastedResultsWithTime from the response data
    //         const forecastedResultsWithTime = data.forecastedResultsWithTime;
    //         const mape = data.mape;
    
    //         // Sort the forecastedResultsWithTime array by date
    //         forecastedResultsWithTime.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    
    //         // console.log('Sorted Forecasted Results:', forecastedResultsWithTime);
    //         // console.log('MAPE:', mape);
    
    //         // Extracting time and values for further processing or charting
    //         this.forecastValuesA = forecastedResultsWithTime.map(item => item.value);
    //         this.forecastDatesA = forecastedResultsWithTime.map(item => item.time);
    
    //         // console.log('Forecast Values:', this.forecastValuesA);
    //         // console.log('Forecast Dates:', this.forecastDatesA);
    
    //         // Combine forecasted values with historical values if needed
    //         this.combinedValuesA = [...this.realValues, ...this.forecastValuesA];
    //         this.combinedDatesA = [...this.realDates, ...this.forecastDatesA];
    
    //         this.updateCharts();
    //     },
    //     error: (error) => {
    //         console.error('Error fetching forecast data', error);
    //     },
    //     complete: () => {
    //         this.spinner.hide();
    //     }
    // });    

      resolve();
    });

    await this.loaddata;
  }

  updateCharts() {
    console.log('masuk sini oy');
    
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
          // data: this.forecastValuesA // Pad with null values
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
}
