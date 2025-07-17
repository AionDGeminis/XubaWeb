import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SignalRService } from '../../services/signalr.service';
import { AuthService } from '../../services/auth.service';
import { SubastasService } from '../../services/subastas.service';
import { ToastrService } from 'ngx-toastr';
import { OfertaPersonalizadaModalComponent } from '../modals/oferta-personalizada-modal/oferta-personalizada-modal.component';
import { VerticalPremiumAuctionsComponent } from '../vertical-premium-auctions/vertical-premium-auctions.component';
import { Subasta } from '../../models/subasta.model';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-auction-detail',
  standalone: true,
  imports: [
    CommonModule,
    OfertaPersonalizadaModalComponent,
    VerticalPremiumAuctionsComponent
  ],
  templateUrl: './auction-detail.component.html',
  styleUrls: ['./auction-detail.component.css']
})
export class AuctionDetailComponent implements OnInit, AfterViewInit, OnDestroy {

  subasta!: Subasta;
  lista: Subasta[] = [];
  origen = '';

  // Estados de UI y datos
  indiceActual = 0;
  imagenActual = '';
  tiempoVence = '00:00:00';
  vencida = false;
  valorApuesta = 0;
  siguienteApuesta = 0;
  estaSiguiendo = false;
  mensajeFinal = '';
  textoTruncado = false;

  mostrarModal: boolean = false;
  mostrarDetalles: boolean = false;

  usuarioMayor = '';
  estatus = '';

  ganadoresLista: string[] = [];
  ganadoresDetalles: { monto: string; usuario: string; fecha: string }[] = [];

  private idSubastaConectada: string | null = null;
  private temporizadorSub$?: Subscription;

  @ViewChild('titulo', { static: false }) tituloElement!: ElementRef;
  @ViewChild('descripcion', { static: false }) descripcionElement!: ElementRef;
  @ViewChild('botonApuesta') botonApuesta!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private signalRService: SignalRService,
    private authService: AuthService,
    private subastasService: SubastasService,
    private renderer: Renderer2,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {

    const id     = +this.route.snapshot.paramMap.get('id')!;
    this.origen  = this.route.snapshot.paramMap.get('origen') || '';
    console.log('Origen:', this.origen);

    this.subastasService.getAuctionById(id).subscribe(sub => {
      this.subasta = sub;
  
      // 2. Luego cargar la lista
      let tipo: 'porvencer' | 'premium' | 'todas' = 'todas';
      if (this.origen === 'Subastas Premium') tipo = 'premium';
      else if (this.origen === 'Subastas Express') tipo = 'porvencer';
  
      console.log('Tipo de subastas a consultar:', tipo);
      this.subastasService.getAuctions(tipo).subscribe(list => {
        console.log('Lista recibida:', list);
        this.lista = list;
  
        // 3. Ya tienes subasta y lista. Ahora sí puedes usar todo
        this.indiceActual  = this.lista.findIndex(s => s.id === this.subasta.id);
        this.imagenActual  = this.subasta.url;
        this.tiempoVence   = this.subasta.tiempoVence ?? '00:00:00';
  
        this.iniciarTemporizador();
        this.verificarSiSiguiendo();
        this.conectarSignalR();
      });
    }); 
    
}
setupIndices() {
  this.indiceActual  = this.lista.findIndex(s => s.id === this.subasta.id);
  this.imagenActual = this.subasta.url;
  this.tiempoVence  = this.subasta.tiempoVence ?? '00:00:00';
}

cambiarSubastaDesdePremium(data: { subasta: Subasta; lista: Subasta[]; origen: string }): void {
  this.subasta = data.subasta;
  this.lista = data.lista;
  this.origen = data.origen;

  this.indiceActual  = this.lista.findIndex(s => s.id === this.subasta.id);
  this.imagenActual  = this.subasta.url;
  this.tiempoVence   = this.subasta.tiempoVence ?? '00:00:00';

  this.resetDatos(); // reinicia temporizador, verifica seguimiento, etc.
  this.actualizarVista();
}
  
ngAfterViewInit(): void {
  setTimeout(() => {
    const tituloEl = this.tituloElement?.nativeElement;
    const descripcionEl = this.descripcionElement?.nativeElement;

    if (tituloEl && descripcionEl) {
      this.textoTruncado =
        tituloEl.scrollWidth > tituloEl.clientWidth ||
        descripcionEl.scrollHeight > descripcionEl.clientHeight;
    }
  });
}

