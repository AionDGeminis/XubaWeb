import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, Renderer2, Signal, computed, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SignalRService } from '../../../services/signalr.service';
import { AuthService } from '../../../services/auth.service';
import { SubastasService } from '../../../services/subastas.service';
import { ToastrService } from 'ngx-toastr';
import { VerticalPremiumAuctionsComponent } from '../../vertical-premium-auctions/vertical-premium-auctions.component';
import { Subasta, Usuario, DetalleSubasta } from '../../../models/subasta.model';
import { interval, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2'
import { SharedService } from '../../../services/shared.service';
import { AuctionService } from '../../../services/auction.service';
import { LoaderComponent } from '../../shared-components/loader/loader.component';
import { SoloDecimalDirective } from '../../../directives/solo-decimal.directive';
import id from '@angular/common/locales/id';
import { Apuesta } from '../../../models/apuesta-model';
import { gsap } from 'gsap';
import { SlidebuttonComponent } from '../../shared-components/slidebutton/slidebutton.component';
import { OfertaPersonalizadaModalComponent } from '../../shared-components/modals/oferta-personalizada-modal/oferta-personalizada-modal.component';


@Component({
  selector: 'app-auction-detail',
  standalone: true,
  imports: [
    CommonModule,
    OfertaPersonalizadaModalComponent,
    VerticalPremiumAuctionsComponent,
    FormsModule,
    LoaderComponent,
    SoloDecimalDirective,
    SlidebuttonComponent
  ],
  templateUrl: './auction-detail.component.html',
  styleUrls: ['./auction-detail.component.css']
})
export class AuctionDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  //================
  //================
  // PROXIMOS CAMBIOS: eliminar el objeto subasta, y sus referencias

  // subasta: Subasta | any = {};
  detallesubasta: DetalleSubasta | any = {};
  lista: Subasta[] = [];
  listaPremium: Subasta[] = [];
  origen = '';
  loading: boolean = false;
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
  public usuario!: Signal<Usuario | null>;
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
  mostrarmodalofertadirecta: boolean = false;
  mostrarmodaldescripcion: boolean = false;
  hayGanador: boolean = true;
  modoOscuro = false;
  ofertar: number = 0;
  classNavigateImg: string = '';
  idSubasta: number = -1;
  @ViewChild('titulo', { static: false }) tituloElement!: ElementRef;
  @ViewChild('descripcion', { static: false }) descripcionElement!: ElementRef;
  @ViewChild('botonApuesta') botonApuesta!: ElementRef;

  classAnimate = { imageContainer: '', rightAside: '' }
  isValidExistingSubasta: boolean = false;
  gettingData: boolean = true;
  connectingSignalR: boolean = false;
  showNewBidIncomeAnimation: boolean = false;
  omitFirstBidIncoming: boolean = false;
  listaComisionesEnvio: any[] = [];
  private bidTimer: ReturnType<typeof setTimeout> | null = null;
  readonly bidNotificationMs = 2000;
  incomeBidAnimateColor: string = '';
  private montoVisible = 0;

  private tweenMonto: gsap.core.Tween | null = null;
  private tweenPop: gsap.core.Timeline | null = null;

  private readonly formatoMoneda = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  @ViewChild('timeFill') timeFill?: ElementRef<HTMLElement>;
  @ViewChild('currentOfferBadge') currentOfferBadge?: ElementRef<HTMLElement>;
  //   @ViewChild('miOfertaPill')
  // miOfertaPill?: ElementRef<HTMLElement>;

  @ViewChild('pillText')
  pillText?: ElementRef<HTMLElement>;

  @ViewChild('pillBidder')
  pillBidder?: ElementRef<HTMLElement>;

  @ViewChild('pillWinning')
  pillWinning?: ElementRef<HTMLElement>;

  @ViewChild('pillAmount') pillAmount!: ElementRef<HTMLParagraphElement>;
  @ViewChild('pillAmountBadge') pillAmountBadge!: ElementRef<HTMLParagraphElement>;
  @ViewChild('pillAmountResponsive') pillAmountResponsive!: ElementRef<HTMLParagraphElement>;

  @ViewChild('offerBadge')
  offerBadge?: ElementRef<HTMLElement>;

  @ViewChild('offerRingOne')
  offerRingOne?: ElementRef<HTMLElement>;

  @ViewChild('offerRingTwo')
  offerRingTwo?: ElementRef<HTMLElement>;

  @ViewChild('trophyLeft')
  trophyLeft?: ElementRef<HTMLElement>;

  @ViewChild('trophyRight')
  trophyRight?: ElementRef<HTMLElement>;

  @ViewChild('confettiLayer')
  confettiLayer?: ElementRef<HTMLElement>;
  badgeCaption: any = { label1: 'NUEVA OFERTA', label2: 'Va ganando' }


  // 

  // 

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
    this.checkNavigation();
    this.checkTheme();
    this.usuario = this.authService.currentUser;
    const id = +this.route.snapshot.paramMap.get('id')!;

    // this.idSubasta = id;
    // console.log(id)
    // this.getInitialData(id);
    this.isLoggedIn = computed(() => !!this.usuario());
    this.omitFirstBidIncoming = true;
    this.checkUserLoggedData();
    // this.vistas.idUsuario = this.usuario()?.id ?? 0;
    // this.vistas.idSubasta = id;
    // this.getVistasOfertas();
    // if (this.isLoggedIn()) {
    //   this.getVendedoresSeguidos(this.usuario()!.id);
    // }
  }

  checkNavigation() {
    let from_page = localStorage.getItem('from_page') ?? '';
    if (from_page !== null && from_page !== '') {
      localStorage.removeItem('from_page');
    }
  }

  animateCurrentAmount(nuevoMonto: number): void {
    const amountEl = this.pillAmount?.nativeElement;
    const amountBadgeEl = this.pillAmountBadge?.nativeElement;
    const amountResponsiveEl = this.pillAmountResponsive?.nativeElement;

    if (!amountEl || nuevoMonto === this.montoVisible) {
      return;
    }

    // Llega otra oferta: corta el conteo anterior y sigue desde el valor en pantalla
    this.tweenMonto?.kill();
    this.tweenPop?.kill();

    const proxy = { val: this.montoVisible };

    this.tweenMonto = gsap.to(proxy, {
      val: nuevoMonto,
      duration: 0.9,
      ease: 'power2.out',
      onUpdate: () => {
        this.montoVisible = proxy.val;
        amountEl.textContent = this.formatoMoneda.format(proxy.val);
        if (amountResponsiveEl) {
          amountResponsiveEl.textContent = this.formatoMoneda.format(proxy.val);
        }
        amountBadgeEl.textContent = this.usuarioMayor ? this.formatoMoneda.format(proxy.val) : '';
      },
      onComplete: () => {
        this.tweenMonto = null;
      }
    });

    // Pop: se agranda, destella en rosa y regresa a su tamaño y color base
    this.tweenPop = gsap.timeline({ onComplete: () => { this.tweenPop = null; } })
      .to(amountEl, { scale: 1.22, color: '#db2777', duration: 0.18, ease: 'power2.out' })
      .to(amountEl, { scale: 1, color: '#0984e3', duration: 0.4, ease: 'power2.inOut' });

    this.tweenPop = gsap.timeline({ onComplete: () => { this.tweenPop = null; } })
      .to(amountBadgeEl, { scale: 1.22, color: '#db2777', duration: 0.18, ease: 'power2.out' })
      .to(amountBadgeEl, { scale: 1, color: '#2d3436', duration: 0.4, ease: 'power2.inOut' });

    if (amountResponsiveEl) {
      this.tweenPop = gsap.timeline({ onComplete: () => { this.tweenPop = null; } })
        .to(amountResponsiveEl, { scale: 1.22, color: '#db2777', duration: 0.18, ease: 'power2.out' })
        .to(amountResponsiveEl, { scale: 1, color: '#0984e3', duration: 0.4, ease: 'power2.inOut' });
    }
  }

  ngOnInit(): void {

    //const id = +this.route.snapshot.paramMap.get('id')!;

    this.origen = this.route.snapshot.paramMap.get('origen') || '';
    console.log('Origen:', this.origen);
    // this.usuario()!.id
    this.getPremium();
    // this.setMontoInicial();

    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.verifyIfAuctionExist(id);
        console.log('Cargando nueva subasta:', id);
        // this.getInitialData(id);
      }
    });
    // this.subastasService.getAuctionById(id).subscribe(sub => {
    //   this.detallesubasta = sub;

    //   // 2. Luego cargar la lista
    //   let tipo: 'porvencer' | 'premium' | 'todas' = 'todas';
    //   if (this.origen === 'Subastas Premium') tipo = 'premium';
    //   else if (this.origen === 'Subastas Express') tipo = 'porvencer';

    //   console.log('Tipo de subastas a consultar:', tipo);
    //   this.subastasService.getAuctions(tipo).subscribe(list => {
    //     console.log('Lista recibida:', list);
    //     this.lista = list;

    //     // 3. Ya tienes subasta y lista. Ahora sí puedes usar todo
    //     this.indiceActual  = this.lista.findIndex(s => s.id === this.detallesubasta!.id);
    //     this.imagenActual  = this.detallesubasta!.url;
    //     this.tiempoVence   = this.detallesubasta!.tiempoVence ?? '00:00:00';

    //     this.iniciarTemporizador();
    //     this.verificarSiSiguiendo();
    //     this.conectarSignalR();
    //   });
    // }); 
    this.modoOscuro = localStorage.getItem('tema') === 'Oscuro';
    console.log("valor de tema oscuro " + this.modoOscuro)

  }

  showNewBidAnimation(): void {
    if (this.omitFirstBidIncoming) {
      this.omitFirstBidIncoming = false;
      return;
    }
    const pill = this.currentOfferBadge?.nativeElement;

    if (!pill) {
      console.warn('No se encontró la pastilla de oferta');
      return;
    }

    // this.burstConfetti();
    const pink = '#db2777';

    const whiteTargets = [
      this.pillBidder?.nativeElement,
      this.pillWinning?.nativeElement,
      this.pillAmountBadge?.nativeElement,
      this.trophyLeft?.nativeElement,
      this.trophyRight?.nativeElement
    ].filter((element): element is HTMLElement => !!element);

    const rings = [
      this.offerRingOne?.nativeElement,
      this.offerRingTwo?.nativeElement
    ].filter((element): element is HTMLElement => !!element);

    const badge = this.offerBadge?.nativeElement;

    gsap.killTweensOf([pill, ...whiteTargets, ...rings, ...(badge ? [badge] : [])]);
    this.burstConfetti();
    const timeline = gsap.timeline();

    // 1) La pastilla entra en modo "mi oferta"
    timeline.to(pill, {
      backgroundColor: pink,
      borderColor: pink,
      scale: 1.05,
      duration: 0.25,
      ease: 'power2.out'
    });

    // 2) Los textos pasan a blanco al mismo tiempo
    if (whiteTargets.length) {
      timeline.to(whiteTargets, { color: '#ffffff', duration: 0.2 }, '<');
    }

    // 3) Los anillos se expanden desde el borde, uno tras otro
    if (rings.length) {
      timeline.fromTo(rings,
        { scale: 1, opacity: 0.9 },
        { scale: 1.55, opacity: 0, duration: 0.75, stagger: 0.16, ease: 'power2.out' },
        '<'
      );
    }

    // 4) La etiqueta "Tu oferta" cae desde arriba
    if (badge) {
      timeline.fromTo(badge,
        { xPercent: -50, y: -14, opacity: 0 },
        { xPercent: -50, y: 0, opacity: 1, duration: 0.35, ease: 'back.out(2)' },
        '<+=.1'
      );
    }

    // 5) Se mantiene azul un momento
    timeline.to({}, { duration: 1 });

    // 6) Regreso al estado normal
    timeline.to(pill, {
      backgroundColor: '#ffffff',
      borderColor: '#e5e8ef',
      scale: 1,
      duration: 0.45,
      ease: 'power2.out'
    });

    const originalColors: Array<[HTMLElement | undefined, string]> = [
      [this.pillBidder?.nativeElement, '#1e2a4a'],
      [this.pillWinning?.nativeElement, '#db2777'],
      [this.pillAmountBadge?.nativeElement, '#566179'],
      [this.trophyLeft?.nativeElement, '#f59e0b'],
      [this.trophyRight?.nativeElement, '#f59e0b']
    ];

    originalColors.forEach(([element, color]) => {
      if (element) {
        timeline.to(element, { color, duration: 0.35 }, '<');
      }
    });

    if (badge) {
      timeline.to(badge, { y: -10, opacity: 0, duration: 0.3 }, '<');
    }
  }

  private readonly CONFETTI_COLORS = ['#db2777', '#f472b6', '#fbcfe8', '#ffffff'];
  private readonly CONFETTI_COUNT = 26;

  burstConfetti(): void {
    const layer = this.confettiLayer?.nativeElement;

    if (!layer) {
      console.warn('[confeti] No se encontró #confettiLayer en el template');
      return;
    }

    const originX = layer.offsetWidth / 2;
    const originY = layer.offsetHeight / 2;

    for (let i = 0; i < this.CONFETTI_COUNT; i++) {
      const particle = document.createElement('div');
      const size = 6 + Math.random() * 6;

      particle.style.cssText = [
        'position: absolute',
        'top: 0',
        'left: 0',
        `width: ${size}px`,
        `height: ${size}px`,
        `border-radius: ${Math.random() > 0.5 ? '50%' : '2px'}`,
        `background: ${this.CONFETTI_COLORS[i % this.CONFETTI_COLORS.length]}`,
        'pointer-events: none',
        'will-change: transform, opacity'
      ].join(';');

      layer.appendChild(particle);

      const angle = (Math.PI * 2 * i) / this.CONFETTI_COUNT + (Math.random() - 0.5);
      const distance = 80 + Math.random() * 90;
      const endX = originX + Math.cos(angle) * distance;
      const endY = originY + Math.sin(angle) * distance - 30;

      gsap.set(particle, { x: originX, y: originY, opacity: 1 });

      gsap.timeline({ onComplete: () => particle.remove() })
        .to(particle, {
          x: endX,
          y: endY,
          rotation: gsap.utils.random(-180, 180),
          duration: 0.65,
          ease: 'power2.out'
        })
        .to(particle, {
          y: `+=${120 + Math.random() * 80}`,
          opacity: 0,
          duration: 0.7,
          ease: 'power1.in'
        }, '-=0.05');
    }
  }



  checkUserLoggedData() {
    if (this.isLoggedIn()) {
      // this.getSubastasSeguidas();
      this.getDireccionesEntrega(this.usuario()!.id, 'entrega');
    }
  }

  verifyIfAuctionExist(IdSubasta: number) {
    this.gettingData = true;
    this.subastasService.ConsultarSubastaOfertarId(IdSubasta).subscribe({
      next: (response: any) => {
        console.log(response);
        this.detallesubasta = response;
        this.isValidExistingSubasta = response && response.id ? true : false;
        this.idSubasta = IdSubasta;
        this.getVistasOfertas();
        if (this.detallesubasta.tiempoVence && this.detallesubasta.tiempoVence === '00:00:00') {
          // if (this.detallesubasta.esMiSubasta) {
          //   //this.router.navigate(['/subasta-terminada', {id: this.detallesubasta!.id}]);
          //   this.router.navigate(['/my-subasta-detalle', IdSubasta]);
          // } else {
          //   let dataParams = JSON.stringify({ idSubasta: IdSubasta, tipoUsuario: 'comprador' });
          //   let encoded = this.ss.encodeToBase64(dataParams);
          //   // this.router.navigate(['/my-subasta-detalle',this.detallesubasta!.id ]);
          //   this.router.navigate(['/subasta-terminada', encoded]);
          // }
          this.moveToSubastaTerminada(IdSubasta, this.detallesubasta.esMiSubasta)
        } else {
          this.conectarSignalR();
          this.checkCurrentAuctionTime();
          this.verificarSiSiguiendo();
          this.checkAuctionBidsAndNextBid();
          this.getComisionesEnvio();
          if (this.lista.length <= 0) {
            this.getListaSubastas();
          }
        }

      },
      error: (error) => {
        this.idSubasta = -1;
        //console.error(error);
        this.isValidExistingSubasta = false;
      },
      complete: () => {
        this.gettingData = false;
        this.loading = false;
      }

    })
  }

  moveToSubastaTerminada(IdSubasta: number, esMiSubasta: boolean) {
    localStorage.setItem('from_page', 'profile');
    if (esMiSubasta) {
      this.router.navigate(['/my-subasta-detalle', IdSubasta]);
    } else {
      let dataParams = JSON.stringify({ idSubasta: IdSubasta, tipoUsuario: 'comprador' });
      let encoded = this.ss.encodeToBase64(dataParams);
      this.router.navigate(['/subasta-terminada', encoded]);
    }
  }

  getComisionesEnvio() {
    this.subastasService.getComisionesCrearSubasta(0, 'CotizacionEnvio').subscribe({
      next: (val) => {
        this.listaComisionesEnvio = val;
      },
      error: (err) => {
        console.error('Error:', err);
      }
    });
  }


  checkCurrentAuctionTime() {
    this.tiempoVence = this.detallesubasta.tiempoVence ?? '00:00:00';
    this.iniciarTemporizador();
  }

  checkAuctionBidsAndNextBid() {
    this.valorApuesta = this.detallesubasta.ofertaActual;
    this.siguienteApuesta = this.detallesubasta.ofertaActual + this.detallesubasta.valorOferta;
  }

  getListaSubastas() {
    let tipo: 'porvencer' | 'premium' | 'todas' = 'todas';
    switch (this.origen) {
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
    this.subastasService.getAuctions(tipo).subscribe({
      next: (response: any) => {
        this.lista = response;
        this.lista = this.lista.filter(x => x.id !== this.detallesubasta.id);
        this.indiceActual = 0; //index > -1 ? index : 0;
        this.lista.unshift(this.detallesubasta);

      },
      error: (error) => {
        console.log('Error getting more subastas: ', error);
        this.ss.showNotification('warning', 'Error obteniendo mas subastas')
      },
      complete: () => {
        console.log('Obteniendo mas subastas completado')
      }
    })
  }


  moveToSelectedPremium(id: number) {
    // this.loading = true;
    this.subastasService.ConsultarSubastaOfertarId(id).subscribe({
      next: (subasta) => {
        let tiempoVence = subasta.tiempoVence ?? '00:00:00';
        let segundos: number, minutos: number, horas: number;
        let _tiempoRestante = tiempoVence.split(':').reduce((acc: number, time: string) => { return (60 * acc) + Number(time); }, 0);
        console.log(_tiempoRestante);
        // this.loading = false;
        if (_tiempoRestante > 0) {
          const url = new URL(window.location.href);
          console.log(url)
          const newURl = `${url.origin}/subasta-detalle/${subasta.id}/SubastasPremium`;
          url.searchParams.set('id', subasta.id.toString());
          url.searchParams.set('origen', 'SubastasPremium');
          this.router.navigate(['/subasta-detalle', subasta.id, 'SubastasPremium']);
          window.location.href = newURl;
        } else {
          // let dataParams = JSON.stringify({ idSubasta: id, tipoUsuario: 'comprador' });
          // let encoded = this.ss.encodeToBase64(dataParams);
          // this.router.navigate(['/subasta-terminada', encoded]);
          this.moveToSubastaTerminada(id, subasta.esMiSubasta)
          // if (this.detallesubasta.esMiSubasta) {
          //   this.router.navigate(['/my-subasta-detalle', this.detallesubasta!.id]);
          // } else {
          //   let dataParams = JSON.stringify({ idSubasta: id, tipoUsuario: 'comprador' });
          //   let encoded = this.ss.encodeToBase64(dataParams);
          //   this.router.navigate(['/subasta-terminada', encoded]);
          // }
        }
      },
      error: (err) => {
        console.error('Error fetching auction details:', err);
        // this.loading = false;
      }
    })
  }


  backToHome() {
    this.router.navigate(['/home']);
  }

  cambiarTema() {
    this.modoOscuro = !this.modoOscuro;

    if (this.modoOscuro) {
      localStorage.setItem('tema', 'Oscuro');
    } else {
      localStorage.setItem('tema', '');
    }

  }

  checkTheme() {
    const tema = localStorage.getItem('theme') ? localStorage.getItem('theme') : '';
    this.isDarkMode = tema === 'dark' ? true : false;
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



  // getDatosSubastaGenerales(id: number) {
  //   this.loading = true;

  //   this.subastasService.ConsultarSubastaOfertarId(id).subscribe({
  //     next: (detalleSubasta: any) => {
  //       let tiempoVence = detalleSubasta.tiempoVence ?? '00:00:00';
  //       let _tiempoRestante = tiempoVence.split(':').reduce((acc: number, time: string) => (60 * acc) + Number(time), 0);
  //       this.loading = false;
  //       if (_tiempoRestante <= 0) {
  //         let dataParams = JSON.stringify({
  //           idSubasta: id,
  //           tipoUsuario: 'comprador'
  //         });
  //         let encoded = this.ss.encodeToBase64(dataParams);
  //         this.router.navigate(['/subasta-terminada', encoded]);
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Error fetching auction details:', err);
  //       this.loading = false;
  //     }
  //   });
  // }

  getVendedoresSeguidos(idUsuario: number) {
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

  getVistasOfertas() {
    this.subastasService.registrarVista({ idSubasta: this.detallesubasta!.id }).subscribe({
      next: (vistas: any) => {
        console.log(vistas)
        this.detallesubasta.vistas = vistas.vistas
        this.detallesubasta.ofertas = vistas.ofertas
      },
      error: (err) => {
        console.error('Error fetching vistas ofertas:', err);
      }
    })
  }

  getSiguiendo(idVendedor: number) {
    if (this.listaVendedoresSeguidos.length > 0) {
      return this.listaVendedoresSeguidos.some(vendedor => vendedor.id === idVendedor);
    } else {
      return false;
    }
  }

  toggleSeguirVendedor(idVendedor: number) {
    if (this.getSiguiendo(idVendedor)) {
      this.dejarSeguirVendedor(idVendedor);
    } else {
      this.seguirVendedor(idVendedor);
    }
  }

  seguirVendedor(idVendedor: number) {
    this.lockButton = true;

    const idUsuario = this.usuario()!.id;
    if (this.isLoggedIn()) {
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

          this.ss.showNotification('error', 'Hubo un problema al seguir vendedor');

          console.error('Error fetching vendedores seguidos:', err);
        }
      });
    }
  }

  navigateImage(to: string, event: any) {
    event.stopPropagation();
    switch (to) {
      case 'prev':
        if (this.currentIndexImageViewer > 0) {
          this.classNavigateImg = 'animate__fadeOutRight';
          setTimeout(() => {
            this.currentIndexImageViewer--;
            this.classNavigateImg = 'animate__fadeInLeft';
          }, 350);
        }
        break;
      case 'next':
        if (this.currentIndexImageViewer < this.imagesListViewer.length - 1) {
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



  openModalViewer() {
    console.log('abrir modal de imagenes')
    this.currentIndexImageViewer = this.currentIndexImage;
    this.isviewerOpen = true;
    this.imagesListViewer = this.detallesubasta.imagenes;
    console.log(this.imagesListViewer)
  }

  closeModalViewer() {
    this.isviewerOpen = false;

  }


  dejarSeguirVendedor(idVendedor: number) {
    this.lockButton = true;
    const idUsuario = this.usuario()!.id;
    if (this.isLoggedIn()) {
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
          this.ss.showNotification('error', 'Hubo un problema al dejar de seguir vendedor');
          console.error('Error fetching vendedores seguidos:', err);
        }
      });
    }
  }



  getPremium() {
    this.subastasService.getAuctions('premium').subscribe({
      next: (list) => {
        this.listaPremium = list;
        for (let p of this.listaPremium) {
          p.venceSegundos = this.tiempoStringASegundos(p.tiempoVence);
        }
        this.setTimer(this.listaPremium);
      },
      error: (e) => {
        console.error('Error fetching premium auctions:', e);
      }
    });
  }

  setTimer(litaItems: any[]) {
    this.intervalId = setInterval(() => {
      for (let item of litaItems) {
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

  openUserPage(idVendedor: number) {
    this.router.navigate(['/userpage', idVendedor]);
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

  toggleSingleSeguida(idSubasta: number, event: Event): void {
    // event.stopPropagation();
    const usuario = this.authService.currentUser();
    if (usuario) {
      // if (this.isSingleSeguida(idSubasta)) {
      //   // this.auctionsId = this.auctionsId.filter(id => id !== idSubasta);
      // } else {
      console.log(usuario!.id);
      //   this.auctionsId.push(idSubasta);
      //   this.subastasService.seguirSubasta(usuario!.id, idSubasta.toString()).subscribe({
      //     next: (data) => {
      //       console.log('resultado seguir subasta');
      //       console.log(data);
      //       this.getSubastasSeguidas();
      //     },
      //     error: (error) => {
      //       console.error('Error al agregar subasta seguida:', error);
      //     }
      //   })
      //   // this.auctionsId.push(idSubasta);
      // }
      // const idUsuario = Number(this.authService.idUsuario);
      //const idSubasta = idSubasta.toString();
      if (this.isFollowed) {
        this.subastasService.dejarDeSeguirSubasta(0, idSubasta.toString())
          //.subscribe(() => this.isSingleSeguida(idSubasta));
          .subscribe(() => this.isFollowed = false);
      } else {
        this.subastasService.seguirSubasta(0, idSubasta.toString())
          .subscribe(() => this.isFollowed = true);
      }
    }

  }

  setupIndices() {
    this.indiceActual = this.lista.findIndex(s => s.id === this.detallesubasta!.id);
    this.imagenActual = this.detallesubasta!.url;
    this.tiempoVence = this.detallesubasta!.tiempoVence ?? '00:00:00';
  }

  cambiarSubastaDesdePremium(data: { subasta: Subasta; lista: Subasta[]; origen: string }): void {
    this.detallesubasta = data.subasta;
    this.lista = data.lista;
    this.origen = data.origen;

    this.indiceActual = this.lista.findIndex(s => s.id === this.detallesubasta!.id);
    this.imagenActual = this.detallesubasta!.url;
    this.tiempoVence = this.detallesubasta!.tiempoVence ?? '00:00:00';

    this.resetDatos(); // reinicia temporizador, verifica seguimiento, etc.
    // this.actualizarVista();
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
          // console.log(this.detallesubasta!)
          this.vencida = true;
          this.temporizadorSub$?.unsubscribe();
          // this.consultarGanador();
          // let dataParams = JSON.stringify({ idSubasta: this.idSubasta, tipoUsuario: 'comprador' });
          // let encoded = this.ss.encodeToBase64(dataParams);
          // this.router.navigate(['/subasta-terminada', encoded]);
        }
      }
    });
  }

  verificarSiSiguiendo(): void {
    const idUsuario = 0;
    // const idUsuario = Number(this.authService.idUsuario);

    this.subastasService.ConsultarSiSiguiendo(
      idUsuario,
      this.detallesubasta.id
    ).subscribe({
      next: res => this.isFollowed = res === true,
      error: err => console.error('Error seguimiento:', err)
    });
  }

  toggleSeguir(): void {
    const idUsuario = 0;
    const idSubasta = this.detallesubasta!.id.toString();
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

  toShort(val: string) {
    return val.length > 41 ? val.substring(0, 41) + '...' : val;
  }

  getDireccionesEntrega(idUsuario: number, tipo: string) {
    this.subastasService.GetDireccionesUsuario(idUsuario, tipo).subscribe({
      next: (response: any) => {
        console.log(response);
        this.direcciones = response;
        this.direccionEntrega = this.direcciones.length > 0 ? this.direcciones.find((direccion: any) => direccion.predeterminada) : null;
        console.log(this.direccionEntrega)
        if (this.direccionEntrega && this.direccionEntrega !== null && this.direccionEntrega !== undefined) {
          // this.calcularPrecios();
          this.cotizarPreciosDeEntrega()
        }
      },
      error: (error: any) => {
        console.error('Error fetching addresses:', error);
      }
    }
    );
  }

  changeDireccionEntrega() {
    this.cotizarPreciosDeEntrega();
  }

  cotizarPreciosDeEntrega() {
    let modeloCotizar = this.getCotizarModelFormat();
    console.log('datos cotizar: ', modeloCotizar);
    this.loadingCotizacion = true;
    this.subastasService.cotizarEnvio(modeloCotizar).subscribe({
      next: (data: any) => {
        this.loadingCotizacion = false;
        this.listaTiposEnvio = data.filter((x: any) => x.codigoProducto === 'G' || x.codigoProducto === 'N');
        console.log('Cotización exitosa:', this.listaTiposEnvio);
        for (let cot of this.listaTiposEnvio) {
          cot.precio = this.getPrecioMasComision(cot.precio);
        }
        // this.listaTiposEnvio[0].precio += 100;
        // this.tipoEnvioSeleccionado = this.listaTiposEnvio[0];
        // this.tipoEnvioSeleccionado.precio
        // this.precioTotal = this.detallesubasta!.apuesta + this.precioComision + this.precioEnvio;
      },
      error: (err) => {
        this.loadingCotizacion = false;
        console.error('Error en la cotización:', err);
      }
    })
  }

  getPrecioMasComision(precio: number) {
    let precioMasComision = precio;
    for (let comision of this.listaComisionesEnvio) {
      if (comision.tipoComision === 'Porcentaje') {
        precioMasComision += precio * (comision.porcentaje / 100);
      }
    }
    return precioMasComision;
  }

  getCotizarModelFormat() {
    console.log('Generating cotización model format');
    console.log(this.detallesubasta)
    var cotizacion = {
      "codigoPostalOrigen": this.detallesubasta.codigoPostal,
      "ciudadOrigen": this.detallesubasta.municipio,
      "codigoPostalDestino": this.direccionEntrega.codigoPostal,
      "ciudadDestino": this.direccionEntrega.municipio,
      "peso": this.detallesubasta!.peso,
      "logitud": this.detallesubasta!.largo,
      "ancho": this.detallesubasta!.profundidad,
      "altura": this.detallesubasta!.ancho,
      "fechaEnvio": this.getCotizarFecha()
    }
    return cotizacion;
  }

  getCotizarFecha() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow.toISOString();
  }

  consultarGanador(): void {
    this.subastasService.consultarGanador(this.detallesubasta!.id).subscribe({
      next: resp => {
        const { apuesta, idComprador } = resp;
        if (apuesta >= this.detallesubasta!.precio) {
          this.mensajeFinal =
            Number(idComprador) === 0
              // Number(idComprador) === Number(this.authService.idUsuario)
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


  private async conectarSignalR(): Promise<void> {
    this.connectingSignalR = true;
    // this.badgeCaption.label1 = '';
    // this.badgeCaption.label2 = 'Conectando... ';
    // this.usuarioMayor = '';
    const nuevoId = this.detallesubasta!.id.toString(); //this.idSubasta.toString();

    if (this.idSubastaConectada && this.idSubastaConectada !== nuevoId) {
      await this.signalRService.leaveSubasta(this.idSubastaConectada);
    }

    this.signalRService.connectToSubasta(nuevoId, '0', (datos: any) => {
      console.log(datos)
      // this.signalRService.connectToSubasta(nuevoId, this.authService.idUsuario, (datos: any[]) => {
      const actual = datos;
      // const actual = datos[0];
      console.log('apuesta recibida')
      console.log(nuevoId)
      this.connectingSignalR = false;
      this.badgeCaption.label1 = 'NUEVA APUESTA';

      console.log(actual)
      if (!actual) return;

      this.usuarioMayor = actual.usuario;
      this.badgeCaption.label2 = this.usuarioMayor ? 'Va Ganando' : 'Sin Apuestas'
      this.estatus = actual.estatus;
      // if(this.estatus !== 'ACT') {

      // }
      this.valorApuesta = actual.apuesta;
      // this.setMontoInicial();
      this.animateCurrentAmount(this.valorApuesta)
      this.siguienteApuesta = actual.siguienteApuesta;
      //this.
      const listaStr = (actual.ganadores ?? '').toString();
      const listaItems = listaStr.split('|').filter((g: string) => g.trim());
      this.ganadoresLista = listaItems;
      console.log(this.valorApuesta)

      // console.log(this.ganadoresLista);
      // this.animateResponse();
      // this.showBidIncoming();
      this.showNewBidAnimation();
      // this.ganadoresDetalles = listaItems.map((item: string) => {
      //   const partes = item.replace('$', '').split('-');
      //   return { monto: `$${partes[0]}`, usuario: partes[1], fecha: partes.slice(2).join('-') };
      // });

      if (actual.estatus !== 'ACT') {
        this.vencida = true;
        this.temporizadorSub$?.unsubscribe();
        // this.consultarGanador();
        if (this.detallesubasta.esMiSubasta) {
          //this.router.navigate(['/subasta-terminada', {id: this.detallesubasta!.id}]);
          this.router.navigate(['/my-subasta-detalle', this.detallesubasta!.id]);
        } else {
          let dataParams = JSON.stringify({ idSubasta: this.detallesubasta!.id, tipoUsuario: 'comprador' });
          let encoded = this.ss.encodeToBase64(dataParams);
          // this.router.navigate(['/my-subasta-detalle',this.detallesubasta!.id ]);
          this.router.navigate(['/subasta-terminada', encoded]);
        }

      }
    });

    this.idSubastaConectada = nuevoId;
  }

  // showBidIncoming() {
  //   if (this.omitFirstBidIncoming) {
  //     this.omitFirstBidIncoming = false;
  //     return;
  //   }

  //   // 1. Cancela el temporizador de la oferta anterior, si existe
  //   if (this.bidTimer) {
  //     clearTimeout(this.bidTimer);
  //     this.bidTimer = null;
  //   }

  //   // 2. Los datos se reemplazan (esto está bien, es lo que quieres)
  //   //    y la notificación se mantiene/reabre en true
  //   this.showNewBidIncomeAnimation = true;

  //   // 3. La notificación ahora espera SUS propios 2 segundos completos
  //   this.bidTimer = setTimeout(() => {
  //     this.showNewBidIncomeAnimation = false;
  //     this.bidTimer = null;
  //   }, this.bidNotificationMs);
  // }
  showBidIncoming() {
    if (this.omitFirstBidIncoming) {
      this.omitFirstBidIncoming = false;
      return;
    }

    if (this.bidTimer) {
      clearTimeout(this.bidTimer);
      this.bidTimer = null;
    }

    this.showNewBidIncomeAnimation = true;
    this.restartTimeBar(); // la barra vuelve a 0% en cada oferta nueva

    this.bidTimer = setTimeout(() => {
      this.showNewBidIncomeAnimation = false;
      this.bidTimer = null;
    }, this.bidNotificationMs);
  }

  private restartTimeBar(): void {
    const fill = this.timeFill?.nativeElement;
    if (!fill) return;

    fill.style.animation = 'none';
    void fill.offsetWidth; // fuerza un reflow: el navegador "olvida" la animación anterior
    fill.style.animation = ''; // se re-aplica la del CSS y arranca desde 0
  }
  // showBidIncoming() {
  //   if (this.omitFirstBidIncoming) {
  //     this.omitFirstBidIncoming = false;
  //     return;
  //   }
  //   this.showNewBidIncomeAnimation = true;
  //   setTimeout(() => {
  //     this.showNewBidIncomeAnimation = false;
  //   }, 2000);
  // }

  openShippingPricesModal() {
    this.direccionEntrega = this.direcciones.length > 0 ? this.direcciones.find((direccion: any) => direccion.predeterminada) : null;
    this.direccionEntrega = this.direccionEntrega ? this.direccionEntrega : this.direcciones.length > 0 ? this.direcciones[0] : null;
    // this.direccionEntrega = !this.direccionEntrega && this.direcciones.length > 0? this.direcciones[0]:null;
    console.log(this.direcciones)
    console.log(this.direccionEntrega)
    if (this.direccionEntrega) {
      this.cotizarPreciosDeEntrega();
      this.showModalShippingPrices = true;
    }
    console.log(this.direccionEntrega)
    if (this.direccionEntrega && this.direccionEntrega !== null && this.direccionEntrega !== undefined) {
      // this.calcularPrecios();
      this.cotizarPreciosDeEntrega()
    }
    this.showModalShippingPrices = true;
  }

  closeShippingPricesModal() {
    this.showModalShippingPrices = false;
  }

  // getSubastasSeguidas(){
  //   const usuario = this.authService.currentUser();
  //     if (usuario) {
  //       const idUsuario = usuario.id;
  //       this.auctionService.getAuctions(idUsuario).subscribe({
  //         next: (data) => {
  //           this.auctionsId = data.map(subasta => subasta.id);
  //           this.isFollowed = this.auctionsId.includes(this.detallesubasta!.id);
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

  apuestaPersonalizada(oferta: number) {
    const monto = oferta + this.valorApuesta
    console.log(monto)

    this.realizarApuesta(monto, false)

  }

  // Envía la apuesta
  realizarApuesta(monto: number, compraDirecta = false): void {
    //console.log('apostar')
    const idComprador = 0;
    // const idComprador = +(this.authService.idUsuario);
    if (idComprador === +(this.detallesubasta!.idVendedor)) {
      this.ss.showNotification('warning', 'No puedes ofertar en tu propia subasta.')
      // this.toastr.error('No puedes ofertar en tu propia subasta.', 'Error');
      return;
    }
    // 3500  3800 4000
    //27900 27800 
    //console.log(this.detallesubasta)
    //const ultima = this.valorApuesta || this.detallesubasta!.apuesta;
    //const diff = monto - ultima;
    const diff = monto - this.valorApuesta;

    //console.log(diff)
    if (diff <= 0 && !compraDirecta) return;

    const dataApuesta: Apuesta = {
      idSubasta: this.detallesubasta!.id,
      idComprador,
      apuesta: compraDirecta ? monto : diff,
      compraDirecta
    }

    console.log(dataApuesta)
    this.subastasService.enviarApuesta(dataApuesta).subscribe({
      next: (data: any) => {
        if (!data.success) {
          this.ss.showNotification('error', data.mensaje, 4500)
        }
        console.log('Respuesta de la apuesta: ')
        console.log(data)
        if (!this.isFollowed) {
          this.verificarSiSiguiendo();
        }
      },
      error: err => console.error('Error al enviar apuesta:', err)
    });

    //this.getVistasOfertas()
  }

  closeModalBottom() {
    this.classModalBottom = 'animate__fadeOutDown'
    setTimeout(() => {
      this.showModalBottom = false;
    }, 250);
  }

  openModalBottom() {
    this.showModalBottom = true;
    this.classModalBottom = 'animate__fadeInUp'
    //     setTimeout(() => {
    //       this.showModalBottom = false;
    // }, 250);
  }

  async compraDirecta() {
    const idComprador = 0;
    // const idComprador = +(this.authService.idUsuario);/
    if (idComprador === +(this.detallesubasta!.musuarios?.id)) {
      this.toastr.error('No puedes ofertar en tu propia subasta.', 'Error');
      return;
    }

    let dataApuesta = {
      idSubasta: this.detallesubasta!.id,
      idComprador,
      apuesta: this.detallesubasta.precio,
      compraDirecta: true
    }
    let r = await this.ss.showConfirmMessage(`¿Desea realizar la compra directa de este producto por un precio de: ${this.toCurrency(this.detallesubasta.precio)}?`)
    if (r) {
      this.subastasService.enviarApuesta(dataApuesta).subscribe({
        next: (data) => {
          console.log(data)
          if (!this.isFollowed) {
            this.verificarSiSiguiendo();
          }
          this.ss.showNotification('success', 'Compra directa correcta')
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
      this.indiceActual--;

      this.classAnimate.imageContainer = 'animate__fadeOutRight'
      this.omitFirstBidIncoming = true;
      setTimeout(() => {

        this.resetDatos();
        this.detallesubasta = this.lista[this.indiceActual];
        //this.detallesubasta = this.lista[this.indiceActual];
        this.router.navigate(['/subasta-detalle', this.detallesubasta!.id, this.origen]);

        //this.actualizarVista(); // actualiza imagen, tiempo, etc.

        this.classAnimate.imageContainer = 'animate__fadeInLeft'
      }, 300);
    }
  }



  irASiguiente(): void {

    // PREMIUM: navegación infinita
    if (this.origen === 'SubastasPremium') {

      if (this.indiceActual >= this.lista.length - 1) {
        this.indiceActual = 0;
      } else {
        this.indiceActual++;
      }

    } else {

      // Otras subastas: mostrar alerta al llegar al final
      if (this.indiceActual >= this.lista.length - 1) {
        Swal.fire({
          icon: 'info',
          title: 'No hay más subastas',
          text: 'Ya no hay más subastas disponibles.',
          confirmButtonText: 'Aceptar'
        });

        return;
      }

      this.indiceActual++;
    }

    this.currentIndexImage = 0;
    this.classAnimate.imageContainer = 'animate__fadeOutLeft';
    this.omitFirstBidIncoming = true;

    // this.detallesubasta = this.lista[this.indiceActual];

    // this.router.navigate([
    //   '/subasta-detalle',
    //   this.detallesubasta!.id,
    //   this.origen
    // ]);

    // this.resetDatos();
    // this.isFollowed = false;
    // this.actualizarVista();

    setTimeout(() => {
      this.resetDatos();
      this.detallesubasta = this.lista[this.indiceActual];

      this.router.navigate(['/subasta-detalle', this.detallesubasta!.id, this.origen]);

      this.classAnimate.imageContainer = 'animate__fadeInRight';


    }, 300);
  }

  // actualizarVista() {
  //   this.imagenActual = this.detallesubasta!.url;
  //   this.tiempoVence = this.detallesubasta!.tiempoVence ?? '00:00:00';
  //   //this.iniciarTemporizador();
  //   this.verificarSiSiguiendo();
  //   //this.getSubastasSeguidas();
  //   this.conectarSignalR();

  //   const segundos = this.tiempoStringASegundos(this.tiempoVence);

  //   this.fechaFin = new Date(
  //     new Date().getTime() + segundos * 1000
  //   );

  //   // this.iniciarTimerReal();
  // }

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
    this.isFollowed = false;
    this.ganadoresLista = [];
    this.ganadoresDetalles = [];
    this.valorApuesta = 0;
    this.siguienteApuesta = 0;
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

  animateResponse() {
    this.animatedClass = 'animate__bounceIn'
    // this.incomeBidAnimateColor = 'bidBadgeColor-begin';
    setTimeout(() => {
      this.animatedClass = '';
      // this.incomeBidAnimateColor = 'bidBadgeColor-medium';
    }, 300);
  }

  tryOfertaPersonalizada() {
    if (this.valorSubastaPersonalizada === null || this.valorSubastaPersonalizada <= 0 || this.valorSubastaPersonalizada > 1000) {
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

  closeModal() {
    this.valorSubastaPersonalizada = null;
    this.isModalOpen = false;
  }

  onContentClick(event: MouseEvent) {
    event.stopPropagation();
  }

  setApuestaPersonalizada(valor: number) {
    this.valorSubastaPersonalizada = valor;
  }

  setIndexImage(index: number) {

    // this.imageClassAnimated = 'animate__BounceIn';
    this.imageClassAnimated = 'animate__BounceIn';
    this.classAnimate.imageContainer = 'animate__FadeIn';
    this.currentIndexImage = index;
    setTimeout(() => {
      this.imageClassAnimated = '';
      this.classAnimate.imageContainer = '';


    }, 300);
  }

  moveToProfile() {
    this.router.navigate(['/profile']);
  }


  abrirmodalofertadirecta() {
    console.log('ABRIENDO MODAL');
    this.ofertar = 0;
    this.mostrarmodalofertadirecta = true
  }

  cerrarmodalofertadirecta() {
    this.mostrarmodalofertadirecta = false;
  }

  botones(numero: number) {
    this.ofertar = numero;
  }

  abrirmodaldescripcion() {
    this.mostrarmodaldescripcion = true
  }

  cerrarmodaldescripcion() {
    this.mostrarmodaldescripcion = false;
  }


}
