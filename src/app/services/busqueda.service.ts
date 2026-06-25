import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BusquedaService {
  private terminoBusquedaSubject = new BehaviorSubject<string>('');

  terminoBusqueda$ = this.terminoBusquedaSubject.asObservable();

  setTermino(termino: string) {
    this.terminoBusquedaSubject.next(termino);
  }

  limpiar() {
    this.terminoBusquedaSubject.next('');
  }

}