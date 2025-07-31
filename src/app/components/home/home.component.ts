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
  imagenesPreview?: any[];
  premium: boolean;
  comisionBanco?: number;
  comisionXuba?: number;
  flete?:number;
  comisionFlete?:number;
  ganacia?: number | null;
  url?: string;
  nuevo?: boolean;
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
  auctionsId: number[] = [];
  tarjeta = {
    holder_name: '',
    card_number: '',
    expiration_month: '',
    expiration_year: '',
    cvv2: '',
    mail: '',
    phone: '',
    holder_lastname: ''
  };
  showingInAside = 'menu';
  clasesAside = {one:'', two:''}
  notificaciones: any[] = [];

  loginForm: any = {usuario:null, pass: null};
  precioSubastaPremium: number = 17.5;
  // loginForm!: FormGroup;
  // errorLogin = '';
  loading: boolean = false;
  // fields = [
  //   { name: 'telefono', type: 'text', placeholder: 'Teléfono', label: 'Telefóno' },
  //   { name: 'contra', type: 'password', placeholder: 'Contraseña', label: 'Contraseña' }
  // ];
  
  constructor(private authService: AuthService,private ss: SharedService, private busquedaService: BusquedaService,private router: Router,private subastaService: SubastasService,private auctionService: AuctionService) {
    this.usuario = this.authService.currentUser;
    this.isLoggedIn = computed(() => !!this.usuario());
    this.busquedaService.terminoBusqueda$.subscribe(
      termino => this.terminoBusqueda = termino
    );
    OpenPay.setId('mz5jjyzabcb3zzpevo0l');
    OpenPay.setApiKey('pk_f2da5530e74d4c7fbf292d886aba5e50');
    OpenPay.setSandboxMode(true);

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
      imagenesPreview: [],
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
      nuevo: false
    };
    this.getSubastasSeguidas();
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
      imagenesPreview: [],
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
      nuevo: false
    };
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
      this.subasta.mimagenesSubasta = this.getClearBase64(this.subasta.mimagenesSubasta);
      if(this.tipoSubasta === 'premium'){
        if(this.checkDataSubasta() && this.checkDataPago()){
          this.loading = true;
          this.tokenizarTarjeta();
        }
      } else {
        if(this.checkDataSubasta()){
          this.loading = true;
          this.saveNewSubasta();  
        }
      }
    }
    // this.loading = true;
    // setTimeout(() => {
    //   this.loading = false;
    // }, 2000);
    //this.subasta.mimagenesSubasta = this.getClearBase64(this.subasta.mimagenesSubasta);

  }

  getNotificaciones(){
    let userData = this.authService.getUserData();
    this.subastaService.getNotifications(userData.id).subscribe({
      next: (data: any) => this.notificaciones = data,
      error: (err) => console.error('Error al cargar notificaciones', err)
    });
  }

  changeAside(option: any){
    if(option === 'notifications'){
      this.getNotificaciones();
    }
    this.clasesAside.one = 'animate__fadeOutLeft'
    setTimeout(() => {
      this.showingInAside = option
      this.clasesAside.two = 'animate__fadeInRight'
    }, 260);

  }

  backToMenuAside(){
    this.clasesAside.two = 'animate__fadeOutRight'
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
    if(!this.ss.isValidModel(this.subasta, ['id','descripcion'])){
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
    // let newArray = JSON.parse(JSON.stringify(array));
    for(let i of array){
      console.log(i)
      let url = i.url;
      //const partes = i.split(',');
      let index = url.indexOf('base64');
      let firstPart = url.substring(0,  index + 7);
      i.url = url.replace(firstPart,'');
      // console.log(index);
      // console.log('total')
      //console.log(partes.length);
      //i = partes.length > 1 ? partes[1] : i;
    }
    return array;
  }


  // Evitar que los clics dentro del contenido del modal cierren el modal
  onContentClick(event: MouseEvent) {
    if(this.loading) return;
    event.stopPropagation();
  }

  openModalCreateAuction(){
    this.openModal = true;
  }

  openModalPoliticasFn() {
    this.openModalPoliticas = true;
  }

  getSubastasSeguidas(){
      const usuario = this.authService.currentUser();
    
        if (usuario) {
          const idUsuario = usuario.id;
        this.auctionService.getAuctions(idUsuario).subscribe({
           next: (data) => {
              this.auctions = data.map(subasta => ({
                ...subasta,
                tiempoVence: subasta.tiempoVence ?? '00:00:00',
                vencida: false
              }));
              this.auctionsId = data.map(subasta => subasta.id);
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
    if (files && files.length + this.subasta.mimagenesSubasta.length <= 5) {
      for (let i = 0; i < files.length && this.subasta.mimagenesSubasta.length < 5; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.subasta.mimagenesSubasta.push({url: e.target.result});
          this.subasta.imagenesPreview!.push({url: e.target.result});
          // this.imagenes.push(e.target.result);
        };
        reader.readAsDataURL(files[i]);
      }
    }
  }

  eliminarImagen(index: number) {
    this.subasta.mimagenesSubasta.splice(index, 1);
    this.subasta.imagenesPreview!.splice(index, 1);
    // this.imagenes
  }

  tokenizarTarjeta() {
    const dataToken = {
      holder_name: this.tarjeta.holder_name,
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
      'lastName':'dfdfg',       
      'email':'dfgdf@mail.com',
      'phone':'6562344343',       
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
    this.authService.logout();
  }

  onLogin() {
    if (!this.loginForm.usuario ||  this.loginForm.usuario.trim() === '' || !this.loginForm.pass || this.loginForm.pass.trim() === '') {
      Swal.fire({
        // title: 'Error!',
        text: 'Informacion incorrecta',
        icon: 'error',
        showConfirmButton: false,
        // confirmButtonText: 'Cool',
        toast: true,
        position: 'top-end',
        timer: 2000,
      });
      return;
    }

    // const { telefono, contra } = this.loginForm.value;

    const correo='';
    this.authService.login(this.loginForm.usuario.trim(), this.loginForm.pass.trim(), correo).subscribe({
      next: (usuario: Usuario) => {
        console.log('Login exitoso:', usuario);
        this.authService.setUser(usuario); 
        Swal.fire({
          // title: 'Error!',
          text: 'Usuario correcto',
          icon: 'success',
          showConfirmButton: false,
          // confirmButtonText: 'Cool',
          toast: true,
          position: 'top-end',
          timer: 2000,
        });
        // console.log('despues de setUser pero desde login:');
      },
      error: (err) => {
        console.error('Error en login:', err);
        Swal.fire({
          // title: 'Error!',
          text: 'telefono o contraseña incorrectos',
          icon: 'error',
          showConfirmButton: false,
          // confirmButtonText: 'Cool',
          toast: true,
          position: 'top-end',
          timer: 2000,
        });
        // this.errorLogin = 'telefono o contraseña incorrectos.';
      }
    });
  }

}
