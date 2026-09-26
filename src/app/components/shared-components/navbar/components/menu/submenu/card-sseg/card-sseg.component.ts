import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-sseg',
  imports: [CommonModule],
  templateUrl: './card-sseg.component.html',
  styleUrl: './card-sseg.component.css'
})
export class CardSsegComponent {
  @Input() listaData: any[] = [];
}
