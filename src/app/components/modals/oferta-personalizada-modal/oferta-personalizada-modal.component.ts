import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-oferta-personalizada-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './oferta-personalizada-modal.component.html',
  styleUrl: './oferta-personalizada-modal.component.css'
})
export class OfertaPersonalizadaModalComponent {
  @Input() valorApuesta: number = 0;
  @Input() tiempoVence: string = '00:00:00';
  @Output() cerrar = new EventEmitter<void>();
  @Output() ofertar = new EventEmitter<number>();
  
  cantidad: number = 0;
  segundosRestantes: number = 0;
  tiempoRestante: string = '';
  intervalId: any;

  ngOnInit() {
    this.segundosRestantes = this.convertirTiempoASegundos(this.tiempoVence);
    this.iniciarCuentaRegresiva();
  } 

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }
  convertirTiempoASegundos(tiempo: string): number {
    const [h, m, s] = tiempo.split(':').map(Number);
    return h * 3600 + m * 60 + s;
  }
  iniciarCuentaRegresiva() {
    this.actualizarTiempoRestante();
  
    this.intervalId = setInterval(() => {
      this.segundosRestantes--;
  
      if (this.segundosRestantes <= 0) {
        this.tiempoRestante = '00:00:00';
        clearInterval(this.intervalId);
        alert('La subasta ha finalizado.');
        this.cerrar.emit();
      } else {
        this.actualizarTiempoRestante();
      }
    }, 1000);
  }
  
  actualizarTiempoRestante() {
    const horas = Math.floor(this.segundosRestantes / 3600);
    const minutos = Math.floor((this.segundosRestantes % 3600) / 60);
    const segundos = this.segundosRestantes % 60;
  
    this.tiempoRestante = 
      `${this.formatoDosDigitos(horas)}:${this.formatoDosDigitos(minutos)}:${this.formatoDosDigitos(segundos)}`;
  }
  
  formatoDosDigitos(valor: number): string {
    return valor < 10 ? `0${valor}` : `${valor}`;
  }
  
  emitirOferta() {
    if (this.cantidad > this.valorApuesta) {
      this.ofertar.emit(this.cantidad);
      this.cerrar.emit();
    } else {
      alert(`La oferta debe ser mayor a $${this.valorApuesta}`);
    }
  }
  sumarCantidad(monto: number) {
    this.cantidad = this.valorApuesta + monto;
  }

  cancelar() {
    this.cerrar.emit();
  }
}
