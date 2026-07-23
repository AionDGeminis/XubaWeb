import { Component, Input, OnInit, Signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SubastasService } from '../../services/subastas.service';
import { Subasta, Usuario } from '../../models/subasta.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../services/shared.service';
import { LoaderComponent } from '../loader/loader.component';
import { AuctionStatus } from '../../../enums/auction-estatus.enum';
import { AuctionClaveStatus } from '../../../enums/auction-estatus-cve.enum';
import { SafeUrlPipe } from "../../pipes/safeurl";
import { WinnerViewComponent } from "./views/winner-view/winner-view.component";
import { AnyuserViewComponent } from './views/anyuser-view/anyuser-view.component';
import { SellerViewComponent } from './views/seller-view/seller-view.component';
import { environment } from '../../environment/environment';
import { OpenPayService } from '../../services/openpay.service';
declare var OpenPay: any;

@Component({
  selector: 'app-auction-finished',
  imports: [CommonModule, FormsModule, LoaderComponent, SafeUrlPipe, WinnerViewComponent, AnyuserViewComponent, SellerViewComponent],
  templateUrl: './auction-finished.component.html',
  styleUrl: './auction-finished.component.css'
})
export class AuctionFinishedComponent implements OnInit{
  subasta!: Subasta;
  lista: Subasta[] = [];
  // usuario: Usuario | null = {} as Usuario;
  ganadorInfo: any;
  listaEstatus: any[] = [];
  loading: boolean = false;
  estatusPendientePago: string = AuctionClaveStatus.PendientePago;
  estatusPagado: string = AuctionClaveStatus.Pagado;
  estatusEnviado: string = AuctionClaveStatus.Enviado;
  tipoUsuario: string = '';
  public usuario!: Signal<Usuario|null>;
  public isLoggedIn!: Signal<boolean>;
  hasPermiso: boolean = false;
  showComprobante: boolean = false;
  direccionEntrega: any;
  // origen = '';
  direcciones: any[] = [];
  // // Estados de UI y datos
  // indiceActual = 0;
  // imagenActual = '';
  // tiempoVence = '00:00:00';
  // vencida = false;
  // valorApuesta = 0;
  // siguienteApuesta = 0;
  // estaSiguiendo = false;
  // mensajeFinal = '';
  // textoTruncado = false;

  // mostrarModal: boolean = false;
  // mostrarDetalles: boolean = false;
  // isModalOpen: boolean = false;

  // usuarioMayor = '';
  // estatus = '';
  // valorSubastaPersonalizada: number | null = null;

  // ganadoresLista: string[] = [];
  // ganadoresDetalles: { monto: string; usuario: string; fecha: string }[] = [];
  animatedClass = '';
  classComprobanteModal = '';
  tarjeta = {
    holder_name: '',
    holder_lastname: '',
    card_number: '',
    expiration_month: '',
    expiration_year: '',
    cvv2: '',
    mail:'',
    phone: '',
  };
  tarjetas: any[] = [];
  selectedCard: any = null;
  openModal: boolean = false;
  isModalOpen: any = {etiqueta: false};

