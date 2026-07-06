import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, Renderer2, Signal, computed, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
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

  subasta: Subasta | any = {};
  lista: Subasta[] = [];
  listaPremium: Subasta[] = [];
  origen = '';

  // Estados de UI y datos
  indiceActual = 0;
  imagenActual = '';
  tiempoVence = '00:00:00';
  vencida = false;
  fechaFin: Date | null = null;
  intervalTiempo: any;
  valorApuesta = 0;
  siguienteApuesta = 0;
  // estaSiguiendo = false;
  mensajeFinal = '';
  textoTruncado = false;

  mostrarModal: boolean = false;
  mostrarDetalles: boolean = false;
  showModalShippingPrices: boolean = false;
  isModalOpen: boolean = false;
  showModalBottom: boolean = false;
  classModalBottom: string = 'animate__fadeOutDown';
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
  listaTiposEnvio: any[] = [];
  direcciones: any[] = [];
  direccionEntrega: any = {};
  vistas: any = {};
  vistasOfertas: any = {};
  loadingCotizacion: boolean = false;
  siguiendoVendedor: boolean = false;
  listaVendedoresSeguidos: any[] = [];
  lockButton: boolean = false;
  isDarkMode = false;
  isviewerOpen: boolean = false;
  imagesListViewer: any[] = [];
  currentIndexImageViewer: number = 0;
  classNavigateImg: string = '';
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
    // private renderer: Renderer2,
    private toastr: ToastrService,
    private ss: SharedService,
    private auctionService: AuctionService,
    private renderer: Renderer2, 
    @Inject(DOCUMENT) private document: Document
  ) {
    this.checkTheme();
    this.usuario = this.authService.currentUser;
    const id     = +this.route.snapshot.paramMap.get('id')!;
    console.log(id)
    this.getInitialData(id);
    this.isLoggedIn = computed(() => !!this.usuario());
    this.vistas.idUsuario = this.usuario()?.id ?? 0;
    this.vistas.idSubasta = id;
    this.getVistasOfertas();
    if(this.isLoggedIn()){
      this.getVendedoresSeguidos(this.usuario()!.id);
      // const id     = +this.route.snapshot.paramMap.get('id')!;
      // console.log(id)
      // this.getInitialData(id);
    }
  }

  getInitialData(IdSubasta: number){
    this.subastasService.getAuctionById(IdSubasta).subscribe(sub => {
     console.log(sub)
       this.subasta = sub;
       if(this.isLoggedIn()){
         // this.getSubastasSeguidas();
         this.getDireccionesEntrega(this.usuario()!.id, 'entrega');
       }
       // 2. Luego cargar la lista
       let tipo: 'porvencer' | 'premium' | 'todas' = 'todas';
 
       switch(this.origen) {
           case 'SubastasPremium':
             tipo = 'premium'
             break;
           case 'SubastasExpress':
             tipo = 'porvencer'
             break;
           default:
             tipo = 'todas';
             break;
       }
       // if (this.origen === 'SubastasPremium') tipo = 'premium';
       // else if (this.origen === 'SubastasExpress') tipo = 'porvencer';
   
       // console.log('Tipo de subastas a consultar:', tipo);
       this.subastasService.getAuctions(tipo).subscribe(list => {
         console.log('Lista recibida:', list);
         this.lista = list;
         let index = this.lista.findIndex( x => x.id === IdSubasta);
         this.indiceActual = index > -1? index:0;
         //console.log(index); 
        
        //  this.
        //  this.lista.unshift(this.subasta!);
   
         // 3. Ya tienes subasta y lista. Ahora sí puedes usar todo
         // this.indiceActual  = this.lista.findIndex(s => s.id === this.subasta!.id);
         // console.log(this.indiceActual)
         this.tiempoVence = this.subasta!.tiempoVence ?? '00:00:00';

// ⬇️ CONVERTIR A FECHA FIN REAL
const segundos = this.tiempoStringASegundos(this.tiempoVence);

this.fechaFin = new Date(
  new Date().getTime() + segundos * 1000
);

// ⬇️ INICIAR TIMER NUEVO (REAL)
this.iniciarTimerReal();
         
         this.iniciarTemporizador();
         this.verificarSiSiguiendo();
         this.conectarSignalR();
       });
     }); 
 }
 iniciarTimerReal() {

  if (this.intervalTiempo) {
    clearInterval(this.intervalTiempo);
  }

  this.intervalTiempo = setInterval(() => {

    if (!this.fechaFin) return;

    const ahora = new Date().getTime();
    const fin = this.fechaFin.getTime();

    let diff = fin - ahora;

    if (diff <= 0) {
      this.tiempoVence = '00:00:00';
      this.vencida = true;
      clearInterval(this.intervalTiempo);
      return;
    }

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    this.tiempoVence = `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}`;

  }, 1000);
}
 
