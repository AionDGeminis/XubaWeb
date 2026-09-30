import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-card-noti',
  imports: [CommonModule],
  templateUrl: './card-noti.component.html',
  styleUrl: './card-noti.component.css'
})
export class CardNotiComponent {
  @Input() listaData: any[] = [];
  @Output() closeAllMenu = new EventEmitter<void>();

  constructor(private router: Router) { }

  goToSubasta(IdSubasta: number) {
    this.closeAllMenu.emit();
    this.router.navigate(['/subasta-detalle', IdSubasta, 'SubastasGeneral']);
  }


  tiempoRelativo(fechaCreada: Date | string, fechaActual: Date | string): string {
    const fecha = typeof fechaCreada === 'string' ? new Date(fechaCreada) : fechaCreada;
    const ahora = typeof fechaActual === 'string' ? new Date(fechaActual) : fechaActual;

    const segundos = Math.floor((ahora.getTime() - fecha.getTime()) / 1000);

    if (segundos < 0) {
      return 'Justo ahora';
    }

    const intervalos: { etiqueta: string; segundos: number }[] = [
      { etiqueta: 'año', segundos: 31536000 },
      { etiqueta: 'mes', segundos: 2592000 },
      { etiqueta: 'semana', segundos: 604800 },
      { etiqueta: 'día', segundos: 86400 },
      { etiqueta: 'hora', segundos: 3600 },
      { etiqueta: 'minuto', segundos: 60 },
    ];

    for (const intervalo of intervalos) {
      const cantidad = Math.floor(segundos / intervalo.segundos);
      if (cantidad >= 1) {
        const plural = cantidad > 1 ? (intervalo.etiqueta === 'mes' ? 'es' : 's') : '';
        return `Hace ${cantidad} ${intervalo.etiqueta}${plural}`;
      }
    }

    return 'Hace un momento';
  }
}
