import { Component, OnInit, Output, EventEmitter  } from '@angular/core';
import { AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';    
import { CommonModule } from '@angular/common';
import { SubastasService } from '../../services/subastas.service';
import { Subasta } from '../../models/subasta.model';
import { interval } from 'rxjs';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-general-auctions',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './general-auctions.component.html',
  styleUrl: './general-auctions.component.css'
})

export class GeneralAuctionsComponent implements OnInit {
  generales: Subasta[] = [];
 
  constructor(private subastaService:SubastasService, private modalService: ModalService,private router: Router  ){
    
  }
  @Output() abrirDetalle = new EventEmitter<{ subasta: Subasta, lista: Subasta[], origen: string }>();
  ngOnInit(): void {
    this.subastaService.getAuctions('todas').subscribe({
      next: (data) => {
        this.generales = data.map(subasta => ({
          ...subasta,
          tiempoVence: subasta.tiempoVence, // ya viene del backend como string HH:mm:ss
          vencida: false
        }));
        interval(1000).subscribe(() => {
          const ahora = new Date();
        
          this.generales.forEach(subasta => {
            subasta.tiempoVence = this.restarUnSegundo(subasta.tiempoVence);
        
            if (subasta.tiempoVence === '00:00:00' && !subasta.vencida) {
              subasta.vencida = true;
        
              // Eliminar visualmente después de 1s (permite animación CSS)
              setTimeout(() => {
                this.generales = this.generales.filter(s => s !== subasta);
              }, 1000);
            }
          });
        });
        },
      error: (error) => {
        console.error('Error cargando subastas:', error);
      }    
    });
  }
  abrirModal(subasta: Subasta) {
    console.log('Subasta seleccionada:', subasta);
    //this.abrirDetalle.emit({ subasta,  origen: 'todas' });
    //this.modalService.abrir(subasta);
    this.router.navigate(['/subasta', subasta.id, 'Subastas Generales']);
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

 
}
