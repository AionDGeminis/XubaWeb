import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, Renderer2, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SignalRService } from '../../services/signalr.service';
import { AuthService } from '../../services/auth.service';
import { SubastasService } from '../../services/subastas.service';
import { ToastrService } from 'ngx-toastr';
import { OfertaPersonalizadaModalComponent } from '../modals/oferta-personalizada-modal/oferta-personalizada-modal.component';
import { VerticalPremiumAuctionsComponent } from '../vertical-premium-auctions/vertical-premium-auctions.component';
import { Subasta, Usuario } from '../../models/subasta.model';
import { interval, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2'
import { SharedService } from '../../services/shared.service';
import { AuctionService } from '../../services/auction.service';

@Component({
  selector: 'app-auction-detail',
  standalone: true,
  imports: [
    CommonModule,
    OfertaPersonalizadaModalComponent,
    VerticalPremiumAuctionsComponent,
    FormsModule
  ],
  templateUrl: './auction-detail.component.html',
  styleUrls: ['./auction-detail.component.css']
})
export class AuctionDetailComponent implements OnInit, AfterViewInit, OnDestroy {

  subasta!: Subasta;
  lista: Subasta[] = [];
  listaPremium: Subasta[] = [];
  origen = '';

  // Estados de UI y datos
  indiceActual = 0;
  imagenActual = '';
  tiempoVence = '00:00:00';
  vencida = false;
  valorApuesta = 0;
  siguienteApuesta = 0;
  // estaSiguiendo = false;
  mensajeFinal = '';
  textoTruncado = false;

  mostrarModal: boolean = false;
  mostrarDetalles: boolean = false;
  isModalOpen: boolean = false;

  usuarioMayor = '';
  estatus = '';
  valorSubastaPersonalizada: number | null = null;

  ganadoresLista: string[] = [];
  ganadoresDetalles: { monto: string; usuario: string; fecha: string }[] = [];
  animatedClass = '';

  private idSubastaConectada: string | null = null;
  private temporizadorSub$?: Subscription;
  public usuario!: Signal<Usuario|null>;
  public isLoggedIn!: Signal<boolean>;

  animatedClassFrame = '';
  currentIndexImage = 0;
  imageClassAnimated = ''
  auctionsId: number[] = [];
  isFollowed: boolean = false;
  private intervalId: any;

  @ViewChild('titulo', { static: false }) tituloElement!: ElementRef;
  @ViewChild('descripcion', { static: false }) descripcionElement!: ElementRef;
  @ViewChild('botonApuesta') botonApuesta!: ElementRef;

  classAnimate = {imageContainer:'', rightAside:''}

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private signalRService: SignalRService,
    private authService: AuthService,
    private subastasService: SubastasService,
    private renderer: Renderer2,
    private toastr: ToastrService,
    private ss: SharedService,
    private auctionService: AuctionService
  ) {
    this.usuario = this.authService.currentUser;
    this.isLoggedIn = computed(() => !!this.usuario());
    // if(this.isLoggedIn()){
    //   this.getSubastasSeguidas();
    // }
  }

  ngOnInit(): void {

    const id     = +this.route.snapshot.paramMap.get('id')!;
    this.origen  = this.route.snapshot.paramMap.get('origen') || '';
    console.log('Origen:', this.origen);
    this.getInitialData(id);
    this.getPremium();
    // this.subastasService.getAuctionById(id).subscribe(sub => {
    //   this.subasta = sub;
  
    //   // 2. Luego cargar la lista
    //   let tipo: 'porvencer' | 'premium' | 'todas' = 'todas';
    //   if (this.origen === 'Subastas Premium') tipo = 'premium';
    //   else if (this.origen === 'Subastas Express') tipo = 'porvencer';
  
    //   console.log('Tipo de subastas a consultar:', tipo);
    //   this.subastasService.getAuctions(tipo).subscribe(list => {
    //     console.log('Lista recibida:', list);
    //     this.lista = list;
  
    //     // 3. Ya tienes subasta y lista. Ahora sí puedes usar todo
    //     this.indiceActual  = this.lista.findIndex(s => s.id === this.subasta.id);
    //     this.imagenActual  = this.subasta.url;
    //     this.tiempoVence   = this.subasta.tiempoVence ?? '00:00:00';
  
    //     this.iniciarTemporizador();
    //     this.verificarSiSiguiendo();
    //     this.conectarSignalR();
    //   });
    // }); 
    
}

getInitialData(IdSubasta: number){
   this.subastasService.getAuctionById(IdSubasta).subscribe(sub => {
      this.subasta = sub;
  
      // 2. Luego cargar la lista
      let tipo: 'porvencer' | 'premium' | 'todas' = 'todas';
      if (this.origen === 'SubastasPremium') tipo = 'premium';
      else if (this.origen === 'SubastasExpress') tipo = 'porvencer';
  
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

getPremium(){
  this.subastasService.getAuctions('premium').subscribe({
    next: (list) => {
      this.listaPremium = list;
      for(let p of this.listaPremium){
        p.venceSegundos = this.tiempoStringASegundos(p.tiempoVence);
      }
      this.setTimer(this.listaPremium);
    },
    error: (e) => {
      console.error('Error fetching premium auctions:', e);
    }
  });
}

setTimer(litaItems: any[]){
  this.intervalId = setInterval(() => {
    for(let item of litaItems){
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

isSingleSeguida(idSubasta: number): boolean {
  let isFollowed = this.auctionsId.includes(idSubasta);
  return isFollowed;
}

getSubastasSeguidas(){
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

toggleSingleSeguida(idSubasta: number, event: Event): void {
  event.stopPropagation();
  const usuario = this.authService.currentUser();
  if(usuario){
     if (this.isSingleSeguida(idSubasta)) {
    // this.auctionsId = this.auctionsId.filter(id => id !== idSubasta);
    } else {
      console.log(usuario!.id);
      this.auctionsId.push(idSubasta);
      this.subastasService.seguirSubasta(usuario!.id, idSubasta.toString()).subscribe({
        next: (data) => {
          console.log('resultado seguir subasta');
          console.log(data);
         this.getSubastasSeguidas();
        },
        error: (error) => {
          console.error('Error al agregar subasta seguida:', error);
        }
      })
      // this.auctionsId.push(idSubasta);
    }
    // const idUsuario = Number(this.authService.idUsuario);
    // //const idSubasta = idSubasta.toString();
    // if (this.isFollowed) {
    //   this.subastasService.dejarDeSeguirSubasta(idUsuario, idSubasta.toString())
    //     .subscribe(() => this.isSingleSeguida(idSubasta));
    // } else {
    //   this.subastasService.seguirSubasta(idUsuario, idSubasta.toString())
    //     .subscribe(() => this.isFollowed = true);
    // }
  }
 
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
          console.log('subasta terminada')
          this.vencida = true;
          this.temporizadorSub$?.unsubscribe();
          this.consultarGanador(); 
          let dataParams = JSON.stringify({ idSubasta: this.subasta.id, tipoUsuario:'comprador'});
          let encoded = this.ss.encodeToBase64(dataParams);
          this.router.navigate(['/subasta-terminada',encoded]);
        }
      }
    });
  }

  verificarSiSiguiendo(): void {
    const idUsuario = Number(this.authService.idUsuario);
    this.subastasService.ConsultarSiSiguiendo(idUsuario, this.subasta.id)
      .subscribe({
        next: res => this.isFollowed = res === true,
        // next: res => this.estaSiguiendo = res === true,
        error: err => console.error('Error seguimiento:', err)
      });
  }

  toggleSeguir(): void {
    const idUsuario = Number(this.authService.idUsuario);
    const idSubasta = this.subasta.id.toString();
    if (this.isFollowed) {
      this.subastasService.dejarDeSeguirSubasta(idUsuario, idSubasta)
        .subscribe(() => this.isFollowed = false);
    } else {
      this.subastasService.seguirSubasta(idUsuario, idSubasta)
        .subscribe(() => this.isFollowed = true);
    }
  }

  // Cambia la imagen principal
  cambiarImagen(url: string): void {
    this.imagenActual = url;
  }

  toShort(val: string){
    return val.length > 41 ? val.substring(0, 41) + '...' : val;
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
      // console.log(this.ganadoresLista);
      this.animateResponse();
      this.ganadoresDetalles = listaItems.map((item: string) => {
        const partes = item.replace('$', '').split('-');
        return { monto: `$${partes[0]}`, usuario: partes[1], fecha: partes.slice(2).join('-') };
      });
    });
    this.idSubastaConectada = nuevoId;
  }

  // getSubastasSeguidas(){
  //   const usuario = this.authService.currentUser();
  //     if (usuario) {
  //       const idUsuario = usuario.id;
  //       this.auctionService.getAuctions(idUsuario).subscribe({
  //         next: (data) => {
  //           this.auctionsId = data.map(subasta => subasta.id);
  //           this.isFollowed = this.auctionsId.includes(this.subasta.id);
  //         },
  //         error: (error) => {
  //           console.error('Error cargando subastas:', error);
  //         }
  //     });
  //   } else {
  //     console.warn('Usuario no logueado, no se cargan subastas seguidas');
  //   }
  // }

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
    console.log('apostar')
    const idComprador = Number(this.authService.idUsuario);
    if (idComprador === Number(this.subasta.musuarios?.id)) {
      this.toastr.error('No puedes ofertar en tu propia subasta.', 'Error');
      return;
    }
    const ultima = this.valorApuesta || this.subasta.apuesta;
    const diff = monto - ultima;
    if (diff <= 0 && !compraDirecta) return;
    let dataApuesta = {
      idSubasta: this.subasta.id, 
      idComprador, 
      apuesta: compraDirecta ? monto : diff, 
      compraDirecta 
    }
    this.subastasService.enviarApuesta(dataApuesta).subscribe({ 
      next: () => {
        if(!this.isFollowed){
          this.verificarSiSiguiendo();
        }
      }, 
      error: err => console.error('Error al enviar apuesta:', err) 
    });
  }

  // Navegación entre subastas
  irAAnterior(): void {
    
    if (this.indiceActual > 0) {
      this.currentIndexImage = 0;
      this.classAnimate.imageContainer = 'animate__fadeOutRight'
      this.indiceActual--;
      this.subasta = this.lista[this.indiceActual];
      this.resetDatos();
      this.actualizarVista(); // actualiza imagen, tiempo, etc.
      setTimeout(() => {
        this.classAnimate.imageContainer = 'animate__fadeInLeft'
     }, 300);
    }
  }
  
  irASiguiente(): void {
    
    if (this.indiceActual < this.lista.length - 1) {
      this.currentIndexImage = 0;
      this.classAnimate.imageContainer = 'animate__fadeOutLeft'
      this.indiceActual++;
      this.subasta = this.lista[this.indiceActual];
      this.resetDatos();
      this.isFollowed = false;
      this.actualizarVista(); // actualiza imagen, tiempo, etc.
      setTimeout(() => {
        this.classAnimate.imageContainer = 'animate__fadeInRight'
     }, 300);
    }
    
  
  }
  actualizarVista() {
    this.imagenActual  = this.subasta.url;
    this.tiempoVence   = this.subasta.tiempoVence ?? '00:00:00';
    this.iniciarTemporizador();
    this.verificarSiSiguiendo();
    //this.getSubastasSeguidas();
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

  animateResponse(){
   this.animatedClass = 'animate__bounceIn' 
   setTimeout(() => {
    this.animatedClass = '';
   }, 300);
  }

  tryOfertaPersonalizada(){
    if(this.valorSubastaPersonalizada === null || this.valorSubastaPersonalizada <=0 || this.valorSubastaPersonalizada > 1000){
      Swal.fire({
      // title: 'Error!',
      text: 'El importe no es valido',
      icon: 'error',
      showConfirmButton: false,
      // confirmButtonText: 'Cool',
      toast: true,
      position: 'top-end',
      timer: 2000,
    });
    return;
    }
    console.log(this.valorSubastaPersonalizada)
    this.realizarApuesta(this.valorApuesta + this.valorSubastaPersonalizada, false);
    this.closeModal();
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal(){
    this.valorSubastaPersonalizada = null;
    this.isModalOpen = false;
  }

  onContentClick(event: MouseEvent) {
    event.stopPropagation();
  }

  setApuestaPersonalizada(valor: number){
    this.valorSubastaPersonalizada = valor;
  }

  setIndexImage(index: number) {
    this.imageClassAnimated = 'animate__fadeIn';
    this.currentIndexImage = index;
    setTimeout(() => {
      this.imageClassAnimated = '';
    }, 300);
  }
  

}
