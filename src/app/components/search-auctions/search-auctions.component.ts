import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubastasService } from '../../services/subastas.service';
import { Subasta } from '../../models/subasta.model';
import { BusquedaService } from '../../services/busqueda.service';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-search-auctions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-auctions.component.html',
  styleUrl: './search-auctions.component.css'
})
export class SearchAuctionsComponent implements OnChanges, OnInit {
  @Input() terminoBusqueda = '';
  @Input() tipoSeccion = '';
  tipoTitulo: string = '';
  @Output() abrirDetalle = new EventEmitter<{ subasta: Subasta, lista: Subasta[], origen: string }>();

  resultados: Subasta[] = [];
  constructor(private ss: SharedService, private subastaService: SubastasService, private busquedaService: BusquedaService,private router: Router) {}
  
  ngOnInit(): void {
    switch(this.tipoSeccion){
      case 'SubastasPremium':
          this.tipoTitulo = 'Subastas PREMIUM';
          break;
      case 'SubastasExpress':
          this.tipoTitulo = 'Subastas EXPRESS';
          break;
      default:
          this.tipoTitulo = 'Subastas GENERALES';
          break;
        
    }
  }

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
    this.getDatosSubasta(subasta.id);
    // this.abrirDetalle.emit({ subasta, lista: this.resultados, origen: 'Resultados de Búsqueda' });
  }

  getDatosSubasta(id: number){
    this.subastaService.getAuctionById(id).subscribe(subasta => {
      let tiempoVence = subasta.tiempoVence?? '00:00:00';
      let segundos: number, minutos: number, horas: number;
      let _tiempoRestante = tiempoVence.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
      console.log(_tiempoRestante);
      if(_tiempoRestante > 0){
        let tipoOrigen = this.tipoSeccion !== '' ? this.tipoSeccion : 'Generales';
        this.router.navigate(['/subasta-detalle', subasta.id, tipoOrigen]);
      } else {
        let dataParams = JSON.stringify({ idSubasta: id, tipoUsuario:'comprador'});
        let encoded = this.ss.encodeToBase64(dataParams);
        this.router.navigate(['/subasta-terminada', encoded]);
      }
        //console.log('Datos de la subasta:', subasta);
    });
  }
  toCurrency(valor: number): string {
    return this.ss.toCurrency(valor);
  }

}