  ngOnDestroy(): void {
    if (this.idSubastaConectada) {
      this.signalRService.leaveSubasta(this.idSubastaConectada);
    }
    this.temporizadorSub$?.unsubscribe();
  }

  iniciarTemporizador(): void {
    this.temporizadorSub$?.unsubscribe();
    this.temporizadorSub$ = interval(1000).subscribe(() => {
      if (!this.vencida) {
        this.tiempoVence = this.restarUnSegundo(this.tiempoVence);
        if (this.tiempoVence === '00:00:00') {
          this.vencida = true;
          this.temporizadorSub$?.unsubscribe();
          this.consultarGanador();
        }
      }
    });
  }

  verificarSiSiguiendo(): void {
    const idUsuario = Number(this.authService.idUsuario);
    this.subastasService.ConsultarSiSiguiendo(idUsuario, this.subasta.id)
      .subscribe({
        next: res => this.estaSiguiendo = res === true,
        error: err => console.error('Error seguimiento:', err)
      });
  }

  toggleSeguir(): void {
    const idUsuario = Number(this.authService.idUsuario);
    const idSubasta = this.subasta.id.toString();
    if (this.estaSiguiendo) {
      this.subastasService.dejarDeSeguirSubasta(idUsuario, idSubasta)
        .subscribe(() => this.estaSiguiendo = false);
    } else {
      this.subastasService.seguirSubasta(idUsuario, idSubasta)
        .subscribe(() => this.estaSiguiendo = true);
    }
  }

  // Cambia la imagen principal
  cambiarImagen(url: string): void {
    this.imagenActual = url;
  }


  consultarGanador(): void {
    this.subastasService.consultarGanador(this.subasta.id).subscribe({
      next: resp => {
        const { apuesta, idComprador } = resp;
        if (apuesta >= this.subasta.precio) {
          this.mensajeFinal =
            Number(idComprador) === Number(this.authService.idUsuario)
              ? '¡¡GANASTE!!'
              : 'Comprado';
        } else {
          this.mensajeFinal = 'Mínimo no alcanzado';
        }
        const listaStr = (resp.ganadores ?? '').toString();
        const lista = listaStr.split('|').filter((g: string) => g.trim());
        this.ganadoresLista = lista;
        this.ganadoresDetalles = lista.map((item: string) => {
          const partes = item.replace('$', '').split('-');
          return { monto: `$${partes[0]}`, usuario: partes[1], fecha: partes.slice(2).join('-') };
        });
      },
      error: err => {
        console.error('Error al consultar ganador:', err);
        this.mensajeFinal = 'No se pudo obtener el resultado.';
      }
    });
  }
  // Conexión SignalR
  private conectarSignalR(): void {
    const nuevoId = this.subasta.id.toString();
    if (this.idSubastaConectada && this.idSubastaConectada !== nuevoId) {
      this.signalRService.leaveSubasta(this.idSubastaConectada);
    }
    this.signalRService.connectToSubasta(nuevoId, this.authService.idUsuario, (datos: any[]) => {
      const actual = datos[0];
      if (!actual) return;
      this.valorApuesta = actual.apuesta;
      this.usuarioMayor = actual.usuario;
      this.estatus = actual.estatus;
      this.siguienteApuesta = actual.siguienteApuesta;
      const listaStr = (actual.ganadores ?? '').toString();
      const listaItems = listaStr.split('|').filter((g: string) => g.trim());
      this.ganadoresLista = listaItems;
      this.ganadoresDetalles = listaItems.map((item: string) => {
        const partes = item.replace('$', '').split('-');
        return { monto: `$${partes[0]}`, usuario: partes[1], fecha: partes.slice(2).join('-') };
      });
    });
    this.idSubastaConectada = nuevoId;
  }

