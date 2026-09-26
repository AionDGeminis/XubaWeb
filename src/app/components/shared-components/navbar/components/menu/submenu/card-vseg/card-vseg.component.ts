import { CommonModule } from '@angular/common';
import { Component, Input, input } from '@angular/core';

@Component({
  selector: 'app-card-vseg',
  imports: [CommonModule],
  templateUrl: './card-vseg.component.html',
  styleUrl: './card-vseg.component.css'
})
export class CardVsegComponent {

  @Input() listaData: any[] = [];
}