  paqueteriaRequestModel: any = {
    plannedShippingDateAndTime: "2025-08-21T19:19:40 GMT+00:00",
    pickup: {
      "isRequested": false
    },
    productCode: "G",
    getRateEstimates: false,
    accounts: [
      {
        "number": "987283375",
        "typeCode": "shipper"
      }
    ],
    outputImageProperties: {
      "printerDPI": 300,
      "encodingFormat": "pdf",
      "imageOptions": [
        {
          "typeCode": "waybillDoc",
          "templateName": "ARCH_8x4",
          "isRequested": true,
          "hideAccountNumber": false,
          "numberOfCopies": 1
        },
        {
          "typeCode": "label",
          "templateName": "ECOM26_84_001",
          "isRequested": true
        }
      ],
      "splitTransportAndWaybillDocLabels": true,
      "allDocumentsInOneImage": false,
      "splitDocumentsByPages": true,
      "splitInvoiceAndReceipt": true,
      "receiptAndLabelsInOneImage": false
    },
    customerDetails: {
      //Quien ENVIA
      "shipperDetails": {
        "postalAddress": {
          "postalCode": "03100",
          "cityName": "Ciudad de Mexico",
          "countryCode": "MX",
          "addressLine1": "Av. Insurgentes Sur 1234",
          "addressLine2": "Colonia Del Valle",
          "countryName": "Mexico"
        },
        "contactInformation": {
          "email": "shipper_create_shipmentapi@dhltestmail.com",
          "phone": "4972463",
          "mobilePhone": "2563456227231",
          "companyName": "XUBA",
          "fullName": "Antonio Rodriguez"
        },
        "registrationNumbers": [
          {
            "typeCode": "VAT",
            "number": "244444911",
            "issuerCountryCode": "MX"
          }
        ],
        "typeCode": "business"
      },
      //Quien RECIBE
      "receiverDetails": {
        "postalAddress": {
          "postalCode": '',
          "cityName": "Ciudad Juarez",
          "countryCode": "MX",
          "addressLine1": "Calle Ignacio Mejía 1234",
          "addressLine2": "Colonia Centro",
          "countryName": "Mexico"
        },
        "contactInformation": {
          "email": "recipient_create_shipmentapi@dhltestmail.com",
          "phone": "1123123",
          "mobilePhone": "256345123",
          "companyName": "XUBA",
          "fullName": "Alejandro Sanchez"
        },
        "registrationNumbers": [
          {
            "typeCode": "VAT",
            "number": "12345678",
            "issuerCountryCode": "MX"
          }
        ],
        "typeCode": "business"
      }
    },
    content: {  
      "packages": [
        {
          "typeCode": "2BP",
          "weight": 0.296,
          "dimensions": {
            "length": 1,
            "width": 1,
            "height": 1
          }
        }
      ],
      "isCustomsDeclarable": false,
      "description": "Shipment Description",
      "incoterm": "DAP",
      "unitOfMeasurement": "metric"
    },
    getTransliteratedResponse: false,
    estimatedDeliveryDate: {
      "isRequested": false,
      "typeCode": "QDDC"
    },
    getAdditionalInformation: [
      {
        "typeCode": "pickupDetails",
        "isRequested": true
      }
    ]
  }
  infoUsuario: any;
  // infoSubasta: any;
  precioTotal: number = 0;
  precioComision: number = 0;
  precioEnvio: number = 0;
  openModalDireccion: boolean = false;
  tipoEnvioSeleccionado: any;
  listaTiposEnvio: any[] = [];
  cotizacionModel = {
    "codigoPostalOrigen": "32594",
    "ciudadOrigen": "ciudad juarez",
    "codigoPostalDestino": "11510",
    "ciudadDestino": "ciudad de mexico",
    "peso": 10,
    "logitud": 30,
    "ancho": 20,
    "altura": 15,
    "fechaEnvio": "2025-07-11T04:07:24.805Z"
  }
  textoLoading = '';
  // modeloComprobante = {
  //   estatus:'Completado',
  //   fecha:'2025-09-09',
  //   idTransaction:'dssdf123e134',
  //   metodoPago: 'Visa * ----123',
  //   cliente:'Freddy villegas',
  //   correo:'corretest@mail.com',
  //   ordenXuba:'AX-#4323-1',
  //   total:2500,
  //   subtotal:2300,
  //   envio:200,
  //   nombreArticulo:'test name art',
  //   idArticulo:323,
  //   descripcion:'sdfsd sdfsfsdf sdfasd',
  //   cantidad:1,
  //   noAutorizacion:'2344523'
  // };
  modeloComprobante = {
    estatus:'',
    fecha:'',
    idTransaction:'',
    metodoPago: '',
    cliente:'',
    correo:'',
    ordenXuba:'',
    total:0,
    subtotal:0,
    envio:0,
    nombreArticulo:'',
    idArticulo:0,
    descripcion:'',
    cantidad:1,
    noAutorizacion:''
  };
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
  descripcionCargo: string = '';
  metodoPagoDescripcion: string = '';
  listaSeguimiento: any[] = [];
  dataParams: any = null;
  constructor(private route: ActivatedRoute,private openPayService: OpenPayService,private ss: SharedService, private authService: AuthService, private subastasService: SubastasService, private router: Router ) { 
    //const dataParams: any  = this.route.snapshot.params;
    // this.usuario = this.authService.currentUser();
    this.usuario = this.authService.currentUser;
    this.isLoggedIn = computed(() => !!this.usuario());
    let dataParams: any = this.route.snapshot.params['permissionData'];
    let decoded = this.ss.decodeFromBase64(dataParams);
    // console.log('Informacion data terminado')
    // console.log(decoded)
    // console.log('parametro de url')
    // console.log(dataParams)
    if(decoded){
      // console.log(decoded)
      this.hasPermiso = true;
      let jsonData = JSON.parse(decoded);
      // this.getDatosSubasta(jsonData.idSubasta);
      this.getInitialData(jsonData.idSubasta);
      console.log(jsonData);
      // this.tipoUsuario = jsonData.tipoUsuario;
      // switch (jsonData.tipoUsuario) {
      //   case 'comprador':
      //       // this.getInitialData(jsonData.idSubasta);
      //       if(this.isLoggedIn()){
      //         // this.getInformacionUsuario(this.usuario()!.id);
      //         // this.getDireccionesEntrega(this.usuario()!.id, 'entrega');
      //         // this.getTarjetasUsuario(this.usuario()!.id);
      //       }
      //       this.hasPermiso = true;
      //       break;
      //   case 'vendedor':
      //       //Agregar validaciones y logica para validar el usuario
      //       // if(this.isLoggedIn()){
      //       //   this.checkUserPermissions(this.usuario()!.id, jsonData.idSubasta);
      //       // } else {
      //       //   this.hasPermiso = false;
      //       // }
      //       // this.getInitialData(jsonData.idSubasta);
      //       this.hasPermiso = true;
      //       break;
      //   default:
      //       // Handle default case
      //       break;
      // }
    } else {
      console.log('informacion de parametros no valida')
      this.hasPermiso = false;
    }
   
    // this.tipoUsuario = dataParams.tipoUsuario || '';
    // if(dataParams && dataParams.id){
    //   if(this.tipoUsuario !== '')
    //   this.getInitialData(dataParams.id);
    //   this.getInformacionGanador(dataParams.id);
    //   this.getHistorialEstatus(dataParams.id);
    // }
    // this.origen  = this.route.snapshot.paramMap.get('origen') || '';
    // console.log('Origen:', this.origen);
  }

