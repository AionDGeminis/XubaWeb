import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-sgui',
  imports: [CommonModule],
  templateUrl: './card-sgui.component.html',
  styleUrl: './card-sgui.component.css'
})
export class CardSguiComponent {
  @Input() listaData: any[] = [];

}
