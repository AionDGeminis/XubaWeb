import { Component, Inject, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SignalRService } from '../../services/signalr.service';
import { AuthService } from '../../services/auth.service';
import { SubastasService } from '../../services/subastas.service';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../services/shared.service';
import { AuctionService } from '../../services/auction.service';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Subasta } from '../../models/subasta.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-auction-detail',
  imports: [CommonModule, FormsModule],
  templateUrl: './my-auction-detail.component.html',
  styleUrl: './my-auction-detail.component.css'
})
export class MyAuctionDetailComponent {
  subasta: Subasta | any = {};
  indexCurrentImage: number = 0;
  listaImagenes: any[] = [];
  mostrarModalCancelar = false;
  motivoCancelacion = '';
  subastaCancelada = false;
  private intervalId: any;
 constructor( private route: ActivatedRoute,
  private router: Router,
  private signalRService: SignalRService,
  private authService: AuthService,
  private subastasService: SubastasService,
  // private renderer: Renderer2,
  private toastr: ToastrService,
  private ss: SharedService,
  private auctionService: AuctionService,
  private renderer: Renderer2, 
  @Inject(DOCUMENT) private document: Document
  ) {
    const id     = +this.route.snapshot.paramMap.get('id')!;
    console.log(id)
    this.getInitialData(id);
  }

  getInitialData(IdSubasta: number){
    this.subastasService.getAuctionById(IdSubasta).subscribe(sub => {
      console.log(sub)
      this.subasta = sub;
      this.subasta.remaining = this.subasta.hora * 3600 + this.subasta.minuto * 60 + this.subasta.segundo
      this.listaImagenes = sub.mimagenesSubasta;
      this.setTimerV2();
      //  if(this.isLoggedIn()){
      //    // this.getSubastasSeguidas();
      //    this.getDireccionesEntrega(this.usuario()!.id, 'entrega');
      //  }
      //  // 2. Luego cargar la lista
      //  let tipo: 'porvencer' | 'premium' | 'todas' = 'todas';
 
      //  switch(this.origen) {
      //      case 'SubastasPremium':
      //        tipo = 'premium'
      //        break;
      //      case 'SubastasExpress':
      //        tipo = 'porvencer'
      //        break;
      //      default:
      //        tipo = 'todas';
      //        break;
      //  }
       // if (this.origen === 'SubastasPremium') tipo = 'premium';
       // else if (this.origen === 'SubastasExpress') tipo = 'porvencer';
   
       // console.log('Tipo de subastas a consultar:', tipo);
      //  this.subastasService.getAuctions(tipo).subscribe(list => {
      //    console.log('Lista recibida:', list);
      //    this.lista = list;
      //    let index = this.lista.findIndex( x => x.id === IdSubasta);
      //    this.indiceActual = index > -1? index:0;
      //    //console.log(index); 
        
      //   //  this.
      //   //  this.lista.unshift(this.subasta!);
   
      //    // 3. Ya tienes subasta y lista. Ahora sí puedes usar todo
      //    // this.indiceActual  = this.lista.findIndex(s => s.id === this.subasta!.id);
      //    // console.log(this.indiceActual)
      //    this.imagenActual  = this.subasta!.url;
      //    this.tiempoVence   = this.subasta!.tiempoVence ?? '00:00:00';
         
      //    this.iniciarTemporizador();
      //    this.verificarSiSiguiendo();
      //    this.conectarSignalR();
      //  });
     }); 
 }

 setTimerV2(){
  this.intervalId = setInterval(() => {
    // this.listaSubastas = this.listaSubastas.map(item => ({
    //   ...item,
    //   //this.toShort(item.descripcion),
    //   remaining: item.remaining > 0 ? item.remaining-1 : 0
    // }));
    //for(let s of this.listaSubastas){
      this.subasta.remaining = this.subasta.remaining -1;
    //}
  }, 1000);
}
formatTimeString(total: number): string {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
}
abrirModalCancelar() {
  this.mostrarModalCancelar = true;
}

cerrarModalCancelar() {
  this.mostrarModalCancelar = false;
  this.motivoCancelacion = '';
}

confirmarCancelacion() {

  const usuario = this.authService.currentUser();

  const data = {
    idSubasta: this.subasta.id,
    idUsuario: usuario?.id,
    motivo: this.motivoCancelacion
  };

  console.log('Datos enviados:', data);

  this.subastasService.cancelarSubastaVendedor(data).subscribe({
    next: (res: any) => {
      console.log('Respuesta del servidor:', res);

      // Cambiar el estatus en la vista
      this.subasta.estatus = 'Cancelada';

      // Ocultar el botón "Cancelar Subasta"
      this.subastaCancelada = true;

      this.toastr.success('Subasta cancelada correctamente');
      this.cerrarModalCancelar();
      clearInterval(this.intervalId);
    },
    error: (err) => {
      console.error(err);
      this.toastr.error('No se pudo cancelar la subasta');
    }
  });
}
}