  ngOnInit(): void {
    // OpenPay.setId('mz5jjyzabcb3zzpevo0l');
    // OpenPay.setApiKey('pk_f2da5530e74d4c7fbf292d886aba5e50');
    // OpenPay.setSandboxMode(true);
    OpenPay.setId(environment.openPayId);
      OpenPay.setApiKey(environment.openPayApiKey);
      OpenPay.setSandboxMode(environment.openPaySandBox);
    this.setDataShipper();
    // throw new Error('Method not implemented.');
    
    
    
  }

  getInitialData(IdSubasta: number){
    // this.getHistorialEstatus(IdSubasta);
    this.getDatosSubasta(IdSubasta);
    this.getInformacionGanador(IdSubasta);
   console.log(
  'postalAddress:',
  this.paqueteriaRequestModel.customerDetails.shipperDetails.postalAddress

);

  }

  probarGuia(){
    console.log("probando paqueteria544")
console.log(this.paqueteriaRequestModel)
this.generarGuiaDeEnvio();

  }

  getInformacionGanador(IdSubasta: number){
    this.loading = true;
    this.subastasService.GetInformacionSubastaTerminada(IdSubasta).subscribe({
      next: (response) => {
        console.log('informacion del ganador')
        console.log(response);
        this.ganadorInfo = response;
        this.loading = false;
        // if(this.ganadorInfo.numGuia && this.ganadorInfo.numGuia.trim() !== ''){
        //     this.GetSegumientoPaqueteria(this.ganadorInfo.numGuia);
        // }
        // this.GetSegumientoPaqueteria('5584773180');

      },
      error: (err) => {
        this.loading = false;
        this.ss.showNotification('error', 'Error al obtener informacion del ganador');
        console.error('Error fetching winner information:', err);
      }
    });
  }

  async calcularPrecios(){
    // this.precioComision = 12.00;
    this.precioEnvio = 0;
    // this.precioTotal = this.subasta.apuesta + this.precioComision + this.precioEnvio;
    let modeloCotizar = this.getCotizarModelFormat();
    console.log('datos cotizar: ', modeloCotizar);
    this.loading = true;
    this.subastasService.cotizarEnvio(modeloCotizar).subscribe({
      next: (data: any) => {
        this.loading = false;
        this.listaTiposEnvio = data.filter( (x: any) => x.codigoProducto === 'G' || x.codigoProducto === 'N');
        // console.log('Cotización exitosa:', this.listaTiposEnvio);
        // this.listaTiposEnvio[0].precio += 100;
        this.tipoEnvioSeleccionado = this.listaTiposEnvio[0];
        this.precioEnvio = this.tipoEnvioSeleccionado.precio
        this.precioTotal = this.subasta.apuesta + this.precioComision + this.precioEnvio;
      },
      error: (err) => {
        this.loading = false;

        console.error('Error en la cotización:', err);
      }

    })
    // this.precioTotal = 
    // let re = await new Promise<any>((resolve, reject) => {
    //   this.subastasService.getSeguidores(2).subscribe({
    //     next: (data) => resolve(data),
    //     error: (err) => reject(err)
    //   })
    // });
    // console.log('datos traidos con promise')
    // console.log(re)
    // this.precioTotal = this.precio + this.precioComision;
  }

  changeTipoEnvio(){
    this.precioEnvio = this.tipoEnvioSeleccionado?.precio || 0;
    this.precioTotal = this.subasta.apuesta + this.precioComision + this.precioEnvio;
  }

  changeDireccion(){
    this.calcularPrecios();
  }

  getPrecioEnvio(): number {
    return this.precioEnvio;
  }

  getInformacionUsuario(idUsuario: number){
    this.authService.consultarDatosUsuario(idUsuario).subscribe({
      next: (response: any) => {
        this.infoUsuario = response;
          // console.log(response);
      },
      error: (err: any) => {
        console.error('Error fetching user information:', err);
      }
    });
  }

  setComprobanteModel(){
    let clienteNombre = `${this.ganadorInfo?.nombre} ${this.ganadorInfo?.apellido}`
    
    this.modeloComprobante = {
      estatus:'',
      fecha:'',
      idTransaction:'',
      metodoPago: '',
      cliente: clienteNombre ,
      correo:'',
      ordenXuba:`#AX-${this.subasta.id}-${this.ganadorInfo.idComprador}`,
      total:this.precioTotal,
      subtotal:this.ganadorInfo.apuesta,
      envio:this.precioEnvio,
      nombreArticulo:`Item#${this.subasta.id}-${this.subasta.caption}`,
      idArticulo:this.subasta.id,
      descripcion: this.descripcionCargo,
      cantidad:1,
      noAutorizacion: '',
    };
  }

