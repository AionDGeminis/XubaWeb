import { Component, computed, ElementRef, EventEmitter, OnInit, Output, Signal, ViewChild  } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BusquedaService } from '../../services/busqueda.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subasta, Usuario } from '../../models/subasta.model';
import { AuthService } from '../../services/auth.service';
import { AuctionService } from '../../services/auction.service';
import { SubastasService } from '../../services/subastas.service';
import { SignalRNotificationService } from '../../services/signalrnotifications.service';
import { SharedService } from '../../services/shared.service';
import { LoaderComponent } from '../loader/loader.component';
import { environment } from '../../environment/environment';
import { OpenPayService } from '../../services/openpay.service';
declare var OpenPay: any;

interface ISubasta {
  id?: number;
  caption: string;
  idVendedor?: number;
  descripcion?: string;
  precio: number | null; 
  apuesta: number | null;
  compraDirecta: boolean;
  marca: string;
  modelo: string;
  puja?: number;
  horas?: number | null;
  valorOferta:number | null;
  peso: number | null;
  largo: number | null;
  ancho: number | null;
  profundidad: number | null;
  mimagenesSubasta: any[];
  // imagenesPreview?: any[];
  premium: boolean;
  comisionBanco?: number;
  comisionXuba?: number;
  flete?:number;
  comisionFlete?:number;
  ganacia?: number | null;
  url?: string;
  nuevo?: boolean;
  idDireccion?: number | null;
}

