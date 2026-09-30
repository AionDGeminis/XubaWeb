import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedService } from '../../../../../../../services/shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-card-sgan',
  imports: [CommonModule],
  templateUrl: './card-sgan.component.html',
  styleUrl: './card-sgan.component.css'
})
export class CardSganComponent {

  @Input() listaData: any[] = [];
  @Output() closeAllMenu = new EventEmitter<void>();
  constructor(private ss: SharedService, private router: Router) { }

  toCurrency(val: any) {
    return this.ss.toCurrency(val);
  }

  goToSubasta(IdSubasta: number) {
    this.closeAllMenu.emit();
    let dataParams = JSON.stringify({ idSubasta: IdSubasta, tipoUsuario: 'comprador' });
    let encoded = this.ss.encodeToBase64(dataParams);
    this.router.navigate(['/subasta-terminada', encoded]);
  }
}
