import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/pages/home/home.component';
import { AuctionDetailComponent } from './components/pages/auction-detail/auction-detail.component';
import { CreateAuctionsComponent } from './components/shared-components/create-auctions/create-auctions.component';
import { AuctionFinishedComponent } from './components/pages/auction-finished/auction-finished.component';
import { ProfileComponent } from './components/pages/profile/profile.component';
import { UserRegisterComponent } from './components/pages/user-register/user-register.component';
import { ValidateComponent } from './components/shared-components/validate/validate.component';
import { PoliticaDeUsoComponent } from './components/shared-components/politica-de-uso/politica-de-uso.component';
import { AvisoPrivacidadComponent } from './components/shared-components/aviso-privacidad/aviso-privacidad.component';
import { AuthCallbackComponent } from './components/pages/auth-callback/auth-callback.component';
import { SearchResultComponent } from './components/pages/search-result/search-result.component';
import { MyAuctionDetailComponent } from './components/pages/my-auction-detail/my-auction-detail.component';
import { UserpageComponent } from './components/pages/userpage/userpage.component';
import { ChangePasswordComponent } from './components/shared-components/change-password/change-password.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'subasta-detalle/:id/:origen', component: AuctionDetailComponent },
    { path: 'my-subasta-detalle/:id', component: MyAuctionDetailComponent },
    { path: 'subasta-terminada/:permissionData', component: AuctionFinishedComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'crearSubasta', component: CreateAuctionsComponent },
    { path: 'registro', component: UserRegisterComponent },
    { path: 'userpage/:id', component: UserpageComponent },
    { path: 'payment-callback/:responseData', component: AuthCallbackComponent },
    { path: 'search-result', component: SearchResultComponent },
    { path: 'validate/:userValidateData', component: ValidateComponent },
    { path: 'change-password/:userValidateData', component: ChangePasswordComponent },
    { path: 'politica-de-uso', component: PoliticaDeUsoComponent },
    { path: 'aviso-de-privacidad', component: AvisoPrivacidadComponent },
    // { path: 'search-result/:paramSearch', component:SearchResultComponent },
    { path: '**', redirectTo: 'home' }
    // { path: '**', redirectTo: 'home' }
];


@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
