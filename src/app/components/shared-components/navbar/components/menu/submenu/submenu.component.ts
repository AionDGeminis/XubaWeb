import { Component, EventEmitter, Input, OnInit, Output, output } from '@angular/core';
import { SubastasService } from '../../../../../../services/subastas.service';
import { CardVsegComponent } from './card-vseg/card-vseg.component';
import { CommonModule } from '@angular/common';
import { CardSsegComponent } from './card-sseg/card-sseg.component';
import { CardSguiComponent } from './card-sgui/card-sgui.component';

@Component({
  selector: 'app-submenu',
  imports: [CommonModule, CardVsegComponent, CardSsegComponent, CardSguiComponent],
  templateUrl: './submenu.component.html',
  styleUrl: './submenu.component.css'
})
export class SubmenuComponent implements OnInit {

  @Output() close = new EventEmitter<void>();
  @Input() tipoCarga: string = '';
  @Input() titulo: string = '';
  hiddenMenuClass = 'animate__fadeInLeft';
  showHiddenMenu: boolean = false;
  currentListResult: any[] = [];
  constructor(private subastaService: SubastasService) {

  }
  ngOnInit(): void {
    console.log('carga inicial submenu')
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

  }

  getSubastasGanadas() {

  }

  getNotificaciones() {

  }
}
