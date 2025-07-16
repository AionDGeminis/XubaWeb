import { Component, ViewEncapsulation, computed, effect, HostListener } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { SearchAuctionsComponent } from '../search-auctions/search-auctions.component';
import { XpressAuctionsComponent } from '../xpress-auctions/xpress-auctions.component';
import { GeneralAuctionsComponent } from '../general-auctions/general-auctions.component';
import { PremiumAuctionsComponent } from '../premium-auctions/premium-auctions.component';
import { FollowedAuctionsComponent } from '../followed-auctions/followed-auctions.component';
import { NotificationsComponent } from '../notifications/notifications.component';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { BusquedaService } from '../../services/busqueda.service';
import { Usuario, Subasta } from '../../models/subasta.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    SearchAuctionsComponent,
    XpressAuctionsComponent,
    GeneralAuctionsComponent,
    PremiumAuctionsComponent,
    FollowedAuctionsComponent,
    NotificationsComponent,
    LoginComponent,
    RegisterComponent,
    ReactiveFormsModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('fadeSlideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('350ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent {
  title = 'XUBA';
  usuario!: typeof AuthService.prototype.currentUser;
  isLoggedIn = computed(() => !!this.usuario());


  menuVisible = false;
  mostrarNoti = false;
  mostrarRegistro = false;
  terminoBusqueda = '';

  constructor(
    private authService: AuthService,
    private busquedaService: BusquedaService,
    private router: Router
  ) {
    this.busquedaService.terminoBusqueda$.subscribe(
      termino => this.terminoBusqueda = termino
    );
  
    effect(() => console.log('¿Está logueado?', this.isLoggedIn()));
  }

  @HostListener('document:click', ['$event.target'])
  onClickFuera(target: HTMLElement) {
    const dentroDelMenu =
      target.closest('.sidebar') || target.closest('.perfil-toggle-wrapper');
    if (!dentroDelMenu) {
      this.menuVisible = false;
    }
  }

  toggleSidebar() {
    this.menuVisible = !this.menuVisible;
  }

  toggleNotificaciones() {
    this.mostrarNoti = !this.mostrarNoti;
  }

  abrirRegistroModal() {
    this.mostrarRegistro = true;
  }

  cerrarRegistroModal() {
    this.mostrarRegistro = false;
  }

  recargarPagina() {
    window.location.reload();
  }

  /**
   * Navega a la ruta de detalle con id y origen como queryParam.
   */
  abrirDetalle(event: { subasta: Subasta; lista: Subasta[]; origen: string }) {
    const { subasta, origen } = event;
    this.router.navigate(
      ['/subasta', subasta.id],
      { queryParams: { origen } }
    );
  }
}
