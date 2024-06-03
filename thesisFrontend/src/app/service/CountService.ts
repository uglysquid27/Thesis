import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UrlHandlingStrategy } from '@angular/router';
import { environment } from '../../environments/environments';
import { catchError } from 'rxjs';

var api = environment.baseUrlApi;

interface ForecastResponse {
  forecastedResultsWithTime: Array<{ time: string, Label_Length_AVE: number }>;
  mape: number;
}

@Injectable({
  providedIn: 'root'
})
export class CountService {
  constructor(private httpClient: HttpClient,) { }
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  getDataSet() {
    return this.httpClient.get(api + 'data/');
  }
  getArimaTest() {
    return this.httpClient.get(api + 'arima/' + "testing");
  }
  getMonteCarloTest() {
    return this.httpClient.get<ForecastResponse>(api + 'montecarlo/');
  }
}