  // getInformacionSubasta(IdSubasta: number){
  //   this.subastasService.getAuctionById(IdSubasta).subscribe(sub => {
  //     this.subasta = sub;
  //     console.log(this.subasta);
  //      // 2. Luego cargar la lista
  //     //  let tipo: 'porvencer' | 'premium' | 'todas' = 'todas';
  //     //  if (this.origen === 'Subastas Premium') tipo = 'premium';
  //     //  else if (this.origen === 'Subastas Express') tipo = 'porvencer';
   
  //     //  console.log('Tipo de subastas a consultar:', tipo);
  //     //  this.subastasService.getAuctions(tipo).subscribe(list => {
  //     //    console.log('Lista recibida:', list);
  //     //    this.lista = list;
   
  //        // 3. Ya tienes subasta y lista. Ahora sí puedes usar todo
  //       //  this.indiceActual  = this.lista.findIndex(s => s.id === this.subasta.id);
  //       //  this.imagenActual  = this.subasta.url;
  //       //  this.tiempoVence   = this.subasta.tiempoVence ?? '00:00:00';
         
  //       //  this.iniciarTemporizador();
  //       //  this.verificarSiSiguiendo();
  //       //  this.conectarSignalR();
  //     //  });
  //    }); 
  // }

  getDatosSubasta(id: number){
    this.loading = true;
    this.subastasService.getAuctionById(id).subscribe({
      next: (subasta) => {
        this.subasta = subasta;
        // console.log('Datos de la subasta', subasta);
        if(this.isLoggedIn()){
          // this.getDireccionesEntrega(this.usuario()!.id, 'entrega');
        }
       
        // let tiempoVence = subasta.tiempoVence?? '00:00:00';
        // let segundos: number, minutos: number, horas: number;
        // let _tiempoRestante = tiempoVence.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
        // console.log(_tiempoRestante);
        this.loading = false;
        // if(_tiempoRestante > 0){
        //   this.router.navigate(['/subasta', subasta.id, 'SubastasPremium']);
        // } else {
        //   let dataParams = JSON.stringify({ idSubasta: id, tipoUsuario:'comprador'});
        //   let encoded = this.ss.encodeToBase64(dataParams);
        //   this.router.navigate(['/subasta-terminada', encoded]);
        // }
      },
      error: (err) => {
        console.error('Error fetching auction details:', err);
        this.loading = false;
      }
    })
  }

  validateData(){

  }

  moveToProfile() {
    this.router.navigate(['/profile']);
  }

  closeModalDireccion(){
    this.openModalDireccion = false;
  }

  fOpenModalDireccion(){
    this.openModalDireccion = true;
  }

  getCotizarModelFormat(){
    // console.log('intentar crear modelo cotizacion')
    // console.log(this.subasta.direccion)
    var cotizacion = {
      "codigoPostalOrigen": this.subasta.direccion.codigoPostal,
      "ciudadOrigen": this.subasta.direccion.municipio,
      "codigoPostalDestino": this.direccionEntrega.codigoPostal,
      "ciudadDestino": this.direccionEntrega.municipio,
      "peso": this.subasta.peso,
      "logitud": this.subasta.largo,
      "ancho": this.subasta.profundidad,
      "altura": this.subasta.ancho,
      "fechaEnvio": this.getCotizarFecha()
    }
    return cotizacion;
  }

  createPaqueteriaModel(){
    // const hoy = new Date();
    // const manana = new Date(hoy);
    // manana.setDate(hoy.getDate() + 4);
    
    this.paqueteriaRequestModel.idsubasta = this.subasta.id;
    this.paqueteriaRequestModel.plannedShippingDateAndTime = this.getCorrectDateFormat()//"2025-08-23T19:19:40 GMT+00:00"
    this.paqueteriaRequestModel.content = {
      "packages": [
          {
            "typeCode": "2BP",
            "weight": this.subasta.peso,
            "dimensions": {
              "length": this.subasta.largo,
              "width": this.subasta.profundidad,
              "height": this.subasta.ancho
            }
          }
        ],
        "isCustomsDeclarable": false,
        "description": "Producto: " + this.subasta.caption,
        "incoterm": "DAP",
        "unitOfMeasurement": "metric"
    }
    // this.paqueteriaRequestModel.content = {
    //   "packages": [
    //       {
    //         "typeCode": "2BP",
    //         "weight": this.infoSubasta.peso,
    //         "dimensions": {
    //           "length": this.infoSubasta.largo,
    //           "width": this.infoSubasta.profundidad,
    //           "height": this.infoSubasta.ancho
    //         }
    //       }
    //     ],
    //     "isCustomsDeclarable": false,
    //     "description": "Producto: " + this.infoSubasta.caption,
    //     "incoterm": "DAP",
    //     "unitOfMeasurement": "metric"
    // }
    console.log('musuarios:', this.subasta.musuarios);
    console.log('nombre:', this.subasta.musuarios?.nombre);
    console.log('apellido:', this.subasta.musuarios?.apellido);
    this.paqueteriaRequestModel.customerDetails.shipperDetails = {
      "postalAddress": {
            "postalCode": this.subasta.direccion.codigoPostal,
            "cityName": this.subasta.direccion.municipio,
            "countryCode": "MX",
            "addressLine1": `${this.subasta.direccion.calle} ${this.subasta.direccion.numeroExt} ${this.subasta.direccion.numeroInt}`,
            "addressLine2": this.subasta.direccion.colonia,
            "countryName": "Mexico"
      },
      "contactInformation": {
        "email": this.subasta.direccion.correo,
        "phone": this.subasta.direccion.telefono,
        "mobilePhone": "2563456227231",
        "companyName": "XUBA",
        "fullName": `${this.subasta.musuarios.nombre} ${this.subasta.musuarios.apellido}`
      },
      "registrationNumbers": [
        {
          "typeCode": "VAT",
          "number": "244444911",
          "issuerCountryCode": "MX"
        }
      ],
      "typeCode": "business"
    }
    this.paqueteriaRequestModel.customerDetails.receiverDetails = {
      "postalAddress": {
        "postalCode": this.direccionEntrega.codigoPostal,
        "cityName": this.direccionEntrega.municipio,
        "countryCode": "MX",
        "addressLine1": `${this.direccionEntrega.calle} ${this.direccionEntrega.numeroExt} ${this.direccionEntrega.numeroInt}`,
        "addressLine2": this.direccionEntrega.colonia,
        "countryName": "Mexico"
      },
      "contactInformation": {
        "email": this.infoUsuario.correo,
        "phone": this.infoUsuario.telefono,
        "mobilePhone": this.infoUsuario.telefono,
        "companyName": "XUBA",
        "fullName": `${this.infoUsuario.nombre} ${this.infoUsuario.apellido}`
      },
      "registrationNumbers": [
        {
          "typeCode": "VAT",
          "number": "12345678",
          "issuerCountryCode": "MX"
        }
      ],
      "typeCode": "business"
    }
    console.log(this.paqueteriaRequestModel)
  }

