import { Injectable, signal } from '@angular/core';
import { Subasta } from '../models/subasta.model';

@Injectable({
  providedIn: 'root'
})
export class LocalSignalsService {
  
    triggerFunction = signal(false);
    triggerFunctionID = signal(-1);
    triggerToogleFollowedG = signal(-1);

//   subastaSeleccionada = signal<Subasta | null>(null);
  constructor() { }

  ejecutarFuncion(){
    this.triggerFunction.set(true);
  }

  ejecutarFuncionByID(id: number){
    this.triggerFunctionID.set(id);
  }

  toogleFollowedIDG(id: number){
    this.triggerToogleFollowedG.set(id);
  }
//   abrir(subasta: Subasta) {
//     if (this.subastaSeleccionada() !== subasta) {
//       this.subastaSeleccionada.set(subasta);
//     }
//   }

//   cerrar() {
//     this.subastaSeleccionada.set(null);
//   }
}
