import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UrlHandlingStrategy } from '@angular/router';
import { environment } from '../../environments/environments';
import { catchError } from 'rxjs';

var api = environment.baseUrlApi;

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

  getReadPdmAssetoci1() {
    return this.httpClient.get(api + 'pdm/' + "pdmassetoci1");
  }
}