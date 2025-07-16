import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubastasService } from '../../services/subastas.service';
import { Subasta } from '../../models/subasta.model';
import { interval } from 'rxjs';


@Component({
  selector: 'app-premium-auctions',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './premium-auctions.component.html',
  styleUrl: './premium-auctions.component.css'
})
export class PremiumAuctionsComponent implements OnInit, AfterViewInit {
  @ViewChild('contenedor') contenedorRef!: ElementRef;

  mostrarFlechaIzquierda = false;
  mostrarFlechaDerecha = true;
  premium: Subasta[] = [];
  @Output() abrirDetalle = new EventEmitter<{ subasta: Subasta, lista: Subasta[], origen: string }>();
  constructor(private subastaService:SubastasService){}
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
  
  abrirModal(subasta: Subasta): void {
    console.log('Subasta express seleccionada:', subasta);
    this.abrirDetalle.emit({ subasta, lista: this.premium, origen: 'Subastas Express' }); // usa el array que tengas
  }

}
