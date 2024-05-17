import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxSpinnerModule } from "ngx-spinner";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainDashboardComponent } from './main-dashboard/main-dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    MainDashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxSpinnerModule,

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