//  toggleTheme(){
//   const html = document.documentElement;
//     const icon = document.getElementById('theme-icon');
//     if(!icon) return;
//     if (html.getAttribute('data-theme') === 'dark') {
//       html.setAttribute('data-theme', 'light');
//       icon.className = 'fas fa-sun';
//       icon.style.color = '#f59e0b';
//     } else {
//       html.setAttribute('data-theme', 'dark');
//       icon.className = 'fas fa-moon';
//       icon.style.color = 'var(--text2)';
//     }
//  }
checkTheme(){
  const tema = localStorage.getItem('theme') ? localStorage.getItem('theme') : '';
  this.isDarkMode = tema === 'dark' ? true:false;
  this.renderer.setAttribute(this.document.documentElement, 'data-theme', tema!);
  localStorage.setItem('theme', tema!);
}
 
toggleTheme() {
  this.isDarkMode = !this.isDarkMode;
  const theme = this.isDarkMode ? 'dark' : '';
  
  // Aplica el atributo al tag <html>
  this.renderer.setAttribute(this.document.documentElement, 'data-theme', theme);
  
  // Opcional: Guardar en localStorage para que persista al recargar
  localStorage.setItem('theme', theme);
}
  ngOnInit(): void {

    const id     = +this.route.snapshot.paramMap.get('id')!;
   
    this.origen  = this.route.snapshot.paramMap.get('origen') || '';
    console.log('Origen:', this.origen);
    // this.usuario()!.id
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
    //     this.indiceActual  = this.lista.findIndex(s => s.id === this.subasta!.id);
    //     this.imagenActual  = this.subasta!.url;
    //     this.tiempoVence   = this.subasta!.tiempoVence ?? '00:00:00';
  
    //     this.iniciarTemporizador();
    //     this.verificarSiSiguiendo();
    //     this.conectarSignalR();
    //   });
    // }); 
    
}

getVendedoresSeguidos(idUsuario: number){
  this.subastasService.GetVendedoresSeguidos(idUsuario).subscribe({
    next: (vendedores: any) => {
        this.listaVendedoresSeguidos = vendedores;
        console.log('Vendedores seguidos:', vendedores);
    },
    error: (err) => {
        console.error('Error fetching vendedores seguidos:', err);
    }
  });
}

getVistasOfertas(){
    this.subastasService.registrarVista(this.vistas).subscribe({
      next: (vistas: any) => {
        this.vistasOfertas = vistas
      }
    })
  }

getSiguiendo(idVendedor: number){
  if(this.listaVendedoresSeguidos.length > 0){
    return this.listaVendedoresSeguidos.some(vendedor => vendedor.id === idVendedor);
  } else {  
    return false;
  }
}

toggleSeguirVendedor(idVendedor: number){
  if(this.getSiguiendo(idVendedor)){
    this.dejarSeguirVendedor(idVendedor);
  } else {
    this.seguirVendedor(idVendedor);
  }
}

seguirVendedor(idVendedor: number){
  this.lockButton = true;

  const idUsuario = this.usuario()!.id;
  if(this.isLoggedIn()){
    let modelo = {
      idUsuario,
      idVendedor
    };
    this.subastasService.seguirVendedor(modelo).subscribe({
      next: (vendedores: any) => {
       this.getVendedoresSeguidos(idUsuario);
       this.lockButton = false;

      },
      error: (err) => {
        this.lockButton = false;

        this.ss.showNotification('error','Hubo un problema al seguir vendedor');

          console.error('Error fetching vendedores seguidos:', err);
      }
    });
  }
}

navigateImage(to: string, event: any){
  event.stopPropagation();
  switch(to){
    case 'prev':
      if(this.currentIndexImageViewer > 0){
        this.classNavigateImg = 'animate__fadeOutRight';
        setTimeout(() => {
          this.currentIndexImageViewer--;
          this.classNavigateImg = 'animate__fadeInLeft';
        }, 350);
      }
        break;
    case 'next':
      if(this.currentIndexImageViewer < this.imagesListViewer.length - 1) {
        this.classNavigateImg = 'animate__fadeOutLeft';
        setTimeout(() => {
          this.currentIndexImageViewer++;
          this.classNavigateImg = 'animate__fadeInRight';
        }, 350);
        // this.currentImageIndex++;
      }
        break;
  }
}

