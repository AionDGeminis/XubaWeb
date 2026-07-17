import { Component, OnInit, Output, EventEmitter, effect } from '@angular/core';
import { AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubastasService } from '../../services/subastas.service';
import { Subasta } from '../../models/subasta.model';
import { interval, Subscription } from 'rxjs';
import { Router } from '@angular/router';    
import {CarouselModule, CarouselComponent } from 'ngx-owl-carousel-o';
import { AuthService } from '../../services/auth.service';
import { AuctionService } from '../../services/auction.service';
import { SharedService } from '../../services/shared.service';
import { LoaderComponent } from '../loader/loader.component';
import { LocalSignalsService } from '../../services/localsignals.service';
import { HostListener } from '@angular/core';
@Component({
  selector: 'app-premium-auctions',
  imports: [CommonModule, CarouselModule, LoaderComponent],
  standalone: true,
  templateUrl: './premium-auctions.component.html',
  styleUrl: './premium-auctions.component.css'
  
})

export class PremiumAuctionsComponent implements OnInit, AfterViewInit {
  @ViewChild('contenedor') contenedorRef!: ElementRef;

  mostrarFlechaIzquierda = false;
  mostrarFlechaDerecha = true;
  premium: Subasta[] = [];
  currentPage = 0;
  auctionsId: number[] = [];
  pagina = 1;
  cargandoMas = false;
  hayMas = true;
  private timer?: Subscription;
  timers: any[] = [];
  // currentIndex = 0;
  visibleCount = 4;
  itemsPorPagina = 4;
  transition = 'transform 0.5s cubic-bezier(.4,0,.2,1)';
  animacion = '';
  currentIndex = 0;

  customOptions = {
  loop: false,
  margin: 16,
  nav: false,
  dots: false,
  mouseDrag: false,
  touchDrag: true,
  pullDrag: false,
  slideBy: 4,

  responsive: {
    0: {
      items: 1,
      slideBy: 1
    },
    576: {
      items: 2,
      slideBy: 2
    },
    992: {
      items: 4,
      slideBy: 4
    }
  }
};
  loading: boolean = false;
  isFollowed: boolean = false;
  private intervalId: any;

  @Output() abrirDetalle = new EventEmitter<{ subasta: Subasta, lista: Subasta[], origen: string }>();
  @ViewChild('owlCar', { static: false }) owlCar!: CarouselComponent;
  @HostListener('window:resize') onResize() {this.updateItemsPorPagina();}

  constructor(private lss: LocalSignalsService, private subastaService:SubastasService,private router: Router, private authService: AuthService, private auctionService: AuctionService, private ss: SharedService){
    this.getSubastasSeguidas();
    effect(() => {
      if (this.lss.triggerFunctionID() > -1) {
        // this.miFuncion();
        // this.getSubastasSeguidas();
        this.auctionsId = this.auctionsId.length > 0 ? this.auctionsId.filter(x => x !== this.lss.triggerFunctionID()): this.auctionsId;
        this.lss.ejecutarFuncionByID(-1);
        // this.lss.triggerFunction.set(false);
      }
    });
  }


  
  ngOnInit(): void {
    this.updateItemsPorPagina();
    this.pagina = 1;
    this.subastaService.getAuctions('premium', 0, this.pagina).subscribe({
      next: (data) => {
        this.premium = data;
        for(let p of this.premium){
          p.venceSegundos = this.tiempoStringASegundos(p.tiempoVence);
        }
        this.setTimer(this.premium);
      },
      error: (error) => {
        console.error('Error cargando subastas:', error);
      }    
    
    });
  }
  updateItemsPorPagina() {
  const width = window.innerWidth;

  if (width <= 575) {
    this.itemsPorPagina = 1; // celular
  } else if (width <= 992) {
    this.itemsPorPagina = 2; // tablet
  } else {
    this.itemsPorPagina = 4; // desktop
  }
}

  // verificarSiSiguiendo(): void {
  //   const idUsuario = Number(this.authService.idUsuario);
  //   this.subastaService.ConsultarSiSiguiendo(idUsuario, this.subasta.id)
  //     .subscribe({
  //       next: res => this.isFollowed = res === true,
  //       // next: res => this.estaSiguiendo = res === true,
  //       error: err => console.error('Error seguimiento:', err)
  //     });
  // }

