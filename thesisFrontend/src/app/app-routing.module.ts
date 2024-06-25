import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainDashboardComponent } from './main-dashboard/main-dashboard.component';
import { ImportComponent } from './import/import.component';
import { DetailComponent } from './detail/detail.component';

const routes: Routes = [
  {path: 'home', component: MainDashboardComponent},
  {path: 'import', component: ImportComponent},
  {path: 'detail', component: DetailComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
