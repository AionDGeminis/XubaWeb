import { Component, computed, HostListener, OnInit, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoaderComponent } from '../loader/loader.component';
import { CommonModule } from '@angular/common';
import { SubastasService } from '../../services/subastas.service';
import { Subasta, Usuario } from '../../models/subasta.model';
import { AuthService } from '../../services/auth.service';
import { AddressesService } from '../../services/addresses.service';
import { SharedService } from '../../services/shared.service';
import { Router } from '@angular/router';
import { SafeUrlPipe } from '../../pipes/safeurl';
import { HttpClient, HttpResponse } from '@angular/common/http';
import html2pdf from 'html2pdf.js';
import { environment } from '../../environment/environment';
import { OpenPayService } from '../../services/openpay.service';
import { ProfileTabIndexEnum } from '../../../enums/profile-tab-index.enum';
import { PagoSubastaTicketComponent } from '../tickets/pago-subasta-ticket/pago-subasta-ticket.component';

declare var OpenPay: any;


@Component({
  selector: 'app-profile',
  imports: [ FormsModule, LoaderComponent, CommonModule, SafeUrlPipe, PagoSubastaTicketComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
    //'Cq@3K$K$RD' = 'secure local card'
    isModalOpen: any = {
      direccion: false, 
      clabe: false,
      tarjeta:false,
      wallet:false, 
      etiqueta: false, 
      recarga: false,
      validacion: false,
      viewer: false,
      subastaDetalle: false,
      disputa: false,
      comprobante: false
    };

    // openModal: boolean = false;
    // openModalCuenta: boolean = false;
    // openModalViewer: boolean = false;
    // openModalTarjetas: boolean = false;

    loading: boolean = false;
    allLoading: boolean = false;


    direccion: any = {
      calle: '',
      numeroInt: '', 
      numeroExt: '',
      colonia: '',
      codigoPostal: '', 
      descripcionDomicilio: 'defaultDescipcion', 
      callesCruzan: '', 
      telefono: 'xxxxxxxxxx', 
      correo: 'correo@mail.com', 
      tipo:'',
      tipoDomicilio: 'ND', 
      estado: '',
      municipio: '',
      quienRecibe: 'ND', 
      idUsuario:0,
      predeterminada: false
    }
    public usuario!: Signal<Usuario|null>;
    public isLoggedIn!: Signal<boolean>;
    direcciones: any[] = [];
    tabIndex: number = 0;
    tabSubastasIndex: number = 0;
    tabCuentasIndex: number = 0;
    subastasActivas: Subasta[] = [];
    subastasInactivas: Subasta[] = [];
    infoUsuario: any = {};
    editInfoUsuario: any = {
      id: 0,
      telefono:'',
      correo:'',
      contra:''
    }
    tarjeta = {
      holder_name: '',
      holder_lastname: '',
      card_number: '',
      expiration_month: '',
      expiration_year: '',
      mail:'',
      phone: '',
      id_user: 0,
      cvv2:''
    };

    dataEditImg = {
      idUsuario: 0, 
      fotoAnterior:'',
      fotoPerfil:''
    }
    private intervalId: any;
    currentMDX: number = 0;
    cuentasClabe: any[] = [];
    cuentaClabeUsuario: any = {idUsuario:0,cuentaClabe:''};
    walletPagos: any[] = [];
    selectedWallet: any = {};
    fecha = new Date();
    updatingImage: boolean = false;
    imageProfileSrc: string = '';
    tarjetas: any[] | null = [];
    selectedColonia: any = null;
    selectedColoniaFiscal: any = null;
    hasColonias: boolean = false;
    manualColonia: boolean = true;
    listaColonias: any[] = [];
    codigoPostal = 'xxxxx';
    isEdit: boolean = false;
    isEditCard: boolean = false;
    selectedCard: any;
    ordenEstatusValidaiones: any = { 
      SST:1, 
      ACT:2,    
      FIN:3,
      PGA:4,
      RGA:5,
      AGA:6, 
      PSI:7,    
      ASI:8,
      RSI:9,
      NEF:10,
      PDO:11, 
      PTP:12,    
      PEV:13,
      ENV:14,
      REC: 15
     };
     selectedSubasta: any;
     showComprobante: boolean = false;
     classComprobanteModal = '';
     textoLoading: string = ''
     modeloComprobante: any = {
      estatus:'',
      fecha:'',
      idTransaction:'',
      metodoPago: '',
      cliente: '' ,
      correo:'',
      ordenXuba:'',
      total:0,
      subtotal:0,
      envio:0,
      nombreArticulo:'',
      idArticulo:0,
      descripcion: '',
      cantidad:1,
      noAutorizacion: '',
    }
    metodoPagoDescripcion: string = '';
    cantidadRecarga: number | null = null;
    currentUserPassword: string | null = null;
    listaSubastas: any[] = [];
    imagesListViewer: any[] = [];
    currentIndexImageViewer: number = 0;
    classNavigateImg = '';
    subastaSeleccionada: any = {};
    subastaEdicion: any = {};
    datosFiscales: any = {
      tipoPersona: 'fisica',
      razonSocial:null,
      nombreComercial:null,
      sitioWeb:null,
      rfc:null,
      curp:null,
      fechaNacimiento:null,
      calle:null,
      noExterior:null,
      noInterior:null,
      colonia:null,
      ciudad:null,
      codigoPostal:null,
      correo:null,
      telefono:null,
      regimen_ae:false,
      resico:false,
      arrendamiento:false,
      zonaFronteriza:'NO',
      ciudadOperacion:null,
      constanciaSituacionFiscal:false,
      identificacionOficial:false,
      comprobanteDomicilioFiscal:false,
      estadoCuentaC:false,
      constanciaFronteriza:false,
      pais: 'MX',
      regimenFiscal: null,
      usoCFDI:null,
      impuestoFronterizo: 'NO',
      actividadPlataformaDigital:'NO',
      tipoValidacion: 'Sellos',

    }
    terminosAceptado = false
    cerFile: File | null = null;
    keyFile: File | null = null;
    
    efirma: any = {
      cert:this.cerFile,
      key: this.keyFile,
      password:null
    }
    fechaNacimiento = {dia:null,mes:null,anio:null}

    dias = Array.from({ length: 31 }, (_, i) => i + 1);
    meses = [{id:1,nom:'Enero'},{id:2,nom:'Febrero'}, {id:3,nom:'Marzo'},
      {id:4,nom:'Abril'},{id:5,nom:'Mayo'}, {id:6,nom:'Junio'},
      {id:7,nom:'Julio'},{id:8,nom:'Agosto'}, {id:9,nom:'Septiembre'},
      {id:10,nom:'Octubre'},{id:11,nom:'Noviembre'}, {id:12,nom:'Diciembre'},
    ]
    anios = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
    idOrganizacion: any = null;
    hasDataZipCode: boolean = false;
    manualDireccionFiscal: boolean = false;
    esFronteraNorte: boolean = false;
    ciudadesFronterizas: any[] = [
      {estado:'Baja California', cd:[
        'Tijuana','Tecate','Mexicali'
      ]},
      {estado:'Sonora', cd:[
        'San Luis Río Colorado','Nogales','Agua Prieta','Naco'
      ]},
      {estado:'Chihuahua', cd:[
         'Puerto Palomas','Ciudad Juárez','Ojinaga','Juárez'
      ]},
      {estado:'Coahuila', cd:[
         'Ciudad Acuña','Piedras Negras'
      ]},
      {estado:'Nuevo León', cd:[
        'Ciudad Anáhuac', 'Anáhuac',
      ]},
      {estado:'Tamaulipas', cd:[
        'Nuevo Laredo','Ciudad Miguel Alemán','Reynosa','Matamoros'
      ]},
    ]

    requisitos: any = {
      comprador: [
        {label: 'Datos fiscales',cumplido:false},
        {label: 'Direccion de entrega',cumplido:true},
      ],
      vendedor: [
        {label: 'Datos fiscales',cumplido:true},
        {label: 'Direccion de entrega',cumplido:false},
        {label: 'Cuenta bancaria deposito',cumplido:true}
      ]
    }

    checkListSubastar: any = [];

    listaRegimenes: any[] = [];
    listaUsoCfdi: any[] = [];
    isLockedPage: boolean = false;
    listaCategoriasDisputa: any[] = [];
    reclamoModel: any = {
      idSubasta:0,
      idVendedor:0,
      idGanador:0,
      idCategoria:0,
      idEstatus:1,
      asunto:'',
      descripcion:'',
      fechaApertura: null,
      imagenesReclamos:[]
    }
    listaSimpleSubastas: any[] = [];
    imagesList: string[] = [];
    imagesPreview: string[] = [];
    listaReclamosAbiertos: any[] = [];
    subastaSeleccioandaReclamo: any = {};
    tipoSubastaIndex: number =  0;
    currentTipoSubasta: string = ''
    open: boolean = false;
    ListTipoSubastaPG: any [] = [
      {label:'Todas', tipo:'todas',bg:'#34495e'},
      {label:'Participadas', tipo:'participadas',bg:'#3498db'},
      {label:'Ganadas', tipo:'ganadas',bg:'#2ecc71'},
    ]
    ListTipoSubastaCreadas: any [] = [
      {label:'Activas', tipo:'Activa',bg:'#1abc9c'},
      {label:'Terminadas', tipo:'Finalizada',bg:'#74b9ff'},
      {label:'Por aprobar', tipo:'Por Aprobar',bg:'#30336b'},
      {label:'Por revisar', tipo:'Rechazada',bg:'#f39c12'},
      {label:'Canceladas por XUBA', tipo:'Cancelada',bg:'#141414'},
      {label:'Cancelada por vendedor', tipo:'Cancelada por vendedor',bg:'#c0392b'}
    ]
    selectedTipoSubasta: any = {}
    totalSubastasPorRevisar: number = 0;
    showModalComprobante: boolean = false;
    constructor(private router: Router, private subastasService: SubastasService, 
      private authService: AuthService, private addressService: AddressesService, 
      private ss: SharedService, private http: HttpClient, private openPayService: OpenPayService) { 
      // this.usuario = this.authService.currentUser;
      // this.isLoggedIn = computed(() => !!this.usuario());
      // console.log(this.usuario());
      // if(this.isLoggedIn()){
        // this.getDirecciones(this.usuario()!.id);
        // this.getInformacionUsuario(this.usuario()!.id);
      // }
      // localStorage.removeItem('BCK-TO-PG');
      // this.checkSavedIndexPage();
      // this.getInformacionListafiscal();
      // this.setLockedPage();
      this.loadInitData();
  }

  ngOnInit(): void {
    // OpenPay.setId('mz5jjyzabcb3zzpevo0l');
    // OpenPay.setApiKey('pk_f2da5530e74d4c7fbf292d886aba5e50');
    // OpenPay.setSandboxMode(true);
    OpenPay.setId(environment.openPayId);
    OpenPay.setApiKey(environment.openPayApiKey);
    OpenPay.setSandboxMode(environment.openPaySandBox);
  }

  loadInitData(){
    this.getWalletPagos();
    this.usuario = this.authService.currentUser;
    this.isLoggedIn = computed(() => !!this.usuario());
    if(this.isLoggedIn()){
      this.getInformacionUsuario(this.usuario()!.id)
    }
    
  }

  // =========================================================
  // ==================== 1.- FUNCIONES PAGINA PRINCIPAL Y TABS
  // =========================================================
  onInput(event: any, atributo: any, fn?: (value: any) => void) {
        const soloNumeros = event.target.value.replace(/[^0-9]/g, '');
        atributo = soloNumeros;
        event.target.value = soloNumeros; 
        fn?.(soloNumeros);
        // Actualiza el input si el usuario pegó algo no numérico
      }

  getInformacionUsuario(idUsuario: number){
    this.loading = true;
    this.authService.consultarDatosUsuario(idUsuario).subscribe({
      next: (response: any) => {

        this.loading = false;
        this.infoUsuario = response;
        this.imageProfileSrc = response.imgPerfil;
        this.idOrganizacion = response.idOrganizacion;
        console.log(this.infoUsuario);
        this.checkListSubastar = response.checkList;
        this.checkCurrentMainIndexPage();
        // if(this.tabIndex === ProfileTabIndexEnum.CuentasYWallet){
        //   this.getWalletPagos();
        //   this.GetCuentasClabe(this.infoUsuario.id)
        //   this.getSecureCards();
        // }
        // //this.infoUsuario.customerID = 'a8rekuqxhndafylwks8m';
        // this.getListaReclamosAbiertos();
        // 
        //   console.log(response);
        //   
        //   if(response.idOrganizacion && response.idOrganizacion !== ''){
        //     
        //     this.setInformacionFiscal(response)
        //   }
      },
      error: (err: any) => {
        this.loading = false;

          console.error('Error fetching user information:', err);
      }
    });
  }

  // loadProfileTabsState(){
  //   const savedMainTabIndex = localStorage.getItem('TpTbIdx')?? 0;
  //   const savedSubastaTabIndex = localStorage.getItem('TpSbTbIdx')??0;
  //   const savedTipoSubasta = localStorage.getItem('cntTypeAuction')??'todas';
  //   this.checkCurrentTabState();
    
  // }

  // setCurrentTabIndex(tabIndex: string){
    
  // }

  // checkCurrentTabState(){
  //   let savedMainTabIndex: any = localStorage.getItem('TpTbIdx');
  //   //savedMainTabIndex = 
  //   this.tabIndex = savedMainTabIndex? +savedMainTabIndex:0;
  // }

  checkCurrentMainIndexPage(){
    this.checkSavedPageIndex();
    switch(this.tabIndex){
      case 0: this.getDataPageGeneral();
        break;
      case 1:
        break;
      case 2:
        break;
      case 3:
        break;
      case 4:
        break;
    }
  }



  checkSavedPageIndex(){
    let index = localStorage.getItem('TpTbIdx');
    this.tabIndex = index ? +index:0;
    //localStorage.setItem('TpTbIdx',this.tabIndex.toString())
    //console.log('index de paginas ' + index)
    if(this.tabIndex === 1){
      this.checkSavedSubastaTabIndex();
    }
    this.setCurrentTabPage(this.tabIndex);
  }

  checkSavedSubastaTabIndex(){
    let index = localStorage.getItem('TpSbTbIdx');
    //console.log('index de subastas pagina ' + index)
    this.tabSubastasIndex = index? +index:0;
    //localStorage.setItem('TpSbTbIdx',this.tabSubastasIndex.toString());
    this.setCurrentTabSubastas(this.tabSubastasIndex);
  }

  setCurrentTabPage(index: number){
    this.tabIndex = index;
    switch(index){
      case 0: this.getDataPageGeneral();
        break;
      case 1: 
        this.tabSubastasIndex = this.getCurrenTabSubastaIndex();
        this.selectedTipoSubasta = this.ListTipoSubastaPG[0];
        this.currentTipoSubasta = this.tabSubastasIndex === 0? 'todas':'Activa';
        // console.log(this.currentTipoSubasta)
        this.setCurrentTabSubastas(this.tabSubastasIndex);
        break;
      case 2:
        break;
      case 3: 
        this.checkCuentasTarjetaIndex();
        if(this.tabCuentasIndex === 0){
          this.GetCuentasClabe(this.infoUsuario.id)
        } else {
          this.getSecureCards();
        }
        
        
        break;
      case 4: this.setInformacionFiscal(this.infoUsuario);

        break;
    }
    localStorage.setItem('TpTbIdx',this.tabIndex.toString())
  }

  getCurrenTabSubastaIndex(){
    let index = localStorage.getItem('TpSbTbIdx') ??  0;
    return +index;
  }

  // =========================================================
  // ==================== 1.- // =============================
  // =========================================================

  // =========================================================
  // ==================== 2.- FUNCIONES TAB - GENERAL
  // =========================================================


  getDataPageGeneral(){
    this.getListaReclamosAbiertos();
    this.getDirecciones( this.infoUsuario.id);
  }

  getListaReclamosAbiertos(){
    let id = this.infoUsuario.id;
    console.log(id);
    this.subastasService.getListaReclamosByUser(id).subscribe({
      next:(res) => {
        console.log(res)
        this.listaReclamosAbiertos = res;
        // if(res.)
      }, 
      error: (err) => {
        console.log(err)
      }
    })
  }

  getDirecciones(idUsuario: number): void {
    // this.loading = true;
    this.subastasService.GetDireccionesUsuario(idUsuario, '').subscribe(
        (response: any) => {
          console.log('direcciones obtenidas');
            console.log(response);
            this.direcciones = response;
            // this.getDireccionesEnvio(idUsuario, 'envio');
            // this.loading = false;
        },
        (error: any) => {
            console.error('Error fetching addresses:', error);
            // this.loading = false;
        }
    );
  }

  async obtenerLinkActualizacionPassword(){
    let r  = await  this.ss.showConfirmMessage('¿Desea recibir un enlace para actualizar su password al correo registrado?');
    if(r){
      console.log(this.infoUsuario)
      this.loading = true;
      let model = {correo: this.infoUsuario.correo}
      this.authService.generarTokenRecuperacionContra(model).subscribe({
        next:(value: any) => {
          this.loading = false;
          console.log(value);
          if(value.success){
            // this.closeModal();
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
  }

  async saveInfoChange(){
    this.openModal('validacion');
  }

  saveDireccion(){
      console.log('ENTRO A SAVE DIRECCION');
    console.log(this.direccion)
   this.direccion.idUsuario = this.usuario()!.id;
   if (!this.ss.isValidModel(this.direccion, ['numeroInt', 'tipo', 'callesCruzan', 'descripcionDomicilio',  'tipoDomicilio', 'quienRecibe', 'correo', 'telefono'])) {
  this.ss.showNotification('warning', 'Por favor, complete todos los campos requeridos');
  return;
}
   this.loading =true ;
   this.subastasService.guardarDireccion(this.direccion).subscribe(
    (response:any) => {
      console.log(response);
      this.loading =false;
      this.ss.showNotification('success', 'Direccion  agregada correctamente');
      this.getDirecciones(this.usuario()!.id);
      this.initDireccion();
      this.closeModal('direccion');
    },
    (error: any) => {
      this.ss.showNotification('error', 'Se produjo un error al guardar la direccion');
      console.error(error);
      this.loading = false;
    }
   )
  }

  saveEditDireccion(){
        this.direccion.idUsuario = this.usuario()!.id;
        if(!this.ss.isValidModel(this.direccion, ['numeroInt'])){
          this.ss.showNotification('warning', 'Por favor, complete todos los campos requeridos');
          return;
        }
        this.loading = true;
        this.subastasService.editarDireccion(this.direccion).subscribe(
          (response: any) => {
              console.log(response);
              this.loading = false;
              this.ss.showNotification('success', 'Direccion actualizada correctamente');
              this.getDirecciones(this.usuario()!.id);
              this.initDireccion();
              this.closeModal('direccion');
          },
          (error: any) => {
            this.ss.showNotification('error', 'Se produjo un error al editar la dirección');
            console.error('Error fetching addresses:', error);
            this.loading = false;
          }
        );
      }
  


  // =========================================================
  // ==================== 2.- // ===================================
  // =========================================================

  // =========================================================
  // ==================== 3.- FUNCIONES TAB - XUBASTAS
  // =========================================================

  setCurrentTabSubastas(index: number){
    console.log(index)
    this.listaSubastas = [];
    this.tabSubastasIndex = index;  
    localStorage.setItem('TpSbTbIdx',this.tabSubastasIndex.toString())
    switch(this.tabSubastasIndex){
      case 0: 
        this.selectedTipoSubasta = this.ListTipoSubastaPG[0];
        this.currentTipoSubasta = 'todas';
        this.getListaSubastasGP();
        break;
      case 1:
        this.getCantidadSubastasPorRevisar();
        //this.selectedTipoSubasta = this.ListTipoSubastaCreadas[0];
        //this.currentTipoSubasta = 'Activa';
        this.getCurrentTipoSubasta();
        this.getListaSubastasCreadas();
        break;
    }
  }

  getCurrentTipoSubasta(){
    let fromNotification = localStorage.getItem('FNToReject');
    console.log(fromNotification)
    if(fromNotification){
      
      this.selectedTipoSubasta = this.ListTipoSubastaCreadas[3];
      this.currentTipoSubasta = 'Rechazada';
     setTimeout(() => {
      localStorage.removeItem('FNToReject');
     }, 50);
      // localStorage.removeItem('FNToReject');
    } else {
      this.selectedTipoSubasta = this.ListTipoSubastaCreadas[0];
        this.currentTipoSubasta = 'Activa';
    }
    console.log(this.selectedTipoSubasta)
    console.log(this.currentTipoSubasta)
  }

  setTipoSubastaPG(tipo: any){
    console.log(tipo)
    this.selectedTipoSubasta = tipo;
    this.currentTipoSubasta = this.selectedTipoSubasta.tipo;
    this.open = false;
    this.onChangeTipoSubasta();
    console.log(this.currentTipoSubasta)
  }

  // setSubasta

  onChangeTipoSubasta(){
    switch(this.tabSubastasIndex){
      case 0: 
      this.getListaSubastasGP();
      break;
    case 1:
      this.getListaSubastasCreadas();
      break;
    }
  }

  getListaSubastasGP(){
    this.loading = true;
    if(this.intervalId){
      clearInterval(this.intervalId);
    }
    console.log(this.intervalId);
    console.log('buscar gp')
    console.log(this.currentTipoSubasta)
        this.subastasService.GetXubastasUsuarioPerfil(this.currentTipoSubasta, this.infoUsuario.id).subscribe({
          next: (data: any) => {
            this.loading = false;
            console.log(data);
            this.listaSubastas = data.data;
            this.listaSubastas = data.data.map((item: any) => ({
              ...item,
              short_desc:  item.descripcion.substring(0,35),
              remaining: item.hora * 3600 + item.minuto * 60 + item.segundo
            }));
            this.setTimerV2();
            //  this.auctionsWin = data;
            
            //  this.loadingNotificaciones = false;
           },
           error: (error) => {
            this.loading = false;
            //  this.loadingNotificaciones = false;
             console.error('Error cargando subastas:', error);
           }
         });
  }

  getListaSubastasCreadas(){
    this.getSubastasByTipo(this.currentTipoSubasta);
  }

  getCantidadSubastasPorRevisar(){
    this.subastasService.getSubastasUsuarioByEstatus(this.usuario()!.id, 'Rechazada').subscribe({
      next: (subastas: any) => {
        console.log(subastas)
        this.totalSubastasPorRevisar = subastas.length;
      },
      error: (err) => {
        this.totalSubastasPorRevisar = 0;
        // this.loading = false;
        console.error('Error fetching subastas:', err);
      }
    });
  }

  getSubastasByTipo(tipo: string){
    this.loading = true;
    console.log(tipo)
      this.subastasService.getSubastasUsuarioByEstatus(this.usuario()!.id, tipo).subscribe({
        next: (subastas: any) => {
          console.log(subastas)
          this.subastasActivas = subastas;
          this.listaSubastas = subastas;
          for(let s of this.listaSubastas){
            s.short_desc = s.descripcion.substring(0,35);
          }
          //   console.log(subastas);
            this.loading = false;
            if(tipo === 'Activa'){
              // this.setTimer(this.listaSubastas);
            }
          
        },
        error: (err) => {
          this.loading = false;
            console.error('Error fetching subastas:', err);
        }
      });
    }


    getCurrenSubastaName(){
      let tipo = '';
      switch(this.tabSubastasIndex){
        case 0: tipo = 'Activas'
          break;
        case 1: tipo = 'Terminadas'
          break;
        case 2: tipo = 'Por aprobar'
          break;
        case 3: tipo = 'Por Revisar'
          break;
        case 4: tipo = 'Denegadas'
          break;
      }
      return tipo;
    }

    toggleDropdown(){
      this.open = !this.open;
    }

    moveToCreateSubasta(){
      this.ss.setLocalStorageEncodedKey('first_xubasta', 'YES');
      this.router.navigate(['/home']);
    }

    @HostListener('document:click', ['$event'])
    clickFuera(event: Event) {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        this.open = false;
      }
    }


  // =========================================================
  // ==================== 3.- // ===================================
  // =========================================================

  // =========================================================
  // ==================== 4.- FUNCIONES TAB - CUENTAS Y WALLET 
  // =========================================================

    setCurrentCuentaIndex(tab: number){ 
      this.tabCuentasIndex = tab;
      switch(tab){
        case 0: this.GetCuentasClabe(this.infoUsuario.id);
          break;
        case 1: this.getSecureCards();
          break;
      }
      localStorage.setItem('TbIdxCyT', tab.toString());
    }

    checkCuentasTarjetaIndex(){
       let index = localStorage.getItem('TbIdxCyT');
       this.tabCuentasIndex = index? +index:0;
    }

    editTarjeta(t: any){
      console.log(t)
      this.tarjeta = t;
      this.isEditCard = true;
      this.openModal('tarjeta')
    }

    async deleteTarjeta(tarjeta: any){
      let r = await this.ss.showConfirmMessage('¿Desea eliminar esta tarjeta?');
      if(r){
        this.loading = true;
        this.openPayService.deleteTarjetaUsuario(this.infoUsuario.id, tarjeta.id).subscribe({
          next: (response: any) => {
            console.log(response);
            this.loading = false;
            this.getSecureCards();
          },
          error: (err) => {
            this.loading = false;
            //this.ss.showNotification('error', 'Hubo un problema al intentar obtener la lista de tarjetas');
            console.log(err)
          }
        })
      }
    }

    GetCuentasClabe(idUsuario: number){
      console.log(idUsuario)

      this.authService.getCuentaClabe(idUsuario).subscribe({
        next: (cuentas) => {
          //console.log(cuentas);
          this.cuentasClabe = cuentas;
          
        },
        error: (e) => {
          console.error('Error fetching cuentasClabe:', e);
        }
      });

    }

     async getSecureCards(){
      console.log('obtener tarjetas usuario')
      console.log(this.infoUsuario)
      this.loading = true;
      this.openPayService.getTarjetasUsuario(this.infoUsuario.id).subscribe({
        next: (response: any) => {
          console.log(response);
          this.tarjetas = response;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          //this.ss.showNotification('error', 'Hubo un problema al intentar obtener la lista de tarjetas');
          console.log(err)
        }
      })
      // this.tarjetas = await this.ss.loadLocalData('Cq@3K$K$RD') ?? []; 
      // if(this.tarjetas.length > 0){
      //   this.tarjetas = this.tarjetas.filter(x => x.id_user === this.usuario()?.id);
      // }
      // console.log('L117: obtener tarjetas ')
      // console.log(this.tarjetas)
    }

    saveCuentaClabe(){
          this.cuentaClabeUsuario.idUsuario = this.usuario()!.id;
          if(!this.cuentaClabeUsuario.cuentaClabe || this.cuentaClabeUsuario.cuentaClabe.trim() === ''){
            this.ss.showNotification('error', 'Cuenta CLABE no puede estar vacía');
            return;
          }      
          this.loading = true;
          this.authService.addCuentaClabe(this.cuentaClabeUsuario).subscribe({
            next: (response: any) => {
                console.log(response);
                this.loading = false;
                this.ss.showNotification('success', 'Cuenta CLABE agregada correctamente');
                this.GetCuentasClabe(this.usuario()!.id);
                this.closeModal('clabe');
    
            },
            error: (error: any) => {
                console.error('Error saving CLABE account:', error);
                this.loading = false;
            }
    
          }
          );
          // this.getInfoZipCode();
    }

    async saveDataUpdated(){
      
          this.editInfoUsuario.telefono = this.infoUsuario.telefono;
          this.editInfoUsuario.correo = this.infoUsuario.correo;
          this.editInfoUsuario.id = this.infoUsuario.id;
          // let r = await this.ss.showConfirmMessage('Desear guardar los cambios en la informacion?');
          // if(r){
            this.loading = true; 
            // console.log('User confirmed saving changes');
            this.authService.editarDatosUsuario(this.editInfoUsuario).subscribe({
              next: (response) => {
                this.loading = false;
                this.ss.showNotification('success','Informacion actualizada correctamente');
                this.closeModal('validacion');
                this.currentUserPassword = null;
                console.log('User information updated successfully', response);
              },
              error: (err) => {
                this.loading = false;
                this.ss.showNotification('error','Error updating user information');
                console.error('Error updating user information', err);
              }
            });
          // }
        }

          async saveTarjeta(){
    
      this.tarjeta.id_user = this.infoUsuario.id;
      console.log(this.tarjeta)
      // if(!this.ss.isValidModel(this.tarjeta, ['cvv2'])){
      //   this.ss.showNotification('error', 'Informacion incompleta');
      //   return;
      // }

      // if(this.isEditCard){
      //   const index = this.tarjetas!.findIndex(card => card.card_number === this.tarjeta.card_number && card.id_user === this.tarjeta.id_user);
      //   if (index !== -1) {
      //     this.tarjetas![index] = this.tarjeta;
      //   }
      // } else {
      //   this.tarjetas!.push(this.tarjeta);
      // }
      
      
      // console.log(this.tarjetas)
      // this.ss.saveLocalSecureData('Cq@3K$K$RD', this.tarjetas).then(() => {
      //   this.ss.showNotification('success', 'Tarjeta guardada exitosamente');
      //   this.closeModal('tarjeta');
      //   this.getSecureCards();
      // }).catch((error) => {
      //   this.ss.showNotification('error', 'Error al guardar la tarjeta');
      //   console.error('Error saving tarjeta:', error);
      // });
      this.loading = true;
      let r = await this.ss.tokenizarTarjeta(this.tarjeta);
      if(r.ok){
        console.log(r)
        console.log(this.infoUsuario)
        let model = {
          idUsuario: this.tarjeta.id_user,
          tokenId:r.token_id,
          deviceSessionId:r.deviceSessionId
        }
        console.log(model)
        this.loading = true;
        this.openPayService.GuardarTarjeta(model).subscribe({
          next: (resp: any) => {
            console.log(resp);
            if(!this.infoUsuario.customer_id){
              this.infoUsuario.customer_id = resp.customerId;
            }
            this.loading = false;
            this.getSecureCards();
            this.closeModal('tarjeta');
            // this.infoUsuario.customerID = 'a8rekuqxhndafylwks8m';
          },
          error: (err) => {
            this.loading = false;
            console.log(err)
          }
        })
        // this.modeloComprobante.metodoPago = r.metodo_desc;
        // this.GenerarCargo(r.token_id, r.deviceSessionId);
      } else {
        this.loading = false;
        this.ss.showNotification('error',r.msg, 6000)
      }
    }

  // =========================================================
  // ==================== 4.- // ===================================
  // =========================================================

 
  // =========================================================
  // ==================== 5.- FUNCIONES TAB - DATOS FISCALES 
  // =========================================================

   getInformacionListafiscal(){
    this.addressService.getRegimenesUsoCFDI().subscribe({
      next: (response: any) => {
        console.log(response)
        this.listaRegimenes = response.regimenesFiscales;
        this.listaUsoCfdi = response.usosCfdi;
      },
      error: (err: any) => {
       
      }
    })
  }

  getDataByZipCode(){
    if(this.datosFiscales.codigoPostal && this.datosFiscales.codigoPostal.length === 5){
      this.loading = true;
      this.addressService.getDataZipCode(this.datosFiscales.codigoPostal).subscribe({
        next:(value) => {
          if(value && value.zip_codes && value.zip_codes.length > 0){
            this.hasDataZipCode = true;
            this.listaColonias = value.zip_codes;
            this.listaColonias.push({id:-1, d_asenta:'Otro' });
          } else {
            this.hasDataZipCode = false;
          }
          this.manualDireccionFiscal = false;
          this.loading = false;
          console.log(value)
        },
        error:(err) => {
          this.loading = false;
          this.hasDataZipCode = false;
          // this.ss.showNotification('error', 'No se pudo eliminar');
        },
      })
    }
  }

  setColoniaDomicilioFiscal(){
    if(this.selectedColoniaFiscal.id > -1){
      this.manualDireccionFiscal = false;
      this.datosFiscales.colonia = this.selectedColoniaFiscal.d_asenta;
      this.datosFiscales.estado = this.selectedColoniaFiscal.d_estado;
      this.datosFiscales.ciudad =  this.selectedColoniaFiscal.d_ciudad ?? null;
      this.datosFiscales.municipio =   this.selectedColoniaFiscal.d_mnpio ?? null;
    } else {
      this.datosFiscales.colonia = null;
      this.datosFiscales.estado = null;
      this.datosFiscales.ciudad = null;
      this.datosFiscales.municipio = null;
      //this.hasColonias = false;
      this.manualDireccionFiscal = true;
    }
    this.checkStateAndCity();
  }

  checkStateAndCity(){
    this.esFronteraNorte = false;
    if(this.datosFiscales.estado && this.datosFiscales.estado.length >  5){
      let _estado = this.ciudadesFronterizas.find(x => x.estado === this.datosFiscales.estado);
      if(_estado !== undefined){
        let _ciudad = _estado.cd.find((ciudad: string) => ciudad === this.datosFiscales.ciudad);
        if(_ciudad !== undefined){
          this.esFronteraNorte = true;
        }
      } 
    }
  }

  async saveInformacionFiscal(){
    let r = await this.ss.showConfirmMessage('¿Desea guardar la siguiente informacion?');
    if(r){
     let organization = {
       // name: this.datosFiscales.razonSocial,
       name: this.datosFiscales.nombreComercial,
       idUsuario: this.infoUsuario.id
     }
     this.loading = true;
     this.authService.saveOrganization(organization).subscribe({
       next:(value: any) => {
         this.loading = false;
         console.log(value)
         this.idOrganizacion = value.id_Organizacion;
         this.updateDatosFiscales();
       }, 
       error:(err: any) => {
         this.loading = false;
         this.ss.showNotification('error', 'No se pudo registrar la organizacion');
       },
     });
    }
  }

  setSelectedColonia(){
    //     console.log(this.selectedColonia);
        if(this.selectedColonia.id > -1){
          this.manualColonia = false;
          this.direccion.colonia = this.selectedColonia.d_asenta;
          this.direccion.estado = this.selectedColonia.d_estado;
          this.direccion.municipio =  this.selectedColonia.d_ciudad ?? this.selectedColonia.d_mnpio;
        } else {
          this.direccion.colonia = null;
          this.direccion.estado = null;
          this.direccion.municipio = null;
          //this.hasColonias = false;
          this.manualColonia = true;
        }
      }

  updateDatosFiscales(){
    let plataformaDigital = this.datosFiscales.actividadPlataformaDigital === 'SI'? true:false;
    let upd = {
      idUsuario: this.infoUsuario.id,
      nombre: this.datosFiscales.nombreComercial,
      razonSocial: this.datosFiscales.nombreComercial,
      regimenFiscal: this.datosFiscales.regimenFiscal,
      paginaWeb: this.datosFiscales.sitioWeb,
      telefono: this.datosFiscales.telefono,
      tipoPersona:this.datosFiscales.tipoPersona,
      rfc:this.datosFiscales.rfc,
      usoCfdi:this.datosFiscales.usoCFDI,
      correoElectronico:this.datosFiscales.correo,
      plataformasDigitales: plataformaDigital,
      tipoFacturacion:this.datosFiscales.tipoValidacion, //Sellos CuentaTerceros
      direccion: {
        numeroExterior: this.datosFiscales.noExterior,
        numeroInterior: this.datosFiscales.noInterior,
        calle: this.datosFiscales.calle,
        codigoPostal: this.datosFiscales.codigoPostal,
        colonia: this.datosFiscales.colonia,
        ciudad: this.datosFiscales.ciudad,
        municipio: this.datosFiscales.municipio,
        estado: this.datosFiscales.estado,
        pais: this.datosFiscales.pais
      }
    }
    this.loading = true;
    console.log(upd)
    console.log(this.idOrganizacion)
    this.authService.updateDataOrganization(upd, this.idOrganizacion).subscribe({
      next:(value: any) => {
        this.loading = false;
        console.log(value)
        this.ss.showNotification('success', 'Organizacion registrada con exito');
        // this.sendEfirma();
          // this.idOrganizacion = value.id_Organizacion;
      }, 
      error:(err: any) => {
        this.loading = false;
        console.log(err)
        this.ss.showNotification('error', 'Hubo un error al actualizar los datos fiscales');
      },
    });
  }

  onCerSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.cerFile = input.files?.[0] ?? null;
  }

  onKeySelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.keyFile = input.files?.[0] ?? null;
  }

  sendEfirma() {
    if (!this.cerFile || !this.keyFile || !this.efirma.password) {
      return;
    }
  }

  setInformacionFiscal(data: any){
    if(data.idOrganizacion && data.idOrganizacion !== 'N/A' && data.datosFiscales.razonSocial){
      this.datosFiscales.tipoPersona = data.datosFiscales.tipoPersona;
      this.datosFiscales.razonSocial =  data.datosFiscales.razonSocial;
      this.datosFiscales.nombreComercial = data.datosFiscales.nombre;
      //this.datosFiscales.sitioWeb = data.datosFiscales.,
      this.datosFiscales.rfc = data.datosFiscales.rfc;
      // this.datosFiscales.curp = data.datosFiscales.,
      // this.datosFiscales.fechaNacimiento = data.datosFiscales.,
      this.datosFiscales.calle = data.datosFiscales.calle;
      this.datosFiscales.noExterior = data.datosFiscales.numeroExterior;
      this.datosFiscales.noInterior = data.datosFiscales.numeroInterior;
      this.datosFiscales.colonia = data.datosFiscales.colonia;
      this.datosFiscales.ciudad = data.datosFiscales.ciudad;
      this.datosFiscales.municipio = data.datosFiscales.municipio;
      this.datosFiscales.estado = data.datosFiscales.estado;
      this.datosFiscales.codigoPostal = data.datosFiscales.codigoPostal;
      this.datosFiscales.correo = data.datosFiscales.correoElectronico;
      // this.datosFiscales.telefono = data.datosFiscales.,
      // this.datosFiscales.regimen_ae = data.datosFiscales.,
      // this.datosFiscales.resico = data.datosFiscales.,
      // this.datosFiscales.arrendamiento = data.datosFiscales.,
      // this.datosFiscales.zonaFronteriza = data.datosFiscales.,
      // this.datosFiscales.ciudadOperacion = data.datosFiscales.,
      // this.datosFiscales.constanciaSituacionFiscal = data.datosFiscales.,
      // this.datosFiscales.identificacionOficial = data.datosFiscales.,
      // this.datosFiscales.comprobanteDomicilioFiscal = data.datosFiscales.,
      // this.datosFiscales.estadoCuentaC = data.datosFiscales.,
      // this.datosFiscales.constanciaFronteriza = data.datosFiscales.,
      this.datosFiscales.pais = data.datosFiscales.pais;
      this.datosFiscales.regimenFiscal = data.datosFiscales.regimenFiscal;
      this.datosFiscales.usoCFDI = data.datosFiscales.usoCfdi;
      // this.datosFiscales.impuestoFronterizo = data.datosFiscales.,
      this.datosFiscales.actividadPlataformaDigital = data.datosFiscales.plataformasDigitales? 'SI':'NO';
      // this.datosFiscales.tipoValidacion = data.datosFiscales.,
    }
  }

  async validarUsuarioLogueado(){
        if(!this.currentUserPassword || this.currentUserPassword.trim() === ''){
          this.ss.showNotification('warning','Informacion incompleta');
          return;
        }
        let r = await this.ss.showConfirmMessage('¿Desea validar y guardar los cambios en la informacion?');
        if(r){
          let m = {
            id: this.usuario()!.id,
            contra: this.currentUserPassword
          }
          this.loading = true; 
          console.log(m);
          this.authService.validarUsuario(m).subscribe({
            next: (response: any) => {
              console.log(response)
              this.loading = false;
              if(response.existe){
                this.saveDataUpdated();
              } else {
                this.ss.showNotification('warning','La contrasena ingresada es incorrecta');
              }
             
              // this.ss.showNotification('success','Informacion actualizada correctamente');
  
              // console.log('User information updated successfully', response);
            },
            error: (err) => {
              this.loading = false;
              this.ss.showNotification('error','Error updating user information');
              console.error('Error updating user information', err);
            }
          });
        }
        
      }

  // =========================================================
  // ==================== 5.- // ===================================
  // =========================================================

  // getDataPageXubastas(){

  // }
  // // setLockedPage(){
   
  // //   let locked = this.ss.toXubaEncode('LCKD'); 
  // //   localStorage.setItem('ILP',locked);
  // //   this.isLockedPage = false;
  // //   //console.log(locked)

  // //   //let unlocked = this.ss.decodeFromXuba('0/=aH¶gg');
  // //   //console.log(unlocked)
  // // }



  // getInformacionListafiscal(){
  //   this.addressService.getRegimenesUsoCFDI().subscribe({
  //     next: (response: any) => {
  //       console.log(response)
  //       this.listaRegimenes = response.regimenesFiscales;
  //       this.listaUsoCfdi = response.usosCfdi;
  //     },
  //     error: (err: any) => {
       
  //     }
  //   })
  // }

    

  //   

  

  //   initFormTarjeta(){
  //     this.tarjeta = {
  //       holder_name: '',
  //       holder_lastname: '',
  //       card_number: '',
  //       expiration_month: '',
  //       expiration_year: '',
  //       mail:'',
  //       phone: '',
  //       id_user: 0,
  //       cvv2:''
  //     };
  //   }

  //   initFormFoto(){
  //     this.dataEditImg = {
  //       idUsuario: 0, 
  //       fotoAnterior:'',
  //       fotoPerfil:''
  //     }
  //   }

  //   

  //   

  //   // COMERCIO SUBASTERO DEL NORTE
  //   // COMERCIO SUBASTERO DEL NORTE
  //   // CSN250325LF2
  //   // idOrganizacion: "699b6fe99c3af737bfe9c78c" 
  //   //                  69a2b2ae7ecffadadd32e3ce 69a2b2ae7ecffadadd32e3ce

  //  

  //   getCategoriasReclamo(){
  //     this.subastasService.getCategoriasReclamo().subscribe({
  //         next: (categorias: any) => {
  //           console.log(categorias);
  //             this.listaCategoriasDisputa = categorias;
  //         },
  //         error: (err) => {
  //             console.error('Error fetching dispute categories:', err);
  //         }
  //     });
  //   }

  //   

  //   
  
  //     const formData = new FormData();
  
  //     // nombres EXACTOS como los pide tu API:
  //     formData.append('cer', this.cerFile);
  //     formData.append('key', this.keyFile);
  //     formData.append('password', this.efirma.password);
  //     console.log(formData)
  //     console.log(this.idOrganizacion)
  //     this.loading = true;
  //     this.authService.saveEfima(formData, this.idOrganizacion).subscribe({
  //       next:(value: any) => {
  //         this.loading = false;
  //         console.log(value)
  //         this.ss.showNotification('success', 'Sellos subidos con exito')
  //           // this.idOrganizacion = value.id_Organizacion;
  //       }, 
  //       error:(err: any) => {
  //         this.loading = false;
  //         this.ss.showNotification('error', 'Error al subir archivos')
  //         console.log(err)
  //       },
  //     });
      
      
  //     // // Ejemplo de POST
  //     // this.http.post('https://tu-api.com/endpoint', formData).subscribe({
  //     //   next: (res) => console.log('OK', res),
  //     //   error: (err) => console.error('ERROR', err),
  //     // });
  //   }

  //   changeTarjetaSeleccionada(){
  //     Object.assign(this.tarjeta, this.selectedCard);
  //   }
  

  //   setTimer(litaItems: any[]){
  //     this.intervalId = setInterval(() => {
  //       for(let item of litaItems){
  //         if (item.tiempoVence > 0) {
  //           item.tiempoVence--;
  //         }
  //       }
  //       // console.log('descontar')
  //     }, 1000);
  //   }

  //   onImgError(event: Event) {
  //     const imgElement = event.target as HTMLImageElement;
  //     imgElement.src = 'images/nofound5.jpg';
  //   }


 
 

  //   getImgBrand(brand: string){
  //     let imagename = '';
  //     switch(brand){
  //       case 'visa': imagename = 'visapng'
  //     }
  //   }

  //   getDataByZipCode(){
  //     // console.log(this.datosFiscales.codigoPostal)
  //     if(this.datosFiscales.codigoPostal && this.datosFiscales.codigoPostal.length === 5){
  //       this.loading = true;
  //       this.addressService.getDataZipCode(this.datosFiscales.codigoPostal).subscribe({
  //         next:(value) => {
           
  //           if(value && value.zip_codes && value.zip_codes.length > 0){
  //             this.hasDataZipCode = true;
  //             this.listaColonias = value.zip_codes;
  //             this.listaColonias.push({id:-1, d_asenta:'Otro' });

  //           } else {
  //             this.hasDataZipCode = false;
  //           }
  //           this.manualDireccionFiscal = false;
  //           this.loading = false;
  //           console.log(value)
  //         },
  //         error:(err) => {
  //           this.loading = false;
  //           this.hasDataZipCode = false;
  //           // this.ss.showNotification('error', 'No se pudo eliminar');
  //         },
  //       })
  //     }
  //   }

    onFileChangeReclamo(event: any) {
      const files = event.target.files;
      let maxFileCount = 5;
      if (files && files.length  <= maxFileCount) {
        for (let i = 0; i < files.length && this.imagesList.length < maxFileCount; i++) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.imagesList.push( e.target.result);
            this.imagesPreview!.push( e.target.result);
            // this.imagenes.push(e.target.result);
          };
          reader.readAsDataURL(files[i]);
        }
      }
    }

  //   setColoniaDomicilioFiscal(){
  //     // console.log(this.selectedColoniaFiscal);
  //     if(this.selectedColoniaFiscal.id > -1){
  //       this.manualDireccionFiscal = false;
  //       this.datosFiscales.colonia = this.selectedColoniaFiscal.d_asenta;
  //       this.datosFiscales.estado = this.selectedColoniaFiscal.d_estado;
  //       this.datosFiscales.ciudad =  this.selectedColoniaFiscal.d_ciudad ?? null;
  //       this.datosFiscales.municipio =   this.selectedColoniaFiscal.d_mnpio ?? null;
  //     } else {
  //       this.datosFiscales.colonia = null;
  //       this.datosFiscales.estado = null;
  //       this.datosFiscales.ciudad = null;
  //       this.datosFiscales.municipio = null;
  //       //this.hasColonias = false;
  //       this.manualDireccionFiscal = true;
  //     }
  //     this.checkStateAndCity();
  //   }

  //  

    async eliminarDireccion(id: number){
      let r = await this.ss.showConfirmMessage('¿Desea eliminar la direccion?');
      if(r){
        this.loading = true;
        this.subastasService.eliminarDirecion(id).subscribe({
          next:(value) => {
            this.loading = false;
            this.ss.showNotification('success', 'Direccion eliminada correctamente');
            this.getDirecciones(this.usuario()!.id)
          },
          error:(err) => {
            this.loading = false;
            this.ss.showNotification('error', 'No se pudo eliminar');
          },
        })
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

  //   getDireccionesEnvio(idUsuario: number, tipo: string){
  //     this.subastasService.GetDireccionesUsuario(idUsuario, tipo).subscribe(
  //       (response: any) => {
  //           console.log(response);
  //           // this.direcciones = [...response];
  //           this.direcciones = [...this.direcciones, ...response];
  //           // this.loading = false;
  //       },
  //       (error: any) => {
  //           console.error('Error fetching addresses:', error);
  //           // this.loading = false;
  //       }
  //     );
  //   }

  

  //   setTipoDireccion(tipo: string) {
  //     this.direccion.tipo = tipo;
  //   }

  //   async saveInfoChange(){
  //     // this.editInfoUsuario.telefono = this.infoUsuario.telefono;
  //     // this.editInfoUsuario.correo = this.infoUsuario.correo;
  //     // this.editInfoUsuario.id = this.infoUsuario.id;
  //     // let r = await this.ss.showConfirmMessage('Desear guardar los cambios en la informacion?');
  //     // if(r){
  //     //   this.loading = true; 
  //     //   // console.log('User confirmed saving changes');
  //     //   this.authService.editarDatosUsuario(this.editInfoUsuario).subscribe({
  //     //     next: (response) => {
  //     //       this.loading = false;
  //     //       this.ss.showNotification('success','Informacion actualizada correctamente');

  //     //       console.log('User information updated successfully', response);
  //     //     },
  //     //     error: (err) => {
  //     //       this.loading = false;
  //     //       this.ss.showNotification('error','Error updating user information');
  //     //       console.error('Error updating user information', err);
  //     //     }
  //     //   });
  //     // }
  //     this.openModal('validacion');
  //   }

  //  

  //  

  //   

    saveReclamo(){
      if(!this.subastaSeleccioandaReclamo || this.subastaSeleccioandaReclamo.idSubasta <= 0){
        this.ss.showNotification('warning','Seleccione una subasta');
        return;
      }
      this.reclamoModel.fechaApertura = new Date();
      this.reclamoModel.idSubasta = this.subastaSeleccioandaReclamo.idSubasta;
      this.reclamoModel.idVendedor = this.subastaSeleccioandaReclamo.idVendedor;
      this.reclamoModel.idGanador = this.infoUsuario.id;
      let r = this.getClearBase64FromArray(this.imagesList);
      for(let image of r){
        this.reclamoModel.imagenesReclamos.push({url:image});
      }
      // console.log(this.reclamoModel);
      this.loading = true;
      this.subastasService.addReclamo(this.reclamoModel).subscribe({
          next: (response) => {
            console.log('Reclamo saved successfully', response);
            this.closeModal('disputa');
            this.getListaReclamosAbiertos();
            this.loading = false;
            // this.getInitialData(true);
          },
          error: (err) => {
            this.loading = false;
            console.error('Error saving reclamo', err);
          }
      });
    }

  //   

  //   setComprobanteModel(){
  //     let clienteNombre = `${this.usuario!()!.nombre}  ${this.usuario!()!.apellido}`
  //     //RSX = Recarga de saldo xuba
  //     const timestamp = Date.now();

  //     this.modeloComprobante = {
  //       estatus:'',
  //       fecha:'',
  //       idTransaction:'',
  //       metodoPago: '',
  //       cliente: clienteNombre ,
  //       correo:'',
  //       ordenXuba:`#RSX-${this.usuario()!.id}-${timestamp}`,
  //       total:this.cantidadRecarga,
  //       subtotal:this.cantidadRecarga,
  //       envio:0,
  //       nombreArticulo:`R-MDX-${timestamp}`,
  //       idArticulo:0,
  //       descripcion: `Recarga de Saldo de Moneda Digital Xuba (MDX) - ${this.usuario!()!.nombre}  ${this.usuario!()!.apellido}`,
  //       cantidad:1,
  //       noAutorizacion: '',
  //     };
  //   }

  //   async downloadComprobante(){
  //     console.log('descargar compronbante')
  //     const timestamp = Date.now();
  //     const _filename = `xuba_pay-recarga-${timestamp}.pdf`; 
  //     const element: any = document.getElementById('printContainer');
  //     const opt: any = {
  //       margin: 10,
  //       filename: _filename,
  //       image: { type: 'jpeg', quality: 0.98 },
  //       html2canvas: { scale: 2 },
  //       jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  //     };

  //     html2pdf().set(opt).from(element).save();
  //   }

  //   // Se genera el token de la tarjeta a traves del openpay.token.create
  //   // una vez obtenido el token se llama a una api propia, la cual se conecta a la api del banco
  //   //
  //    procesarPago(){
  //         if(!this.ss.isValidModel(this.tarjeta, [])){
  //           this.ss.showNotification('error', 'Datos faltantes');
  //           return;
  //         } else {
  //           if(+this.tarjeta.expiration_month > 12){
  //             this.ss.showNotification('error', 'El mes de expiración de la tarjeta no es válido.', 3000);
  //             return;
  //           }
  //           this.tokenizarTarjeta();
  //         }
  //         // this.loading = true;
  //       }
        
  //       tokenizarTarjeta() {
  //         this.loading = true;
  //         this.textoLoading = 'Procesando tu pago...'
  //         this.setComprobanteModel();
  //         const dataToken = {
  //           holder_name: this.tarjeta.holder_name,
  //           card_number: this.tarjeta.card_number,
  //           expiration_month: this.tarjeta.expiration_month,
  //           expiration_year: this.tarjeta.expiration_year,
  //           cvv2: this.tarjeta.cvv2
  //         };
  //         console.log('Tokenizing card with data:', dataToken);
  //         OpenPay.token.create(dataToken,
  //           (response: any) => {
  //             const token_id = response.data.id;
  //             // this.loading = false;
  //             console.log('tarketa okenizada:')
  //             console.log(response);
  //             let cardnumber = response.data.card.card_number.slice(-4);
  //             this.metodoPagoDescripcion = `Tarjeta • ${response.data.card.brand} • **** ${cardnumber}`;
  //             this.modeloComprobante.metodoPago = this.metodoPagoDescripcion;
  //             // if(response.data.card.type === 'credit'){
  //             //   this.loading = false;
  //             //   this.ss.showNotification('error', 'Solo se permiten tarjetas de debito', 3500);
  //             //   return;
  //             // } else {
  //               this.GenerarCargo(token_id);
  //             // }
      
  //           },
  //           (error: any) => {
  //             this.loading = false;
  //             let res_error = error.data;
  //             let errorMessage = '';
  //             switch(res_error.description) {
  //                 case 'card_number length is invalid':
  //                     errorMessage = 'El número de tarjeta tiene una longitud inválida.';
  //                     break;
  //                 case 'cvv2 length must be 3 digits':
  //                     errorMessage = 'El CVV2 debe tener 3 dígitos.';
  //                     break;
  //                 case 'cvv2 length must be 4 digits':
  //                     errorMessage = 'El CVV2 debe tener 4 dígitos.';
  //                     break;
  //                 case 'The expiration date has expired':
  //                     errorMessage = 'La fecha de expiración es invalida.';
  //                     break;
  //                 case 'The card number verification digit is invalid':
  //                     errorMessage = 'El numero de tarjeta es invalido.';
  //                     break;
  //                 default:
  //                     errorMessage = 'No se ha podido generar el cargo [stp1-tkn]';
  //             }
  //             this.ss.showNotification('error', errorMessage, 3500);
      
  //             console.error('Error al tokenizar:', error);
  //           }
  //         );
  //       }
      
       
      
  //   GenerarCargo(tokenId: string){
  //     let userData = this.authService.getUserData();
  //     const timestamp = Date.now()
  //     const dataCharge  = {
  //       'token': tokenId,
  //       'amount': this.cantidadRecarga,
  //       'description': 'Pago Recarga MDX - ' + this.usuario()!.id + '-'+ timestamp,
  //       'name':this.tarjeta.holder_name,       
  //       'lastName':this.tarjeta.holder_lastname,       
  //       'email':this.tarjeta.mail,
  //       'phone':this.tarjeta.phone,       
  //     };
       
  //     console.log(dataCharge)
  //     this.openPayService.GenerarCargoSubastaPremium(dataCharge).subscribe({
  //       next: (response: any) => {
  //         this.loading = false;
  //         console.log('CARGO COMPLETADO')
  //         console.log(response);
  //         let res = JSON.parse(response.message);
  //         console.log(res);
  //         if(res.error_code){
  //           switch(res.error_code) { 
  //             case 1001: 
  //               this.ss.showNotification('error', 'El correo proporcionado es inválido.', 3500);
  //               break;
  //             case 3001: 
  //               this.ss.showNotification('error', 'La tarjeta fue declinada.', 3500);
  //               break;
  //             case 3002: 
  //               this.ss.showNotification('error', 'La tarjeta ha expirado.', 3500);
  //               break;
  //             case 3003: 
  //               this.ss.showNotification('error', 'La tarjeta no tiene fondos suficientes.', 3500);
  //               // this.ss.showNotification('error', 'La tarjeta fue declinada.', 3500);
  //               break;
  //             case 3004: 
  //               this.ss.showNotification('error', 'La tarjeta ha sido identificada como una tarjeta robada.', 3500);
  //               // this.ss.showNotification('error', 'La tarjeta fue declinada.', 3500);
  //               break;
  //             case 3005: 
  //               this.ss.showNotification('error', 'La tarjeta ha sido rechazada por el sistema antifraudes.', 3500);
  //               break;
  //             default: 
  //             this.ss.showNotification('error', 'Se produjo un error desconocido ['+res.error_code +']', 3500);
  //               break;
  //           }
  //         } else {
  //           let estatusCargo = '';
  //           switch(res.status){
  //             case 'completed': estatusCargo = 'Completado';
  //               break;
  //             default: estatusCargo = 'NoDisponible';
  //               break;
  //           }
  //           this.modeloComprobante.noAutorizacion = res.authorization;
  //           this.modeloComprobante.idTransaction = res.id;
  //           this.modeloComprobante.fecha = res.operation_date;
  //           this.modeloComprobante.estatus = estatusCargo;
  //           this.modeloComprobante.correo = res.customer.email;
  //           if(res.id && res.status && res.status === 'completed'){
  //             this.closeModal('recarga');
  //             // this.ss.showNotification('success', 'Pago completado exitosamente');
  //             setTimeout(() => { this.openComprobante(); }, 350);
              
  //             // this.CambiarEstatusSubasta(this.subasta!.id, AuctionStatus.Pagado, true);
  //           } else { 
  //             this.ss.showNotification('warning', 'Pago procesado con estatus no completado');
  //             return;
  //             // [Log] {http_code: 402, error_code: 3001, category: "gateway", description: "The card was declined by the bank", request_id: "20a590f7-a0ca-4450-a602-e06a424addea"} (main.js, line 10334)
            
  //             // setTimeout(() => { this.openComprobante(); }, 350);
  //           }
  //         }
  //       },
  //       error: (error: any) => {
  //         console.log(error);
  //         this.loading = false;
  //         this.ss.showNotification('error','Hubo un problema al generar el cargo');
  //           console.error('Error al generar cargo:', error);
  //         }
  //             // this.generarCargoSuccess(response);
  //       });
  //   }

  //   openComprobante(){
  //     this.classComprobanteModal = 'animate__zoomIn';
  //     this.showComprobante = true;
  //   }

    checkCodigoPostal = (value: any) =>{
      if(value.length === 5){
        if(value !== this.codigoPostal){
          this.codigoPostal = value;
          console.log(this.codigoPostal);
          console.log('Obtener datos');
          this.getInfoZipCode(this.codigoPostal);
        }
      } else {
        this.hasColonias = false;
        this.listaColonias = [];
      }
      
    }

  //  


   

    openEditModal(key: string, prop?: any, value?: any){
      this.isEdit = true;
      this.isModalOpen[key] = true;
      //if(prop){
        this.direccion = value;
      //}
      console.log(prop)
      console.log(prop)
    }

  //   closeModal(key: string){
  //     this.isModalOpen[key] = false;
  //     this.isEditCard = false;
  //   }

  //   getSubastasForReclamos(){
  //     console.log(this.infoUsuario.id);
  //     this.subastasService.getListaSubastasForReclamos(this.infoUsuario.id).subscribe({
  //       next: (response: any) => {
  //         console.log(response);
  //         this.listaSimpleSubastas = response;
  //         // this.loading = false;
  //         // this.ss.showNotification('success', 'Cuenta CLABE agregada correctamente');
  //         // this.GetCuentasClabe(this.usuario()!.id);
  //         // this.closeModal('clabe');

  //       },
  //       error: (error: any) => {
  //           console.error('Error al obtener lista de subastas para reclamo:', error);
  //           // this.loading = false;
  //       }
  //     });
  //   }

  //   onContentClick(event: MouseEvent) {
  //     event.stopPropagation();
  //   }

  //   

     
  //     this.loading = true;
  //     this.subastasService.guardarDireccion(this.direccion).subscribe(
  //       (response: any) => {
  //           console.log(response);
  //           this.loading = false;
  //           this.ss.showNotification('success', 'Direccion agregada correctamente');
  //           this.getDirecciones(this.usuario()!.id);
  //           this.initDireccion();
  //           this.closeModal('direccion');
  //       },
  //       (error: any) => {
  //         this.ss.showNotification('error', 'Se produjo un error al guardar la dirección');
  //         console.error('Error fetching addresses:', error);
  //         this.loading = false;
  //       }
  //     );
  //     // this.getInfoZipCode();
  //   }

  //   
  //  
  //   //http://localhost:4200/subasta-terminada/eyJpZFN1YmFzdGEiOjUxODAsInRpcG9Vc3VhcmlvIjoiY29tcHJhZG9yIn0%3D
  

  //   checkOpenPayCustomer(){
  //     console.log(this.tarjeta)
  //     console.log(this.infoUsuario)
  //     if(!this.infoUsuario.customerID){
  //       let modelCustomerOpenPay = {
  //         nombre:this.tarjeta.holder_name,
  //         apellido:this.tarjeta.holder_lastname,
  //         email:this.tarjeta.mail,
  //         telefono:this.tarjeta.phone
  //       }
  //       console.log(modelCustomerOpenPay)
  //       this.openPayService.CrearClienteOpenPay(modelCustomerOpenPay).subscribe({
  //         next: (response) => {
  //           console.log(response)
  //         },
  //         error: (err) => {
  //           console.log(err);
  //         }
  //       })
  //     } else {
  //       console.log('ya guardado')
  //     }
  //   }

    getInfoZipCode(codigoPostal: any){
        this.addressService.getDataZipCode(codigoPostal).subscribe({
            next: (data: any) => {
              console.log('Zip code info:', data);
              this.listaColonias = data.zip_codes;
              this.listaColonias.push({id:-1, d_asenta:'Otro' })
              if(this.listaColonias && this.listaColonias.length > 1){
                this.hasColonias = true;
              } else{
                this.hasColonias = false;
              }
              this.manualColonia = false;
            },
            error: (error: any) => {
              this.listaColonias = [];
              this.hasColonias = false;
              this.manualColonia = true;
                console.error('Error fetching zip code info:', error);
            }
        }
            // (data: any) => {
            //     console.log('Zip code info:', data);
            // },
            // (error: any) => {
            //     console.error('Error fetching zip code info:', error);
            // }
        );
    }

    openModalComprobante(){
      this.modeloComprobante.idTransaction = 'asd223s224352';
      this.modeloComprobante.metodoPago = 'Pago test VISA ';
      this.modeloComprobante.cliente = 'Freddy Villegas';
      this.modeloComprobante.correo = 'fvillegas@mail.com';
      this.modeloComprobante.ordenXuba = 'PXUCI-02022';
      this.modeloComprobante.total = 1350;
      this.modeloComprobante.noAutorizacion = '00H12';
      this.modeloComprobante.nombreArticulo = 'Items test comp';
      this.modeloComprobante.descripcion = 'item prueba descripcion comprobante articulo';
      this.modeloComprobante.subtotal = 1100;
      this.modeloComprobante.envio = 250;

      this.showModalComprobante = true;
      this.openModal('comprobante')
    }

    closeModalComprobante(){
      this.showModalComprobante = false;
    }
  //   setCurrentPageTab(index: number){
  //     localStorage.setItem('TpTbIdx', index.toString());
  //   }
  //   setCurrentSubastaPageTab(index: number){
  //     localStorage.setItem('TpSbTbIdx', index.toString());
  //   }


  //   openDetalleReclamo(reclamo: any){

  //     this.setCurrentPageTab(0);
  //     this.getDatosSubasta(reclamo.idSubasta);
  //   }
   
  //   setCurrentTab(tab: number){
  //     this.setCurrentPageTab(tab);
  //     switch(tab){
  //       case ProfileTabIndexEnum.MisSubastas:
  //           // this.getSubastasUsuario();
  //           // this.getSubastasByTipo('Activa')
  //           // this.getSubastasInactivasUsuario();
  //           this.setCurrentTabSubastas(0);
  //           break;
  //      // case 3: 
  //       // if(this.isLoggedIn()){
  //       //   this.getWalletPagos();
  //       //   this.GetCuentasClabe(this.usuario()!.id)
  //       //   this.getSecureCards();
  //       // } 
  //           // Add logic for tab 3 if needed
  //        //   break;
  //     }
  //     this.tabIndex = tab;
      
  //   }

  //   setCurrentTabSubastas(tab: number){
  //     this.tabSubastasIndex = tab;
  //     this.setCurrentSubastaPageTab(tab);
  //     switch(tab){
  //       case 0: this.getSubastasGanadas(0);
  //       // case 0: this.getSubastasByTipo('Activa');
  //         break;
  //       case 1: this.getSubastasCreadas();
  //       // case 1: this.getSubastasByTipo('Finalizada');
  //         break;
  //       // case 2: this.getSubastasByTipo('Por Aprobar');
  //       //   break;
  //       // case 3: this.getSubastasByTipo('Rechazada');
  //       //   break;
  //       // case 4: this.getSubastasByTipo('Cancelada');
  //       //   break;
  //     }
  //   }

  //   onChangeTipoSubasta(){
      
      
  //     switch(this.tabSubastasIndex){
  //       case 0: this.getListaSubastasPG();
  //       // case 0: this.getSubastasByTipo('Activa');
  //         break;
  //       case 1: this.getSubastasCreadas();
  //       // case 1: this.getSubastasByTipo('Finalizada');
  //         break;
  //       // case 2: this.getSubastasByTipo('Por Aprobar');
  //       //   break;
  //       // case 3: this.getSubastasByTipo('Rechazada');
  //       //   break;
  //       // case 4: this.getSubastasByTipo('Cancelada');
  //       //   break;
  //     }
  //   }

  //   getSubastasGanadas(index: number) {
  //     this.currentTipoSubasta = 'todas'
  //     this.getListaSubastasPG()
  //   }

  //   getListaSubastasPG(){
  //     this.loading = true;
  //     this.subastasService.GetXubastasUsuarioPerfil(this.currentTipoSubasta, this.infoUsuario.id).subscribe({
  //       next: (data: any) => {
  //         this.loading = false;
  //         console.log(data);
  //         this.listaSubastas = data.data;
  //         this.listaSubastas = data.data.map((item: any) => ({
  //           ...item,
  //           short_desc:  item.descripcion.substring(0,35),
  //           remaining: item.hora * 3600 + item.minuto * 60 + item.segundo
  //         }));
  //         this.setTimerV2();
  //         //  this.auctionsWin = data;
          
  //         //  this.loadingNotificaciones = false;
  //        },
  //        error: (error) => {
  //         this.loading = false;
  //         //  this.loadingNotificaciones = false;
  //          console.error('Error cargando subastas:', error);
  //        }
  //      });
  //   }

  //   getSubastasCreadas(){
  //     this.getSubastasByTipo(this.currentTipoSubasta);
  //   }

  //   

 

  //   setTimeString(){

  //   }

  

  //   getCurrenSubastaName(){
  //     let tipo = '';
  //     switch(this.tabSubastasIndex){
  //       case 0: tipo = 'Activas'
  //         break;
  //       case 1: tipo = 'Terminadas'
  //         break;
  //       case 2: tipo = 'Por aprobar'
  //         break;
  //       case 3: tipo = 'Por Revisar'
  //         break;
  //       case 4: tipo = 'Denegadas'
  //         break;
  //     }
  //     return tipo;
  //   }


  //   // getSubastasUsuario(){
  //   //   this.subastasService.getSubastasActivasVendedor(this.usuario()!.id).subscribe({
  //   //     next: (subastas) => {
  //   //       this.subastasActivas = subastas;
  //   //         console.log(subastas);
  //   //         for(let p of this.subastasActivas){
  //   //           p.venceSegundos = this.tiempoStringASegundos(p.tiempoVence);
  //   //           p.short_desc = this.toShort(p.descripcion);
  //   //         }
  //   //         this.setTimer(this.subastasActivas);
  //   //         // Handle the fetched subastas here
  //   //     },
  //   //     error: (err) => {
  //   //         console.error('Error fetching subastas:', err);
  //   //     }
  //   //   });
  //   // }
  //   getSubastasByTipo(tipo: string){
  //     this.loading = true;
  //     console.log(tipo)
  //       this.subastasService.getSubastasUsuarioByEstatus(this.usuario()!.id, tipo).subscribe({
  //       next: (subastas: any) => {
  //         console.log(subastas)
  //         this.subastasActivas = subastas;
  //         this.listaSubastas = subastas;
  //         for(let s of this.listaSubastas){
  //           s.short_desc = s.descripcion.substring(0,35);
  //         }
  //         //   console.log(subastas);
  //           this.loading = false;
  //           if(tipo === 'Activa'){
  //             // this.setTimer(this.listaSubastas);
  //           }
          
  //       },
  //       error: (err) => {
  //         this.loading = false;
  //           console.error('Error fetching subastas:', err);
  //       }
  //     });
  //   }

  //   // getSubastasInactivasUsuario(){
  //   //   this.subastasService.getSubastasTerminadasVendedor(this.usuario()!.id).subscribe({
  //   //     next: (subastas) => {
  //   //       this.subastasInactivas = subastas
  //   //         console.log('subastas terminadas usuario');
  //   //         console.log(subastas);
  //   //         for(let s of this.subastasInactivas){
  //   //           s.short_desc = this.toShort(s.descripcion);
  //   //         }
  //   //         // Handle the fetched subastas here
  //   //     },
  //   //     error: (err) => {
  //   //         console.error('Error fetching subastas:', err);
  //   //     }
  //   //   });
  //   // }

  //   tiempoStringASegundos(tiempo: string) {
  //     const [h, m, s] = tiempo.split(':').map(Number);
  //     return h * 3600 + m * 60 + s;
  //   }

  //   toShort(val: string){
  //     return val.length > 41 ? val.substring(0, 41) + '...' : val;
  //   }
    
  //   // 2. Función para convertir segundos a "hh:mm:ss"
  //   segundosATiempoString(tiempo: string) {
  //     let segundos = tiempo.split(':').reduce((acc, time) => (60 * acc) + +time, 0);

  //     const h = String(Math.floor(segundos / 3600)).padStart(2, '0');
  //     const m = String(Math.floor((segundos % 3600) / 60)).padStart(2, '0');
  //     const s = String(segundos % 60).padStart(2, '0');
  //     return `${h}:${m}:${s}`;
  //   }
  

  //   openSubastaDetalle(subasta: any){
  //     if(this.tabSubastasIndex === 0){
  //       this.getDatosSubasta(subasta.id);
  //     } else {
  //       this.subastaEdicion = subasta;
  //       this.subastaEdicion.precio = subasta.extraInfo.precio; 
  //       this.subastaEdicion.imagesPreview = subasta.imagenes;
  //       this.subastaSeleccionada = subasta
  //       // this.subastaSeleccionada.
  //       console.log(this.subastaSeleccionada)
  //       // this.subastaSeleccionada.extraInfo //{apuestaActual: 40000, precio: 25000 };
  //       this.openModal('subastaDetalle');

  //     }
  //   }

    

    getWalletPagos(){
      // this.usuario()!.id
      this.walletPagos = [
        {id:2323,item: {name:'Mario Kart',id:4343, img: 'images/subasta1.webp'},tipo:'Entrada', totalRecibir: 1230.00, fecha: new Date(), estatus:'Por pagar',estatusClave:'PPR', precio: 1700,retenciones:[{name:'IVA (16%)', valor:200}, {name:'ISR (16%)', valor:170}, {name:'XUBA (16%)', valor:100}], saldoNegativo:0, flete:0 },
        {id:5334,item: {name:'Memoria',id:54355,img: 'images/subasta2.webp'}, tipo:'Salida',totalRecibir: 3422.00, fecha: new Date(), estatus:'Pagado',estatusClave:'PDO',precio: 4100,retenciones:[{name:'IVA (16%)', valor:300}, {name:'ISR (16%)', valor:200}, {name:'XUBA (16%)', valor:200}], saldoNegativo:0, flete:0 }
      ]
    }

 
  
    onFileChange(event: any) {
      const files = event.target.files;
       if (files && files.length > 0) {
        //for (let i = 0; i < files.length && this.subasta.mimagenesSubasta.length < 5; i++) {
         const reader = new FileReader();
         reader.onload = (e: any) => {
            this.imageProfileSrc = e.target.result;
            this.updatingImage = true;
           //this.subasta.mimagenesSubasta.push({url: e.target.result});
           // this.imagesPreview!.push({url: e.target.result});
            //this.imagenes.push(e.target.result);
          };
          reader.readAsDataURL(files[0]);
          }
      }
    

  //   // onFileChangeEdit(event: any) {
  //   //   const files = event.target.files;
  //   //   if (files && files.length > 0) {
  //   //     // for (let i = 0; i < files.length && this.subasta.mimagenesSubasta.length < 5; i++) {
  //   //       const reader = new FileReader();
  //   //       reader.onload = (e: any) => {
  //   //         this.imageProfileSrc = e.target.result;
  //   //         this.updatingImage = true;
  //   //         this.subastaEdicion.imagesPreview.push({url: e.target.result})
  //   //         // this.subasta.mimagenesSubasta.push({url: e.target.result});
  //   //         // this.imagesPreview!.push({url: e.target.result});
  //   //         // this.imagenes.push(e.target.result);
  //   //       };
  //   //       reader.readAsDataURL(files[0]);
  //   //     // }
  //   //   }
  //   // }


    eliminarImagen(image: any, index: number) {
      // this.subastaEdicion.mimagenesSubasta.splice(index, 1);
      this.subastaEdicion.imagesPreview!.splice(index, 1);
      if(!this.subastaEdicion.idImg){
        this.subastaEdicion.idImg = [{id:image.id}]
      } else {
        this.subastaEdicion.idImg.push({id:image.id})
      }
      // this.imagenes
    }

  //   getClearBase64(url: string){
  //     let index = url.indexOf('base64');
  //     let firstPart = url.substring(0,  index + 7);
  //     let clearB64 = url.replace(firstPart,'');
  //     return clearB64;
  //   }

  //   getClearBase64FromArray(array: any[]){
  //     let _array = [];
  //     for(let i of array){
  //       let index = i.indexOf('base64');
  //       let firstPart = i.substring(0,  index + 7);
  //       let b64 = i.replace(firstPart,'');
  //       console.log(b64)
  //       _array.push(b64);
  //     }
  //     return _array;
  //   }

     editImgPerfil(): void {
       //this.initFormFoto();
      this.dataEditImg = {
       fotoPerfil: this.getClearBase64(this.imageProfileSrc) ,
       idUsuario:this.usuario()!.id,
        fotoAnterior:this.usuario()!.imgPerfil
      }
     this.loading = true;
       this.authService.actualizarFotoPerfilUsuario(this.dataEditImg).subscribe({
         next: (response: any) => {
           this.loading = false;
           console.log('Profile image updated successfully', response);
           this.usuario()!.imgPerfil = response.message;
           this.ss.showNotification('success','Foto actualizada correctamente');
           this.authService.setUser(this.usuario()!);
       },
         error: (error) => {
           this.loading = false;
           console.error('Error updating profile image', error);
         }
       });

       // this.usuario()!.imgPerfil = this.imageProfileSrc;
     // console.log(this.usuario())
       // console.log(this.dataEditImg)

     }

 
  //   toCurrency(valor: number): string {
  //     return this.ss.toCurrency(valor);
  //   }
  
  //   isInMinimumStatus(clave: string, minCve: string){
  //     let current = this.ordenEstatusValidaiones[clave];
  //     let minimo = this.ordenEstatusValidaiones[minCve];
  //     return current >= minimo;
  //   }

  //   openLabelModal(event: MouseEvent, item: any){
  //     event.stopPropagation();
  //     this.selectedSubasta = item;
  //     this.openModal('etiqueta');

  //   }

  //   descargarPdfEtiqueta(){
  //     const timestamp = Date.now();
  //     const link = document.createElement('a');
  //     link.href = this.selectedSubasta.urlGuia;
  //     link.download = `guide_label-${this.selectedSubasta.id}-${timestamp}.pdf`; // 👈 nombre del archivo a guardar
  //     link.target = '_blank';
  //     link.click();
  //   }

  //   openImagesViewer(imagenes: any[], $event: any){
  //     $event.stopPropagation();
  //     this.currentIndexImageViewer = 0;
  //     this.imagesListViewer = imagenes;
  //     this.isModalOpen.viewer = true;
  //   }

    async downloadPdf(){
      try {
        const timestamp = Date.now();
        const filename = `guide_label-${this.selectedSubasta.id}-${timestamp}.pdf`; 
        const resp = await fetch(this.selectedSubasta.urlGuia, { credentials: 'same-origin' }); // o mode:'cors' según sea necesario
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const blob = await resp.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blobUrl);
      } catch (err) {
        console.error('Error descargando PDF:', err);
        alert('No se pudo descargar el PDF (CORS o URL inaccesible).');
      }
    }

  //   closeComprobante() {
  //     this.classComprobanteModal = 'animate__zoomOut';
  //     setTimeout(() => {
  //       this.showComprobante = false;
  //     }, 250);
  //   }
  
  //   // descargarPdfConHttpClient() {
  //   //   this.http.get(this.selectedSubasta.urlGuia, { responseType: 'blob', observe: 'response' }).subscribe({
  //   //     next: (resp: HttpResponse<Blob>) => {
  //   //       const blob = resp.body!;
  //   //       const disposition = resp.headers.get('Content-Disposition') || '';
  //   //       const timestamp = Date.now();

  //   //       // const nombre = obtenerNombreDesdeContentDisposition(disposition) || nombrePredeterminado;
  //   //       const nombre = `guide_label-${this.selectedSubasta.id}-${timestamp}.pdf`; 
  //   //       const blobUrl = window.URL.createObjectURL(blob);
  //   //       const a = document.createElement('a');
  //   //       a.style.display = 'none';
  //   //       a.href = blobUrl;
  //   //       a.download = nombre;
  //   //       document.body.appendChild(a);
  //   //       a.click();
  //   //       document.body.removeChild(a);
  //   //       window.URL.revokeObjectURL(blobUrl);
  //   //     },
  //   //     error: err => console.error('Error descargando PDF (HttpClient):', err)
  //   //   });
  //   // }

  

  toCurrency(valor: number): string {
    return this.ss.toCurrency(valor);
  }

  formatTimeString(total: number): string {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
  }

  openSubastaDetalle(subasta: any){
    if(this.tabSubastasIndex === 0){
      this.getDatosSubasta(subasta.id);
    } else {
      this.subastaEdicion = subasta;
      this.subastaEdicion.precio = subasta.extraInfo.precio; 
      this.subastaEdicion.imagesPreview = subasta.imagenes;
      this.subastaSeleccionada = subasta
      // this.subastaSeleccionada.
      console.log(this.subastaSeleccionada)
      // this.subastaSeleccionada.extraInfo //{apuestaActual: 40000, precio: 25000 };
      
      //if(this.currentTipoSubasta !== 'Finalizada' && this.currentTipoSubasta !== 'Rechazada'){
        this.getDatosSubasta(subasta.id);
      //} else {
        //this.openModal('subastaDetalle');
      //}
      
    }
  }

  hasToReview(element: string, checklist: any[]){
    return checklist.find(x => x.concepto === element) !== undefined? true:false;
  }

  getCommentReview(element: string, checklist: any[]){
    let el = checklist.find(x => x.concepto === element);
    return el.comentario;
  }

  openModalSubastaEdicion(subasta: any){
    this.subastaEdicion = subasta;
    this.subastaEdicion.precio = subasta.extraInfo.precio; 
    this.subastaEdicion.imagesPreview = subasta.imagenes;
    this.subastaSeleccionada = subasta
    this.openModal('subastaDetalle');
  }

  openSubastaDetalleCreada(subasta: any){
    this.router.navigate(['/my-subasta-detalle', subasta.id])
  }

  getDatosSubasta(id: number){
      this.loading = true;
      this.subastasService.getAuctionById(id).subscribe({
        next: subasta => {
          this.loading = false;
          let tiempoVence = subasta.tiempoVence?? '00:00:00';
          let _tiempoRestante = tiempoVence.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
            //console.log(_tiempoRestante);
          localStorage.setItem('BCK-TO-PG','profile');
          if(_tiempoRestante > 0){
            this.router.navigate(['/subasta-detalle', subasta.id, 'MyAuctionsPage']);
          } else {
            let dataParams = JSON.stringify({ idSubasta: id, tipoUsuario:'vendedor'});
            let encoded = this.ss.encodeToBase64(dataParams);
            this.router.navigate(['/subasta-terminada', encoded]);
          }
        }, 
          error: err => {
            console.error('Error fetching auction data:', err);
            this.loading = false;
          }
      })
  }

  openImagesViewer(imagenes: any[], $event: any){
    $event.stopPropagation();
    this.currentIndexImageViewer = 0;
    this.imagesListViewer = imagenes;
    this.isModalOpen.viewer = true;
  }

  onImgError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'images/nofound5.jpg';
  }

  segundosATiempoString(tiempo: string) {
    let segundos = tiempo.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
    const h = String(Math.floor(segundos / 3600)).padStart(2, '0');
    const m = String(Math.floor((segundos % 3600) / 60)).padStart(2, '0');
    const s = String(segundos % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  openModal(key: string, prop?: any, value?: any){
      
    this.isEdit = false;
    this.isModalOpen[key] = true;
    this.loading = false;
    // if(key === 'tarjeta' && !this.isEditCard){
      // this.initFormTarjeta();
    // }
    // if(key === 'disputa'){
    //   this.getCategoriasReclamo();
    //   this.getSubastasForReclamos();
    // }
    // if(prop){
    //   prop = value;
    // }
  }

  closeModal(key: string){
    this.isModalOpen[key] = false;
    this.isEditCard = false;
  }

  actualizarSubastaRechazada(){
      
    this.subastaEdicion.imgSubasta = [];
    for(let im of this.subastaEdicion.imagenes){
      if(im.url.includes('data:image')){
        let b64 = this.getClearBase64(im.url)
        this.subastaEdicion.imgSubasta.push({urlImg:b64})
      }
    }
    // console.log(this.subasta)
   
    this.subastaEdicion.idSubasta = this.subastaEdicion.id;
    this.subastaEdicion.idVendedor = this.infoUsuario.id;
    console.log(this.subastaEdicion)
    this.loading = true;
    this.subastasService.updateSubastaRechazada(this.subastaEdicion).subscribe({
      next: (res) => {
        this.loading = false;
        this.getSubastasByTipo('Rechazada');
        this.closeModal('subastaDetalle')
        console.log(res);
      }, 
      error: (err) => {
        this.loading = false;
        this.ss.showNotification('error','Hubo un error al actualizar los datos');
        console.log(err)
      }
    })
  }

  getClearBase64(url: string){
    let index = url.indexOf('base64');
    let firstPart = url.substring(0,  index + 7);
    let clearB64 = url.replace(firstPart,'');
    return clearB64;
  }
  
  getClearBase64FromArray(array: any[]){
    let _array = [];
    for(let i of array){
      let index = i.indexOf('base64');
      let firstPart = i.substring(0,  index + 7);
      let b64 = i.replace(firstPart,'');
      console.log(b64)
      _array.push(b64);
    }
    return _array;
  }


  onFileChangeEdit(event: any) {
      const files = event.target.files;
      let maxFileCount = !this.subastaEdicion.premium ? 5 : 100;
      let maxCantAdd = maxFileCount - this.subastaEdicion.imagesPreview.length;
      let restFilesCount = files && files.length > maxCantAdd ? maxCantAdd: files.length;
      // if (files && files.length + this.subasta.mimagenesSubasta.length <= maxFileCount) {
        if(restFilesCount > 0){
          for (let i = 0; i < restFilesCount; i++) {
            // for (let i = 0; i < files.length && this.subasta.mimagenesSubasta.length < maxFileCount; i++) {
              const reader = new FileReader();
              reader.onload = (e: any) => {
                this.subastaEdicion.imagesPreview.push({url: e.target.result});
                //this.subastaEdicion.imgSubas.push({url: e.target.result});
                // this.imagesPreview!.push({url: e.target.result});
                // this.imagenes.push(e.target.result);
              };
              reader.readAsDataURL(files[i]);
            // }
          }
        }
  }

  onContentClick(event: MouseEvent) {
    event.stopPropagation();
  }

  setTimerV2(){
    this.intervalId = setInterval(() => {
      // this.listaSubastas = this.listaSubastas.map(item => ({
      //   ...item,
      //   //this.toShort(item.descripcion),
      //   remaining: item.remaining > 0 ? item.remaining-1 : 0
      // }));
      for(let s of this.listaSubastas){
        s.remaining = s.remaining -1;
      }
    }, 1000);
  }

  initDireccion(){
        this.direccion = {
          calle: '',
          numeroInt: '', 
          numeroExt: '',
          colonia: '',
          codigoPostal: '', 
          descripcionDomicilio: 'descripcion', // 
          callesCruzan: '', 
          telefono: 'xxxxxxxxxx', //
          correo: 'correo@mail.com', //
          tipo:'',
          tipoDomicilio: 'ND', //
          estado: '',
          municipio: '',
          quienRecibe: 'ND', //
          idUsuario:0,
          predeterminada: false
        }
      }
}