@Component({
  selector: 'app-navbar',  
  standalone: true,
  imports: [FormsModule,CommonModule, LoaderComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  @ViewChild('campoBusqueda') campoBusqueda!: ElementRef<HTMLInputElement>;
  @Output() toggleMenu = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();
  public usuario!: Signal<Usuario|null>;
  public isLoggedIn!: Signal<boolean>;
  currentRoute: string = '';
  inPreregistro: boolean = false;
  isOpened: boolean = false;
  showSearch: boolean = false;
  showTitleDetail: boolean = false;
  paramParts: any[] = [];
  tituloDetalle: string = '';
  loading: boolean = false;
  openModal: boolean = false;
  isOpenHiddenMenu: boolean = false;
  classMenu = '';
  currentHomeIndex: number = 0;
  totalNotificaciones: number = 10;
  loadingNotificaciones: boolean = false;
  auctions: any[] = [];
  auctionsWin: any[] = [];
  auctionsId: number[] = [];
  seguidasIntervalID: any = null;
  itemsLoaderNotificaciones: any = [1,2,3,4,5,6,7,8];
  direccionesEnvioUsuario: any[] = [];
  showingInAside: string = 'menu';
  clasesAside = {one:'', two:''}
  tarjetas: any[] = [];
  selectedTab: number = -1;
  tipoSubasta:  'general' | 'premium' = 'general';
  subasta!: ISubasta;
  imagesPreview: any[] = [];
  precioSubastaPremium: number = 17.5;
  porcentajeValorInicial: number = 0;
  terminosRevisados: boolean = false;
  selectedCard: any = null;
  tarjeta = {
    holder_name: '',
    holder_lastname: '',
    card_number: '',
    expiration_month: '',
    expiration_year: '',
    cvv2: '',
    mail: '',
    phone: '',
  };
  aceptarTerminos: boolean = false;
  openModalPoliticas: boolean = false;
  showBack: boolean = false;
  modeloComprobante: any = {}
  emailContacto = 'soporte@xuba.mx'
  notificaciones: any[] = [];
  followers: any[] = [];
  favoritos: any[] = [];
  loginForm: any = {usuario:null, pass: null};
  aceptarTerminosCrearSubasta: boolean = false;

  constructor(private busquedaService: BusquedaService, 
    private router: Router, private route: ActivatedRoute, 
    private signalRNotiService: SignalRNotificationService, 
    private ss: SharedService, 
    private subastaService: SubastasService,
    private auctionService: AuctionService,
    private openPayService: OpenPayService,
    private authService: AuthService)  {
      // this.subasta = {
      //   id: 0,
      //   caption: '',
      //   descripcion: '',
      //   precio: null,
      //   compraDirecta: false,
      //   marca: '',
      //   modelo: '',
      //   nuevo: false, 
      //   peso: null,
      //   largo: null,
      //   ancho: null,
      //   profundidad: null,
      //   idDireccion: null,
      //   // puja: 0,
      //   mimagenesSubasta: [],
      //   horas: null,
      //   apuesta: null,
      //   // imagenesPreview: [],
      //   premium: false,
        
      //   valorOferta: null,
      //   comisionBanco: 0,
      //   comisionXuba: 0,
      //   flete:0,
      //   comisionFlete:0,
      //   ganacia: 0,
      //   url: '',
       
        
      // };
      this.usuario = this.authService.currentUser;
      this.isLoggedIn = computed(() => !!this.usuario());
      this.initSubasta();

      OpenPay.setId(environment.openPayId);
      OpenPay.setApiKey(environment.openPayApiKey);
      OpenPay.setSandboxMode(environment.openPaySandBox);
      // OpenPay.setId('mz5jjyzabcb3zzpevo0l');
      // OpenPay.setApiKey('pk_f2da5530e74d4c7fbf292d886aba5e50');
      // OpenPay.setSandboxMode(true);
      if(this.isLoggedIn()){
        console.log(this.usuario());
        this.conectarSignalR(this.usuario()!.id);
      }
    // const routePath = this.route.snapshot.routeConfig;
    // console.log('URL actual:', routePath);
   
  }

  initSubasta(){
    this.subasta = {
      id: 0,
      caption: '',
      descripcion: '',
      precio: null,
      compraDirecta: false,
      marca: '',
      modelo: '',
      nuevo: false, 
      peso: null,
      largo: null,
      ancho: null,
      profundidad: null,
      idDireccion: null,
      // puja: 0,
      mimagenesSubasta: [],
      horas: null,
      apuesta: null,
      // imagenesPreview: [],
      premium: false,
      
      valorOferta: null,
      comisionBanco: 0,
      comisionXuba: 0,
      flete:0,
      comisionFlete:0,
      ganacia: 0,
      url: '',
     
      
    };
  }

  ngOnInit(): void {
    
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
      // .subscribe((event: NavigationEnd) => {
        // Guarda la URL actual
        this.currentRoute = event.urlAfterRedirects;
        this.inPreregistro = this.currentRoute === '/preregistro'? true: false;
        // console.log('Ruta actual:', this.currentRoute);
        this.showSearch = this.currentRoute.includes('home');
        this.showBack = !this.currentRoute.includes('home');

        this.paramParts = this.currentRoute.split('/');
        // console.log(this.paramParts)
        this.showTitleDetail = this.paramParts.length > 2 && this.paramParts[1] === 'subasta-detalle';
        if(this.showTitleDetail && this.paramParts.length > 3){
          let _from = this.paramParts[3] || '';
          // console.log(_from)
          switch(_from){
            case 'SubastasPremium':
              this.tituloDetalle = 'Premium';
              break;
            case 'Generales':
              this.tituloDetalle = 'Generales';
              break;
            case 'SubastasExpress':
              this.tituloDetalle = 'Express';
              break;
            default:
              this.tituloDetalle = 'Generales';

          }
        }
        // Aquí puedes hacer lógica para mostrar/ocultar elementos
      });

      this.usuario = this.authService.currentUser;
      this.isLoggedIn = computed(() => !!this.usuario());
      // console.log('USUAROO LOGUEADO ACTUAL')
      // console.log(this.usuario())
  }
  
  private conectarSignalR(idUsuario: number): void {
    this.signalRNotiService.connectToNotifications(idUsuario.toString(), (datos: any) => {
      this.totalNotificaciones = datos;
    });
  }

  mostrarBusqueda = false;
  textoBusqueda = '';

  toggleBusqueda() {
    if (!this.mostrarBusqueda) {
      this.textoBusqueda = '';      
    }
    this.mostrarBusqueda = !this.mostrarBusqueda;
    if (this.mostrarBusqueda) {
      setTimeout(() => {
        this.campoBusqueda.nativeElement.focus();
      });
    }
    setTimeout(() => {
        this.isOpened = !this.isOpened;
    }, 10);
    
  }
  recargarPagina() {
    // let locked = localStorage.getItem('ILP');
    // console.log(locked)
    // if(locked) return;
    if(this.inPreregistro) return;
    this.router.navigate(
      ['/home'],
    );
    // location.reload(); // ← Esto emula un F5

  }

  getTiempoRelativo(fecha: Date | string, fechaServidor: Date | string): string {
    const ahora = new Date(fechaServidor).getTime();
    const fechaInput = new Date(fecha).getTime();
  
    const diffMs = ahora - fechaInput;
  
    const segundos = Math.floor(diffMs / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
  
    if (segundos < 10) {
      return 'ahora';
    }
  
    if (segundos < 60) {
      return `hace ${segundos} seg`;
    }
  
    if (minutos < 60) {
      return `hace ${minutos} min`;
    }
  
    if (horas < 24) {
      return `hace ${horas} hr`;
    }
  
    return `hace ${dias} d`;
  }

  openProfilePage(){
    this.fnToggleMenu();
    this.router.navigate(['/profile']);
  }

  fnToggleMenu(){
    if(this.isOpenHiddenMenu)    {
      this.classMenu = 'menu-closed';
      setTimeout(() => { 
        this.isOpenHiddenMenu = false;
      }, 50);
    } else {
      this.isOpenHiddenMenu = true;
      setTimeout(() => {
        this.classMenu = 'menu-open';
      }, 50);
    }
  
    // this.toggleMenu.emit();
  }

  buscar() {
    const termino = this.textoBusqueda.trim();
    // console.log('antes de buscar')
    if (termino) {
      this.busquedaService.setTermino(termino);
      this.mostrarBusqueda = false; // Oculta el campo
      this.textoBusqueda = ''; // Opcional: limpia el texto
      this.isOpened  = false;
    }
  }

  backToPage(){
    let pageTo = localStorage.getItem('BCK-TO-PG') ?? 'home';

    this.router.navigate(
      [`/${pageTo}`],
    );
  }

  openUserPage(user: any){
    this.fnToggleMenu();
    setTimeout(() => {
      this.router.navigate(['/userpage', user]);
    }, 100);
   
    
  }


  changeAside(option: any){
    // if(option === 'notifications'){
    //   this.getNotificaciones();
    // }
    switch(option){
      case 'following': this.getSubastasSeguidas();
        break;
      case 'notifications': this.getNotificaciones();
        break;
      case 'winner': this.getSubastasGanadas();
        break;
      case 'followers': this.getMisSeguidores();
        break;
      case 'following-seller': this.getVendedoresFavoritos();
        break;
    }
    this.clasesAside.one = 'animate__fadeOutLeft'
    setTimeout(() => {
      this.showingInAside = option
      this.clasesAside.two = 'animate__fadeInRight'
    }, 260);

  }

  backToMenuAside(){
    this.clasesAside.two = 'animate__fadeOutRight'
    if(this.seguidasIntervalID){
      clearInterval(this.seguidasIntervalID);
    }
    setTimeout(() => {
      this.showingInAside = 'menu'
      this.clasesAside.one = 'animate__fadeInLeft'
    }, 260);
  }

  toShort(val: string){
    return val.length > 41 ? val.substring(0, 41) + '...' : val;
  }


// =========================================================================
// =========================================================================
// ================ FUNCIONES DENTRO DEL MENU DESPLEGABLE ==================

getSubastasSeguidas(){
  const usuario = this.authService.currentUser();
    if (usuario) {
      const idUsuario = usuario.id;
      this.loadingNotificaciones = true;
      this.auctionService.getAuctions(idUsuario).subscribe({
        next: (data) => {
            this.auctions = data.map(subasta => ({
              ...subasta,
              tiempoVence: subasta.tiempoVence ?? '00:00:00',
              vencida: false,
              venceSegundos: this.tiempoStringASegundos(subasta.tiempoVence)
            }));
            this.loadingNotificaciones = false;
            this.auctionsId = data.map(subasta => subasta.id);
            this.setTimer(this.auctions);
          },
          error: (error) => {
            this.loadingNotificaciones = false;
            console.error('Error cargando subastas:', error);
          }
        });
    } else {
      console.warn('Usuario no logueado, no se cargan subastas seguidas');
    }
  }

  getSubastasGanadas(){
    const usuario = this.authService.currentUser();
      if (usuario) {
        this.loadingNotificaciones = true;
        const idUsuario = usuario.id;
      this.subastaService.getSubastasGanadas(idUsuario).subscribe({
         next: (data) => {
            this.auctionsWin = data;
            this.loadingNotificaciones = false;
          },
          error: (error) => {
            this.loadingNotificaciones = false;
            console.error('Error cargando subastas:', error);
          }
        });
    } else {
      console.warn('Usuario no logueado, no se cargan subastas seguidas');
    }
  }

  abrirDetalleSubasta(subasta: Subasta): void {
    this.classMenu = 'menu-closed';
    setTimeout(() => { 
      this.isOpenHiddenMenu = false;
    }, 50);
    this.getDatosSubasta(subasta.id)
  }

  openModalPoliticasFn() {
    this.fnToggleMenu();
    this.openModalPoliticas = true;
  }

  getNotificaciones(){
    this.loadingNotificaciones = true;
    let userData = this.authService.getUserData();
    this.subastaService.getNotifications(userData.id).subscribe({
      next: (data: any) => { 
        console.log('Notificaciones cargadas:', data);
        this.notificaciones = data;
        this.loadingNotificaciones = false;
      },
      error: (err) =>{ 
        console.error('Error al cargar notificaciones', err)
        this.loadingNotificaciones = false;
      }
    });
  }

  getMisSeguidores(){
    this.loadingNotificaciones = true;
    let userData = this.authService.getUserData();
    this.subastaService.getSeguidores(userData.id).subscribe({
      next: (data: any) => { 
        console.log('seguidos cargadas:', data);
        this.followers = data;
        this.loadingNotificaciones = false;
      },
      error: (err) =>{ 
        console.error('Error al cargar seguidores', err)
        this.loadingNotificaciones = false;
      }
    });
  }

  getVendedoresFavoritos(){
    this.loadingNotificaciones = true;
    let userData = this.authService.getUserData();
    this.subastaService.GetVendedoresSeguidos(userData.id).subscribe({
      next: (data: any) => { 
        console.log('favoritos  obtenidos:', data);
        this.favoritos = data;
        this.loadingNotificaciones = false;
      },
      error: (err) =>{ 
        console.error('Error al cargar seguidores', err)
        this.loadingNotificaciones = false;
      }
    });
  }

  getDatosSubasta(id: number){
    this.loading = true;
    this.subastaService.getAuctionById(id).subscribe({
      next: (subasta) => {
        let tiempoVence = subasta.tiempoVence?? '00:00:00';
        let segundos: number, minutos: number, horas: number;
        let _tiempoRestante = tiempoVence.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
        console.log(_tiempoRestante);
        this.loading = false;
        if(_tiempoRestante > 0){
          this.router.navigate(['/subasta-detalle', subasta.id, 'SubastasPremium']);
        } else {
          let dataParams = JSON.stringify({ idSubasta: id, tipoUsuario:'comprador'});
          let encoded = this.ss.encodeToBase64(dataParams);
          this.router.navigate(['/subasta-terminada', encoded]);
        }
      },
      error: (err) => {
        console.error('Error fetching auction details:', err);
        this.loading = false;
      }
    })
  }


  openModalCreateAuction(){
    if(this.isLoggedIn()){
      this.getDirecciones(this.usuario()!.id, 'envio');
      this.getTarjetasUsuario(this.usuario()!.id);
    }
    this.fnToggleMenu();
    this.openModal = true;
   
  }


  tiempoStringASegundos(tiempo: string) {
    const [h, m, s] = tiempo.split(':').map(Number);
    return h * 3600 + m * 60 + s;
  }

  setTimer(litaItems: any[]){
    this.seguidasIntervalID = setInterval(() => {
      for(let item of litaItems){
        if (item.venceSegundos > 0) {
          item.venceSegundos--;
        }
      }
    }, 1000);
  }


  toCurrency(valor: number): string {
    return this.ss.toCurrency(valor);
  }

  segundosATiempoString(segundos: number) {
    const h = String(Math.floor(segundos / 3600)).padStart(2, '0');
    const m = String(Math.floor((segundos % 3600) / 60)).padStart(2, '0');
    const s = String(segundos % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  getDirecciones(idUsuario: number, tipo: string){
    this.subastaService.GetDireccionesUsuario(idUsuario, tipo).subscribe({
      next: (response: any) => {
        console.log('Addresses fetched successfully:', response);
        this.direccionesEnvioUsuario = response;
      },
      error: (error: any) => {
        console.error('Error fetching addresses:', error);
      }
    }
  );
  }

  async getTarjetasUsuario(idUsuario: number){
    this.tarjetas = await this.ss.loadLocalData('Cq@3K$K$RD') ?? []; 
    if(this.tarjetas.length > 0){
      this.tarjetas = this.tarjetas.filter(x => x.id_user === idUsuario);
    }
    console.log('L487: obtener tarjetas ')
    console.log(this.tarjetas)
  }

  onFileChange(event: any) {
    const files = event.target.files;
    let maxFileCount = this.tipoSubasta === 'general' ? 5 : 100;
    let maxCantAdd = maxFileCount - this.subasta.mimagenesSubasta.length;
    let restFilesCount = files && files.length > maxCantAdd ? maxCantAdd: files.length;
    // if (files && files.length + this.subasta.mimagenesSubasta.length <= maxFileCount) {
      if(restFilesCount > 0){
        for (let i = 0; i < restFilesCount; i++) {
          // for (let i = 0; i < files.length && this.subasta.mimagenesSubasta.length < maxFileCount; i++) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
              this.subasta.mimagenesSubasta.push({url: e.target.result});
              this.imagesPreview!.push({url: e.target.result});
              // this.imagenes.push(e.target.result);
            };
            reader.readAsDataURL(files[i]);
          // }
        }
      }
  }

  eliminarImagen(index: number) {
    this.subasta.mimagenesSubasta.splice(index, 1);
    this.imagesPreview!.splice(index, 1);
    // this.imagenes
  }

  setValorHoras(){
    if(this.tipoSubasta === 'general'){
      this.subasta.horas = 100;
      this.subasta.valorOferta = this.subasta.apuesta && this.subasta.apuesta < 100 ? 50:100 ;
      if(this.subasta.mimagenesSubasta.length > 5){
        this.subasta.mimagenesSubasta.splice(5);
        this.imagesPreview.splice(5);
      }
        
    } else {
      this.subasta.horas = null;
      this.subasta.valorOferta = null;
    }
   
  }

  calcularValorInicial(){
    this.subasta.apuesta = (this.subasta.precio! * this.porcentajeValorInicial) /100
  }

  onInput(event: any, atributo: any, fn?: (value: any) => void) {
    const soloNumeros = event.target.value.replace(/[^0-9]/g, '');
    atributo = soloNumeros;
    event.target.value = soloNumeros; 
    fn?.(soloNumeros);
  }


  acceptTerms(){
    this.terminosRevisados = true;
  }

  closeModal() {
    if(this.loading) return;
    this.close.emit();
    this.openModal = false;
    this.openModalPoliticas = false;
    //this.initSubastaEntity();
    this.selectedTab = -1;
    this.aceptarTerminosCrearSubasta = false;
  }

  nextStep(){
    console.log(this.selectedTab)
    console.log(this.tipoSubasta)
    if((this.selectedTab < 2 && this.tipoSubasta === 'general') || (this.selectedTab < 3 && this.tipoSubasta === 'premium')){
      this.selectedTab++;
    } else {
      if(this.isValidModelSubasta() && this.isValidNoNegativeValues()){
        // this.ss.showNotification('success', 'todo correcto')
        let userData = this.authService.getUserData();
        this.subasta.idVendedor = userData.id;
        this.subasta.mimagenesSubasta = this.getClearBase64(this.subasta.mimagenesSubasta);
        if(this.tipoSubasta === 'premium'){
          if(this.checkDataPago()){

            this.subasta.premium = true;
            this.loading = true;
            this.tokenizarTarjeta();
          }
        } else {
            this.subasta.premium = false;
            this.loading = true;
            this.saveNewSubasta();  
        }
      }
    }
  }

  isValidModelSubasta(){
    let isValid = true;
    this.subasta.horas = this.tipoSubasta ==='premium'? this.subasta.horas:100;
    if(this.tipoSubasta !== 'premium'){
      this.subasta.valorOferta = this.subasta.apuesta && this.subasta.apuesta < 100 ? 50:100 ;
    }
    let result = this.ss.isValidModelV2(this.subasta, ['url']);
    if(!result.valid){
      let texto = result.prop === 'mimagenesSubasta'? 'Seleccione al menos una imagen':`Informacion faltante: ${result.prop}`;
      this.ss.showNotification('warning', texto, 6000);
      isValid = false;
      // return;
    }
    return isValid;
  }

  isValidNoNegativeValues(){
    if(this.subasta.peso! <= 0){
      this.ss.showNotification('warning', 'El peso del producto no es valido');
      return false;
    }
  
    if(this.subasta.precio! <= 0){
      this.ss.showNotification('warning', 'El precio es invalido');
      return false;
    }
    if(this.subasta.ancho! <= 0){
     this.ss.showNotification('warning', 'El alto del producto no es valido');
     return false;
    }
    if(this.subasta.largo! <= 0){
     this.ss.showNotification('warning', 'El largo del producto no es valido');
     return false;
    }
    if(this.subasta.profundidad! <= 0){
     this.ss.showNotification('warning', 'El valor de profundidad no es valido');
     return false;
    }
  
    if(this.subasta.horas! <= 0 || this.subasta.horas! > 100 || (this.tipoSubasta === 'premium' && this.subasta.horas! < 30)){
     this.ss.showNotification('warning', 'El tiempo no es valido');
     return false;
    }

    if(this.subasta.valorOferta! <= 0 || this.subasta.valorOferta! > this.subasta.precio!){
     this.ss.showNotification('warning', 'El aumento de oferta no es valido');
     return false;
    }
    // if(this.tipoSubasta === 'premium' && (this.subasta.horas! <= 0))
    return true;
      //  return;
       
      
  }

  getClearBase64(array: any[]){
    for(let i of array){
      console.log(i)
      let url = i.url;
      let index = url.indexOf('base64');
      let firstPart = url.substring(0,  index + 7);
      i.url = url.replace(firstPart,'');
    }
    return array;
  }

  checkDataPago(){
    let valid = true;
    if(!this.ss.isValidModel(this.tarjeta, [])){
      this.ss.showNotification('warning', 'Informacion de pago incompleta');
      valid = false;
    }
    return valid;    
  }

  async tokenizarTarjeta() {
    this.setComprobanteModel();
    let r = await this.ss.tokenizarTarjeta(this.tarjeta);
    if(r.ok){
      this.modeloComprobante.metodoPago = r.metodo_desc;
      this.GenerarCargo(r.token_id, r.deviceSessionId);
    } else {
      this.ss.showNotification('error',r.msg)
    }
    console.log(r)
  }

  setComprobanteModel(){
    let clienteNombre = `${this.usuario()?.nombre} ${this.usuario()?.apellido}`
    const timestamp = Date.now();

    this.modeloComprobante = {
      estatus:'',
      fecha:'',
      idTransaction:'',
      metodoPago: '',
      cliente: clienteNombre ,
      correo:'',
      ordenXuba:`NAX-PREMIUM_${timestamp}-${this.usuario()?.id}`,
      total:this.precioSubastaPremium,
      subtotal:this.precioSubastaPremium,
      envio:0,
      nombreArticulo:`NAX#${this.subasta.caption}-${this.subasta.descripcion?.substring(0,10)}`,
      idArticulo: 0,
      descripcion: this.subasta.descripcion?.substring(0,10),
      cantidad:1,
      noAutorizacion: '',
    };
  }

  GenerarCargo(tokenId: string, deviceSessionId: any){
    let userData = this.authService.getUserData();
    // const deviceSessionId = OpenPay.deviceData.setup('payment-form', 'device-session-id');
    //let dataParamsEndAuth = JSON.stringify({idSubasta: -1, autoRedirect: false, redirectTo: 'home', moveToAuthPage:false, tipoUsuario:'vendedor', process:'payment-premium' });
    let dataParamsEndAuth = JSON.stringify({id: -1, tu:'vendedor', rt: 'home', mtap: false, process:'payment-premium'});

    let encodedAuth = this.ss.encodeToBase64(dataParamsEndAuth);

   
    const dataCharge  = {
      'token': tokenId,
      'amount': this.precioSubastaPremium,
      'description': 'Pago subasta premium vendedor ' + userData.id,
      'name':this.tarjeta.holder_name,       
      'lastName':this.tarjeta.holder_lastname,
      'email':this.tarjeta.mail,
      'phone':this.tarjeta.phone,
      'use_3d_secure': true,
      'device_session_id': deviceSessionId,
      'redirect_url':  `${environment.threeds_redirect_url}/${encodedAuth}` 
    };
    console.log(dataCharge)
    this.openPayService.GenerarCargo(dataCharge).subscribe({
      // next: (response: any) => {
      //   let res = JSON.parse(response.message);
      //   if(res.id && res.status && res.status === 'completed'){
      //     this.saveNewSubasta();  
      //   }
      // },
      // error: (error) => {
      //   this.loading = false;
      // }
      next: (response: any) => {
        this.loading = false;
        
        console.log('CARGO COMPLETADO')
        console.log(response);
       let res = JSON.parse(response.message);
        console.log(res);

        if(res.error_code){
          let textoError = this.ss.getMensajeTextoErrorOpenPay(res.error_code);
          this.ss.showNotification('error', textoError, 6000);
        } 
        else {
          this.modeloComprobante.noAutorizacion = res.authorization;
          this.modeloComprobante.idTransaction = res.id;
          this.modeloComprobante.fecha = res.operation_date;
          this.modeloComprobante.estatus = 'Completado';
          this.modeloComprobante.correo = res.customer.email;
          let estatusCargo = '';
          if(res.status === 'completed'){
            estatusCargo = 'Completado';
            this.saveNewSubasta();
            //this.CambiarEstatusSubasta(this.subasta!.id, AuctionStatus.Pagado, true);

          } else {
            // let encodedKeyDataTransactionID =  this.ss.encodeToBase64('transaction_id');
            // localStorage.setItem(encodedKeyDataTransactionID!, res.id);
            // let encodedKeyDataSubasta =  this.ss.encodeToBase64('tmp_subasta_model');
            // localStorage.setItem(encodedKeyDataSubasta!, JSON.stringify(this.subasta));
            // let encodedKeyTicket = this.ss.encodeToBase64('tmp_ticket_model');
            // localStorage.setItem(encodedKeyTicket!, JSON.stringify(this.modeloComprobante));

            this.ss.setLocalStorageEncodedKey('transaction_id', res.id);
            this.ss.setLocalStorageEncodedKey('tmp_subasta_model',  JSON.stringify(this.subasta));
            this.ss.setLocalStorageEncodedKey('tmp_ticket_model', JSON.stringify(this.modeloComprobante));
            setTimeout(() => {
              // let dataParams = JSON.stringify({transaction_id: res.id, idSubasta: -1, tipoUsuario:'vendedor', autoRedirect: true, redirectTo:res.payment_method.url, moveToAuthPage: true});
              // let dataParams = JSON.stringify({transaction_id: res.id, idSubasta: -1, tipoUsuario:'vendedor', autoRedirect: true, redirectTo:res.payment_method.url, moveToAuthPage: true});
              let dataParams = JSON.stringify({id: -1,tid:res.id , tu:'comprador', rt: res.payment_method.url, mtap: true});

              let encoded = this.ss.encodeToBase64(dataParams);
              this.openModal = false;
              this.router.navigate(['/payment-callback',encoded]);
            }, 100);
          }

        }
      },
      error: (error: any) => {
        this.loading = false;
        this.ss.showNotification('error','Hubo un problema al generar el cargo');  
      }
    });

  }


  saveNewSubasta(){
    //console.log(this.subasta);
    this.subastaService.crearSubasta(this.subasta).subscribe({
      next: (response) => this.saveSubastaSuccess(response),
      error: (err) => this.handleError(err),
    })
  }

  saveSubastaSuccess(data: any){
    console.log(data)
    this.loading = false;
    this.openModal = false;
    this.tarjeta = {
      holder_name: '',
      card_number: '',
      expiration_month: '',
      expiration_year: '',
      cvv2: '',
      mail: '',
      phone: '',
      holder_lastname: ''
    };
    this.initSubasta();
    this.selectedTab = -1;
    this.aceptarTerminosCrearSubasta = false;
    this.ss.showNotification('success','Subasta creada con éxito');
    return;
  }

  handleError(data: any){
    this.loading = false;
    console.log(data);
  }

  changeTarjetaSeleccionada(){
    this.tarjeta = this.selectedCard;
  }

  onContentClick(event: MouseEvent) {
    if(this.loading) return;
    event.stopPropagation();
  }


  logout() {
    console.log('Cerrando sesión...');
    this.signalRNotiService.closeConnection();
    this.authService.logout();
  }

  onLogin() {
    if (!this.loginForm.usuario ||  this.loginForm.usuario.trim() === '' || !this.loginForm.pass || this.loginForm.pass.trim() === '') {
      this.ss.showNotification('error', 'Informacion incorrecta');
      return;
    }

    // const { telefono, contra } = this.loginForm.value;

    const correo='';
    this.loading = true;
    this.authService.login(this.loginForm.usuario.trim(), this.loginForm.pass.trim(), correo).subscribe({
      next: (usuario: any) => {
        this.loading = false;
        console.log('Login exitoso:', usuario);
        this.authService.setUser(usuario); 
        this.ss.showNotification('success', 'Inicio de sesión exitoso');
        this.conectarSignalR(this.usuario()!.id);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error en login:', err);
        this.ss.showNotification('error', 'Error en el inicio de sesión');
      }
    });
  }

  goToSearch(){
    this.classMenu = 'menu-closed';
    setTimeout(() => { 
      this.isOpenHiddenMenu = false;
    }, 50);
    this.router.navigate(['/search-result']);
  }

  
// =========================================================================
// =========================================================================

}
