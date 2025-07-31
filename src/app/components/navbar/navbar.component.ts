import { Component, ElementRef, ViewChild  } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BusquedaService } from '../../services/busqueda.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',  
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  @ViewChild('campoBusqueda') campoBusqueda!: ElementRef<HTMLInputElement>;


  constructor(private busquedaService: BusquedaService, private router: Router) {}
  mostrarBusqueda = false;
  textoBusqueda = '';

  toggleBusqueda() {
    if (!this.mostrarBusqueda) {
      this.textoBusqueda = '';      
    }
    this.mostrarBusqueda = !this.mostrarBusqueda;
    if (this.mostrarBusqueda) {
      setTimeout(() => {
        this.campoBusqueda.nativeElement.focus();
      });
    }
  }
  recargarPagina() {
    this.router.navigate(
      ['/home'],
    
    );
    // location.reload(); // ← Esto emula un F5

  }

  buscar() {
    const termino = this.textoBusqueda.trim();
    console.log('antes de buscar')
    if (termino) {
      this.busquedaService.setTermino(termino);
      this.mostrarBusqueda = false; // Oculta el campo
      this.textoBusqueda = ''; // Opcional: limpia el texto
    }
  }
}