  // Acción de apuesta animada
  animarApuestaClick(): void {
    this.renderer.addClass(this.botonApuesta.nativeElement, 'animate__animated');
    this.renderer.addClass(this.botonApuesta.nativeElement, 'animate__headShake');
    this.realizarApuesta(this.siguienteApuesta, false);
    setTimeout(() => {
      this.renderer.removeClass(this.botonApuesta.nativeElement, 'animate__animated');
      this.renderer.removeClass(this.botonApuesta.nativeElement, 'animate__headShake');
    }, 1300);
  }

  // Envía la apuesta
  realizarApuesta(monto: number, compraDirecta = false): void {
    const idComprador = Number(this.authService.idUsuario);
    if (idComprador === Number(this.subasta.musuarios?.id)) {
      this.toastr.error('No puedes ofertar en tu propia subasta.', 'Error');
      return;
    }
    const ultima = this.valorApuesta || this.subasta.apuesta;
    const diff = monto - ultima;
    if (diff <= 0 && !compraDirecta) return;
    this.subastasService.enviarApuesta({ idSubasta: this.subasta.id, idComprador, apuesta: compraDirecta ? monto : diff, compraDirecta })
      .subscribe({ next: () => {}, error: err => console.error('Error al enviar apuesta:', err) });
  }

  // Navegación entre subastas
  irAAnterior(): void {
    if (this.indiceActual > 0) {
      this.indiceActual--;
      this.subasta = this.lista[this.indiceActual];
      this.resetDatos();
      this.actualizarVista(); // actualiza imagen, tiempo, etc.
    }
  }
  
  irASiguiente(): void {
    if (this.indiceActual < this.lista.length - 1) {
      this.indiceActual++;
      this.subasta = this.lista[this.indiceActual];
      this.resetDatos();
      this.actualizarVista(); // actualiza imagen, tiempo, etc.
    }
  }
  actualizarVista() {
    this.imagenActual  = this.subasta.url;
    this.tiempoVence   = this.subasta.tiempoVence ?? '00:00:00';
    this.iniciarTemporizador();
    this.verificarSiSiguiendo();
    this.conectarSignalR();
  }

  cerrarDetalle(): void {
    this.router.navigate(['/']);
  }

  abrirDetalle(event: { subasta: Subasta; lista: Subasta[]; origen: string }): void {
    this.router.navigate([
      '/subasta',
      event.subasta.id
    ], { queryParams: { origen: event.origen } });
  }

  private resetDatos(): void {
    this.ganadoresLista = [];
    this.ganadoresDetalles = [];
    this.valorApuesta = 0;
    this.imagenActual = '';
    if (this.idSubastaConectada) {
      this.signalRService.leaveSubasta(this.idSubastaConectada);
      this.idSubastaConectada = null;
    }
    this.temporizadorSub$?.unsubscribe();
  }


  // Utilidades de tiempo
  private restarUnSegundo(t: string): string {
    const [h, m, s] = t.split(':').map(Number);
    let total = h * 3600 + m * 60 + s - 1;
    if (total <= 0) return '00:00:00';
    const hh = Math.floor(total / 3600);
    const mm = Math.floor((total % 3600) / 60);
    const ss = total % 60;
    return `${this.pad(hh)}:${this.pad(mm)}:${this.pad(ss)}`;
  }

  private pad(n: number): string {
    return n < 10 ? '0' + n : n.toString();
  }

  limpiarMontoNumber(monto: string): number {
    return Number(monto.replace(/[^0-9.-]+/g, ''));
  }
}
