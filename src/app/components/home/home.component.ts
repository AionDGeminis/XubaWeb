import { Component, ViewEncapsulation, Signal, computed, effect, HostListener, Output, EventEmitter, OnInit, Renderer2, Inject } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule, DOCUMENT } from '@angular/common';
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
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { BusquedaService } from '../../services/busqueda.service';
import { Usuario, Subasta } from '../../models/subasta.model';
// import { Toast } from 'ngx-toastr';
import Swal from 'sweetalert2'
import { SubastasService } from '../../services/subastas.service';
import { AuctionService } from '../../services/auction.service';
import { SharedService } from '../../services/shared.service';
import { LoaderComponent } from '../loader/loader.component';
import { SignalRNotificationService } from '../../services/signalrnotifications.service';
import { environment } from '../../environment/environment';
import { OpenPayService } from '../../services/openpay.service';
import { LocalSignalsService } from '../../services/localsignals.service';
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
  entregaSucursal: boolean
}
// var nuevaSubasta = {
//   "caption": form.nombre,
//   "url":"",
//   "precio":form.precio,
//   "idVendedor":idUser,
//   "descripcion":form.descripcion,
//   "puja":0,
//   "horas":form.tiempo,
//   "comisionBanco":0,
//   "comisionXuba":0,
//   "flete":0,
//   "comisionFlete":0,
//   "ganancia":form.precio,
//   "apuesta":0,
//   "mimagenesSubasta": await getImageB64(),
//   "premium":form.opcionPaquete == OpcionPaquete.gratis? false:true,
//   "compraDirecta":form.compraDirecta,
//   "valorOferta": form.cantidadPuja,
//   "peso":form.peso,
//   "largo":form.largo,
//   "ancho":form.ancho,
//   "profundidad":form.profundidad,
// };
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    // SidebarComponent,
    SearchAuctionsComponent,
    XpressAuctionsComponent,
    GeneralAuctionsComponent,
    PremiumAuctionsComponent,
    // FollowedAuctionsComponent,
    NotificationsComponent,
    // LoginComponent,
    RegisterComponent,
    // ReactiveFormsModule,
    FormsModule,
    LoaderComponent
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




export class HomeComponent implements OnInit {
  title = 'XUBA';
  public usuario!: Signal<Usuario|null>;
  public isLoggedIn!: Signal<boolean>;
  @Output() close = new EventEmitter<void>();
  openModal: boolean = false;
  openModalPoliticas: boolean = false;
  openModalResetPassword: boolean = false;
  currentHomeIndex = 0;
  menuVisible = false;
  mostrarNoti = false;
  mostrarRegistro = false;
  terminoBusqueda = '';
  selectedTab = -1;
  // selectedTab = 0;

  imagenes: string[] = [];
  tipoSubasta: 'general' | 'premium' = 'general';
  descripcionGeneral = '';
  subasta: ISubasta;
  expandido = false;
  auctions: Subasta[] = [];
  auctionsWin: Subasta[] = [];
  auctionsId: number[] = [];
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
  showingInAside = 'menu';
  clasesAside = {one:'', two:''}
  notificaciones: any[] = [];
  paginaNotificaciones = 1;
  cargandoMasNotificaciones = false;
  hayMasNotificaciones = true;
  pagina = 1;
  cargandoMas = false;
  hayMas = true;
  paginaSubastas = 1;
  cargandoMasSubastas = false;
  hayMasSubastas = true;
  paginaSubastasGanadas = 1;
  cargandoMasSubastasGanadas = false;
  hayMasSubastasGanadas = true;
  paginaSeguidores = 1;
  cargandoMasSeguidores = false;
  hayMasSeguidores = true;
  paginaVendedoresFavoritos = 1;
  cargandoMasVendedoresFavoritos = false;
  hayMasVendedoresFavoritos = true;
  imagesPreview: any[] = [];
  itemsLoaderNotificaciones: any = [1,2,3,4,5,6,7,8];
  loginForm: any = {usuario:null, pass: null};
  precioSubastaPremium: number = 17.5;
  // loginForm!: FormGroup;
  // errorLogin = '';
  loading: boolean = false;
  direccionesEnvioUsuario: any[] = [];
  loadingNotificaciones: boolean = false;
  totalNotificaciones: number = 0;
  seguidasIntervalID: any;
  tarjetas: any[] = [];
  selectedCard: any = {};
  followers: any[] = [];
  favoritos: any[] = [];
  // selectedCard: any = {
  //   holder_name: '',
  //   holder_lastname: '',
  //   card_number: '',
  //   expiration_month: '',
  //   expiration_year: '',
  //   mail:'',
  //   phone: '',
  //   id_user: 0
  // }
  // fields = [
  //   { name: 'telefono', type: 'text', placeholder: 'Teléfono', label: 'Telefóno' },
  //   { name: 'contra', type: 'password', placeholder: 'Contraseña', label: 'Contraseña' }
  // ];
  terminosRevisados: boolean = false;
  aceptarTerminos: boolean = false;
  emailContacto = 'soporte@xuba.mx'
  url3DS: string | null = null;
  modeloComprobante: any = {};
  porcentajeValorInicial: number = 0;
  highlight: string= 'alto'
  textoLoading: string = '';
 