  getCorrectDateFormat(): string{
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    let fecha = '';
    const yyyy = tomorrow.getUTCFullYear();
    const mm = String(tomorrow.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getUTCDate()).padStart(2, '0');
    const hh = String(tomorrow.getUTCHours()).padStart(2, '0');
    const mi = String(tomorrow.getUTCMinutes()).padStart(2, '0');
    const ss = String(tomorrow.getUTCSeconds()).padStart(2, '0');
    fecha = `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss} GMT+00:00`;
    return fecha;
  }

  getCotizarFecha(){
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return today.toISOString();
  }

  

  setDataShipper(){
    this.paqueteriaRequestModel.customerDetails.shipperDetails = {
      "postalAddress": {
        "postalCode": "03100",
        "cityName": "Ciudad de Mexico",
        "countryCode": "MX",
        "addressLine1": "Av. Insurgentes Sur 1234",
        "addressLine2": "Colonia Del Valle",
        "countryName": "Mexico"
      },
      "contactInformation": {
        "email": "shipper_create_shipmentapi@dhltestmail.com",
        "phone": "4972463",
        "mobilePhone": "2563456227231",
        "companyName": "XUBA",
        "fullName": "Antonio Rodriguez"
      },
      "registrationNumbers": [
        {
          "typeCode": "VAT",
          "number": "244444911",
          "issuerCountryCode": "MX"
        }
      ],
      "typeCode": "business"
    }
  }

  async getTarjetasUsuario(idUsuario: number){
    this.tarjetas = await this.ss.loadLocalData('Cq@3K$K$RD') ?? []; 
    if(this.tarjetas.length > 0){
      this.tarjetas = this.tarjetas.filter(x => x.id_user === idUsuario);
    }
    console.log('L487: obtener tarjetas ')
    console.log(this.tarjetas)
  }

  changeTarjetaSeleccionada(){
    Object.assign(this.tarjeta, this.selectedCard);
  }

  checkUserPermissions(IdUsuario: number, IdSubasta: number) {
    this.subastasService.getAuctionById(IdSubasta).subscribe({
      next: (auction) => {
        if(auction.musuarios.id === IdUsuario) {
          this.hasPermiso = true;
          this.getInitialData(IdSubasta);
        } else {
          // console.log('informacion valida, pero no es usuario vendedor')
          this.hasPermiso = false;
        }
      },
      error: (error) => {
        this.hasPermiso = false;
      }
    }); 
  }

  

  isInMinimumStatus(clave: string, minCve: string){
    let current = this.ordenEstatusValidaiones[clave];
    let minimo = this.ordenEstatusValidaiones[minCve];
    return current >= minimo;
  }

  isInMinimumStatusTo(clave: string, minCve: string, to: string){
    let current = this.ordenEstatusValidaiones[clave];
    let minimo = this.ordenEstatusValidaiones[minCve];
    let toStatus = this.ordenEstatusValidaiones[to];
    return current >= minimo && current < toStatus;
  }


  GetSegumientoPaqueteria(noGuia: string){
    this.subastasService.GetPaqueteriaSeguimiento(noGuia).subscribe((seguimiento: any) => {
      this.listaSeguimiento = seguimiento.events;

        console.log(this.listaSeguimiento);
    });
  }

  getHistorialEstatus(IdSubasta: number){
    this.subastasService.GetHistorialEstatusSubasta(IdSubasta).subscribe((historial: any) => {
      console.log(historial);
      this.listaEstatus = historial;
    });
  }

