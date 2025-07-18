import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-auctions',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-auctions.component.html',
  styleUrl: './create-auctions.component.css'
})
export class CreateAuctionsComponent {
  selectedTab = 0;

  imagenes: string[] = [];
  tipoSubasta: 'general' | 'premium' = 'general';
  descripcionGeneral = '';

  onFileChange(event: any) {
    const files = event.target.files;
    if (files && files.length + this.imagenes.length <= 5) {
      for (let i = 0; i < files.length && this.imagenes.length < 5; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagenes.push(e.target.result);
        };
        reader.readAsDataURL(files[i]);
      }
    }
  }

  eliminarImagen(index: number) {
    this.imagenes.splice(index, 1);
  }
}
