import { Component, ViewEncapsulation, Signal, computed, effect, HostListener, Output, EventEmitter } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
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
declare var OpenPay: any;

interface ISubasta {
  id?: number;
  caption: string;
  idVendedor?: number;
  descripcion?: string;
  precio: number | null; 
  apuesta?: number | null;
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
  idDireccion?: number;
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
    SidebarComponent,
    SearchAuctionsComponent,
    XpressAuctionsComponent,
    GeneralAuctionsComponent,
    PremiumAuctionsComponent,
    FollowedAuctionsComponent,
    NotificationsComponent,
    LoginComponent,
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




export class HomeComponent {
  title = 'XUBA';
  public usuario!: Signal<Usuario|null>;
  public isLoggedIn!: Signal<boolean>;
  @Output() close = new EventEmitter<void>();
  openModal: boolean = false;
  openModalPoliticas: boolean = false;
  currentHomeIndex = 0;
  menuVisible = false;
  mostrarNoti = false;
  mostrarRegistro = false;
  terminoBusqueda = '';
  selectedTab = 0;

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
  selectedCard: any = null;
  followers: any[] = [];
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
  
  constructor(private authService: AuthService,private signalRNotiService: SignalRNotificationService, private ss: SharedService, private busquedaService: BusquedaService,private router: Router,private subastaService: SubastasService,private auctionService: AuctionService) {
    this.usuario = this.authService.currentUser;
    this.isLoggedIn = computed(() => !!this.usuario());
    this.busquedaService.terminoBusqueda$.subscribe(
      termino => this.terminoBusqueda = termino
    );
    OpenPay.setId('mz5jjyzabcb3zzpevo0l');
    OpenPay.setApiKey('pk_f2da5530e74d4c7fbf292d886aba5e50');
    OpenPay.setSandboxMode(true);
    if(this.isLoggedIn()){
      console.log(this.usuario());
      this.conectarSignalR(this.usuario()!.id);
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
      puja: 0,
      horas: null,
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
      idDireccion: 0
    };
    this.imagesPreview = [];
    // this.getSubastasSeguidas();
    // this.getDireccionesEnvio();
    // const formControls: { [key: string]: any } = {};
    // this.fields.forEach(field => {
    //   formControls[field.name] = ['', Validators.required];
    // });
    // this.loginForm = this.fb.group(formControls);
    
  }

  initSubastaEntity(){
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
      idDireccion: 0
    };
    this.imagesPreview = [];
  }

  @HostListener('document:click', ['$event.target'])
  onClickFuera(target: HTMLElement) {
    const dentroDelMenu =
      target.closest('.sidebar') || target.closest('.perfil-toggle-wrapper');
    if (!dentroDelMenu) {
      this.menuVisible = false;
    }
  }

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

