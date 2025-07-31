import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubastasService } from '../../services/subastas.service';
import { Subasta } from '../../models/subasta.model';
import { interval } from 'rxjs';
import { Router } from '@angular/router';    
import {CarouselModule, CarouselComponent } from 'ngx-owl-carousel-o';
import { AuthService } from '../../services/auth.service';
import { AuctionService } from '../../services/auction.service';
@Component({
  selector: 'app-premium-auctions',
  imports: [CommonModule, CarouselModule],
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

  @Output() abrirDetalle = new EventEmitter<{ subasta: Subasta, lista: Subasta[], origen: string }>();
  @ViewChild('owlCar', { static: false }) owlCar!: CarouselComponent;

  constructor(private subastaService:SubastasService,private router: Router, private authService: AuthService, private auctionService: AuctionService){
    this.getSubastasSeguidas();
  }
  
  ngOnInit(): void {
    this.subastaService.getAuctions('premium').subscribe({
      next: (data) => {
        this.premium = data;
      },
      error: (error) => {
        console.error('Error cargando subastas:', error);
      }    
    
    });
  }
 

  pad(n: number): string {
    return n < 10 ? '0' + n : n.toString();
  }

  // currentIndex = 0;
  visibleCount = 4;
  transition = 'transform 0.5s cubic-bezier(.4,0,.2,1)';
  animacion = '';
  currentIndex = 0;

  customOptions = {
    loop: false,
    margin: 16,
    nav: false,
    dots: false,
    // navText: [
    //   '<span class="custom-nav-arrow">&lt;</span>',
    //   '<span class="custom-nav-arrow">&gt;</span>'
    // ],
    responsive: {
      0: { items: 1 },
      576: { items: 2 },
      768: { items: 3 },
      992: { items: 4 }
    }
  };

  getSubastasSeguidas(){
    const usuario = this.authService.currentUser();
      if (usuario) {
        const idUsuario = usuario.id;
        this.auctionService.getAuctions(idUsuario).subscribe({
          next: (data) => {
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

  toggleSeguida(idSubasta: number, event: Event): void {
    event.stopPropagation();
    const usuario = this.authService.currentUser();
    if(usuario){
       if (this.isSeguida(idSubasta)) {
      // this.auctionsId = this.auctionsId.filter(id => id !== idSubasta);
      } else {
        console.log(usuario!.id);
        this.subastaService.seguirSubasta(usuario!.id, idSubasta.toString()).subscribe({
          next: (data) => {
            console.log('resultado seguir subasta');
            console.log(data);
            this.getSubastasSeguidas();
          },
          error: (error) => {
            console.error('Error al agregar subasta seguida:', error);
          }
        })
        // this.auctionsId.push(idSubasta);
      }
    }
   
  }
  
  getTransform() {
    // 214 = 210px tarjeta + 2*2px margen (mx-2)
    return `translateX(-${this.currentIndex * 214}px)`;
  }

  get totalPages() {
    return Math.ceil(this.premium.length / this.visibleCount);
  }

  get currentItems() {
    const start = this.currentPage * this.visibleCount;
    return this.premium.slice(start, start + this.visibleCount);
  }



  next() {
    // if (this.currentPage < this.totalPages - 1) {
    //   this.animacion = 'animate__animated animate__slideInRight';
    //   this.currentPage++;
    //   setTimeout(() => this.animacion = '', 600);
    // }
    this.owlCar.next();
  }

  prev() {
    this.owlCar.prev();
    // if (this.currentPage > 0) {
    //   this.animacion = 'animate__animated animate__slideInLeft';
    //   this.currentPage--;
    //   setTimeout(() => this.animacion = '', 600);
    // }
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

    setTimeout(() => this.verificarScroll(contenedor), 300);
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
    this.subastaService.getAuctionById(id).subscribe(subasta => {
      let tiempoVence = subasta.tiempoVence?? '00:00:00';
      let segundos: number, minutos: number, horas: number;
      let _tiempoRestante = tiempoVence.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
      console.log(_tiempoRestante);
      if(_tiempoRestante > 0){
        this.router.navigate(['/subasta', subasta.id, 'Subastas Premium']);
      } else {
        this.router.navigate(['/subasta-terminada',subasta.id, 'comprador']);
      }
        //console.log('Datos de la subasta:', subasta);
    });
  }

}
