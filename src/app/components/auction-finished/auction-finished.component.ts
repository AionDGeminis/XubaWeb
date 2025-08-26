import { Component, OnInit, Signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SubastasService } from '../../services/subastas.service';
import { Subasta, Usuario } from '../../models/subasta.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../services/shared.service';
import { LoaderComponent } from '../loader/loader.component';
import { AuctionStatus } from '../../../enums/auction-estatus.enum';
import { AuctionClaveStatus } from '../../../enums/auction-estatus-cve.enum';
declare var OpenPay: any;

@Component({
  selector: 'app-auction-finished',
  imports: [CommonModule, FormsModule, LoaderComponent],
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
  infoSubasta: any;
  precioTotal: number = 0;
  precioComision: number = 0;
  precioEnvio: number = 0;
  openModalDireccion: boolean = false;

  constructor(private route: ActivatedRoute,private ss: SharedService, private authService: AuthService, private subastasService: SubastasService ) { 
    //const dataParams: any  = this.route.snapshot.params;
    // this.usuario = this.authService.currentUser();
    this.usuario = this.authService.currentUser;
    this.isLoggedIn = computed(() => !!this.usuario());
    let dataParams: any = this.route.snapshot.params['permissionData'];
    let decoded = this.ss.decodeFromBase64(dataParams);
    console.log('Informacion data terminado')
    console.log(decoded)
    if(decoded){
      console.log(decoded)
      let jsonData = JSON.parse(decoded);
      this.getDatosSubasta(jsonData.idSubasta);
      console.log(jsonData);
      this.tipoUsuario = jsonData.tipoUsuario;
      switch (jsonData.tipoUsuario) {
        case 'comprador':
            this.getInitialData(jsonData.idSubasta);
            if(this.isLoggedIn()){
              this.getInformacionUsuario(this.usuario()!.id);
              this.getDireccionesEntrega(this.usuario()!.id, 'entrega');
              this.getTarjetasUsuario(this.usuario()!.id);
            }
            this.hasPermiso = true;
            break;
        case 'vendedor':
            //Agregar validaciones y logica para validar el usuario
            // if(this.isLoggedIn()){
            //   this.checkUserPermissions(this.usuario()!.id, jsonData.idSubasta);
            // } else {
            //   this.hasPermiso = false;
            // }
            this.getInitialData(jsonData.idSubasta);
            this.hasPermiso = true;
            break;
        default:
            // Handle default case
            break;
      }
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

  async calcularPrecios(){
    this.precioComision = 12.00;
    this.precioEnvio = 120;
    this.precioTotal = this.subasta.apuesta + this.precioComision + this.precioEnvio;
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

  getPrecioEnvio(): number {
    return this.precioEnvio;
  }

  getInformacionUsuario(idUsuario: number){
    this.authService.consultarDatosUsuario(idUsuario).subscribe({
      next: (response: any) => {
        this.infoUsuario = response;
          console.log(response);
      },
      error: (err: any) => {
        console.error('Error fetching user information:', err);
      }
    });
  }

  getDatosSubasta(id: number){
    // this.loading = true;
    this.subastasService.getAuctionById(id).subscribe({
      next: (subasta) => {
        this.infoSubasta = subasta;
        console.log('Datos de la subasta', subasta);
        // let tiempoVence = subasta.tiempoVence?? '00:00:00';
        // let segundos: number, minutos: number, horas: number;
        // let _tiempoRestante = tiempoVence.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
        // console.log(_tiempoRestante);
        // this.loading = false;
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
        // this.loading = false;
      }
    })
  }

  validateData(){

  }

  closeModalDireccion(){
    this.openModalDireccion = false;
  }

  fOpenModalDireccion(){
    this.openModalDireccion = true;
  }

  initPaqueteriaModel(){
    this.paqueteriaRequestModel = {
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
  }

  createPaqueteriaModel(){
    // const hoy = new Date();
    // const manana = new Date(hoy);
    // manana.setDate(hoy.getDate() + 4);
    this.paqueteriaRequestModel.plannedShippingDateAndTime = this.getCorrectDateFormat()//"2025-08-23T19:19:40 GMT+00:00"
    this.paqueteriaRequestModel.content = {
      "packages": [
          {
            "typeCode": "2BP",
            "weight": 2,
            "dimensions": {
              "length": 15,
              "width": 6,
              "height": 20
            }
          }
        ],
        "isCustomsDeclarable": false,
        "description": "Producto: " + this.infoSubasta.caption,
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

  ngOnInit(): void {
    OpenPay.setId('mz5jjyzabcb3zzpevo0l');
    OpenPay.setApiKey('pk_f2da5530e74d4c7fbf292d886aba5e50');
    OpenPay.setSandboxMode(true);
    this.setDataShipper();
    // throw new Error('Method not implemented.');
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
    this.tarjeta = this.selectedCard;
  }

  checkUserPermissions(IdUsuario: number, IdSubasta: number) {
    this.subastasService.getAuctionById(IdSubasta).subscribe({
      next: (auction) => {
        if(auction.musuarios.id === IdUsuario) {
          this.hasPermiso = true;
          this.getInitialData(IdSubasta);
        } else {
          console.log('informacion valida, pero no es usuario vendedor')
          this.hasPermiso = false;
        }
      },
      error: (error) => {
        this.hasPermiso = false;
      }
    }); 
  }

  getInitialData(IdSubasta: number){
    this.getInformacionSubasta(IdSubasta);
    this.getInformacionGanador(IdSubasta);
    this.getHistorialEstatus(IdSubasta);
   }

  getInformacionSubasta(IdSubasta: number){
    this.subastasService.getAuctionById(IdSubasta).subscribe(sub => {
      this.subasta = sub;
      console.log(this.subasta);
       // 2. Luego cargar la lista
      //  let tipo: 'porvencer' | 'premium' | 'todas' = 'todas';
      //  if (this.origen === 'Subastas Premium') tipo = 'premium';
      //  else if (this.origen === 'Subastas Express') tipo = 'porvencer';
   
      //  console.log('Tipo de subastas a consultar:', tipo);
      //  this.subastasService.getAuctions(tipo).subscribe(list => {
      //    console.log('Lista recibida:', list);
      //    this.lista = list;
   
         // 3. Ya tienes subasta y lista. Ahora sí puedes usar todo
        //  this.indiceActual  = this.lista.findIndex(s => s.id === this.subasta.id);
        //  this.imagenActual  = this.subasta.url;
        //  this.tiempoVence   = this.subasta.tiempoVence ?? '00:00:00';
         
        //  this.iniciarTemporizador();
        //  this.verificarSiSiguiendo();
        //  this.conectarSignalR();
      //  });
     }); 
  }

  getInformacionGanador(IdSubasta: number){
   
    this.subastasService.GetInformacionSubastaTerminada(IdSubasta).subscribe({
      next: (response) => {
        console.log('informacion del ganador')
        console.log(response);
        this.ganadorInfo = response;
      },
      error: (err) => {
        console.error('Error fetching winner information:', err);
      }
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
          console.log(response);
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

  procesarPago(){
    if(!this.ss.isValidModel(this.tarjeta, [])){
      this.ss.showNotification('error', 'Datos faltantes');
      return;
    } else {
      console.log(this.tarjeta)
      this.tokenizarTarjeta();
    }
    // this.generarGuiaDeEnvio();
  //  console.log(this.direccionEntrega);
  //  console.log(this.usuario())
  }
  
  tokenizarTarjeta() {
    this.loading = true;
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
        this.GenerarCargo(token_id);
      },
      (error: any) => {
        this.loading = false;
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
    this.subastasService.GenerarCargoSubastaPremium(dataCharge).subscribe({
      next: (response: any) => {
        //this.loading = false;
        console.log(response);
        let res = JSON.parse(response.message);
        console.log(res);
        if(res.id && res.status && res.status === 'completed'){
          this.CambiarEstatusSubasta(this.subasta.id, AuctionStatus.Pagado);
        } else {
          this.loading = false;
        }
      },
      error: (error: any) => {
        this.loading = false;
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
        this.closeModal();
        this.getInitialData(this.subasta.id);
        console.log('Estatus actualizado:', response);
        this.generarGuiaDeEnvio();
      },  
      error: (error) => {
        console.error('Error al actualizar estatus:', error);
      }
    });
  }

  generarGuiaDeEnvio(){
    this.createPaqueteriaModel();
    setTimeout(() => {
      console.log(this.paqueteriaRequestModel);
      console.log(JSON.stringify(this.paqueteriaRequestModel));
      console.log('intentar generar guia de envio');
      this.subastasService.generarGuiaPaqueteria(this.paqueteriaRequestModel).subscribe({
        next: (response) => {
          console.log('Guía de envío generada exitosamente:', response);
        },
        error: (error) => {
          console.error('Error al generar la guía de envío:', error);
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
}
