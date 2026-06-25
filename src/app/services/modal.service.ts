import { Injectable, signal } from '@angular/core';
import { Subasta } from '../models/subasta.model';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  subastaSeleccionada = signal<Subasta | null>(null);
  constructor() { }
  abrir(subasta: Subasta) {
    if (this.subastaSeleccionada() !== subasta) {
      this.subastaSeleccionada.set(subasta);
    }
  }

  cerrar() {
    this.subastaSeleccionada.set(null);
  }
}
