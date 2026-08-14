import { Component, OnInit, Output, EventEmitter, Input, effect, HostListener } from '@angular/core';
import { AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SubastasService } from '../../services/subastas.service';
import { Subasta } from '../../models/subasta.model';
import { interval } from 'rxjs';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';
import { AuctionService } from '../../services/auction.service';
import { LoaderComponent } from '../loader/loader.component';
import { SharedService } from '../../services/shared.service';
import { LocalSignalsService } from '../../services/localsignals.service';

@Component({
  selector: 'app-general-auctions',
  imports: [CommonModule, LoaderComponent],
  standalone: true,
  templateUrl: './general-auctions.component.html',
  styleUrl: './general-auctions.component.css'
})

export class GeneralAuctionsComponent implements OnInit {
  generales: Subasta[] = [];
  auctionsId: number[] = [];
  private intervalId: any;
  loading: boolean = false;
  mainTitle: string = '';
  cargandoMas = false;
  hayMas = true;
  constructor(private lss: LocalSignalsService, private subastaService: SubastasService, private ss: SharedService, private modalService: ModalService, private router: Router, private authService: AuthService, private auctionService: AuctionService) {
    this.getSubastasSeguidas();
    effect(() => {
      if (this.lss.triggerToogleFollowedG() > -1) {
        this.auctionsId = this.auctionsId.length > 0 ? this.auctionsId.filter(x => x !== this.lss.triggerToogleFollowedG()) : this.auctionsId;
        this.lss.toogleFollowedIDG(-1);
      }
    });
  }

  @Input() tipoSeccion = '';

  @Output() abrirDetalle = new EventEmitter<{ subasta: Subasta, lista: Subasta[], origen: string }>();

  ngOnInit(): void {
    let tipoSubasta: any = 'todas';
    switch (this.tipoSeccion) {
      case 'SubastasPremium':
        this.mainTitle = 'Xubastas PREMIUM';
        tipoSubasta = 'premium';
        break;
      case 'SubastasExpress':
        this.mainTitle = 'Xubastas EXPRESS';
        tipoSubasta = 'porvencer';
        break;
      default:
        this.mainTitle = 'Xubastas GENERALES';
        tipoSubasta = 'todas';
        break;

    }

    this.cargarMasSubastas()
  }

  setTimer(litaItems: any[]) {
    if (this.intervalId) {
      return;
    }

    this.intervalId = setInterval(() => {

      for (let item of litaItems) {

        if (item.venceSegundos > 0) {
          item.venceSegundos--;
        }
        
      }

    }, 1000);

  }

  tiempoStringASegundos(tiempo: string) {
    const [h, m, s] = tiempo.split(':').map(Number);
    return h * 3600 + m * 60 + s;
  }

  // 2. Función para convertir segundos a "hh:mm:ss"
  segundosATiempoString(segundos: number) {
    const h = String(Math.floor(segundos / 3600)).padStart(2, '0');
    const m = String(Math.floor((segundos % 3600) / 60)).padStart(2, '0');
    const s = String(segundos % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  contadorTiempo(tiempo: string) {

  }

  abrirModal(subasta: Subasta) {
    //this.abrirDetalle.emit({ subasta,  origen: 'todas' });
    //this.modalService.abrir(subasta);
    this.router.navigate(['/subasta-detalle', subasta.id, 'Subastas Generales']);
  }

  getSubastasSeguidas() {
    const usuario = this.authService.currentUser();
    if (usuario) {
      const idUsuario = usuario.id;
      this.auctionService.getAuctions(idUsuario).subscribe({
        next: (data) => {
          this.auctionsId = data.map(subasta => subasta.id);
        },
        error: (error) => {
          console.error('Error cargando subastas:', error);
        }
      });
    } else {
      console.warn('Usuario no logueado, no se cargan subastas seguidas');
    }
  }

  isSeguida(idSubasta: number): boolean {
    let isFollowed = this.auctionsId.includes(idSubasta);
    return isFollowed;
  }

  toggleSeguida(idSubasta: number, event: Event): void {
    event.stopPropagation();
    const usuario = this.authService.currentUser();
    if (usuario) {
      if (this.isSeguida(idSubasta)) {
        this.subastaService.dejarDeSeguirSubasta(usuario!.id, idSubasta.toString()).subscribe({
          next: (data) => {
            this.getSubastasSeguidas();
            this.lss.ejecutarFuncion();
          },
          error: (error) => {
            console.error('Error al agregar subasta seguida:', error);
          }
        })
        // this.auctionsId = this.auctionsId.filter(id => id !== idSubasta);
      } else {
        this.subastaService.seguirSubasta(usuario!.id, idSubasta.toString()).subscribe({
          next: (data) => {
            this.getSubastasSeguidas();
            this.lss.ejecutarFuncion();
          },
          error: (error) => {
            console.error('Error al agregar subasta seguida:', error);
          }
        })
        // this.auctionsId.push(idSubasta);
      }
    }

  }

  restarUnSegundo(tiempo: string): string {
    const [h, m, s] = tiempo.split(':').map(Number);
    let total = h * 3600 + m * 60 + s - 1;

    if (total <= 0) return '00:00:00';

    const hh = Math.floor(total / 3600);
    const mm = Math.floor((total % 3600) / 60);
    const ss = total % 60;

    return `${this.pad(hh)}:${this.pad(mm)}:${this.pad(ss)}`;
  }
  pad(n: number): string {
    return n < 10 ? '0' + n : n.toString();
  }

  // abrirDetalleSubasta(subasta: Subasta): void {
  //   // console.log('Subasta express seleccionada:', subasta);
  //   this.router.navigate(['/subasta', subasta.id, 'Subastas Premium']);
  // }
 getDatosSubasta(id: number) {
  this.loading = true;

  this.subastaService.ConsultarSubastaOfertarId(id).subscribe({
    next: (subasta) => {
      this.loading = false;

      this.router.navigate(['/subasta-detalle', subasta.id, 'Generales']);
    },
    error: (err) => {
      console.error('Error fetching auction details:', err);
      this.loading = false;
    }
  });
}

  toCurrency(valor: number): string {
    return this.ss.toCurrency(valor);
  }

  cargarMasSubastas() {

    if (this.cargandoMas || !this.hayMas) return;

    this.cargandoMas = true;

    this.subastaService.getAuctions('todas').subscribe({
      next: (respuesta) => {

        const nuevas = respuesta.filter(
          x => !this.generales.some(s => s.id === x.id)
        );

        this.generales.push(...nuevas);
        // Inicializar temporizador de las nuevas
        nuevas.forEach(p => {
          p.venceSegundos = this.tiempoStringASegundos(p.tiempoVence);
        });

        if (!this.intervalId) {
          this.setTimer(this.generales)
        }

        this.cargandoMas = false;

        // Si no llegó ninguna nueva, ya no seguir intentando
        if (nuevas.length === 0) {
          this.hayMas = false;
        }
      },
      error: () => {
        this.cargandoMas = false;
      }
    });

  }
  @HostListener('window:scroll', [])
  onScroll(): void {

    const posicion =
      window.innerHeight + window.scrollY;

    const altura =
      document.body.offsetHeight;

    if (posicion >= altura - 200) {
      this.cargarMasSubastas();
    }

  }


}
