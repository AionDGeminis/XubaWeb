import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubastasService } from '../../services/subastas.service';
import { Subasta } from '../../models/subasta.model';
import { interval } from 'rxjs';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-vertical-premium-auctions',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './vertical-premium-auctions.component.html',
  styleUrl: './vertical-premium-auctions.component.css'
})
export class VerticalPremiumAuctionsComponent implements OnInit{
  auctions: Subasta[] = [];

  @Output() abrirDetalle = new EventEmitter<{ subasta: Subasta, lista: Subasta[], origen: string }>();

   constructor(      
      private subastaService: SubastasService,
      private modalService: ModalService
    ) {}


    ngOnInit(): void {
      this.subastaService.getAuctions('premium').subscribe({
        next: (data) => {
          this.auctions = data.map(subasta => ({
            ...subasta,
            tiempoVence: subasta.tiempoVence,
            vencida: false
          }));
  
          interval(1000).subscribe(() => {
            this.auctions.forEach(subasta => {
              subasta.tiempoVence = this.restarUnSegundo(subasta.tiempoVence);
  
              if (subasta.tiempoVence === '00:00:00' && !subasta.vencida) {
                subasta.vencida = true;
  
                setTimeout(() => {
                  this.auctions = this.auctions.filter(s => s !== subasta);
                }, 1000); // esperar animación
              }
            });
          });
        },
        error: (error) => {
          console.error('Error cargando subastas:', error);
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

abrirModal(subasta: Subasta): void {
  console.log('Subasta premium seleccionada:', subasta);
  this.abrirDetalle.emit({ subasta, lista: this.auctions, origen: 'Subastas Premium' });
  this.modalService.abrir(subasta);
}

}
