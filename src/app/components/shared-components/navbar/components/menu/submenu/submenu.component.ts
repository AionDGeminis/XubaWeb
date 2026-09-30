import { Component, EventEmitter, Input, OnInit, Output, output } from '@angular/core';
import { SubastasService } from '../../../../../../services/subastas.service';
import { CardVsegComponent } from './card-vseg/card-vseg.component';
import { CommonModule } from '@angular/common';
import { CardSsegComponent } from './card-sseg/card-sseg.component';
import { CardSguiComponent } from './card-sgui/card-sgui.component';
import { CardNotiComponent } from './card-noti/card-noti.component';
import { CardSganComponent } from './card-sgan/card-sgan.component';

@Component({
  selector: 'app-submenu',
  imports: [CommonModule, CardVsegComponent, CardSsegComponent, CardSguiComponent, CardNotiComponent, CardSganComponent],
  templateUrl: './submenu.component.html',
  styleUrl: './submenu.component.css'
})
export class SubmenuComponent implements OnInit {

  @Output() close = new EventEmitter<void>();
  @Output() closeAllMenu = new EventEmitter<void>();
  @Input() tipoCarga: string = '';
  @Input() titulo: string = '';
  hiddenMenuClass = 'animate__fadeInLeft';
  showHiddenMenu: boolean = false;
  currentListResult: any[] = [];
  paginaResultados = 1;
  cargandoMasResultados = false;
  hayMasResultados = true;
  constructor(private subastaService: SubastasService) {

  }
  ngOnInit(): void {
    console.log('carga inicial submenu')
    this.paginaResultados = 1;
    this.loadInitData();
  }


  closeNoEmit() {
    this.hiddenMenuClass = 'animate__fadeOutLeft';
  }

  closeHiddenMenu() {
    this.hiddenMenuClass = 'animate__fadeOutLeft';
    setTimeout(() => {
      this.close.emit();
    }, 250);
  }


  loadInitData() {
    switch (this.tipoCarga) {
      case 'VSEG':
        this.getVendedoresSeguidos();
        break;
      case 'SGUI':
        this.getSeguidores();
        break;
      case 'SSEG':
        this.getSubastasSiguiendo();
        break;
      case 'SGAN':
        this.getSubastasGanadas();
        break;
      case 'NOTI':
        this.getNotificaciones();
        break;
    }
  }

  getVendedoresSeguidos() {
    // this.loadingNotificaciones = true;
    // let userData = this.authService.getUserData();
    this.subastaService.GetVendedoresSeguidos(0).subscribe({
      next: (data: any) => {
        console.log('favoritos  obtenidos:', data);
        this.currentListResult = data;
        // this.loadingNotificaciones = false;
      },
      error: (err) => {
        console.error('Error al cargar seguidores', err)
        // this.loadingNotificaciones = false;
      }
    });
  }

  getSeguidores() {
    // this.loadingNotificaciones = true;
    // let userData = th is.authService.getUserData();
    this.subastaService.getSeguidores(0).subscribe({
      next: (data: any) => {
        console.log('seguidos cargadas:', data);
        this.currentListResult = data;
        // this.loadingNotificaciones = false;
      },
      error: (err) => {
        console.error('Error al cargar seguidores', err)
        // this.loadingNotificaciones = false;
      }
    });
  }

  getSubastasSiguiendo() {
    this.cargandoMasResultados = true;

    const idUsuario = 0;

    console.log('Solicitando página:', this.paginaResultados);

    this.subastaService.getSubastasSeguidas(0, this.paginaResultados).subscribe({
      next: (data) => {
        console.log('Página recibida:', this.paginaResultados);
        console.log('Cantidad recibida:', data.length);
        console.log(data)

        if (data.length < 10) {
          this.hayMasResultados = false;
        }
        this.currentListResult.push(...data);
        this.paginaResultados++;
        this.cargandoMasResultados = false;
        console.log('Total:', this.currentListResult.length);
      },
      error: (error) => {
        this.cargandoMasResultados = false;
        console.error('Error cargando subastas seguidas:', error);
      }
    });
  }

  getSubastasGanadas() {

    if (this.cargandoMasResultados || !this.hayMasResultados) {
      return;
    }

    // if (reset) {
    //   this.paginaResultados = 1;
    //   this.auctionsWin = [];
    //   this.hayMasSubastasGanadas = true;
    // }

    // const usuario = this.authService.currentUser();

    // if (!usuario) {
    //   console.warn('Usuario no logueado, no se cargan subastas ganadas');
    //   return;
    // }

    //this.loadingNotificaciones = true;
    this.cargandoMasResultados = true;

    const idUsuario = 0;

    console.log('Solicitando página:', this.paginaResultados);

    this.subastaService.getSubastasGanadas(0, this.paginaResultados).subscribe({
      next: (data) => {
        console.log('Página recibida:', this.paginaResultados);
        console.log('Cantidad recibida:', data.length);
        console.log(data)

        if (data.length < 10) {
          this.hayMasResultados = false;
        }
        this.currentListResult.push(...data);
        this.paginaResultados++;
        this.cargandoMasResultados = false;
        console.log('Total:', this.currentListResult.length);
      },
      error: (error) => {
        this.cargandoMasResultados = false;
        console.error('Error cargando subastas ganadas:', error);
      }
    });

  }

  getNotificaciones() {
    if (this.cargandoMasResultados || !this.hayMasResultados) {
      return;
    }
    // if (reset) {
    //   this.paginaResultados = 1;
    //   this.notificaciones = [];
    //   this.hayMasNotificaciones = true;
    // }
    this.cargandoMasResultados = true;
    //this.loadingNotificaciones = true;
    // const userData = this.authService.getUserData();
    console.log('Solicitando página:', this.paginaResultados);
    this.currentListResult = [];
    this.subastaService.getNotifications(0, this.paginaResultados).subscribe({
      next: (data: any) => {
        console.log('Página recibida:', this.paginaResultados);
        console.log('Cantidad recibida:', data.length);
        console.log('Datos:', data);
        if (data.length < 10) {
          this.hayMasResultados = false;
        }
        this.currentListResult.push(...data);
        // this.notificaciones.push(...data);
        console.log('Total de notificaciones:', this.currentListResult.length);
        this.paginaResultados++;
        console.log('Siguiente página:', this.paginaResultados);
        //this.loadingNotificaciones = false;
        this.cargandoMasResultados = false;
      },

      error: (err) => {
        console.error('Error obteniendo notificaciones:', err);
        // this.loadingNotificaciones = false;
        this.cargandoMasResultados = false;
      }

    });
  }

  closeFullMenu() {
    this.closeAllMenu.emit();
  }
}
