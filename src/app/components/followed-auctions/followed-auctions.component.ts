import { Component, OnInit,Output, EventEmitter, OnDestroy  } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/subasta.model';
import { CommonModule } from '@angular/common';
import { AuctionService } from '../../services/auction.service';
import { Subasta } from '../../models/subasta.model';
import { interval, Subscription } from 'rxjs';
@Component({
  selector: 'app-followed-auctions',
  templateUrl: './followed-auctions.component.html',
  styleUrls: ['./followed-auctions.component.css'],
  standalone: true,
  imports:[CommonModule]
})
export class FollowedAuctionsComponent implements OnInit, OnDestroy  {
  auctions: Subasta[] = [];
  private temporizadorSub!: Subscription;

  @Output() abrirDetalle = new EventEmitter<{ subasta: Subasta, lista: Subasta[], origen: string }>();

  constructor(
    private authService: AuthService,
    private auctionService: AuctionService
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.currentUser();

    if (usuario) {
      const idUsuario = usuario.id;
    this.auctionService.getAuctions(idUsuario).subscribe({
       next: (data) => {
          this.auctions = data.map(subasta => ({
            ...subasta,
            tiempoVence: subasta.tiempoVence ?? '00:00:00',
            vencida: false
          }));

          this.temporizadorSub = interval(1000).subscribe(() => {
            this.auctions.forEach(subasta => {
              subasta.tiempoVence = this.restarUnSegundo(subasta.tiempoVence);

              if (subasta.tiempoVence === '00:00:00' && !subasta.vencida) {
                subasta.vencida = true;
              }
            });
          });
        },
        error: (error) => {
          console.error('Error cargando subastas:', error);
        }
      });
  } else {
    console.warn('Usuario no logueado, no se cargan subastas seguidas');
  }
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
  console.log('Subasta seguida seleccionada:', subasta);
  this.abrirDetalle.emit({ subasta, lista: this.auctions, origen: 'Subastas Seguidas' }); // usa el arreglo correcto aquí
}

ngOnDestroy(): void {
  if (this.temporizadorSub) {
    this.temporizadorSub.unsubscribe();
  }
}

get uniqueId() {
  return (subasta: Subasta, index: number) => `${subasta.id}_${index}`;
}
}