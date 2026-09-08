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
export class AuctionFinishedComponent implements OnInit {
  subasta!: Subasta;
  lista: Subasta[] = [];
  idSubasta: number = -1;
  // usuario: Usuario | null = {} as Usuario;
  ganadorInfo: any;
  listaEstatus: any[] = [];
  loading: boolean = false;
  estatusPendientePago: string = AuctionClaveStatus.PendientePago;
  estatusPagado: string = AuctionClaveStatus.Pagado;
  estatusEnviado: string = AuctionClaveStatus.Enviado;
  tipoUsuario: string = '';
  public usuario!: Signal<Usuario | null>;
  public isLoggedIn!: Signal<boolean>;
  hasPermiso: boolean = false;
  showComprobante: boolean = false;
  direccionEntrega: any;
  vendedor: any
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
    mail: '',
    phone: '',
  };
  tarjetas: any[] = [];
  selectedCard: any = null;
  openModal: boolean = false;
  isModalOpen: any = { etiqueta: false };

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
          // "fullName": "Antonio Rodriguez"
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
    estatus: '',
    fecha: '',
    idTransaction: '',
    metodoPago: '',
    cliente: '',
    correo: '',
    ordenXuba: '',
    total: 0,
    subtotal: 0,
    envio: 0,
    nombreArticulo: '',
    idArticulo: 0,
    descripcion: '',
    cantidad: 1,
    noAutorizacion: ''
  };
  ordenEstatusValidaiones: any = {
    SST: 1,
    ACT: 2,
    FIN: 3,
    PGA: 4,
    RGA: 5,
    AGA: 6,
    PSI: 7,
    ASI: 8,
    RSI: 9,
    NEF: 10,
    PDO: 11,
    PTP: 12,
    PEV: 13,
    ENV: 14,
    REC: 15
  };
  descripcionCargo: string = '';
  metodoPagoDescripcion: string = '';
  listaSeguimiento: any[] = [];
  dataParams: any = null;
  constructor(private route: ActivatedRoute, private openPayService: OpenPayService, private ss: SharedService, private authService: AuthService, private subastasService: SubastasService, private router: Router) {
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
    if (decoded) {
      // console.log(decoded)
      this.hasPermiso = true;
      let jsonData = JSON.parse(decoded);
      console.log(jsonData)
      this.idSubasta = jsonData.idSubasta;
      // this.getDatosSubasta(jsonData.idSubasta);

      //this.getInitialData(jsonData.idSubasta);

      //console.log(jsonData);
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
    // OpenPay.setId(environment.openPayId);
    // OpenPay.setApiKey(environment.openPayApiKey);
    // OpenPay.setSandboxMode(environment.openPaySandBox);
    //this.setDataShipper();
    // throw new Error('Method not implemented.');
    this.getInitialData(this.idSubasta);
  }

  getInitialData(IdSubasta: number) {
    this.getDatosSubasta(IdSubasta);
    this.getInformacionGanador(IdSubasta);
  }

  getDatosSubasta(id: number) {
    this.loading = true;
    // console.log(id)
    this.subastasService.getAuctionById(id).subscribe({
      next: (subasta) => {
        this.subasta = subasta;
        this.vendedor = subasta.musuarios;
        console.log(this.subasta);
        // console.log(this.vendedor);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching auction details:', err);
        this.loading = false;
      }
    })
  }

  getInformacionGanador(IdSubasta: number) {
    // console.log(IdSubasta)
    this.loading = true;
    this.subastasService.GetInformacionSubastaTerminada(IdSubasta).subscribe({
      next: (response) => {
        // console.log('informacion del ganador')
        // console.log(response);
        this.ganadorInfo = response;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.ss.showNotification('error', 'Error al obtener informacion del ganador');
        console.error('Error fetching winner information:', err);
      }
    });
  }

}
