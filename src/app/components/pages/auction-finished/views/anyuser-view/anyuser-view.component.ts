import { Component, Input, OnInit } from '@angular/core';
import { DetalleSubasta, Subasta } from '../../../../../models/subasta.model';
import { SubastasService } from '../../../../../services/subastas.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-anyuser-view',
  imports: [CommonModule],
  templateUrl: './anyuser-view.component.html',
  styleUrl: './anyuser-view.component.css'
})
export class AnyuserViewComponent implements OnInit {
  @Input() subasta: DetalleSubasta | null = null;
  @Input() ganadorInfo: any | null = null;
  @Input() idSubasta!: number;
  loading: boolean = false;
  listaOtrosProductos: any[] = [];

  constructor(private subastasService: SubastasService, private router: Router) {

    // Initialization logic can go here
  }
  ngOnInit(): void {
    this.getDatosSubasta(this.idSubasta);
    this.getListaOtrosProductos();

  }



  getDatosSubasta(id: number) {
    this.loading = true;
    // this.subastasService.getAuctionById(id).subscribe({
    this.subastasService.ConsultarSubastaOfertarId(id).subscribe({
      next: (subasta) => {
        console.log(subasta)
        this.subasta = subasta;
        // this.precioActualSubasta = this.subasta.apuesta;
        // this.precioTotal = 10;
        this.loading = false;
        // this.getDireccionesEntrega();
        // this.getInformacionGanador(this.idSubasta);
        // this.getHistorialEstatus(this.idSubasta);

      },
      error: (err) => {
        console.error('Error fetching auction details:', err);
        this.loading = false;
      }
    })
  }

  getListaOtrosProductos() {
    // if (this.subasta && this.subasta.musuarios) {
    //   this.subastasService.getSubastasActivasVendedor(this.subasta.musuarios.id).subscribe({
    //     next: (productos) => {
    //       console.log(productos)
    //       this.listaOtrosProductos = productos.slice(0, 5);

    //     },
    //     error: (err) => {
    //       console.error('Error fetching products', err);
    //     }

    //   });
    // }
    // console.log(this.subasta);
  }

  goToDetail(idSubasta: number) {
    this.router.navigate(['/subasta-detalle', idSubasta, 'todas']);
  }
}
