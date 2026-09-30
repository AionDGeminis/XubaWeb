import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedService } from '../../../../../../../services/shared.service';
import { Router } from '@angular/router';
import { SubastasService } from '../../../../../../../services/subastas.service';

@Component({
  selector: 'app-card-sseg',
  imports: [CommonModule],
  templateUrl: './card-sseg.component.html',
  styleUrl: './card-sseg.component.css'
})
export class CardSsegComponent {
  @Input() listaData: any[] = [];
  @Output() closeAllMenu = new EventEmitter<void>();
  listaVendedoresSeguidos: any[] = [];
  constructor(private ss: SharedService, private router: Router, private subastaService: SubastasService) {
    // this.getVendedoresSeguidos();
  }

  toCurrency(val: any) {
    return this.ss.toCurrency(val);
  }

  goToSubasta(IdSubasta: number) {
    this.closeAllMenu.emit();
    this.router.navigate(['/subasta-detalle', IdSubasta, 'SubastasGeneral']);
  }

}
