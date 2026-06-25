import { Component, OnInit, Output, EventEmitter  } from '@angular/core';
import { AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubastasService } from '../../services/subastas.service';
import { Subasta } from '../../models/subasta.model';
import { interval } from 'rxjs';
import { Router } from '@angular/router';    
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-xpress-auctions',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './xpress-auctions.component.html',
  styleUrl: './xpress-auctions.component.css'
})
export class XpressAuctionsComponent implements OnInit, AfterViewInit {
  @ViewChild('contenedor') contenedorRef!: ElementRef;

  mostrarFlechaIzquierda = false;
  mostrarFlechaDerecha = true;
  xpress: Subasta[] = [];
  @Output() abrirDetalle = new EventEmitter<{ subasta: Subasta, lista: Subasta[], origen: string }>();
  constructor(private subastaService:SubastasService,private router: Router, private ss: SharedService){}
  ngOnInit(): void {
    this.subastaService.getAuctions('porvencer').subscribe({
      next: (data) => {
        this.xpress = data.map(subasta => ({
          ...subasta,
          tiempoVence: subasta.tiempoVence, // ya viene del backend como string HH:mm:ss
          vencida: false
        }));
        console.log('subastas express data: ')
        console.log(data)
      // Actualiza el contador cada segundo
        interval(1000).subscribe(() => {
          const ahora = new Date();
        
          this.xpress.forEach(subasta => {
            subasta.tiempoVence = this.restarUnSegundo(subasta.tiempoVence);
        
            if (subasta.tiempoVence === '00:00:00' && !subasta.vencida) {
              subasta.vencida = true;
        
              // Eliminar visualmente después de 1s (permite animación CSS)
              setTimeout(() => {
                this.xpress = this.xpress.filter(s => s !== subasta);
              }, 1000);
            }
          });
        });
        this.xpress[0].premium = true;
    },
      error: (error) => {
        console.error('Error cargando subastas express:', error);
      }
    
    });
  }
  restarUnSegundo(tiempo: string): string {
    const [h, m, s] = tiempo.split(':').map(Number);
    let total = h * 3600 + m * 60 + s - 1;
  
    if (total <= 0) return '00:00:00';
  
    const hh = Math.floor(total / 3600);
    const mm = Math.floor((total % 3600) / 60);
    const ss = total % 60;
  
    return `${this.pad(hh)}:${this.pad(mm)}:${this.pad(ss)}`;
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
    this.router.navigate(['/subasta-detalle', subasta.id, 'SubastasExpress']);
  }

  toCurrency(valor: number): string {
    return this.ss.toCurrency(valor);
  }


}
