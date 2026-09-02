import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appSoloDecimal]',
  standalone: true
})
export class SoloDecimalDirective {

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {

    const input = event.target as HTMLInputElement;

    const permitidas = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'Home',
      'End'
    ];

    if (permitidas.includes(event.key)) {
      return;
    }

    // Permitir números
    if (/^\d$/.test(event.key)) {

      // Evitar 01, 02, 0001...
      if (
        input.selectionStart === 1 &&
        input.value === '0' &&
        !input.value.includes('.')
      ) {
        event.preventDefault();
      }

      return;
    }

    // Permitir un solo punto
    if (
      event.key === '.' &&
      !input.value.includes('.')
    ) {
      return;
    }

    event.preventDefault();

  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {

    const input = event.target as HTMLInputElement;

    let valor = input.value;

    // Eliminar caracteres inválidos
    valor = valor.replace(/[^\d.]/g, '');

    // Solo un punto
    const partes = valor.split('.');

    if (partes.length > 2) {

      valor = partes[0] + '.' + partes.slice(1).join('');

    }

    // Máximo dos decimales

    if (valor.includes('.')) {

      let [entero, decimal] = valor.split('.');

      decimal = (decimal || '').slice(0, 2);

      valor = entero + (decimal.length ? '.' + decimal : '.');
    }

    // Eliminar ceros iniciales

    if (/^0\d+/.test(valor)) {

      valor = valor.replace(/^0+/, '');

    }

    const cursor = input.selectionStart ?? valor.length;

    if (input.value !== valor) {
      input.value = valor;

      input.setSelectionRange(
        Math.min(cursor, input.value.length),
        Math.min(cursor, input.value.length)
      );
    }

  }

}
