import { NgModule } from '@angular/core';
import {  RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AuctionDetailComponent } from './components/auction-detail/auction-detail.component';
import { CreateAuctionsComponent } from './components/create-auctions/create-auctions.component';
import { AuctionFinishedComponent } from './components/auction-finished/auction-finished.component';
import { ProfileComponent } from './components/profile/profile.component';
import { UserRegisterComponent } from './components/user-register/user-register.component';
import { UserpageComponent } from './components/userpage/userpage.component';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { SearchResultComponent } from './components/search-result/search-result.component';
import { ValidateComponent } from './components/validate/validate.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { MyAuctionDetailComponent } from './components/my-auction-detail/my-auction-detail.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'subasta-detalle/:id/:origen', component: AuctionDetailComponent },
    { path: 'my-subasta-detalle/:id', component: MyAuctionDetailComponent },
    { path: 'subasta-terminada/:permissionData', component: AuctionFinishedComponent },
    { path: 'profile', component:ProfileComponent },
    { path: 'crearSubasta', component:CreateAuctionsComponent },
    { path: 'preregistro', component:UserRegisterComponent },
    { path: 'userpage/:id', component:UserpageComponent },
    { path: 'payment-callback/:responseData', component:AuthCallbackComponent },
    { path: 'search-result', component:SearchResultComponent },
    { path: 'validate/:userValidateData', component:ValidateComponent },
    { path: 'change-password/:userValidateData', component:ChangePasswordComponent },
    // { path: 'search-result/:paramSearch', component:SearchResultComponent },
    { path: '**', redirectTo: 'preregistro' }
    // { path: '**', redirectTo: 'home' }
];


@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]    
  })
  export class AppRoutingModule { }