openModalViewer(){
  this.isviewerOpen = true;
  this.imagesListViewer = this.subasta.mimagenesSubasta;
}

closeModalViewer(){
  this.isviewerOpen = false;

}


dejarSeguirVendedor(idVendedor: number){
  this.lockButton = true;
  const idUsuario = this.usuario()!.id;
  if(this.isLoggedIn()){
    let modelo = {
      idUsuario,
      idVendedor
    };
    this.subastasService.noseguirVendedor(modelo).subscribe({
      next: (vendedores: any) => {
       this.getVendedoresSeguidos(idUsuario);
       this.lockButton = false;
      },
      error: (err) => {
        this.lockButton = false;
        this.ss.showNotification('error','Hubo un problema al dejar de seguir vendedor');
          console.error('Error fetching vendedores seguidos:', err);
      }
    });
  }
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
       // item.venceSegundos--;
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

openUserPage(user: any){
  this.router.navigate(['/userpage', user]);
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
  this.indiceActual  = this.lista.findIndex(s => s.id === this.subasta!.id);
  this.imagenActual = this.subasta!.url;
  this.tiempoVence  = this.subasta!.tiempoVence ?? '00:00:00';
}

cambiarSubastaDesdePremium(data: { subasta: Subasta; lista: Subasta[]; origen: string }): void {
  this.subasta = data.subasta;
  this.lista = data.lista;
  this.origen = data.origen;

  this.indiceActual  = this.lista.findIndex(s => s.id === this.subasta!.id);
  this.imagenActual  = this.subasta!.url;
  this.tiempoVence   = this.subasta!.tiempoVence ?? '00:00:00';

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
          let dataParams = JSON.stringify({ idSubasta: this.subasta!.id, tipoUsuario:'comprador'});
          let encoded = this.ss.encodeToBase64(dataParams);
          this.router.navigate(['/subasta-terminada',encoded]);
        }
      }
    });
  }

  verificarSiSiguiendo(): void {
    const idUsuario = Number(this.authService.idUsuario);
    this.subastasService.ConsultarSiSiguiendo(idUsuario, this.subasta!.id)
      .subscribe({
        next: res => this.isFollowed = res === true,
        // next: res => this.estaSiguiendo = res === true,
        error: err => console.error('Error seguimiento:', err)
      });
  }

  toggleSeguir(): void {
    const idUsuario = Number(this.authService.idUsuario);
    const idSubasta = this.subasta!.id.toString();
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

  getDireccionesEntrega(idUsuario: number, tipo: string){
    this.subastasService.GetDireccionesUsuario(idUsuario, tipo).subscribe({
      next: (response: any) => {
          console.log(response);
          this.direcciones = response;
          this.direccionEntrega = this.direcciones.length > 0 ? this.direcciones.find((direccion: any) => direccion.predeterminada) : null;
          console.log(this.direccionEntrega)
          if(this.direccionEntrega && this.direccionEntrega !== null && this.direccionEntrega !== undefined){
            // this.calcularPrecios();
            this.cotizarPreciosDeEnntrega()
          }
      },
      error: (error: any) => {
          console.error('Error fetching addresses:', error);
      }
    }
    );
  }

  changeDireccionEntrega(){
    this.cotizarPreciosDeEnntrega();
  }

  cotizarPreciosDeEnntrega(){
    let modeloCotizar = this.getCotizarModelFormat();
    console.log('datos cotizar: ', modeloCotizar);
    this.loadingCotizacion = true;
    this.subastasService.cotizarEnvio(modeloCotizar).subscribe({
      next: (data: any) => {
        this.loadingCotizacion = false;
        this.listaTiposEnvio = data.filter( (x: any) => x.codigoProducto === 'G' || x.codigoProducto === 'N');
        console.log('Cotización exitosa:', this.listaTiposEnvio);
        // this.listaTiposEnvio[0].precio += 100;
        // this.tipoEnvioSeleccionado = this.listaTiposEnvio[0];
        // this.tipoEnvioSeleccionado.precio
        // this.precioTotal = this.subasta!.apuesta + this.precioComision + this.precioEnvio;
      },
      error: (err) => {
        this.loadingCotizacion = false;
        console.error('Error en la cotización:', err);
      }
    })
  }

  getCotizarModelFormat(){
    console.log('Generating cotización model format');
    console.log(this.subasta)
    var cotizacion = {
      "codigoPostalOrigen": this.subasta!.direccion.codigoPostal,
      "ciudadOrigen": this.subasta!.direccion.municipio,
      "codigoPostalDestino": this.direccionEntrega.codigoPostal,
      "ciudadDestino": this.direccionEntrega.municipio,
      "peso": this.subasta!.peso,
      "logitud": this.subasta!.largo,
      "ancho": this.subasta!.profundidad,
      "altura": this.subasta!.ancho,
      "fechaEnvio": this.getCotizarFecha()
    }
    return cotizacion;
  }

  getCotizarFecha(){
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow.toISOString();
  }

  consultarGanador(): void {
    this.subastasService.consultarGanador(this.subasta!.id).subscribe({
      next: resp => {
        const { apuesta, idComprador } = resp;
        if (apuesta >= this.subasta!.precio) {
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
    const nuevoId = this.subasta!.id.toString();
    if (this.idSubastaConectada && this.idSubastaConectada !== nuevoId) {
      this.signalRService.leaveSubasta(this.idSubastaConectada);
    }
    this.signalRService.connectToSubasta(nuevoId, this.authService.idUsuario, (datos: any[]) => {
      const actual = datos[0];
      console.log('apuesta recibida')
      console.log(actual)
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
      
      if(actual.estatus === 'FIN'){
        this.vencida = true;
        this.temporizadorSub$?.unsubscribe();
        this.consultarGanador(); 
        let dataParams = JSON.stringify({ idSubasta: this.subasta!.id, tipoUsuario:'comprador'});
        let encoded = this.ss.encodeToBase64(dataParams);
        this.router.navigate(['/subasta-terminada',encoded]);
      }

    });
    this.idSubastaConectada = nuevoId;
  }

  openShippingPricesModal(){
    this.direccionEntrega = this.direcciones.length > 0 ? this.direcciones.find((direccion: any) => direccion.predeterminada) : null;
    this.direccionEntrega = this.direccionEntrega ? this.direccionEntrega :  this.direcciones.length > 0? this.direcciones[0]:null;
    // this.direccionEntrega = !this.direccionEntrega && this.direcciones.length > 0? this.direcciones[0]:null;
    console.log(this.direcciones)
    console.log(this.direccionEntrega)
    if(this.direccionEntrega){
      this.cotizarPreciosDeEnntrega();
      this.showModalShippingPrices = true;
    }
          console.log(this.direccionEntrega)
          // if(this.direccionEntrega && this.direccionEntrega !== null && this.direccionEntrega !== undefined){
          //   // this.calcularPrecios();
          //   this.cotizarPreciosDeEnntrega()
          // }
    // this.showModalShippingPrices = true;
  }

  closeShippingPricesModal(){
    this.showModalShippingPrices = false;
  }

  // getSubastasSeguidas(){
  //   const usuario = this.authService.currentUser();
  //     if (usuario) {
  //       const idUsuario = usuario.id;
  //       this.auctionService.getAuctions(idUsuario).subscribe({
  //         next: (data) => {
  //           this.auctionsId = data.map(subasta => subasta.id);
  //           this.isFollowed = this.auctionsId.includes(this.subasta!.id);
  //         },
  //         error: (error) => {
  //           console.error('Error cargando subastas:', error);
  //         }
  //     });
  //   } else {
  //     console.warn('Usuario no logueado, no se cargan subastas seguidas');
  //   }
  // }

  toCurrency(valor: number): string {
    return this.ss.toCurrency(valor);
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
    console.log('apostar')
    const idComprador = +(this.authService.idUsuario);
    if (idComprador === +(this.subasta!.musuarios?.id)) {
      this.ss.showNotification('warning', 'No puedes ofertar en tu propia subasta.')
      // this.toastr.error('No puedes ofertar en tu propia subasta.', 'Error');
      return;
    }
    const ultima = this.valorApuesta || this.subasta!.apuesta;
    const diff = monto - ultima;
    console.log(diff)
    if (diff <= 0 && !compraDirecta) return;
    let dataApuesta = {
      idSubasta: this.subasta!.id, 
      idComprador, 
      apuesta: compraDirecta ? monto : diff, 
      compraDirecta 
    }
    console.log(dataApuesta)
    this.subastasService.enviarApuesta(dataApuesta).subscribe({ 
      next: () => {
        if(!this.isFollowed){
          this.verificarSiSiguiendo();
        }
      }, 
      error: err => console.error('Error al enviar apuesta:', err) 
    });

    this.getVistasOfertas()
  }
  
  closeModalBottom(){
    this.classModalBottom = 'animate__fadeOutDown'
    setTimeout(() => {
          this.showModalBottom = false;
    }, 250);
  }

  openModalBottom(){
    this.showModalBottom = true;
    this.classModalBottom = 'animate__fadeInUp'
//     setTimeout(() => {
//       this.showModalBottom = false;
// }, 250);
  }

  async compraDirecta(){
    const idComprador = +(this.authService.idUsuario);
    if (idComprador === +(this.subasta!.musuarios?.id)) {
      this.toastr.error('No puedes ofertar en tu propia subasta.', 'Error');
      return;
    }

    let dataApuesta = {
      idSubasta: this.subasta!.id, 
      idComprador, 
      apuesta: this.subasta.precio, 
      compraDirecta : true
    }
    let r = await this.ss.showConfirmMessage(`¿Desea realizar la copra directa de este producto por un precio de: ${this.toCurrency(this.subasta.precio)}?`)
    if(r){
      this.subastasService.enviarApuesta(dataApuesta).subscribe({ 
        next: (data) => {
          console.log(data)
          if(!this.isFollowed){
            this.verificarSiSiguiendo();
          }
          this.ss.showNotification('success','Compra directa correcta')
        }, 
        error: err => console.error('Error al enviar apuesta:', err) 
      });
    }
   
  }

  // Navegación entre subastas
  irAAnterior(): void {
    // console.log(this.indiceActual)
    if (this.indiceActual > 0) {
      this.currentIndexImage = 0;
      this.classAnimate.imageContainer = 'animate__fadeOutRight'
      this.indiceActual--;
      this.subasta = this.lista[this.indiceActual];
      this.router.navigate(['/subasta-detalle', this.subasta!.id, this.origen]);

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
      this.router.navigate(['/subasta-detalle', this.subasta!.id, this.origen]);
      console.log(this.subasta)
      this.resetDatos();
      this.isFollowed = false;
      this.actualizarVista(); 
      setTimeout(() => {
        this.classAnimate.imageContainer = 'animate__fadeInRight'
     }, 300);
    }
    
  
  }
  actualizarVista() {
    this.imagenActual  = this.subasta!.url;
    this.tiempoVence   = this.subasta!.tiempoVence ?? '00:00:00';
    //this.iniciarTemporizador();
    this.verificarSiSiguiendo();
    //this.getSubastasSeguidas();
    this.conectarSignalR();

    const segundos = this.tiempoStringASegundos(this.tiempoVence);

this.fechaFin = new Date(
  new Date().getTime() + segundos * 1000
);

this.iniciarTimerReal();
  }

  cerrarDetalle(): void {
    this.router.navigate(['/']);
  }

  abrirDetalle(event: { subasta: Subasta; lista: Subasta[]; origen: string }): void {
    this.router.navigate([
      '/subasta-detalle',
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
  
  moveToProfile(){
    this.router.navigate(['/profile']);
  }

  getDatosSubasta(id: number){
    // this.loading = true;
    this.subastasService.getAuctionById(id).subscribe({
      next: (subasta) => {
        let tiempoVence = subasta.tiempoVence?? '00:00:00';
        let segundos: number, minutos: number, horas: number;
        let _tiempoRestante = tiempoVence.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
        console.log(_tiempoRestante);
        // this.loading = false;
        if(_tiempoRestante > 0){
          const url = new URL(window.location.href);
          console.log(url)
          const newURl = `${url.origin}/subasta-detalle/${subasta.id}/SubastasPremium`;
          // url.searchParams.set('id', subasta.id.toString());
          // url.searchParams.set('origen', 'SubastasPremium');
          // this.router.navigate(['/subasta-detalle', subasta.id, 'SubastasPremium']);
          window.location.href = newURl;
        } else {
          let dataParams = JSON.stringify({ idSubasta: id, tipoUsuario:'comprador'});
          let encoded = this.ss.encodeToBase64(dataParams);
          this.router.navigate(['/subasta-terminada', encoded]);
        }
      },
      error: (err) => {
        console.error('Error fetching auction details:', err);
        // this.loading = false;
      }
    })
  }
  
}