  getDireccionesEntrega(idUsuario: number, tipo: string){
    this.subastasService.GetDireccionesUsuario(idUsuario, tipo).subscribe({
      next: (response: any) => {
          // console.log(response);
          this.direcciones = response;
          this.direccionEntrega = this.direcciones.length > 0 ? this.direcciones.find((direccion: any) => direccion.predeterminada) : null;
          if(this.direccionEntrega && this.direccionEntrega !== null && this.direccionEntrega !== undefined){
            this.calcularPrecios();
          }
      },
      error: (error: any) => {
          console.error('Error fetching addresses:', error);
      }
    }
    );
  }

  toDateFormat(fechaISO: string){
    const fecha = new Date(fechaISO);

    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Mes empieza en 0
    const anio = fecha.getFullYear();
  
    const hora = String(fecha.getHours()).padStart(2, '0');
    const minuto = String(fecha.getMinutes()).padStart(2, '0');
  
    return `${dia}/${mes}/${anio} ${hora}:${minuto}`;
  }

  procesarPago(){
    if(!this.ss.isValidModel(this.tarjeta, [])){
      this.ss.showNotification('error', 'Datos faltantes');
      return;
    } else {
      if(+this.tarjeta.expiration_month > 12){
        this.ss.showNotification('error', 'El mes de expiración de la tarjeta no es válido.', 3000);
        return;
      }
      // console.log(this.tarjeta)
      this.tokenizarTarjeta();
    }
    // this.loading = true;
  }
  //http://localhost:4200/subasta-terminada/eyJpZFN1YmFzdGEiOjU1MzUsInRpcG9Vc3VhcmlvIjoiY29tcHJhZG9yIn0%3D
 
  tokenizarTarjeta() {
    this.loading = true;
    this.textoLoading = 'Procesando tu pago...'
    this.setComprobanteModel();
    const dataToken = {
      holder_name: this.tarjeta.holder_name,
      card_number: this.tarjeta.card_number,
      expiration_month: this.tarjeta.expiration_month,
      expiration_year: this.tarjeta.expiration_year,
      cvv2: this.tarjeta.cvv2
    };
    console.log('Tokenizing card with data:', dataToken);
    OpenPay.token.create(dataToken,
      (response: any) => {
        const token_id = response.data.id;
        // this.loading = false;
        console.log('tarketa okenizada:')
        console.log(response);
        let cardnumber = response.data.card.card_number.slice(-4);
        this.metodoPagoDescripcion = `Tarjeta • ${response.data.card.brand} • **** ${cardnumber}`;
        this.modeloComprobante.metodoPago = this.metodoPagoDescripcion;
        // if(response.data.card.type === 'credit'){
        //   this.loading = false;
        //   this.ss.showNotification('error', 'Solo se permiten tarjetas de debito', 3500);
        //   return;
        // } else {
          this.GenerarCargo(token_id);
        // }

      },
      (error: any) => {
        this.loading = false;
        let res_error = error.data;
        let errorMessage = '';
        switch(res_error.description) {
            case 'card_number length is invalid':
                errorMessage = 'El número de tarjeta tiene una longitud inválida.';
                break;
            case 'cvv2 length must be 3 digits':
                errorMessage = 'El CVV2 debe tener 3 dígitos.';
                break;
            case 'cvv2 length must be 4 digits':
                errorMessage = 'El CVV2 debe tener 4 dígitos.';
                break;
            case 'The expiration date has expired':
                errorMessage = 'La fecha de expiración es invalida.';
                break;
            case 'The card number verification digit is invalid':
                errorMessage = 'El numero de tarjeta es invalido.';
                break;
            default:
                errorMessage = 'No se ha podido generar el cargo [stp1-tkn]';
        }
        this.ss.showNotification('error', errorMessage, 3500);

        console.error('Error al tokenizar:', error);
      }
    );
  }