  setTimer(litaItems: any[]){
    this.intervalId = setInterval(() => {
      for(let item of litaItems){
        if (item.venceSegundos > 0) {
          item.venceSegundos--;
        }
      }
    }, 1000);
  }
 

  pad(n: number): string {
    return n < 10 ? '0' + n : n.toString();
  }

  
  // StartTimer(tiempovence: string, idSubasta: number){
  //   let _tiempoRestante = tiempovence.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
  //   if(tiempovence <= 0){

  //   } else {
  //     let _t = {

  //     }
  //   }
  // }

  // iniciarTemporizador(): void {
  //   this.temporizadorSub$?.unsubscribe();
  //   this.temporizadorSub$ = interval(1000).subscribe(() => {
  //     if (!this.vencida) {
  //       this.tiempoVence = this.restarUnSegundo(this.tiempoVence);
  //       if (this.tiempoVence === '00:00:00') {
  //         console.log('subasta terminada')
  //         this.vencida = true;
  //         this.temporizadorSub$?.unsubscribe();
  //         this.consultarGanador();
  //         this.router.navigate(['/subasta-terminada', 'comprador']);
  //       }
  //     }
  //   });
  // }

  getSubastasSeguidas(){
    const usuario = this.authService.currentUser();
      if (usuario) {
        const idUsuario = usuario.id;
        this.auctionService.getAuctions(idUsuario).subscribe({
          next: (data) => {
            console.log(data)
            this.auctionsId = data.map(subasta => subasta.id);
          },
          error: (error) => {
            console.error('Error cargando subastas:', error);
          }
      });
    } else {
      console.warn('Usuario no logueado, no se cargan subastas seguidas');
    }
  }

  isSeguida(idSubasta: number): boolean {
    let isFollowed = this.auctionsId.includes(idSubasta);
    return isFollowed;
  }

  toggleSeguida(idSubasta: number, event: Event, subasta: any): void {
    event.stopPropagation();
    const usuario = this.authService.currentUser();
   
    if(usuario){
      if(this.isSeguida(idSubasta)) {
      // this.auctionsId = this.auctionsId.filter(id => id !== idSubasta);
        this.subastaService.dejarDeSeguirSubasta(usuario!.id, idSubasta.toString()).subscribe({
          next: (data) => {
            console.log('resultado seguir subasta');
            console.log(data);
            this.getSubastasSeguidas();
            this.lss.ejecutarFuncion();
          },
          error: (error) => {
            console.error('Error al agregar subasta seguida:', error);
          }
        })
      } else {
        console.log(usuario!.id);
        this.auctionsId.push(idSubasta);
        this.subastaService.seguirSubasta(usuario!.id, idSubasta.toString()).subscribe({
          next: (data) => {
            console.log('resultado seguir subasta');
            console.log(data);
            this.getSubastasSeguidas();
            this.lss.ejecutarFuncion();
          },
          error: (error) => {
            console.error('Error al agregar subasta seguida:', error);
          }
        })
        // this.auctionsId.push(idSubasta);
      }
    }
  //  this.lss.ejecutarFuncion();
  }
  
 getTransform(): string {
  const card = document.querySelector('.auction-card') as HTMLElement;
  if (!card) return 'translateX(0px)';

  const gap = 16;
  const cardWidth = card.offsetWidth + gap;

  return `translateX(-${this.currentIndex * cardWidth}px)`;
}

  get totalPages() {
    return Math.ceil(this.premium.length / this.visibleCount);
  }

  get currentItems() {
    const start = this.currentPage * this.visibleCount;
    return this.premium.slice(start, start + this.visibleCount);
  }



next() {

  const ultimaPagina = Math.ceil(this.premium.length / this.itemsPorPagina) - 1;

  if (this.currentPage >= ultimaPagina) {

    this.cargarMasPremium();

    return;

  }

  this.currentPage++;
  this.currentIndex += this.itemsPorPagina;

}

prev() {

  if (this.currentPage == 0) {
    return;
  }

  this.currentPage--;
 this.currentIndex -= this.itemsPorPagina;

}
  ngAfterViewInit() {
    setTimeout(() => {
      const contenedor = this.contenedorRef.nativeElement;
     this.verificarScroll(contenedor);
    }, 100);
  }

