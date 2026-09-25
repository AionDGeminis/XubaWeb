import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';
import { LoaderComponent } from '../../shared-components/loader/loader.component';
import { SubastasService } from '../../../services/subastas.service';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-search-result',
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './search-result.component.html',
  styleUrl: './search-result.component.css'
})
export class SearchResultComponent {

  search: any;
  resultados: any[] = [];
  loading: boolean = false;
  constructor(private router: Router, private subastaService: SubastasService, private ss: SharedService) {

  }

  // searchResult(){

  // }

  obtenerResultados(): void {
    this.loading = true;
    this.subastaService.buscarSubastas(this.search).subscribe({
      next: (data) => {
        this.resultados = data.map(subasta => ({
          ...subasta,
          short_desc: subasta.descripcion.substring(0, 30),
          tiempoVence: subasta.tiempoVence,
          vencida: false
        }));
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Error buscando subastas:', error);
      }
    });
  }

  toCurrency(valor: number): string {
    return this.ss.toCurrency(valor);
  }

  toDetail(subasta: any) {
    this.router.navigate(['/subasta-detalle', subasta.id, 'SearchResults']);
  }
}
