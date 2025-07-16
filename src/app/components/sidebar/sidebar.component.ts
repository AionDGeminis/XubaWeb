import { Component, computed, Signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/subasta.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  usuario: Signal<Usuario | null>;

  menuItems = [
    { texto: 'MIS SUBASTAS', icono: 'iconos/xuba.png', ruta: '#' },
    { texto: 'DIRECCIÓN DE ENTREGA', icono: 'iconos/direccion.png', ruta: '#' },
    { texto: 'CONFIGURACIÓN', icono: 'iconos/configuracion.png', ruta: '#' },
    { texto: 'ENVÍOS', icono: 'iconos/envios.png', ruta: '#' },
    { texto: 'RECLAMOS', icono: 'iconos/reclamos.png', ruta: '#' },
    { texto: 'CERRAR SESIÓN', icono: 'iconos/cerrar.png', accion: 'logout' }
  ];

  constructor(private authService: AuthService) {
    this.usuario = this.authService.currentUser;
  }
  logout() {
    console.log('Cerrando sesión...');
    this.authService.logout();
  }
}