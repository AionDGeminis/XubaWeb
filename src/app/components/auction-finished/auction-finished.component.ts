import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SubastasService } from '../../services/subastas.service';
import { Subasta, Usuario } from '../../models/subasta.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../services/shared.service';
import { LoaderComponent } from '../loader/loader.component';
import { AuctionStatus } from '../../../enums/auction-estatus.enum';
declare var OpenPay: any;

@Component({
  selector: 'app-auction-finished',
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './auction-finished.component.html',
  styleUrl: './auction-finished.component.css'
})
export class AuctionFinishedComponent implements OnInit{

  subasta!: Subasta;
  lista: Subasta[] = [];
  usuario: Usuario | null = {} as Usuario;
  ganadorInfo: any;
  listaEstatus: any[] = [];
  loading: boolean = false;
  // origen = '';

  // // Estados de UI y datos
  // indiceActual = 0;
  // imagenActual = '';
  // tiempoVence = '00:00:00';
  // vencida = false;
  // valorApuesta = 0;
  // siguienteApuesta = 0;
  // estaSiguiendo = false;
  // mensajeFinal = '';
  // textoTruncado = false;

  // mostrarModal: boolean = false;
  // mostrarDetalles: boolean = false;
  // isModalOpen: boolean = false;

  // usuarioMayor = '';
  // estatus = '';
  // valorSubastaPersonalizada: number | null = null;

  // ganadoresLista: string[] = [];
  // ganadoresDetalles: { monto: string; usuario: string; fecha: string }[] = [];
  animatedClass = '';
  tarjeta = {
    holder_name: '',
    holder_lastname: '',
    card_number: '',
    expiration_month: '',
    expiration_year: '',
    cvv2: '',
    mail:'',
    phone: '',
  };
  openModal: boolean = false;
  constructor(private route: ActivatedRoute,private ss: SharedService, private authService: AuthService, private subastasService: SubastasService ) { 
    const dataParams: any  = this.route.snapshot.params;
    this.usuario = this.authService.currentUser();
    if(dataParams && dataParams.id){
      this.getInitialData(dataParams.id);
      this.getInformacionGanador(dataParams.id);
      this.getHistorialEstatus(dataParams.id);
    }
    // this.origen  = this.route.snapshot.paramMap.get('origen') || '';
    // console.log('Origen:', this.origen);
  }

  ngOnInit(): void {
    OpenPay.setId('mz5jjyzabcb3zzpevo0l');
    OpenPay.setApiKey('pk_f2da5530e74d4c7fbf292d886aba5e50');
    OpenPay.setSandboxMode(true);
    // throw new Error('Method not implemented.');
  }

  getInformacionGanador(IdSubasta: number){
    this.subastasService.GetInformacionSubastaTerminada(IdSubasta).subscribe(winnerInfo => {
      this.ganadorInfo = winnerInfo;
    });
  }

  getHistorialEstatus(IdSubasta: number){
    this.subastasService.GetHistorialEstatusSubasta(IdSubasta).subscribe((historial: any) => {
      console.log(historial);
      this.listaEstatus = historial;
    });
  }

  getInitialData(IdSubasta: number){
    this.subastasService.getAuctionById(IdSubasta).subscribe(sub => {
       this.subasta = sub;
      console.log(this.subasta);
       // 2. Luego cargar la lista
      //  let tipo: 'porvencer' | 'premium' | 'todas' = 'todas';
      //  if (this.origen === 'Subastas Premium') tipo = 'premium';
      //  else if (this.origen === 'Subastas Express') tipo = 'porvencer';
   
      //  console.log('Tipo de subastas a consultar:', tipo);
      //  this.subastasService.getAuctions(tipo).subscribe(list => {
      //    console.log('Lista recibida:', list);
      //    this.lista = list;
   
         // 3. Ya tienes subasta y lista. Ahora sí puedes usar todo
        //  this.indiceActual  = this.lista.findIndex(s => s.id === this.subasta.id);
        //  this.imagenActual  = this.subasta.url;
        //  this.tiempoVence   = this.subasta.tiempoVence ?? '00:00:00';
         
        //  this.iniciarTemporizador();
        //  this.verificarSiSiguiendo();
        //  this.conectarSignalR();
      //  });
     }); 
  }

  procesarPago(){
    if(!this.ss.isValidModel(this.tarjeta, [])){
      this.ss.showNotification('error', 'Datos faltantes');
      return;
    } else {
      //this.ss.showNotification('success', 'Correcto');
      console.log(this.tarjeta)
      this.tokenizarTarjeta();
      // this.loading = true; subasta-terminada/5483/comprador
    }
   
  }
  
  tokenizarTarjeta() {
    this.loading = true;
    const dataToken = {
      holder_name: this.tarjeta.holder_name,
      card_number: this.tarjeta.card_number,
      expiration_month: this.tarjeta.expiration_month,
      expiration_year: this.tarjeta.expiration_year,
      cvv2: this.tarjeta.cvv2
    };
    console.log('Tokenizing card with data:', dataToken);
    OpenPay.token.create(dataToken,
      (response: any) => {
        const token_id = response.data.id;
        this.GenerarCargo(token_id);
      },
      (error: any) => {
        this.loading = false;
        console.error('Error al tokenizar:', error);
      }
    );
  }

  GenerarCargo(tokenId: string){
    let userData = this.authService.getUserData();
    const dataCharge  = {
      'token': tokenId,
      'amount': this.subasta.apuesta,
      'description': 'Pago subasta GANADA-' + userData.id + '-'+this.subasta.caption,
      'name':this.tarjeta.holder_name,       
      'lastName':this.tarjeta.holder_lastname,       
      'email':this.tarjeta.mail,
      'phone':this.tarjeta.phone,       
    };
 
    console.log(dataCharge)
    this.subastasService.GenerarCargoSubastaPremium(dataCharge).subscribe({
      next: (response: any) => {
        this.loading = false;
        console.log(response);
        let res = JSON.parse(response.message);
        console.log(res);
        if(res.id && res.status && res.status === 'completed'){
          this.CambiarEstatusSubasta(this.subasta.id, AuctionStatus.PendientePago);
        }
      },
      error: (error: any) => {
        this.loading = false;
        console.error('Error al generar cargo:', error);
      }
        // this.generarCargoSuccess(response);
    });

  }

  //12 = Pendiente pago = 
  CambiarEstatusSubasta(idSubasta: number, nuevoEstatus: number) {
    this.subastasService.actualizarEstatusSubasta(idSubasta, nuevoEstatus).subscribe({
      next: (response) => {
        console.log('Estatus actualizado:', response);
      },
      error: (error) => {
        console.error('Error al actualizar estatus:', error);
      }
    });
  }

  onContentClick(event: MouseEvent) {
    event.stopPropagation();
  }

  closeModal(){
    if(this.loading) return;
    this.openModal = false;
  }

  openModalPago(){
    this.openModal = true;
  }

  onInput(event: any) {
    // Solo deja los dígitos del 0 al 9
    const soloNumeros = event.target.value.replace(/[^0-9]/g, '');
    this.tarjeta.card_number = soloNumeros;
    event.target.value = soloNumeros; // Actualiza el input si el usuario pegó algo no numérico
  }
}
