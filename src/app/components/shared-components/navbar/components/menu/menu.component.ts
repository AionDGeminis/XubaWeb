import { Component, EventEmitter, Input, input, Output, Signal, viewChild } from '@angular/core';
import { AuthService } from '../../../../../services/auth.service';
import { SubastasService } from '../../../../../services/subastas.service';
import { SharedService } from '../../../../../services/shared.service';
import { SignalRNotificationService } from '../../../../../services/signalrnotifications.service';
import { Usuario } from '../../../../../models/subasta.model';
import { CommonModule } from '@angular/common';
import { SubmenuComponent } from './submenu/submenu.component';
import { Router } from '@angular/router';
import { NuevaSubastaModalComponent } from '../../../modals/nueva-subasta-modal/nueva-subasta-modal.component';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, SubmenuComponent, NuevaSubastaModalComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  @Output() close = new EventEmitter<void>();
  @Output() showModalCrearSubasta = new EventEmitter<void>();
  @Input() showBack: boolean = false;
  public isLoggedIn!: Signal<boolean>;
  public usuario!: Signal<Usuario | null>;

  hiddenMenuClass = { container: 'animate__fadeIn', menu: 'animate__fadeInLeft' };;
  showHiddenMenu: boolean = false;
  showHiddenSubmenu: boolean = false;

  loginClass: string = '';
  showLoginForm: boolean = false;
  loginForm: any = { usuario: null, pass: null };

  showModalNuevaSubasta: boolean = false;
  totalNotificaciones: number = 10;
  tipoSubmenu: string = '';
  tituloSubmenu: string = '';
  submenu = viewChild(SubmenuComponent);

  constructor(
    // private busquedaService: BusquedaService,
    // private router: Router, private route: ActivatedRoute,
    private signalRNotiService: SignalRNotificationService,
    private ss: SharedService,
    private subastaService: SubastasService,
    private router: Router,

    // private auctionService: AuctionService,
    // private openPayService: OpenPayService,
    // private location: Location,
    private authService: AuthService) {
    this.isLoggedIn = this.authService.isLoggedIn;
    this.usuario = this.authService.currentUser;
  }


  openProfilePage() {
    // this.fnToggleMenu();
    this.closeHiddenMenu();
    this.router.navigate(['/profile']);
  }

  fnToggleMenu() {
    if (this.showHiddenMenu) {
      this.closeHiddenMenu();
    } else {
      this.openHiddenMenu();
    }
  }

  toggleLoginForm() {
    if (this.showHiddenMenu) {
      this.closeHiddenMenu();
    }
    if (this.showLoginForm) {
      this.closeLoginForm();
    } else {
      this.openLoginForm();
      // this.loginForm.usuario = null;
      // this.loginForm.pass = null;
      // this.loginClass = 'animate__fadeIn';
      // this.showLoginForm = true;
    }
  }

  openLoginForm() {
    this.loginForm.usuario = null;
    this.loginForm.pass = null;
    this.loginClass = 'animate__fadeIn';
    this.showLoginForm = true;
  }

  closeLoginForm() {
    this.loginClass = 'animate__fadeOut';
    setTimeout(() => {
      this.showLoginForm = false;
      this.loginClass = '';
    }, 250);
  }

  closeHiddenMenu() {
    if (this.showHiddenSubmenu) this.closeSubmenu();
    this.hiddenMenuClass = { container: 'animate__fadeOut', menu: 'animate__fadeOutLeft' };
    setTimeout(() => {
      this.close.emit();
      // this.showHiddenMenu = false;
      // this.hiddenMenuClass = { container: '', menu: '' };
    }, 250);
  }

  openHiddenMenu() {
    this.hiddenMenuClass = { container: 'animate__fadeIn', menu: 'animate__fadeInLeft' };
    this.showHiddenMenu = true;
  }


  openSubmenu(tipo: string, titulo: string) {
    // if (this.showHiddenSubmenu) {
    this.tipoSubmenu = tipo;
    this.tituloSubmenu = titulo;
    this.submenu()?.closeNoEmit();
    setTimeout(() => {
      this.showHiddenSubmenu = false;
      setTimeout(() => {
        this.showHiddenSubmenu = true;
      }, 100);
    }, 100);


    // } else {
    //   this.showHiddenSubmenu = true;




    // this.tipoSubmenu = tipo;
    // this.tituloSubmenu = titulo;

  }

  closeSubmenu() {
    this.showHiddenSubmenu = false;
  }

  backToHome() {
    this.closeHiddenMenu();
    this.router.navigate(['/home']);
  }


  openModalNuevaSubasta(): void {
    this.closeHiddenMenu();
    setTimeout(() => {
      this.showModalCrearSubasta.emit();
      // this.showModalNuevaSubasta = true;

    }, 200);
  }

  closeModalNuevaSubasta(): void {
    this.showModalNuevaSubasta = false;
  }

  logout() {

    console.log('Cerrando sesión...');
    this.signalRNotiService.closeConnection();
    this.authService.logout();
    // this.isLoggedIn() = this.authService.isLoggedIn();
  }

}