  GenerarCargo(tokenId: string){
    let userData = this.authService.getUserData();
    const dataCharge  = {
      'token': tokenId,
      'amount': this.subasta.apuesta,
      'description': 'Pago subasta GANADA-' + userData.id + '-'+this.subasta.caption,
      'name':this.tarjeta.holder_name,       
      'lastName':this.tarjeta.holder_lastname,       
      'email':this.tarjeta.mail,
      'phone':this.tarjeta.phone,       
    };
 
    console.log(dataCharge)
    this.openPayService.GenerarCargo(dataCharge).subscribe({
      next: (response: any) => {
        this.loading = false;
        console.log('CARGO COMPLETADO')
        console.log(response);
        let res = JSON.parse(response.message);
        console.log(res);
        if(res.error_code){
          switch(res.error_code) { 
            case 1001: 
              this.ss.showNotification('error', 'El correo proporcionado es inválido.', 3500);
              break;
            case 3001: 
              this.ss.showNotification('error', 'La tarjeta fue declinada.', 3500);
              break;
            case 3002: 
              this.ss.showNotification('error', 'La tarjeta ha expirado.', 3500);
              break;
            case 3003: 
              this.ss.showNotification('error', 'La tarjeta no tiene fondos suficientes.', 3500);
              // this.ss.showNotification('error', 'La tarjeta fue declinada.', 3500);
              break;
            case 3004: 
              this.ss.showNotification('error', 'La tarjeta ha sido identificada como una tarjeta robada.', 3500);
              // this.ss.showNotification('error', 'La tarjeta fue declinada.', 3500);
              break;
            case 3005: 
              this.ss.showNotification('error', 'La tarjeta ha sido rechazada por el sistema antifraudes.', 3500);
              break;
            default: 
            this.ss.showNotification('error', 'Se produjo un error desconocido ['+res.error_code +']', 3500);
              break;
          }
        } else {
          let estatusCargo = '';
          switch(res.status){
            case 'completed': estatusCargo = 'Completado';
              break;
            default: estatusCargo = 'NoDisponible';
              break;
          }
          this.modeloComprobante.noAutorizacion = res.authorization;
          this.modeloComprobante.idTransaction = res.id;
          this.modeloComprobante.fecha = res.operation_date;
          this.modeloComprobante.estatus = estatusCargo;
          this.modeloComprobante.correo = res.customer.email;
          if(res.id && res.status && res.status === 'completed'){
            this.CambiarEstatusSubasta(this.subasta.id, AuctionStatus.Pagado);
          } else { 
            this.ss.showNotification('warning', 'Pago procesado con estatus no completado');
            return;          
          }
        }
       
       

        

       
      },
      error: (error: any) => {
        console.log(error);
        this.loading = false;
        this.ss.showNotification('error','Hubo un problema al generar el cargo');

        console.error('Error al generar cargo:', error);
      }
        // this.generarCargoSuccess(response);
    });

  }

  //12 = Pendiente pago = 
  CambiarEstatusSubasta(idSubasta: number, nuevoEstatus: number) {
    this.subastasService.actualizarEstatusSubasta(idSubasta, nuevoEstatus).subscribe({
      next: (response) => {
        this.loading = false;
        // this.closeModal();
        // this.getInitialData(this.subasta.id);
        console.log('Estatus actualizado:', response);
        this.generarGuiaDeEnvio();
      },  
      error: (error) => {
        this.ss.showNotification('error','Hubo un problema al cambiar estatus');
        this.loading = false;
        // this.showComprobante = true;
        // this.openComprobante();
        setTimeout(() => { this.openComprobante(); }, 350);
        console.error('Error al actualizar estatus:', error);
      }
    });
  }

  generarGuiaDeEnvio(){
    this.textoLoading = 'Generando guia...'
    this.loading = true;
    this.createPaqueteriaModel();
    setTimeout(() => {
      console.log(this.paqueteriaRequestModel);
      console.log(JSON.stringify(this.paqueteriaRequestModel));
      console.log('intentar generar guia de envio');
      this.subastasService.generarGuiaPaqueteria(this.paqueteriaRequestModel).subscribe({
        next: (response) => {
          this.loading = false;
          this.closeModal();
          this.getInitialData(this.subasta.id);
          console.log('Guía de envío generada exitosamente:', response);
          this.ss.showNotification('success','Pago procesado correctamente');
          // this.showComprobante = true;
          // this.openComprobante();
          setTimeout(() => { this.openComprobante(); }, 350);
        },
        error: (error) => {
          this.loading = false;
          this.ss.showNotification('error','Hubo un problema al generar la guia de envio');
          // this.showComprobante = true;
          // this.openComprobante();
          setTimeout(() => { this.openComprobante(); }, 350);
          console.error('Error al generar la guía de envío:', error.error);
        }
      });
    }, 200);
    
  }

  onContentClick(event: MouseEvent) {
    event.stopPropagation();
  }

  closeModal(){
    if(this.loading) return;
    this.openModal = false;
  }

  openModalPago(){
    this.openModal = true;
  }

  // onInput(event: any) {
  //   // Solo deja los dígitos del 0 al 9
  //   const soloNumeros = event.target.value.replace(/[^0-9]/g, '');
  //   this.tarjeta.card_number = soloNumeros;
  //   event.target.value = soloNumeros; // Actualiza el input si el usuario pegó algo no numérico
  // }

  onInput(event: any, atributo: any, fn?: (value: any) => void) {
    const soloNumeros = event.target.value.replace(/[^0-9]/g, '');
    atributo = soloNumeros;
    event.target.value = soloNumeros; 
    fn?.(soloNumeros);
    // Actualiza el input si el usuario pegó algo no numérico
  }



