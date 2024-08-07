import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UrlHandlingStrategy } from '@angular/router';
import { environment } from '../../environments/environments';
import { Observable, catchError } from 'rxjs';

var api = environment.baseUrlApi;

interface ForecastResponse {
  forecastedResultsWithTime: Array<{ time: string, value: number }>;
  mape: number;
  steps: any;
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

  getDataSet(attributeName: string): Observable<any> {
    return this.httpClient.post<any>(api + 'data/fetch', { attributeName });
  }

  getArimaTest(attributeName: string): Observable<ForecastResponse> {
    return this.httpClient.post<ForecastResponse>(api + 'arima/arimacalc', { attributeName });
  }
  getMonteCarloTest(attributeName: string): Observable<ForecastResponse> {
    return this.httpClient.post<ForecastResponse>(api + 'montecarlo/' + 'montecarlocalc', { attributeName });
  }
  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');

    return this.httpClient.post(api + 'upload/', formData, { headers });
  }
}