  verificarScroll(contenedor: HTMLElement) {
    this.mostrarFlechaIzquierda = contenedor.scrollLeft > 0;
    this.mostrarFlechaDerecha =true;
  }

  scrollDerecha(contenedor: HTMLElement) {
    const anchoVisible = contenedor.offsetWidth;
    contenedor.scrollBy({ left: anchoVisible, behavior: 'smooth' });

    //setTimeout(() => this.verificarScroll(contenedor), 300);
  }

  scrollIzquierda(contenedor: HTMLElement) {
    const anchoVisible = contenedor.offsetWidth;
    contenedor.scrollBy({ left: -anchoVisible, behavior: 'smooth' });

    setTimeout(() => this.verificarScroll(contenedor), 300);
  }
  
  abrirDetalleSubasta(subasta: Subasta): void {
    // console.log('Subasta express seleccionada:', subasta);
    // this.router.navigate(['/subasta', subasta.id, 'Subastas Premium']);
    this.getDatosSubasta(subasta.id)
  }



  getDatosSubasta(id: number){
    this.loading = false;
    this.subastaService.getAuctionById(id).subscribe({
      next: (subasta) => {
        let tiempoVence = subasta.tiempoVence?? '00:00:00';
        let segundos: number, minutos: number, horas: number;
        let _tiempoRestante = tiempoVence.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
        console.log(_tiempoRestante);
        this.loading = false;
        if(_tiempoRestante > 0){
          this.router.navigate(['/subasta-detalle', subasta.id, 'SubastasPremium']);
        } else {
          let dataParams = JSON.stringify({ idSubasta: id, tipoUsuario:'comprador'});
          let encoded = this.ss.encodeToBase64(dataParams);
          this.router.navigate(['/subasta-terminada', encoded]);
        }
      },
      error: (err) => {
        console.error('Error fetching auction details:', err);
        this.loading = false;
      }
    })
    
    // subscribe(subasta => {
    //   let tiempoVence = subasta.tiempoVence?? '00:00:00';
    //   let segundos: number, minutos: number, horas: number;
    //   let _tiempoRestante = tiempoVence.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
    //   console.log(_tiempoRestante);
    //   this.loading = false;
    //   if(_tiempoRestante > 0){
    //     this.router.navigate(['/subasta', subasta.id, 'SubastasPremium']);
    //   } else {
    //     let dataParams = JSON.stringify({ idSubasta: id, tipoUsuario:'comprador'});
    //     let encoded = this.ss.encodeToBase64(dataParams);
    //     this.router.navigate(['/subasta-terminada', encoded]);
    //   }
    //     //console.log('Datos de la subasta:', subasta);
    // });
  }

  tiempoStringASegundos(tiempo: string) {
    const [h, m, s] = tiempo.split(':').map(Number);
    return h * 3600 + m * 60 + s;
  }
  
  // 2. Función para convertir segundos a "hh:mm:ss"
  segundosATiempoString(segundos: number) {
    const h = String(Math.floor(segundos / 3600)).padStart(2, '0');
    const m = String(Math.floor((segundos % 3600) / 60)).padStart(2, '0');
    const s = String(segundos % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  toCurrency(valor: number): string {
    return this.ss.toCurrency(valor);
  }


cargarMasPremium() {

  if (this.cargandoMas || !this.hayMas) {
    return;
  }

  this.cargandoMas = true;

  this.pagina++;

  this.subastaService.getAuctions('premium',0,this.pagina)
      .subscribe({

        next: respuesta => {

          if(respuesta.length==0){

            this.hayMas=false;

          }else{

            respuesta.forEach(x=>{

              x.venceSegundos=this.tiempoStringASegundos(x.tiempoVence);

            });

            this.premium.push(...respuesta);
            console.log(this.premium.length)

          }

          this.cargandoMas=false;

        },

        error: err=>{

          console.error(err);

          this.cargandoMas=false;

        }

      });

}

trackBySubasta(index: number, item: Subasta): number {
  return item.id;
}
}
