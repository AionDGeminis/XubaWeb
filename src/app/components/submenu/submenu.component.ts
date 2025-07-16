import { Component,  Output, EventEmitter  } from '@angular/core';

@Component({
  selector: 'app-submenu',
  imports: [],
  templateUrl: './submenu.component.html',
  styleUrl: './submenu.component.css'
})
export class SubmenuComponent {
  @Output() mostrarNotificaciones = new EventEmitter<void>();
  onClickNotificaciones() {
    this.mostrarNotificaciones.emit();
  }
  recargarPagina() {
    location.reload(); // ← Esto emula un F5
  }

}
