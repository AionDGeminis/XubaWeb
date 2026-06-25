import { Component, Input, OnInit } from '@angular/core';
import { Subasta } from '../../../../models/subasta.model';
import { SubastasService } from '../../../../services/subastas.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-anyuser-view',
  imports: [CommonModule],
  templateUrl: './anyuser-view.component.html',
  styleUrl: './anyuser-view.component.css'
})
export class AnyuserViewComponent implements OnInit {
  @Input() subasta: Subasta | null = null;
  @Input() ganadorInfo: any | null = null;
  listaOtrosProductos: any[] = [];

  constructor(private subastaService: SubastasService, private router: Router) {

    // Initialization logic can go here
  }
  ngOnInit(): void {
    this.getListaOtrosProductos();
  }

  


  getListaOtrosProductos(){
    if(this.subasta && this.subasta.musuarios){
      this.subastaService.getSubastasActivasVendedor(this.subasta.musuarios.id).subscribe({
        next: (productos) => {
          console.log(productos)
          this.listaOtrosProductos = productos.slice(0,5);
          
        },
        error: (err) => {
          console.error('Error fetching products', err);
        }

      });
    } 
   console.log(this.subasta); 
  }

  goToDetail(idSubasta: number){
    this.router.navigate(['/subasta-detalle', idSubasta, 'todas']);
  }
}
