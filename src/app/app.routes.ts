import { NgModule } from '@angular/core';
import {  RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AuctionDetailComponent } from './components/auction-detail/auction-detail.component';
import { CreateAuctionsComponent } from './components/create-auctions/create-auctions.component';
import { AuctionFinishedComponent } from './components/auction-finished/auction-finished.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'subasta/:id/:origen', component: AuctionDetailComponent },
    { path: 'subasta-terminada/:id/:tipoUsuario', component: AuctionFinishedComponent },
    { path: 'crearSubasta', component:CreateAuctionsComponent },
    { path: '**', redirectTo: 'home' }
];


@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]    
  })
  export class AppRoutingModule { }
