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
  ganadorInfo: any = {};
  impuestos = 0;
  comisionXuba = 0;
  gananciaTotal = 0;
  iva = 0;
  isr = 0;
  listaEstatus: any[] = [];
  loading = false;
  mostrarModalVistas = false;
  listaVistas: any[] = [];
  mostrarModalOfertas = false;
  listaOfertas: any[] = [];
  textoLoading = '';
  indexCurrentImage: number = 0;
  listaImagenes: any[] = [];
  mostrarGaleria = false;
  imagenSeleccionada = 0;
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

  this.loading = true;

  this.subastasService.getAuctionById(IdSubasta).subscribe({
    

    next:(sub)=>{

      this.subasta = sub;

      this.subasta.remaining =
        this.subasta.hora * 3600 +
        this.subasta.minuto * 60 +
        this.subasta.segundo;
        console.log(this.subasta.estatus);

      this.listaImagenes = sub.mimagenesSubasta;

      this.setTimerV2();

      this.getInformacionGanador(IdSubasta);

      this.getHistorialEstatus(IdSubasta);

      //this.CambiarEstatusSubasta(IdSubasta, 2);

      this.loading = false;

    },

    error:()=>{

      this.loading=false;

    }

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
getInformacionGanador(idSubasta:number){

  this.subastasService
      .GetInformacionSubastaTerminada(idSubasta)
      .subscribe({

        next:(resp)=>{

          this.ganadorInfo = resp;

          console.log(this.ganadorInfo);
          this.calcularGanancia();

        },

        error:(err)=>{

          console.error(err);

        }

      });

}
getHistorialEstatus(idSubasta: number) {

  this.subastasService.GetHistorialEstatusSubasta(idSubasta).subscribe({

     next: (resp: any) => {

  console.log("Historial:", resp);

  this.listaEstatus = resp;
  if (this.listaEstatus.length > 0) {
  this.subasta.estatus = this.listaEstatus[0].desStatus;
}

  if (this.listaEstatus.length > 0) {

    console.log("Primer estatus:", this.listaEstatus[0]);

  }

},

      error: (err) => {

        console.error(err);

      }

    });

}
onImgError(event: Event) {
  const img = event.target as HTMLImageElement;
  img.src = 'images/nofound5.jpg';
}
abrirGaleria(index: number = 0) {
  this.imagenSeleccionada = index;
  this.mostrarGaleria = true;
  this.document.body.style.overflow = 'hidden';
}

cerrarGaleria() {
  this.mostrarGaleria = false;
  this.document.body.style.overflow = 'auto';
}

seleccionarImagen(index: number) {
  this.imagenSeleccionada = index;
}

CambiarEstatusSubasta(idSubasta:number,nuevoEstatus:number){

  this.loading = true;

  this.subastasService.actualizarEstatusSubasta(idSubasta,nuevoEstatus).subscribe({

        next:(resp)=>{

          console.log(resp);

          this.loading = false;

          this.getInitialData(idSubasta);

          this.getHistorialEstatus(idSubasta);

          this.toastr.success("Estatus actualizado");

        },

        error:(err)=>{

          this.loading = false;

          console.error(err);

          this.toastr.error("No se pudo actualizar el estatus");

        }

      });

}
calcularGanancia() {

  const precioFinal = this.ganadorInfo.apuesta || 0;

  this.comisionXuba = precioFinal * 0.099;
  this.iva = precioFinal * 0.08;
  this.isr = precioFinal * 0.04;

  this.gananciaTotal =
    precioFinal -
    this.comisionXuba -
    this.iva -
    this.isr;

}
abrirModalVistas() {

  this.mostrarModalVistas = true;

}

cerrarModalVistas() {

  this.mostrarModalVistas = false;

}
abrirModalOfertas() {

  this.mostrarModalOfertas = true;

}

cerrarModalOfertas() {

  this.mostrarModalOfertas = false;

}

}
