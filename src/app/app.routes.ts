import { NgModule } from '@angular/core';
import {  RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AuctionDetailComponent } from './components/auction-detail/auction-detail.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'subasta/:id', component: AuctionDetailComponent },
    { path: '**', redirectTo: '' }
];


@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]    
  })
  export class AppRoutingModule { }