  validRegisteredMail: any = null;
  aceptarTerminosCrearSubasta: boolean = false;
  isDarkMode = false;
  listaComisiones: any[] = [];
  infoUsuario: any = {};
  classAsideItem = '';
  splicingIndex = -1;
  tipoEntrega: 'sucursal' | 'domicilio' = 'sucursal';
  horaDomicilioInicio: any;
  horaDomicilioFin: any;
  constructor(
    private lss: LocalSignalsService,
    private authService: AuthService,
    private openPayService: OpenPayService,
    private signalRNotiService: SignalRNotificationService, 
    private ss: SharedService, 
    private busquedaService: BusquedaService,
    private router: Router,
    private subastaService: SubastasService,
    private auctionService: AuctionService,
    private renderer: Renderer2, 
    @Inject(DOCUMENT) private document: Document) {
      effect(() => {
        if (this.lss.triggerFunction()) {
        // this.miFuncion();
        this.getSubastasSeguidas();
          this.lss.triggerFunction.set(false);
        }
      });
      // this.checkTheme();
      this.usuario = this.authService.currentUser;
      this.isLoggedIn = computed(() => !!this.usuario());
      this.busquedaService.terminoBusqueda$.subscribe(
        termino => this.terminoBusqueda = termino
      );
      // OpenPay.setId('mz5jjyzabcb3zzpevo0l');
      // OpenPay.setApiKey('pk_f2da5530e74d4c7fbf292d886aba5e50');
      // OpenPay.setSandboxMode(true);
      OpenPay.setId(environment.openPayId);
      OpenPay.setApiKey(environment.openPayApiKey);
      OpenPay.setSandboxMode(environment.openPaySandBox);
      if(this.isLoggedIn()){
        console.log(this.usuario());
        this.conectarSignalR(this.usuario()!.id);
        this.getInformacionUsuario(this.usuario()!.id);
      }

      effect(() => console.log('¿Está logueado?', this.isLoggedIn()));
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
        entregaSucursal:true
        
      };
      this.imagesPreview = [];
      this.clearAllLocalTmp();
      this.checkFirstLogin();
    // this.getSubastasSeguidas();
    // this.getDireccionesEnvio();
    // const formControls: { [key: string]: any } = {};
    // this.fields.forEach(field => {
    //   formControls[field.name] = ['', Validators.required];
    // });
    // this.loginForm = this.fb.group(formControls);
    
  }

  dejarSeguirSubasta(idSubasta: number, index: number, event: Event){
    event.stopPropagation();
    this.splicingIndex = index;
    
    setTimeout(() => {
      this.auctions.splice(index, 1);
      this.splicingIndex = -1;
      this.subastaService.dejarDeSeguirSubasta(this.infoUsuario.id, idSubasta.toString()).subscribe({
      next: (data) => {
        console.log('resultado seguir subasta');
        console.log(data);
        this.getSubastasSeguidas();
        this.lss.ejecutarFuncionByID(idSubasta);
        this.lss.toogleFollowedIDG(idSubasta);

      },
      error: (error) => {
        console.error('Error al agregar subasta seguida:', error);
      }
    })
    }, 300);
    // this.auctions.splice(index, 1);
    // this.classAsideItem = 'animate__fadeOutLeft'
    
  }

  // checkTheme(){
  //   const tema = localStorage.getItem('theme') ? localStorage.getItem('theme') : '';
  //   this.isDarkMode = tema === 'dark' ? true:false;
  //   this.renderer.setAttribute(this.document.documentElement, 'data-theme', tema!);
  //   localStorage.setItem('theme', tema!);
  // }

  checkFirstLogin(){
    let first = this.ss.getLocalStorageEncodedKey('first_home');
    let subasta = this.ss.getLocalStorageEncodedKey('first_xubasta');
    if(first){
      setTimeout(() => {
        // this.openModalCreateAuction();
        this.ss.removeLocalStorageEncodedKey('first_home');
        this.ss.showMessage('info', 'Registro exitoso<br >Favor de revisar tu correo para validar tu cuenta');
        // this.ss.showNotification('info', 'Registro exitoso, enviamos un correo para validar tu cuenta', 4000);
      }, 550);
    }

    if(subasta){
      setTimeout(() => {
        this.openModalCreateAuction();
        this.ss.removeLocalStorageEncodedKey('first_xubasta');
      }, 350);
    }
  }

  getInformacionUsuario(idUsuario: number){
    this.authService.consultarDatosUsuario(idUsuario).subscribe({
      next: (response: any) => {
        this.infoUsuario = response;
      },
      error: (err: any) => {
        console.error('Error fetching user information:', err);
      }
    });
  }

  

  clearAllLocalTmp(){
    this.ss.removeLocalStorageEncodedKey('transaction_id');
    this.ss.removeLocalStorageEncodedKey('tmp_subasta_model');
    this.ss.removeLocalStorageEncodedKey('tmp_paqueteria_model');
    this.ss.removeLocalStorageEncodedKey('tmp_ticket_model');
    this.ss.removeLocalStorageEncodedKey('tmp_direccion_eg');
    localStorage.removeItem('isXubastaCreated');
    localStorage.removeItem('isXubastaUpdated');
    localStorage.removeItem('isGuideGenerated');
    localStorage.removeItem('isClaimUpdated');
    localStorage.removeItem('TpTbIdx');
    localStorage.removeItem('TpSbTbIdx');
  }


  ngOnInit(): void {
    
  }

  

  initSubastaEntity(){
    this.tipoSubasta = 'general';
    this.tipoEntrega = 'sucursal';
    this.subasta = {
      id: 0,
      caption: '',
      descripcion: '',
      precio: null,
      compraDirecta: false,
      marca: '',
      modelo: '',
      puja: 0,
      horas: null,
      apuesta: null,
      mimagenesSubasta: [],
      // imagenesPreview: [],
      premium: false,
      peso: null,
      largo: null,
      ancho: null,
      profundidad: null,
      valorOferta: null,
      comisionBanco: 0,
      comisionXuba: 0,
      flete:0,
      comisionFlete:0,
      ganacia: 0,
      url: '',
      nuevo: false,
      idDireccion: 0,
      entregaSucursal: true
    };
    this.imagesPreview = [];
  }

  acceptTerms(){
    this.terminosRevisados = true;
  }

  // @HostListener('document:click', ['$event.target'])
  // onClickFuera(target: HTMLElement) {
  //   const dentroDelMenu =
  //     target.closest('.sidebar') || target.closest('.perfil-toggle-wrapper');
  //   if (!dentroDelMenu) {
  //     this.menuVisible = false;
  //   }
  // }

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

  toggleFollowed(){
    this.expandido = !this.expandido;
  }

  mostrarVentana3DS(url: string) {
    this.url3DS = url;
  }

  changeTarjetaSeleccionada(){
    // this.tarjeta = this.selectedCard;
    Object.assign(this.tarjeta, this.selectedCard);
  }
  /**
   * Navega a la ruta de detalle con id y origen como queryParam.
   */
  abrirDetalle(event: { subasta: Subasta; lista: Subasta[]; origen: string }) {
    const { subasta, origen } = event;
    this.router.navigate(
      ['/subasta-detalle', subasta.id],
      { queryParams: { origen } }
    );
  }

  openProfilePage(){
    this.router.navigate(['/profile']);
  }

  openUserPage(user: any){
    this.router.navigate(['/userpage', user]);
  }

  closeModal() {
    if(this.loading) return;
    this.close.emit();
    this.openModal = false;
    this.openModalPoliticas = false;
    this.openModalResetPassword = false;
    //this.initSubastaEntity();
    this.selectedTab = -1;
    this.aceptarTerminosCrearSubasta = false;
  }

  openModalForResetPassword(){
    this.openModalResetPassword = true;
  }

  checkDataForChangePassword(){
    if(!this.validRegisteredMail || this.validRegisteredMail == undefined || this.validRegisteredMail.trim() ===''){
      this.ss.showNotification('warning', 'Ingrese un correo valido');
      return;
    }
    let model = {correo: this.validRegisteredMail};
    this.loading = true;
    this.authService.consultarCorreoExistente(model).subscribe({
      next: (response: any) => {
        console.log(response)
        this.loading = false;
        if(response.success){
          this.enviarCorreoRecuperacionContrasenia();
          //enviar el correo y mostrar ensaje
          // this.closeModal();
          // this.ss.showNotification('success', 'Se ha enviado un correo con un enlace para actualizar tu contrasenia', 4000)
        }
        else {
          this.ss.showNotification('error',response.mensaje, 2500);
          return;
        }
      }, 
      error: (err) => {
        this.loading = false;
        console.log(err)
      }
    })
  }

  enviarCorreoRecuperacionContrasenia(){
    this.loading = true;
    let model = {correo: this.validRegisteredMail}
    this.authService.generarTokenRecuperacionContra(model).subscribe({
      next:(value: any) => {
        this.loading = false;
        console.log(value);
        if(value.success){
          this.closeModal();
          this.ss.showNotification('success', 'Se ha enviado un correo con un enlace para actualizar tu contrasenia', 4000)
        } else {
          this.ss.showNotification('error',value.mensaje, 2500);
          return;
        }
      }, 
      error: (err) => {
        this.loading = false;
        console.log(err)
        // this.ss.showNotification('error',ee.mensaje, 2500);
        return;
      }
    })
  }
  
  nextStep(){
    // console.log(this.subasta)
    // this.validarModelData();
   
    // this.subasta.horas = this.tipoSubasta ==='premium'? this.subasta.horas:100;
    // if(this.tipoSubasta !== 'premium'){
      // this.subasta.valorOferta = this.subasta.apuesta && this.subasta.apuesta < 100 ? 50:100 ;
    // }
    // let result = this.ss.isValidModelV2(this.subasta, ['url']);
    // if(!result.valid){
    //   let texto = result.prop === 'mimagenesSubasta'? 'Seleccione al menos una imagen':`Informacion faltante: ${result.prop}`;
    //   this.ss.showNotification('warning', texto, 6000);
    //   return;
    // }
    // console.log(result);
    // this.ss.showNotification('info', 'no se debe mostrar');
    // if((this.subasta, ['id','descripcion', 'premium', 'url', 'valorOferta'])){
    //   this.ss.showNotification('error', 'Informacion incompleta');
    //   // valid = false;
    // }
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
            // if(!this.subasta.valorOferta || this.subasta.valorOferta === undefined || this.subasta.valorOferta <= 0){
            //   this.ss.showNotification('warning','El incremento de oferta no es valido');
            //   return;
            // }
            this.subasta.premium = true;
            this.loading = true;
            if(this.selectedCard.id){
              this.setComprobanteModel();
              let d_id = this.ss.getDeviceSessionID();
              let metodoPagoDescripcion = `Tarjeta • ${this.selectedCard.brand} • **** ${this.selectedCard.card_number}`;
              this.modeloComprobante.metodoPago = metodoPagoDescripcion;
              this.textoLoading = 'Procesando pago...'
              this.GenerarCargo('',d_id, this.selectedCard.id)
              console.log(d_id)
            } else {
              this.tokenizarTarjeta(this.selectedCard);
            }
            // this.tokenizarTarjeta();
          }
        } else {
         
          // if(this.checkDataSubasta()){
            this.subasta.premium = false;
            // this.subasta.valorOferta = this.subasta.apuesta! < 100 ? 50:100;
            this.loading = true;
            this.saveNewSubasta();  
          // }
        }
      }
      // if(this.subasta.mimagenesSubasta.length === 0){
      //   this.ss.showNotification('warning','Debe agregar al menos una imagen');
      //   return;
      // }
      // if(this.subasta.mimagenesSubasta.length > 5 && this.tipoSubasta === 'general'){
      //   this.ss.showNotification('warning','Solo puedes subir 5 imagenes');
      //   return;
      // }
     
      //console.log(this.subasta.mimagenesSubasta);
     
    }
  }

  isValidModelSubasta(){
    let isValid = true;
    this.subasta.entregaSucursal = this.tipoEntrega === 'sucursal'? true:false;
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
  
    if(this.subasta.horas! <= 0 || this.subasta.horas! > 100 || (this.tipoSubasta === 'premium' && this.subasta.horas! < 1)){
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

  validarNumerosNegativos(obj: any){
    // let res: any = {valid: true, prop: null}
    // for (const key in obj) {
    //   const value = obj[key];
  
    //   if (typeof value === "number") {
    //     if (value <= 0 || Number.isNaN(value)) {
    //       res = {valid: false, prop: key}
    //       break;
    //     }
    //   }
    // }
    // return res;

  }

  validarModelData(){
    
    if(!this.ss.isValidModel(this.subasta, ['id','descripcion', 'premium', 'url', 'valorOferta'])){
      //this.ss.showNotification('error', 'Informacion incompleta');
      //valid = false;
      return;
    }
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
      this.calcularValorInicial();
    }
   
  }

  hasErrors(){

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

 getNotificaciones(reset: boolean = false) {

  if (this.cargandoMasNotificaciones || !this.hayMasNotificaciones) {
    return;
  }

  if (reset) {
    this.paginaNotificaciones = 1;
    this.notificaciones = [];
    this.hayMasNotificaciones = true;
  }

  this.cargandoMasNotificaciones = true;
  //this.loadingNotificaciones = true;

  const userData = this.authService.getUserData();

  console.log('Solicitando página:', this.paginaNotificaciones);

  this.subastaService.getNotifications(
    userData.id,
    this.paginaNotificaciones
  ).subscribe({

    next: (data: any) => {

      console.log('Página recibida:', this.paginaNotificaciones);
      console.log('Cantidad recibida:', data.length);
      console.log('Datos:', data);

      if (data.length < 10) {
        this.hayMasNotificaciones = false;
      }

      this.notificaciones.push(...data);

      console.log('Total de notificaciones:', this.notificaciones.length);

      this.paginaNotificaciones++;

      console.log('Siguiente página:', this.paginaNotificaciones);

      //this.loadingNotificaciones = false;
      this.cargandoMasNotificaciones = false;
    },

    error: (err) => {

      console.error('Error obteniendo notificaciones:', err);

      this.loadingNotificaciones = false;
      this.cargandoMasNotificaciones = false;
    }

  });

}
onScrollNotifications(event: any) {

  const element = event.target;

  console.log(
    "scrollTop:", element.scrollTop,
    "clientHeight:", element.clientHeight,
    "scrollHeight:", element.scrollHeight
  );

  const alFinal =
    element.scrollTop + element.clientHeight >= element.scrollHeight - 20;

  if (alFinal) {
    console.log("Pidiendo página", this.paginaNotificaciones);
    this.getNotificaciones();
  }
}
  getMisSeguidores(reset: boolean = false) {

  if (this.cargandoMasSeguidores || !this.hayMasSeguidores) {
    return;
  }

  if (reset) {
    this.paginaSeguidores = 1;
    this.followers = [];
    this.hayMasSeguidores = true;
  }

  //this.loadingNotificaciones = true;
  this.cargandoMasSeguidores = true;

  const userData = this.authService.getUserData();

  console.log('Solicitando página:', this.paginaSeguidores);

  this.subastaService.getSeguidores(
    userData.id,
    this.paginaSeguidores
  ).subscribe({

    next: (data: any) => {

      console.log('Página recibida:', this.paginaSeguidores);
      console.log('Cantidad recibida:', data.length);

      if (data.length < 10) {
        this.hayMasSeguidores = false;
      }

      this.followers.push(...data);

      this.paginaSeguidores++;

     // this.loadingNotificaciones = false;
      this.cargandoMasSeguidores = false;
    },

    error: (err) => {

      console.error('Error al cargar seguidores', err);

      this.loadingNotificaciones = false;
      this.cargandoMasSeguidores = false;
    }

  });

}
onScrollSeguidores(event: any) {

  const element = event.target;

  const alFinal =
    element.scrollTop + element.clientHeight >= element.scrollHeight - 20;

  if (alFinal) {
    console.log('Pidiendo página', this.paginaSeguidores);
    this.getMisSeguidores();
  }

}

  getVendedoresFavoritos(reset: boolean = false) {

  if (this.cargandoMasVendedoresFavoritos || !this.hayMasVendedoresFavoritos) {
    return;
  }

  if (reset) {
    this.paginaVendedoresFavoritos = 1;
    this.favoritos = [];
    this.hayMasVendedoresFavoritos = true;
  }

  this.cargandoMasVendedoresFavoritos = true;
 // this.loadingNotificaciones = true;

  let userData = this.authService.getUserData();

  this.subastaService.GetVendedoresSeguidos(
    userData.id,
    this.paginaVendedoresFavoritos
  ).subscribe({

    next: (data: any) => {

      if (data.length < 10) {
        this.hayMasVendedoresFavoritos = false;
      }

      this.favoritos.push(...data);

      this.paginaVendedoresFavoritos++;

      //this.loadingNotificaciones = false;
      this.cargandoMasVendedoresFavoritos = false;
    },

    error: (err) => {

      console.error('Error al cargar vendedores favoritos', err);

      this.loadingNotificaciones = false;
      this.cargandoMasVendedoresFavoritos = false;
    }

  });

}
onScrollVendedoresFavoritos(event: any) {

  const element = event.target;

  const alFinal =
    element.scrollTop + element.clientHeight >= element.scrollHeight - 20;

  if (alFinal) {
    this.getVendedoresFavoritos();
  }

}

  changeHomeIndex(index: number){
    this.currentHomeIndex = index;
  }


  changeAside(option: any){
    // if(option === 'notifications'){
    //   this.getNotificaciones();
    // }
    switch(option){
      case 'following': this.getSubastasSeguidas();
        break;
      case 'notifications': this.getNotificaciones(true);
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

  checkDataSubasta(){
    console.log(this.subasta)
    let valid = true;
    if(!this.ss.isValidModel(this.subasta, ['id','descripcion', 'premium', 'url', 'valorOferta'])){
        this.ss.showNotification('error', 'Informacion incompleta');
        valid = false;
      }
    return valid;
    // let valid = true;
    // let userData = this.authService.getUserData();
    // this.subasta.idVendedor = userData.id;
    // if(this.tipoSubasta === 'premium'){
    //   if(!this.subasta.horas || this.subasta.horas < 30 || this.subasta.horas > 100){
    //     this.ss.showNotification('error', 'Cantidad de Horas no valida');
    //     // return;
    //     // valid = false;
    //     return false;
    //   }
    // } else {
    //   this.subasta.horas = 100;
    // }
    // console.log(this.subasta)
    // if(!this.ss.isValidModel(this.subasta, ['id','descripcion', 'premium', 'url', 'valorOferta'])){
    //   this.ss.showNotification('error', 'Informacion incompleta');
    //   valid = false;
    // }
    // if(!this.porcentajeValorInicial || this.porcentajeValorInicial === undefined){
    //   this.ss.showNotification('warning','Seleccione un porcentaje de valor inicial');
    //   valid = false;
    // }
    // this.isNonNegativeValue();
    // // if()
    // return valid;    
  }

  // isNonNegativeValue(){
  //   if(this.subasta.precio! <= 0){
  //     this.ss.showNotification('warning', 'El precio es invalido');
  //     return;
  //    }
  //  if(this.subasta.ancho! <= 0){
  //   this.ss.showNotification('warning', 'El alto del producto no es valido');
  //   return;
  //  }
  //  if(this.subasta.largo! <= 0){
  //   this.ss.showNotification('warning', 'El largo del producto no es valido');
  //   return;
  //  }
  //  if(this.subasta.profundidad! <= 0){
  //   this.ss.showNotification('warning', 'La profundidad del producto no es valido');
  //   return;
  //  }
  //  if(this.subasta.peso! <= 0){
  //   this.ss.showNotification('warning', 'El peso del producto no es valido');
  //   return;
  //  }

  //  if(this.subasta.horas! <= 0 || this.subasta.horas! > 100){
  //   this.ss.showNotification('warning', 'El tiempo no es valido');
  //   return;
  //  }

  //  if(this.subasta.valorOferta! <= 0 || this.subasta.valorOferta! > this.subasta.precio!){
  //   this.ss.showNotification('warning', 'El aumento de oferta no es valido');
  //   return;
  //  }
  // //  return;
   
  // }

  checkDataPago(){
    let valid = true;
    let omitir = this.ss.isValidValue(this.selectedCard.id) ? ['card_number']:['id'];
    const _card = {
      card_number: this.tarjeta.card_number,
      cvv2: this.tarjeta.cvv2,
      expiration_month: this.tarjeta.expiration_month,
      expiration_year: this.tarjeta.expiration_year,
      holder_lastname: this.tarjeta.holder_lastname,
      holder_name: this.tarjeta.holder_name,
      id: this.selectedCard.id,
      mail: this.tarjeta.mail,
      phone: this.tarjeta.phone
    }
    // if(!this.ss.isValidModel(_card,omitir)){
    // // if(!this.ss.isValidModel(this.tarjeta, [])){
    //   this.ss.showNotification('warning', 'Informacion de pago incompleta');
    //   valid = false;
    // }
    // 
    if(!this.ss.isValidModel(_card, omitir)){
      this.ss.showNotification('error', 'Datos faltantes');
      valid = false;
    } else {
      if(+_card.expiration_month > 12){
        this.ss.showNotification('error', 'El mes de expiración de la tarjeta no es válido.', 3000);
        valid = false;
      }
    }
    return valid;    
  }

  handleError(data: any){
    this.loading = false;
    console.log(data);
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


  // Evitar que los clics dentro del contenido del modal cierren el modal
  onContentClick(event: MouseEvent) {
    if(this.loading) return;
    event.stopPropagation();
  }

  getComisionesUsuario(idUsuario: number){
    this.subastaService.getComisionesCrearSubasta(idUsuario).subscribe({
        next: (val) => {
          this.listaComisiones = val;
          console.log(val)
        },
        error: (err) => {
          console.log(err)
        }
    })
  }

  getGanancia(){
    let totalComision = 0;
    if(this.listaComisiones.length > 0){
      for(let c of this.listaComisiones){
       switch(c.tipoComision){
        case 'Porcentaje': let porcentajeValor = (c.porcentaje * this.subasta.precio!) / 100;
          totalComision += porcentajeValor;
          break;
        case 'Pago':
          totalComision += c.porcentaje;
          break;
       }
      }
    }
    return this.subasta.precio! - totalComision;
  }

  openModalCreateAuction(){
    if(this.isLoggedIn()){
      this.getComisionesUsuario(this.usuario()!.id);
      this.getDireccionesEnvio(this.usuario()!.id, 'envio');
      this.getTarjetasUsuario(this.usuario()!.id);
    }
    this.openModal = true;
  }

  openModalPoliticasFn() {
    this.openModalPoliticas = true;
  }

  marcarNotificacionAbrir(notificacion: any, subasta: Subasta){
    console.log(subasta)
    this.subastaService.marcarVistaNotificacion(notificacion.id).subscribe({
      next: (response) => {
        console.log(response)
        console.log(notificacion)
        if(notificacion.titulo === 'Subasta Rechazada'){
          localStorage.setItem('TpTbIdx','1');
          localStorage.setItem('TpSbTbIdx','1');
          localStorage.setItem('FNToReject', 'T');
          this.router.navigate(['/profile']);
        } else {
           this.abrirDetalleSubasta(subasta);
        }
       
      },
      error: (err) => {
        console.log(err)
        this.abrirDetalleSubasta(subasta);
      }
    })
    // this.subastaService.marcarVistaNotificacion(idNotificacion);
    // this.abrirDetalleSubasta(subasta);
  }

  abrirDetalleSubasta(subasta: Subasta): void {

    this.getDatosSubasta(subasta.id)
  }

  async getTarjetasUsuario(idUsuario: number){
    // this.tarjetas = await this.ss.loadLocalData('Cq@3K$K$RD') ?? []; 
    // if(this.tarjetas.length > 0){
    //   this.tarjetas = this.tarjetas.filter(x => x.id_user === idUsuario);
    // }
    // console.log('L487: obtener tarjetas ')
    // console.log(this.tarjetas)
    this.openPayService.getTarjetasUsuario(idUsuario).subscribe({
      next: (response: any) => {
        console.log(response);
        this.tarjetas = response;
        let newCard = this.getNewCardModel();
        this.tarjetas.push(newCard);
        // this.loading = false;
      },
      error: (err) => {
        // this.loading = false;
        //this.ss.showNotification('error', 'Hubo un problema al intentar obtener la lista de tarjetas');
        console.log(err)
      }
    })
  }


  getNewCardModel(){
    return  {
      id:null,
      holder_name: '',
      holder_lastname: '',
      card_number: '',
      expiration_month: '',
      expiration_year: '',
      cvv2: '',
      mail:'',
      phone: '',
    };
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

  getSubastasSeguidas(reset: boolean = false) {

  if (this.cargandoMasSubastas || !this.hayMasSubastas) {
    return;
  }

  if (reset) {
    this.paginaSubastas = 1;
    this.auctions = [];
    this.hayMasSubastas = true;
  }

  const usuario = this.authService.currentUser();

  if (!usuario) {
    console.warn('Usuario no logueado, no se cargan subastas seguidas');
    return;
  }

  this.cargandoMasSubastas = true;
 // this.loadingNotificaciones = true;

  const idUsuario = usuario.id;

  console.log('Solicitando página:', this.paginaSubastas);

  this.auctionService.getAuctions(idUsuario, this.paginaSubastas).subscribe({

    next: (data) => {

      console.log('Página recibida:', this.paginaSubastas);
      console.log('Cantidad recibida:', data.length);

      if (data.length < 10) {
        this.hayMasSubastas = false;
      }

      const nuevasSubastas = data.map(subasta => ({
        ...subasta,
        tiempoVence: subasta.tiempoVence ?? '00:00:00',
        vencida: false,
        venceSegundos: this.tiempoStringASegundos(subasta.tiempoVence)
      }));

      this.auctions.push(...nuevasSubastas);

      this.auctionsId = this.auctions.map(subasta => subasta.id);

      this.setTimer(this.auctions);

      this.paginaSubastas++;

     // this.loadingNotificaciones = false;
      this.cargandoMasSubastas = false;

      console.log('Total subastas:', this.auctions.length);
      console.log('Siguiente página:', this.paginaSubastas);

    },

    error: (error) => {

      this.loadingNotificaciones = false;
      this.cargandoMasSubastas = false;

      console.error('Error cargando subastas:', error);

    }

  });

}
onScrollSubastas(event: any) {

  const element = event.target;

  const alFinal =
    element.scrollTop + element.clientHeight >= element.scrollHeight - 20;

  console.log({
    scrollTop: element.scrollTop,
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    alFinal
  });

  if (alFinal) {
    console.log('Pidiendo página', this.paginaSubastas);
    this.getSubastasSeguidas();
  }

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

  private conectarSignalR(idUsuario: number): void {
    // const nuevoId = this.subasta.id.toString();
    // if (this.idSubastaConectada && this.idSubastaConectada !== nuevoId) {
    //   this.signalRService.leaveSubasta(this.idSubastaConectada);
    // }
    this.signalRNotiService.connectToNotifications(idUsuario.toString(), (datos: any) => {
      // const actual = datos[0];
      // if (!actual) return;
      // this.valorApuesta = actual.apuesta;
      // this.usuarioMayor = actual.usuario;
      // this.estatus = actual.estatus;
      // this.siguienteApuesta = actual.siguienteApuesta;
      // const listaStr = (actual.ganadores ?? '').toString();
      // const listaItems = listaStr.split('|').filter((g: string) => g.trim());
      // this.ganadoresLista = listaItems;
      // // console.log(this.ganadoresLista);
      // this.animateResponse();
      // this.ganadoresDetalles = listaItems.map((item: string) => {
      //   const partes = item.replace('$', '').split('-');
      //   return { monto: `$${partes[0]}`, usuario: partes[1], fecha: partes.slice(2).join('-') };
      // });
      console.log('Datos recibidos signal r notificaciones:', datos);
      console.log(datos);
      this.totalNotificaciones = datos;
    });
    // this.idSubastaConectada = nuevoId;
  }

 getSubastasGanadas(reset: boolean = false) {

  if (this.cargandoMasSubastasGanadas || !this.hayMasSubastasGanadas) {
    return;
  }

  if (reset) {
    this.paginaSubastasGanadas = 1;
    this.auctionsWin = [];
    this.hayMasSubastasGanadas = true;
  }

  const usuario = this.authService.currentUser();

  if (!usuario) {
    console.warn('Usuario no logueado, no se cargan subastas ganadas');
    return;
  }

  //this.loadingNotificaciones = true;
  this.cargandoMasSubastasGanadas = true;

  const idUsuario = usuario.id;

  console.log('Solicitando página:', this.paginaSubastasGanadas);

  this.subastaService.getSubastasGanadas(
    idUsuario,
    this.paginaSubastasGanadas
  ).subscribe({

    next: (data) => {

      console.log('Página recibida:', this.paginaSubastasGanadas);
      console.log('Cantidad recibida:', data.length);
      console.log(data)

      if (data.length < 10) {
        this.hayMasSubastasGanadas = false;
      }

      this.auctionsWin.push(...data);

      this.paginaSubastasGanadas++;

      //this.loadingNotificaciones = false;
      this.cargandoMasSubastasGanadas = false;

      console.log('Total:', this.auctionsWin.length);
    },

    error: (error) => {

      this.loadingNotificaciones = false;
      this.cargandoMasSubastasGanadas = false;

      console.error('Error cargando subastas:', error);

    }

  });

}

onScrollSubastasGanadas(event: any) {

  const element = event.target;

  const alFinal =
    element.scrollTop + element.clientHeight >= element.scrollHeight - 20;

  if (alFinal) {
    console.log('Pidiendo página', this.paginaSubastasGanadas);
    this.getSubastasGanadas();
  }

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

  generarModeloCargo(deviceSessionId: any, encodedAuth: string){
    let userData = this.authService.getUserData();
    const dataCharge:any = {
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

    return dataCharge;
  }

  async tokenizarTarjeta(card: any) {
    // this.setComprobanteModel();
    // let r = await this.ss.tokenizarTarjeta(this.tarjeta);
    // if(r.ok){
    //   this.modeloComprobante.metodoPago = r.metodo_desc;
    //   this.GenerarCargo(r.token_id, r.deviceSessionId);
    // } else {
    //   this.ss.showNotification('error',r.msg)
    // }
    // console.log(r)
    this.loading = true;
    this.textoLoading = 'Procesando pago...'
    this.setComprobanteModel();
    let r = await this.ss.tokenizarTarjeta(card);
    if(r.ok){
      this.modeloComprobante.metodoPago = r.metodo_desc;
      this.GenerarCargo(r.token_id, r.deviceSessionId);
    } else {
      this.loading = false;
      this.ss.showNotification('error',r.msg, 6000)
    }
  }
  
  async getChargePaymentResponse(dataChargeModel: any, card_id?: any){
    let responseCharge = await new Promise<any>((res,rej) => {
      if(card_id){
        this.openPayService.GenerarCargoSecureCard(dataChargeModel).subscribe({
          next: (response: any) => {
            this.loading = false;
            res({success: true, result: response});
          }, 
          error: (error: any) => {
            this.loading = false;
            res({success: false, result: error});
          }
        });
      } else {
        this.openPayService.GenerarCargo(dataChargeModel).subscribe({
          next: (response: any) => {
            this.loading = false;
            res({success: true, result: response});
          }, 
          error: (error: any) => {
            this.loading = false;
            res({success: false, result: error});
          }
        });
      }
    });
    return responseCharge;
  }

  setResponseComprobanteData(response: any){
    this.modeloComprobante.noAutorizacion = response.authorization;
    this.modeloComprobante.idTransaction = response.id;
    this.modeloComprobante.fecha = response.operation_date;
    this.modeloComprobante.estatus = 'Completado';
    this.modeloComprobante.correo = this.tarjeta.mail;
  }

  async GenerarCargo(tokenId: string, deviceSessionId: any, card_id?: any){
    let dataParamsEndAuth = JSON.stringify({id: -1, tu:'vendedor', rt: 'home', mtap: false, process:'payment-premium'});
    let encodedAuth = this.ss.encodeToBase64(dataParamsEndAuth);

    const dataCharge:any = this.generarModeloCargo(deviceSessionId, encodedAuth!);
    if(card_id){
      dataCharge.idTarjeta = card_id;
      dataCharge.customerId = this.infoUsuario.customer_Id
      dataCharge.deviceSessionId = deviceSessionId
      dataCharge.redirectUrl = dataCharge.redirect_url
    } else {
      dataCharge.token = tokenId;
    }
    this.loading = true;
    let responseCharge = await this.getChargePaymentResponse(dataCharge, card_id);

    console.log(responseCharge);
    if(responseCharge.success) {
      let res: any = card_id ? responseCharge.result: JSON.parse(responseCharge.result.message);
      if(res.error_code || res.error_message){
        let textoError = this.ss.getMensajeTextoErrorOpenPay(res.error_code ?? res.error_message);
        this.ss.showNotification('error', textoError, 6000);
      } else {
        this.afterProcessCharge(res);
      }

    } else {
      this.ss.showNotification('error','Hubo un problema al generar el cargo'); 
      return;
    }
  }

  afterProcessCharge(response: any){
    this.setResponseComprobanteData(response);
    if(response.status === 'completed'){
      this.saveNewSubasta();
      //this.CambiarEstatusSubasta(this.subasta!.id, AuctionStatus.Pagado, true);
    } else {
      this.setToXubaComprobante(response)
      this.moveTo3DAuth(response);
    }
  }

  moveTo3DAuth(response: any){
    setTimeout(() => {
      let dataParams = JSON.stringify({'id': -1,'tid':response.id , 'tu':'comprador', 'rt': response.payment_method.url, 'mtap': true});
      let encoded = this.ss.encodeToBase64(dataParams);
      this.router.navigate(['/payment-callback',encoded]);
    }, 100);
  }

  setToXubaComprobante(response: any){
    this.ss.setLocalStorageEncodedKey('transaction_id', response.id);
    this.ss.setLocalStorageEncodedKey('tmp_subasta_model',  JSON.stringify(this.subasta));
    this.ss.setLocalStorageEncodedKey('tmp_ticket_model', JSON.stringify(this.modeloComprobante));
  }

  GenerarCargo_old(tokenId: string, deviceSessionId: any){
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

  calcularValorInicial(){
    this.subasta.apuesta = (this.subasta.precio! * this.porcentajeValorInicial) /100
    this.subasta.valorOferta =  this.subasta.apuesta * 0.6;
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
    this.initSubastaEntity();
    this.selectedTab = 0;
    this.ss.showNotification('success','Subasta creada con éxito');
    return;
  }

  getDireccionesEnvio(idUsuario: number, tipo: string){
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


  // @override
  // Future <PaymentChargeEntity> generarCargo(String token, double monto, String caption, String name, String lastName, String mail, String phone) async {
  //   try {
  //      Map<String, dynamic> headers = {
  //     'Content-Type': 'application/json',
  //     // 'Authorization': 'Basic $credentials',
  //     };
     
  //     final apiBankUrl = 'http://173.208.155.152:8001/api/Cargos/GenerarCargo';
  //     var dataCharge = {
  //       'token': token,
  //       'amount': monto,
  //       'description': caption.trim(),
  //       'name':name.trim(),       
  //       'lastName':lastName.trim(),       
  //       'email':mail.trim(),       
  //       'phone':phone.trim(),       
  //     };
  //     print(dataCharge);
  //     final response = await dio.post(apiBankUrl, data: dataCharge, options: Options(headers: headers));
  //     var cargo = PaymentChargeModel.fromJson(response.data).toPaymentChargeEntity();
  //     return cargo;

  //   } on DioException catch (e) {
  //     if (e.response?.data is Map) {
  //       final errorData = e.response?.data;
  //       final description = errorData['description'] ?? 'Error desconocido';

  //       throw Exception(description);
  //     } else {
  //       throw Exception('Error inesperado: ${e.message}');
  //     }
  //   } catch (e) {
  //     throw Exception('Error inesperado: $e');
  //   }
  // }
  

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
        if(usuario.correoValidado){
          this.authService.setUser(usuario); 
          this.ss.showNotification('success', 'Inicio de sesión exitoso');
          this.conectarSignalR(this.usuario()!.id);
        } else {
          this.ss.showNotification('error', 'Para continuar primero valida tu correo',3500);
        }
        // console.log('Login exitoso:', usuario);

       
      },
      error: (err) => {
        this.loading = false;
        console.error('Error en login:', err);
        this.ss.showNotification('error', 'Error en el inicio de sesión');
      }
    });
  }



  onInput(event: any, atributo: any, fn?: (value: any) => void) {
    const soloNumeros = event.target.value.replace(/[^0-9]/g, '');
    atributo = soloNumeros;
    event.target.value = soloNumeros; 
    fn?.(soloNumeros);
  }

  toCurrency(valor: number): string {
    return this.ss.toCurrency(valor);
  }


}
