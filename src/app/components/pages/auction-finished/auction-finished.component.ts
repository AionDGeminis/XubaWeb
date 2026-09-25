import { Component, Input, OnInit, Signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SubastasService } from '../../../services/subastas.service';
import { Subasta, Usuario } from '../../../models/subasta.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../../services/shared.service';
import { LoaderComponent } from '../../shared-components/loader/loader.component';
import { AuctionStatus } from '../../../../enums/auction-estatus.enum';
import { AuctionClaveStatus } from '../../../../enums/auction-estatus-cve.enum';
import { SafeUrlPipe } from "../../../pipes/safeurl";
import { WinnerViewComponent } from "./views/winner-view/winner-view.component";
import { AnyuserViewComponent } from './views/anyuser-view/anyuser-view.component';
import { SellerViewComponent } from './views/seller-view/seller-view.component';
import { environment } from '../../../environment/environment';
import { OpenPayService } from '../../../services/openpay.service';
declare var OpenPay: any;

@Component({
  selector: 'app-auction-finished',
  imports: [CommonModule, FormsModule, LoaderComponent, SafeUrlPipe, WinnerViewComponent, AnyuserViewComponent, SellerViewComponent],
  templateUrl: './auction-finished.component.html',
  styleUrl: './auction-finished.component.css'
})
export class AuctionFinishedComponent implements OnInit {
  subasta!: Subasta;
  lista: Subasta[] = [];
  idSubasta: number = -1;
  ganadorInfo: any;
  loading: boolean = false;
  public usuario!: Signal<Usuario | null>;
  public isLoggedIn!: Signal<boolean>;
  hasPermiso: boolean = false;
  vendedor: any
  currentUser = { winner: false, any: false }
  textoLoading: string = 'Cargando...';
  dataParams: any = null;

  constructor(private route: ActivatedRoute, private openPayService: OpenPayService, private ss: SharedService, private authService: AuthService, private subastasService: SubastasService, private router: Router) {
    this.usuario = this.authService.currentUser;
    this.isLoggedIn = computed(() => !!this.usuario());
    let dataParams: any = this.route.snapshot.params['permissionData'];
    let decoded = this.ss.decodeFromBase64(dataParams);
    if (decoded) {
      this.hasPermiso = true;
      let jsonData = JSON.parse(decoded);
      // console.log(jsonData)
      this.idSubasta = jsonData.idSubasta;
    } else {
      // console.log('informacion de parametros no valida')
      this.hasPermiso = false;
    }
  }

  ngOnInit(): void {
    this.getInitialData(this.idSubasta);
  }

  checkCurrentUser() {

  }

  getInitialData(IdSubasta: number) {
    // this.getDatosSubasta(IdSubasta);
    this.getInformacionGanador(IdSubasta);
  }

  getDatosSubasta(id: number) {
    this.loading = true;
    // console.log(id)
    this.subastasService.getAuctionById(id).subscribe({
      next: (subasta) => {
        this.subasta = subasta;
        this.vendedor = subasta.musuarios;
        // console.log(this.subasta);
        // console.log(this.vendedor);
        this.loading = false;
      },
      error: (err) => {
        // console.error('Error fetching auction details:', err);
        this.loading = false;
      }
    })
  }

  getInformacionGanador(IdSubasta: number) {
    // console.log(IdSubasta)
    this.loading = true;
    this.subastasService.verificarGanadorSubasta(IdSubasta).subscribe({
      next: (response) => {
        this.loading = false;
        //     // console.log('informacion del ganador')
        // console.log(response);
        this.currentUser.winner = response.ganador;
        this.currentUser.any = !this.currentUser.winner;
        //     this.ganadorInfo = response;
        //     this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.currentUser.winner = false;
        this.currentUser.any = true;
        //     this.ss.showNotification('error', 'Error al obtener informacion del ganador');
        //     console.error('Error fetching winner information:', err);
      }
    });
  }

}