  changeTarjetaSeleccionada(){
    this.tarjeta = this.selectedCard;
  }
  /**
   * Navega a la ruta de detalle con id y origen como queryParam.
   */
  abrirDetalle(event: { subasta: Subasta; lista: Subasta[]; origen: string }) {
    const { subasta, origen } = event;
    this.router.navigate(
      ['/subasta', subasta.id],
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
    //this.initSubastaEntity();
    this.selectedTab = 0;
  }

  nextStep(){
    if((this.selectedTab < 2 && this.tipoSubasta === 'general') || (this.selectedTab < 3 && this.tipoSubasta === 'premium')){
      this.selectedTab++;
    } else {
      if(this.subasta.mimagenesSubasta.length === 0){
        this.ss.showNotification('warning','Debe agregar al menos una imagen');
        return;
      }
      if(this.subasta.mimagenesSubasta.length > 5 && this.tipoSubasta === 'general'){
        this.ss.showNotification('warning','Solo puedes subir 5 imagenes');
        return;
      }
      this.subasta.mimagenesSubasta = this.getClearBase64(this.subasta.mimagenesSubasta);
      //console.log(this.subasta.mimagenesSubasta);
      if(this.tipoSubasta === 'premium'){
        if(this.checkDataSubasta() && this.checkDataPago()){
          this.subasta.premium = true;
          this.loading = true;
          this.tokenizarTarjeta();
        }
      } else {
        if(this.checkDataSubasta()){
          this.subasta.premium = false;
          this.loading = true;
          this.saveNewSubasta();  
        }
      }
    }
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
      case 'notifications': this.getNotificaciones();
        break;
      case 'winner': this.getSubastasGanadas();
        break;
      case 'followers': this.getMisSeguidores();
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
    let valid = true;
    let userData = this.authService.getUserData();
    this.subasta.idVendedor = userData.id;
    if(this.subasta.premium){
      if(!this.subasta.horas || this.subasta.horas < 30 || this.subasta.horas > 100){
        this.ss.showNotification('error', 'Cantidad de Horas no valida');
        // return;
        valid = false;
      }
    } else {
      this.subasta.horas = 100;
    }
    console.log(this.subasta)
    if(!this.ss.isValidModel(this.subasta, ['id','descripcion', 'premium', 'url'])){
      this.ss.showNotification('error', 'Informacion incompleta');
      valid = false;
      // return;
    }
    return valid;    
  }

  checkDataPago(){
    let valid = true;
    if(!this.ss.isValidModel(this.tarjeta, [])){
      this.ss.showNotification('error', 'Informacion de pago incompleta');
      valid = false;
    }
    return valid;    
  }

  saveNewSubasta(){
    console.log(this.subasta);
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

  openModalCreateAuction(){
    if(this.isLoggedIn()){
      this.getDireccionesEnvio(this.usuario()!.id, 'envio');
      this.getTarjetasUsuario(this.usuario()!.id);
    }
    this.openModal = true;
  }

  openModalPoliticasFn() {
    this.openModalPoliticas = true;
  }


  abrirDetalleSubasta(subasta: Subasta): void {
    this.getDatosSubasta(subasta.id)
    // this.loading = true;
  }

  async getTarjetasUsuario(idUsuario: number){
    this.tarjetas = await this.ss.loadLocalData('Cq@3K$K$RD') ?? []; 
    if(this.tarjetas.length > 0){
      this.tarjetas = this.tarjetas.filter(x => x.id_user === idUsuario);
    }
    console.log('L487: obtener tarjetas ')
    console.log(this.tarjetas)
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
          this.router.navigate(['/subasta', subasta.id, 'SubastasPremium']);
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
              // this.temporizadorSub = interval(1000).subscribe(() => {
              //   this.auctions.forEach(subasta => {
              //     subasta.tiempoVence = this.restarUnSegundo(subasta.tiempoVence);
    
              //     if (subasta.tiempoVence === '00:00:00' && !subasta.vencida) {
              //       subasta.vencida = true;
              //     }
              //   });
              // });
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

  inListSeguidas(idSubasta: number){
    let isFollowed = this.auctionsId.includes(idSubasta);
    return isFollowed;
  }

  onFileChange(event: any) {
    const files = event.target.files;
    let maxFileCount = this.tipoSubasta === 'general' ? 5 : 100;
    if (files && files.length + this.subasta.mimagenesSubasta.length <= maxFileCount) {
      for (let i = 0; i < files.length && this.subasta.mimagenesSubasta.length < maxFileCount; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.subasta.mimagenesSubasta.push({url: e.target.result});
          this.imagesPreview!.push({url: e.target.result});
          // this.imagenes.push(e.target.result);
        };
        reader.readAsDataURL(files[i]);
      }
    }
  }

  eliminarImagen(index: number) {
    this.subasta.mimagenesSubasta.splice(index, 1);
    this.imagesPreview!.splice(index, 1);
    // this.imagenes
  }

  tokenizarTarjeta() {
    const dataToken = {
      holder_name: this.tarjeta.holder_name + ' ' + this.tarjeta.holder_lastname,
      card_number: this.tarjeta.card_number,
      expiration_month: this.tarjeta.expiration_month,
      expiration_year: this.tarjeta.expiration_year,
      cvv2: this.tarjeta.cvv2
    };
    console.log(dataToken)
    OpenPay.token.create(dataToken, 
      (response: any) => {
        const token_id = response.data.id;
        console.log(response)
        // Envía el token_id a tu backend para procesar el pago
        console.log('Token:', token_id);
        this.GenerarCargo(token_id);
      },
      (error: any) => {
        this.loading = false;
        // Maneja el error
        console.error('Error al tokenizar:', error);
      }
    );
  }

  GenerarCargo(tokenId: string){
    let userData = this.authService.getUserData();
    const dataCharge  = {
      'token': tokenId,
      'amount': this.precioSubastaPremium,
      'description': 'Pago subasta premium vendedor ' + userData.id,
      'name':this.tarjeta.holder_name,       
      'lastName':this.tarjeta.holder_lastname,
      'email':this.tarjeta.mail,
      'phone':this.tarjeta.phone,       
    };
    console.log(dataCharge)
    this.subastaService.GenerarCargoSubastaPremium(dataCharge).subscribe({
      next: (response: any) => {
        let res = JSON.parse(response.message);
        console.log(res);
        if(res.id && res.status && res.status === 'completed'){
          this.saveNewSubasta();  
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Payment failed:', error);
      }
    });

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
        // console.log('Login exitoso:', usuario);
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

}
