import { NgModule } from '@angular/core';
import {  RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AuctionDetailComponent } from './components/auction-detail/auction-detail.component';
import { CreateAuctionsComponent } from './components/create-auctions/create-auctions.component';
import { AuctionFinishedComponent } from './components/auction-finished/auction-finished.component';
import { ProfileComponent } from './components/profile/profile.component';
import { UserRegisterComponent } from './components/user-register/user-register.component';
import { UserpageComponent } from './components/userpage/userpage.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'subasta/:id/:origen', component: AuctionDetailComponent },
    { path: 'subasta-terminada/:permissionData', component: AuctionFinishedComponent },
    { path: 'profile', component:ProfileComponent },
    { path: 'crearSubasta', component:CreateAuctionsComponent },
    { path: 'preregistro', component:UserRegisterComponent },
    { path: 'userpage/:id', component:UserpageComponent },
    { path: '**', redirectTo: 'preregistro' }
    // { path: '**', redirectTo: 'home' }
];


@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]    
  })
  export class AppRoutingModule { }
