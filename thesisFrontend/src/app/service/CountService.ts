import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UrlHandlingStrategy } from '@angular/router';
import { environment } from '../../environments/environments';
import { Observable, catchError } from 'rxjs';

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
    return this.httpClient.get<ForecastResponse>(api + 'arima/' + "arimacalc");
  }
  getMonteCarloTest() {
    return this.httpClient.get<ForecastResponse>(api + 'montecarlo/' + 'montecarlocalc');
  }
  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');

    return this.httpClient.post(api + 'upload/', formData, { headers });
  }
}