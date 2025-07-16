import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubastasService } from '../../services/subastas.service';
import { Subasta } from '../../models/subasta.model';
import { BusquedaService } from '../../services/busqueda.service';

@Component({
  selector: 'app-search-auctions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-auctions.component.html',
  styleUrl: './search-auctions.component.css'
})
export class SearchAuctionsComponent implements OnChanges {
  @Input() terminoBusqueda = '';
  @Output() abrirDetalle = new EventEmitter<{ subasta: Subasta, lista: Subasta[], origen: string }>();

  resultados: Subasta[] = [];
  constructor(private subastaService: SubastasService, private busquedaService: BusquedaService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['terminoBusqueda'] && this.terminoBusqueda.trim()) {
      this.cargarResultados();
    }
  }
  
  volverAGenerales() {
    this.busquedaService.limpiar();
  }

  cargarResultados(): void {
    this.subastaService.buscarSubastas(this.terminoBusqueda).subscribe({
      next: (data) => {
        this.resultados = data.map(subasta => ({
          ...subasta,
          tiempoVence: subasta.tiempoVence,
          vencida: false
        }));
      },
      error: (error) => {
        console.error('Error buscando subastas:', error);
      }
    });
  }

  abrirModal(subasta: Subasta) {
    this.abrirDetalle.emit({ subasta, lista: this.resultados, origen: 'Resultados de Búsqueda' });
  }

}