  // initPaqueteriaModel(){
  //   this.paqueteriaRequestModel = {
  //     plannedShippingDateAndTime: "2025-08-21T19:19:40 GMT+00:00",
  //     pickup: {
  //       "isRequested": false
  //     },
  //     productCode: "G",
  //     getRateEstimates: false,
  //     accounts: [
  //       {
  //         "number": "987283375",
  //         "typeCode": "shipper"
  //       }
  //     ],
  //     outputImageProperties: {
  //       "printerDPI": 300,
  //       "encodingFormat": "pdf",
  //       "imageOptions": [
  //         {
  //           "typeCode": "waybillDoc",
  //           "templateName": "ARCH_8x4",
  //           "isRequested": true,
  //           "hideAccountNumber": false,
  //           "numberOfCopies": 1
  //         },
  //         {
  //           "typeCode": "label",
  //           "templateName": "ECOM26_84_001",
  //           "isRequested": true
  //         }
  //       ],
  //       "splitTransportAndWaybillDocLabels": true,
  //       "allDocumentsInOneImage": false,
  //       "splitDocumentsByPages": true,
  //       "splitInvoiceAndReceipt": true,
  //       "receiptAndLabelsInOneImage": false
  //     },
  //     customerDetails: {
  //       //Quien ENVIA
  //       "shipperDetails": {
  //         "postalAddress": {
  //           "postalCode": "03100",
  //           "cityName": "Ciudad de Mexico",
  //           "countryCode": "MX",
  //           "addressLine1": "Av. Insurgentes Sur 1234",
  //           "addressLine2": "Colonia Del Valle",
  //           "countryName": "Mexico"
  //         },
  //         "contactInformation": {
  //           "email": "shipper_create_shipmentapi@dhltestmail.com",
  //           "phone": "4972463",
  //           "mobilePhone": "2563456227231",
  //           "companyName": "XUBA",
  //           "fullName": "Antonio Rodriguez"
  //         },
  //         "registrationNumbers": [
  //           {
  //             "typeCode": "VAT",
  //             "number": "244444911",
  //             "issuerCountryCode": "MX"
  //           }
  //         ],
  //         "typeCode": "business"
  //       },
  //       //Quien RECIBE
  //       "receiverDetails": {
  //         "postalAddress": {
  //           "postalCode": '',
  //           "cityName": "Ciudad Juarez",
  //           "countryCode": "MX",
  //           "addressLine1": "Calle Ignacio Mejía 1234",
  //           "addressLine2": "Colonia Centro",
  //           "countryName": "Mexico"
  //         },
  //         "contactInformation": {
  //           "email": "recipient_create_shipmentapi@dhltestmail.com",
  //           "phone": "1123123",
  //           "mobilePhone": "256345123",
  //           "companyName": "XUBA",
  //           "fullName": "Alejandro Sanchez"
  //         },
  //         "registrationNumbers": [
  //           {
  //             "typeCode": "VAT",
  //             "number": "12345678",
  //             "issuerCountryCode": "MX"
  //           }
  //         ],
  //         "typeCode": "business"
  //       }
  //     },
  //     content: {  
  //       "packages": [
  //         {
  //           "typeCode": "2BP",
  //           "weight": 0.296,
  //           "dimensions": {
  //             "length": 1,
  //             "width": 1,
  //             "height": 1
  //           }
  //         }
  //       ],
  //       "isCustomsDeclarable": false,
  //       "description": "Shipment Description",
  //       "incoterm": "DAP",
  //       "unitOfMeasurement": "metric"
  //     },
  //     getTransliteratedResponse: false,
  //     estimatedDeliveryDate: {
  //       "isRequested": false,
  //       "typeCode": "QDDC"
  //     },
  //     getAdditionalInformation: [
  //       {
  //         "typeCode": "pickupDetails",
  //         "isRequested": true
  //       }
  //     ]
  //   }
  // }

  async print(){
    //   console.log('Printing ticket...')
    //   setTimeout(() => {
    //    this.ss.ImprimirTicket();
    //  }, 250);
    try {
      await this.ss.captureAndPrintInline('printContainer', {
        scale: 2,                 // aumenta resolución (2-3 recomendado)
        backgroundColor: '#ffffff', // fuerza fondo blanco si tu comprobante tiene color de fondo
        fileName: undefined       // o 'comprobante_tr_ABC123.png' si quieres descargar
      });
    } catch (err: any) {
      this.ss.showNotification('error','Error al intentar imprimir\n' + err.toString())
      console.error('Error al capturar/imprimir:', err);
    }
  }

  async downloadComprobante(){
    try {
        await this.ss.captureAndDownloadPdf('printContainer', {
            filename: 'comprobante.pdf',
            scale: 2,
            backgroundColor: '#ffffff',
            orientation: 'p',
            format: 'a4',
            marginMm: 10
        });
    } catch (err: any) {
        this.ss.showNotification('error', 'Error al intentar descargar el comprobante\n' + err.toString());
        console.error('Error al capturar')
    }
  }

  toCurrency(valor: number): string {
    return this.ss.toCurrency(valor);
  }

  closeComprobante() {
    this.classComprobanteModal = 'animate__zoomOut';
    setTimeout(() => {
      this.showComprobante = false;
    }, 250);
  }

  openComprobante(){
    this.classComprobanteModal = 'animate__zoomIn';
    this.showComprobante = true;
  }

  setOpenModal(modalName: string){
    this.isModalOpen[modalName] = true;
  }
  setCloseModal(modalName: string){
    this.isModalOpen[modalName] = false;
  }
  
  async downloadPdf(){
    try {
      const timestamp = Date.now();
      const filename = `guide_label-${this.subasta.id}-${timestamp}.pdf`; 
      const resp = await fetch(this.subasta.urlGuia, { credentials: 'same-origin' }); // o mode:'cors' según sea necesario
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
}
