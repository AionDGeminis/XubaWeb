import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { SubastasService } from '../../../../../../../services/subastas.service';

@Component({
  selector: 'app-card-vseg',
  imports: [CommonModule],
  templateUrl: './card-vseg.component.html',
  styleUrl: './card-vseg.component.css'
})
export class CardVsegComponent {

  @Input() listaData: any[] = [];
  @Output() closeAllMenu = new EventEmitter<void>();
  listaVendedoresSeguidos: any[] = [];
  constructor(private router: Router, private subastaService: SubastasService) {
    this.getVendedoresSeguidos();
  }

  openUserPage(idVendedor: string) {
    this.closeAllMenu.emit();
    this.router.navigate(['/userpage', idVendedor]);
  }


  getVendedoresSeguidos() {
    this.subastaService.GetVendedoresSeguidos(0).subscribe({
      next: (vendedores: any) => {
        this.listaVendedoresSeguidos = vendedores;
        console.log('Vendedores seguidos:', vendedores);
      },
      error: (err) => {
        console.error('Error fetching vendedores seguidos:', err);
      }
    });
  }

  isFollowed(IdVendedor: number) {
    if (this.listaVendedoresSeguidos.length > 0) {
      return this.listaVendedoresSeguidos.some(vendedor => vendedor.id === IdVendedor);
    } else {
      return false;
    }
  }

  toggleSeguir($event: any, IdVendedor: number) {
    $event.stopPropagation();
    const data = { idVendedor: IdVendedor };
    if (this.isFollowed(IdVendedor)) {
      this.dejarSeguirVendedor(data);
    } else {
      this.seguirVendedor(data);
    }
  }

  seguirVendedor(data: any) {
    this.subastaService.seguirVendedor(data).subscribe({
      next: (response: any) => {
        this.getVendedoresSeguidos();
      },
      error: (err) => {
        console.error('Error al seguir al vendedor:', err);
      }
    });
  }

  dejarSeguirVendedor(data: any) {
    this.subastaService.noseguirVendedor(data).subscribe({
      next: (response: any) => {
        this.getVendedoresSeguidos();
      },
      error: (err) => {
        console.error('Error al dejar de seguir:', err);
      }
    });
  }
}
