import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, Signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subasta, Usuario } from '../../../../models/subasta.model';
import { CotizacionPaqueteriaModel } from '../../../../models/cotizacion-model';
import { SharedService } from '../../../../services/shared.service';
import { SubastasService } from '../../../../services/subastas.service';
import { AuthService } from '../../../../services/auth.service';
import { AuctionStatus } from '../../../../../enums/auction-estatus.enum';
import { LoaderComponent } from '../../../loader/loader.component';
import html2pdf from 'html2pdf.js';
import { SafeUrlPipe } from "../../../../pipes/safeurl";
import { SignalRChatService } from '../../../../services/signalrchat.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environment/environment';
import { FullscreenModalComponent } from "../../../modals/fullscreen-modal/fullscreen-modal.component";
import { OpenPayService } from '../../../../services/openpay.service';
declare var OpenPay: any;

@Component({
  selector: 'app-winner-view',
  imports: [CommonModule, FormsModule, LoaderComponent, SafeUrlPipe, FullscreenModalComponent],
  standalone: true,
  templateUrl: './winner-view.component.html',
  styleUrl: './winner-view.component.css'
})
export class WinnerViewComponent implements OnInit{
  @Input() subasta: Subasta | null = null;
  @Input() ganadorInfo: any | null = null;
  @Input() usuario!: Usuario | null;
  @Input() isLoggedIn!: Signal<boolean>;

  ordenEstatusValidaciones: any = { 
    SST:1,  ACT:2, FIN:3,  MNA:4,  PGA:5,
    RGA:5,  AGA:5, PSI:6,  ASI:6,  RSI:6,
    NEF:10, PDO:7, PTP:8,  PEV:0,  ENV:10,
    REC: 11
  };
  showComprobante: boolean = false;
  isModalOpen: any = {etiqueta: false, nuevaOferta: false, disputa: false, detalleReclamo:false, viewer: false};
  tipoEnvioSeleccionado: any;
  listaTiposEnvio: any[] = [];
  cotizarEnvioModel: CotizacionPaqueteriaModel | null = null;
  listaDireccionesEntrega: any[] = [];
  miDireccionEntrega: any;
  nuevaOfertaModel: any = {oferta: null, confirmarOferta: null}
  imagesPreview: string[] = [];
  imagesList: string[] = [];
  categoriaReclamo:any = null;

  // variables temporales ====================== 
  guiaEnvioRetorno: any = null;
  estatusEnvioRetorno: string = 'PEN';
  subestatus = 'GRP';
  paqueteriaRequestModel: any = {
    customerDetails: {}
  }
  listaOfertas = [500];
  loading: boolean = false;
  openModal: boolean = false;
  listaSeguimiento: any[] = [];
  listaHistorialEstatusProducto: any[] = [];
  textoLoading: string = '';
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
  infoUsuario: any;
  // infoSubasta: any;
  precioActualSubasta: number = 0;
  precioTotal: number = 0;
  precioComision: number = 0;
  precioEnvio: number = 0;
  openModalDireccion: boolean = false;
  descripcionCargo: string = '';
  metodoPagoDescripcion: string = '';
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
  selectedCard: any = {};
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
  informacionReclamo: any = {};
  currentImageIndex = 0;
  conversacion: any[] = [];
  // [{
  //   id:1,fecha: '10/10/2025 12:55',idUsuario:1, tipoUsuario:'C',mensaje:'Hola, recibí el producto pero tiene problemas. La pantalla está rayada y no enciende bien. Adjunto fotos.'},
  //   {id:2,fecha: '10/10/2025 12:55',idUsuario:2, tipoUsuario:'V',mensaje:'Hola, ¿podrías proporcionar más detalles sobre el problema? Gracias.'},
  //   {id:3,fecha: '10/10/2025 12:55',idUsuario:3, tipoUsuario:'A',mensaje:'Hola, estamos revisando tu caso. Te contactaremos pronto con una solución.'},
  //   {id:4,fecha: '10/10/2025 12:55',idUsuario:1, tipoUsuario:'C',mensaje:'Sigo sin recibir informacion'}]
  newReclamoMessage: string = '';
  newMessageClass = '';
  classNavigateImg = '';
  sendingMessage: boolean = false;
  idConexionChat: number = -1;
  terminosRevisados: boolean = false;
  aceptarTerminos: boolean = false;
  url3DS: string | null = null;
  dataParams: any = null;
  isNewCard: boolean = false;
  camposOmitirTarjeta: any = [
    'address','allows_charges','allows_payouts','bank_code','bank_name','','','','',
    '','','','','','',''
  ];
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  constructor(
    private ss: SharedService, 
    private subastasService: SubastasService,
    private authService: AuthService , 
    private router: Router,
    private route: ActivatedRoute,
    private openPayService: OpenPayService,
    private signalRChatService: SignalRChatService) {
      this.dataParams = this.route.snapshot.params['permissionData'];
      this.getInitialGuiaModel();

      // console.log('informacion params')
      // console.log(this.dataParams)
    // this.getInitialData();
  }

  ngOnInit(): void {
    // OpenPay.setId('mz5jjyzabcb3zzpevo0l');
    // OpenPay.setApiKey('pk_f2da5530e74d4c7fbf292d886aba5e50');
    // OpenPay.setSandboxMode(true);
    OpenPay.setId(environment.openPayId);
    OpenPay.setApiKey(environment.openPayApiKey);
    OpenPay.setSandboxMode(environment.openPaySandBox);
    // window.addEventListener('message', (event) => {
    //   if (event.data?.status) {
    //     this.handle3DSResult(event.data);
    //   }
    // });

    // console.log('informacion ganador fijo')
    // console.log(this.ganadorInfo)
    // if(this.ganadorInfo && this.ganadorInfo.numGuia && this.ganadorInfo.numGuia.trim() !== ''){
       // this.GetSegumientoPaqueteria(this.ganadorInfo.numGuia);
      //  this.ganadorInfo.claveEstatus = 'PVE';
      //  this.GetSegumientoPaqueteria('5584773180');
      //  this.GetSegumientoPaqueteria('2035758211');
    // }
    
    // this.getInitialData();
    // this.getTarjetasUsuario(this.usuario!.id);
    this.getInformacionUsuario(this.usuario!.id);
    // if(this.ganadorInfo && this.ganadorInfo.claveEstatus === 'RCM'){
    //   this.getCategoriasReclamo();
    //   this.getReclamoInfo();
    // }
   
  }

  private conectarSignalR(idReclamo: number): void {
    this.signalRChatService.connectToChat(idReclamo.toString(), this.authService.idUsuario, (datos: any[]) => {
      console.log('recibir mensajes en tiempo real')
      this.addMessageToList(datos);
    });
  }

  private scrollToBottom(options?: ScrollToOptions) {
    const el = this.messagesContainer.nativeElement;
    if (!el) return;
    // instantáneo o suave según options
    el.scrollTo({ top: el.scrollHeight, ...(options || {}) });
  }
  
  getInformacionUsuario(idUsuario: number){
    this.authService.consultarDatosUsuario(idUsuario).subscribe({
      next: (response: any) => {
        this.infoUsuario = response;
       
        this.getInitialData(true);
          console.log(response);
      },
      error: (err: any) => {
        console.error('Error fetching user information:', err);
      }
    });
  }

 
  getInitialData(reloadSubastaInfo?: boolean){
    // console.log(this.usuario!)
    if(this.subasta){
      console.log(this.subasta);
      // this.ganadorInfo.claveEstatus = 'PVE';
      this.precioActualSubasta = this.subasta.apuesta;
      // console.log('datos de la subasta')
      // console.log(this.subasta)
      // this.getDireccionesEntrega(this.infoUsuario.id, 'entrega');
      this.getHistorialEstatus(this.subasta.id);
      //this.checkAndLoadDataByStatus();
      // this.getTarjetasUsuario(this.infoUsuario.id);
      // if(reloadSubastaInfo){
      //   this.getDatosSubasta(this.subasta.id);
      this.getInformacionGanador(this.subasta.id);
      // }
    }
  }

  


  getDatosSubasta(id: number){
    this.loading = true;
    this.subastasService.getAuctionById(id).subscribe({
      next: (subasta) => {
        this.subasta = subasta;
        this.loading = false;
        this.getDireccionesEntrega(this.infoUsuario.id);
      },
      error: (err) => {
        console.error('Error fetching auction details:', err);
        this.loading = false;
      }
    })
  }

  getInformacionGanador(IdSubasta: number){
    this.loading = true;
    this.subastasService.GetInformacionSubastaTerminada(IdSubasta).subscribe({
      next: (response) => {
        console.log('informacion del ganador')
        // console.log(response);
        this.ganadorInfo = response;
        console.log(this.ganadorInfo)
        this.precioActualSubasta = this.ganadorInfo.apuesta;
        this.loading = false;
        
        this.checkAndLoadDataByStatus();
        //
      },
      error: (err) => {
        this.loading = false;
        this.ss.showNotification('error', 'Error al obtener informacion del ganador');
        console.error('Error fetching winner information:', err);
      }
    });
  }

  checkAndLoadDataByStatus(){
  //   if(this.ganadorInfo.numGuia && this.ganadorInfo.numGuia.trim() !== ''){
  //     // this.GetSegumientoPaqueteria(this.ganadorInfo.numGuia);
  //     this.GetSegumientoPaqueteria(this.ganadorInfo.numGuia);
  // }
  console.log(this.subasta?.mestatus.cveStatus)
  console.log(this.ganadorInfo)
    switch(this.subasta?.mestatus.cveStatus){
      case 'ACT':
        break;
      case 'PDO':
       case   'ENV':      
          // if(this.ganadorInfo.numGuia) this.GetSegumientoPaqueteria(this.ganadorInfo.numGuia)
          if(this.ganadorInfo.numGuia) this.GetSegumientoPaqueteria('2035758211')
        break;
      case 'PTP':
        this.getDireccionesEntrega(this.infoUsuario.id);
        this.getSecureCards();
        break;
      case 'REC':
        this.getCategoriasReclamo();
        break;
      case 'RCM':
        this.getReclamoInfo();
        break;
    }
  }

  async getSecureCards(){
    // console.log('obtener tarjetas usuario')
    // console.log(this.infoUsuario)
    // this.loading = true;
    this.openPayService.getTarjetasUsuario(this.infoUsuario.id).subscribe({
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

  getDireccionesEntrega(idUsuario: number){
    this.subastasService.GetDireccionesUsuario(idUsuario, '').subscribe({
      next: (response: any) => {
          console.log(response);
          this.listaDireccionesEntrega = response;
          this.miDireccionEntrega = this.listaDireccionesEntrega.length > 0 ? this.listaDireccionesEntrega.find((direccion: any) => direccion.predeterminada) : null;
          console.log(this.miDireccionEntrega);
          if(!this.miDireccionEntrega && this.listaDireccionesEntrega.length > 0){
            this.miDireccionEntrega = this.listaDireccionesEntrega[0];
          }
          // if(this.miDireccionEntrega && this.miDireccionEntrega !== null && this.miDireccionEntrega !== undefined){
            this.calcularPrecios();
          // }
      },
      error: (error: any) => {
          console.error('Error fetching addresses:', error);
      }
    }
    );
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

  // toCurrency(valor: any){
  //  return this.ss.toCurrency(valor); 
  // }

  addNewMessage(){
    if(!this.sendingMessage){
      this.sendingMessage = true;
      let mensaje = {idReclamo: this.informacionReclamo.id, mensaje:this.newReclamoMessage,tipoUsuario: 'C',idUsuario: this.usuario!.id}
      this.subastasService.saveMessageChat(mensaje).subscribe({
        next: (response) => {
          // this.signalRChatService.sendGetMessageAsync(this.informacionReclamo.id);
          console.log('mensaje guardado', response);
          // this.addMessageToList(mensaje);
          this.newReclamoMessage = '';
          this.sendingMessage = false;
        },
        error: (err) => {
          this.sendingMessage = false;
          console.error('Error saving message', err);
        }
      });
    }
    
  }

  addMessageToList(message: any){
     //let mensaje = { id: this.conversacion.length + 1, fecha: new Date().toISOString(), idUsuario: 1, tipoUsuario: 'C', mensaje: this.newReclamoMessage };
    this.conversacion.push(message);
    this.newReclamoMessage = '';
    setTimeout(() => this.scrollToBottom({ behavior: 'smooth' }), 100);
    this.newMessageClass = 'animate__slideInRight';
    setTimeout(() => {
      this.newMessageClass = '';
    }, 200);
  }


  getCategoriasReclamo(){
    this.subastasService.getCategoriasReclamo().subscribe({
        next: (categorias: any) => {
          console.log(categorias);
            this.listaCategoriasDisputa = categorias;
        },
        error: (err) => {
            console.error('Error fetching dispute categories:', err);
        }
    });
  }


  saveReclamo(){
    this.reclamoModel.fechaApertura = new Date();
    this.reclamoModel.idSubasta = this.subasta!.id;
    this.reclamoModel.idVendedor = this.subasta!.musuarios.id;
    this.reclamoModel.idGanador = this.ganadorInfo.idComprador;
    let r = this.getClearBase64(this.imagesList);
    for(let image of r){
      this.reclamoModel.imagenesReclamos.push({url:image});
    }
    // console.log(this.reclamoModel);
    this.subastasService.addReclamo(this.reclamoModel).subscribe({
        next: (response) => {
          console.log('Reclamo saved successfully', response);
          this.setCloseModal('disputa');
          this.getInitialData(true);
        },
        error: (err) => {
          console.error('Error saving reclamo', err);
        }
    });
  }

  acceptTerms(){
    this.terminosRevisados = true;
  }

  navigateImage(to: string, event: any){
    event.stopPropagation();
    switch(to){
      case 'prev':
        if(this.currentImageIndex > 0){
          this.classNavigateImg = 'animate__fadeOutRight';
          setTimeout(() => {
            this.currentImageIndex--;
            this.classNavigateImg = 'animate__fadeInLeft';
          }, 350);
        }
          break;
      case 'next':
        if(this.currentImageIndex < this.informacionReclamo.imagenesReclamos.length - 1) {
          this.classNavigateImg = 'animate__fadeOutLeft';
          setTimeout(() => {
            this.currentImageIndex++;
            this.classNavigateImg = 'animate__fadeInRight';
          }, 350);
          // this.currentImageIndex++;
        }
          break;
    }
  }

  getClearBase64(array: any[]){
    let _array = [];
    // console.log(array)
    for(let i of array){
      // let url = i;
      let index = i.indexOf('base64');
      // console.log(index)
      let firstPart = i.substring(0,  index + 7);
      
      let b64 = i.replace(firstPart,'');
      console.log(b64)
      _array.push(b64);
    }
    // console.log(array)
    return _array;
  }

  nextEstatusReclamo(){
    if(this.informacionReclamo.idEstatus === 3){
      if(this.subestatus === 'GRP'){
        this.subestatus = 'GRL';
      } 
      else if(this.subestatus === 'GRL'){
        this.subestatus = 'PER';
      }
      else if(this.subestatus === 'PER'){
        this.subestatus = 'PRP';
      }
      else {
        this.informacionReclamo.idEstatus++;
      }
    } else {
      this.informacionReclamo.idEstatus++;
    }
  }

  async downloadPdf(){
    try {
      const timestamp = Date.now();
      const filename = `guide_label-return-${this.subasta!.id}-${timestamp}.pdf`; 
      const resp = await fetch(this.subasta!.urlGuia, { credentials: 'same-origin' }); // o mode:'cors' según sea necesario
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




  getReclamoInfo(){
    this.subastasService.getInfoDetalleReclamo(this.subasta!.id).subscribe({
        next: (reclamoInfo: any) => {
            this.informacionReclamo = reclamoInfo;
            console.log('Informacion del reclamo')
            console.log(reclamoInfo);
            this.getMensajesReclamo(reclamoInfo.id)
            this.conectarSignalR(this.informacionReclamo.id);
            // this.informacionReclamo.idEstatus = 3;
        },
        error: (err) => {
            console.error('Error fetching claim information:', err);
        }
    });
  }

  getMensajesReclamo(idReclamo: number){
    this.subastasService.getMensajesChatReclamo(idReclamo).subscribe({
      next: (msg: any)=> {
        this.conversacion = msg;
        console.log(msg)
      },
      error: (error) => {
        console.log(error)
      }
    })
  }

  setToProcesoTemporal(){
    this.informacionReclamo.idEstatus = 2;
  }

  

  onFileChange(event: any) {
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

  getInitialGuiaModel(){
    this.paqueteriaRequestModel = this.ss.getInitialGuiaModel();
  }

  isInMinimumStatus(clave: string, minCve: string){
    let current = this.ordenEstatusValidaciones[clave];
    let minimo = this.ordenEstatusValidaciones[minCve];
    return current >= minimo;
  }

  isInMinimumStatusTo(clave: string, minCve: string, to: string){
    let current = this.ordenEstatusValidaciones[clave];
    let minimo = this.ordenEstatusValidaciones[minCve];
    let toStatus = this.ordenEstatusValidaciones[to];
    return current >= minimo && current < toStatus;
  }

  getCotizarModelFormat(){
    const cotizacion: CotizacionPaqueteriaModel = {
      "codigoPostalOrigen": this.subasta!.direccion.codigoPostal,
      "ciudadOrigen": this.subasta!.direccion.municipio,
      "codigoPostalDestino": this.miDireccionEntrega.codigoPostal,
      "ciudadDestino": this.miDireccionEntrega.municipio,
      "peso": this.subasta!.peso,
      "logitud": this.subasta!.largo,
      "ancho": this.subasta!.profundidad,
      "altura": this.subasta!.ancho,
      "fechaEnvio": this.getCotizarFecha()
    }
    return cotizacion;
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

  getPrecioActualSubasta(){
    
  }


  async calcularPrecios(){
    //this.precioActualSubasta =  this.ganadorInfo.apuesta;
    // this.precioActualSubasta = this.ganadorInfo.ofertas && this.ganadorInfo.ofertas.length > 0 ? this.ganadorInfo.ofertas[this.ganadorInfo.ofertas.length - 1].oferta : this.ganadorInfo.apuesta;
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
        // this.precioTotal = 1;
        this.precioTotal = +(this.precioActualSubasta + this.precioEnvio).toFixed(2);
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
    this.precioTotal = +(this.precioActualSubasta + this.precioEnvio).toFixed(2);
    // this.precioTotal = this.subasta!.apuesta  + this.precioEnvio;
  }

  contraOfertar(){
    this.isModalOpen.nuevaOferta = true;
  }


  async ofrecerNuevoPrecio(){
      if(!this.nuevaOfertaModel.oferta || this.nuevaOfertaModel.oferta < 1 || this.nuevaOfertaModel.oferta === undefined){
        this.ss.showNotification('error','El valor de la oferta no es valido');
        return;
      }
     
      let r = await this.ss.showConfirmMessage(`¿Desea enviar esta contraoferta al vendedor?`);
      if(r){
        let dataOferta = {
          idSubasta: this.subasta!.id,
          idUsuario: this.usuario!.id,
          oferta:this.nuevaOfertaModel.oferta,
          tipoUsuario: 'COMP'
        }
        this.setCloseModal('nuevaOferta');
        this.subastasService.guardarOFertaCompraSubasta(dataOferta).subscribe({
          next: () => {
            //this.ss.showNotification('success', 'Oferta enviada correctamente');
            this.CambiarEstatusSubasta(this.subasta!.id, AuctionStatus.PropuestaVendedor);
  
          },
          error: (err) => {
            this.ss.showNotification('error', 'Error al enviar la oferta');
          }
        });
        // this.CambiarEstatusSubasta(this.subasta!.id, this.oferta2nd? AuctionStatus.PropuestaSiguiente:AuctionStatus.PropuestaGanador);
        // this.oferta2nd = false;
      };
    }

  changeDireccion(){
    this.calcularPrecios();
  }

  getPrecioEnvio(): number {
    return this.precioEnvio;
  }

  
  toCurrency(valor: number): string {
    return this.ss.toCurrency(valor);
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
      ordenXuba:`AX-${this.subasta!.id}-${this.ganadorInfo.idComprador}`,
      total:this.precioTotal,
      subtotal:this.ganadorInfo.apuesta,
      envio:this.precioEnvio,
      nombreArticulo:`Item#${this.subasta!.id}-${this.subasta!.caption}`,
      idArticulo:this.subasta!.id,
      descripcion: this.descripcionCargo,
      cantidad:1,
      noAutorizacion: '',
    };
  }

  isInList(current: string, lista: string[] ){
    return lista.includes(current);
  }

  getLastOferta(){
    return this.ganadorInfo.ofertas && this.ganadorInfo.ofertas.length > 0 ? this.ganadorInfo.ofertas[this.ganadorInfo.ofertas.length - 1].oferta : 0;
  }

   GetSegumientoPaqueteria(noGuia: string){
      this.subastasService.GetPaqueteriaSeguimiento(noGuia).subscribe((seguimiento: any) => {
        this.listaSeguimiento = seguimiento.events;
  
          console.log(this.listaSeguimiento);
      });
    }
  
    getHistorialEstatus(IdSubasta: number){
      this.subastasService.GetHistorialEstatusSubasta(IdSubasta).subscribe((historial: any) => {
        // console.log(historial);
        this.listaHistorialEstatusProducto = historial;
      });
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
  
    createPaqueteriaModel(){
      //Cambiar la api de guardar direccion, para que se registre un telefono y correo en cada direccion

      this.paqueteriaRequestModel = this.ss.getPaqueteriaGuiaModel(this.subasta!,this.subasta!.direccion,this.subasta!.direccion,this.miDireccionEntrega, this.infoUsuario );
      // this.paqueteriaRequestModel.idsubasta = this.subasta!.id;
      // this.paqueteriaRequestModel.plannedShippingDateAndTime = this.getCorrectDateFormat()//"2025-08-23T19:19:40 GMT+00:00"
      // this.paqueteriaRequestModel.content = {
      //   "packages": [
      //       {
      //         "typeCode": "2BP",
      //         "weight": this.subasta!.peso,
      //         "dimensions": {
      //           "length": this.subasta!.largo,
      //           "width": this.subasta!.profundidad,
      //           "height": this.subasta!.ancho
      //         }
      //       }
      //     ],
      //     "isCustomsDeclarable": false,
      //     "description": "Producto: " + this.subasta!.caption,
      //     "incoterm": "DAP",
      //     "unitOfMeasurement": "metric"
      // }
      // //ENVIA
      // this.paqueteriaRequestModel.customerDetails.shipperDetails = {
      //   "postalAddress": {
      //         "postalCode": this.subasta!.direccion.codigoPostal,
      //         "cityName": this.subasta!.direccion.municipio,
      //         "countryCode": "MX",
      //         "addressLine1": `${this.subasta!.direccion.calle} ${this.subasta!.direccion.numeroExt} ${this.subasta!.direccion.numeroInt}`,
      //         "addressLine2": this.subasta!.direccion.colonia,
      //         "countryName": "Mexico"
      //   },
      //   "contactInformation": {
      //     "email": this.subasta!.direccion.correo,
      //     "phone": this.subasta!.direccion.telefono,
      //     "mobilePhone": "2563456227231",
      //     "companyName": "XUBA",
      //     "fullName": `${this.subasta!.musuarios.nombre} ${this.subasta!.musuarios.apellido}`
      //   },
      //   "registrationNumbers": [
      //     {
      //       "typeCode": "VAT",
      //       "number": "244444911",
      //       "issuerCountryCode": "MX"
      //     }
      //   ],
      //   "typeCode": "business"
      // }
      // //RECIBE
      // this.paqueteriaRequestModel.customerDetails.receiverDetails = {
      //   "postalAddress": {
      //     "postalCode": this.miDireccionEntrega.codigoPostal,
      //     "cityName": this.miDireccionEntrega.municipio,
      //     "countryCode": "MX",
      //     "addressLine1": `${this.miDireccionEntrega.calle} ${this.miDireccionEntrega.numeroExt} ${this.miDireccionEntrega.numeroInt}`,
      //     "addressLine2": this.miDireccionEntrega.colonia,
      //     "countryName": "Mexico"
      //   },
      //   "contactInformation": {
      //     "email": this.infoUsuario.correo,
      //     "phone": this.infoUsuario.telefono,
      //     "mobilePhone": this.infoUsuario.telefono,
      //     "companyName": "XUBA",
      //     "fullName": `${this.infoUsuario.nombre} ${this.infoUsuario.apellido}`
      //   },
      //   "registrationNumbers": [
      //     {
      //       "typeCode": "VAT",
      //       "number": "12345678",
      //       "issuerCountryCode": "MX"
      //     }
      //   ],
      //   "typeCode": "business"
      // }
    }


    async procesarPago(){
      let omitir = this.ss.isValidValue(this.selectedCard.id) ? ['card_number']:['id']
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
      // console.log(this.selectedCard)
      // console.log(_card)
      // console.log(omitir)
      if(!this.ss.isValidModel(_card, omitir)){
        this.ss.showNotification('error', 'Datos faltantes');
        return;
      } else {
        if(+_card.expiration_month > 12){
          this.ss.showNotification('error', 'El mes de expiración de la tarjeta no es válido.', 3000);
          return;
        }
        // console.log(this.tarjeta)
        let r = await this.ss.showConfirmMessage('¿Desea proceder con el pago?');
        if(r){
          if(_card.id){
            this.setComprobanteModel();
            let d_id = this.ss.getDeviceSessionID();
            let metodoPagoDescripcion = `Tarjeta • ${this.selectedCard.brand} • **** ${this.selectedCard.card_number}`;
            this.modeloComprobante.metodoPago = metodoPagoDescripcion;
            this.textoLoading = 'Procesando pago...'
            this.GenerarCargo('',d_id, _card.id)
            console.log(d_id)
          } else {
            this.tokenizarTarjeta(_card);
          }
        }
      }
    }
    
    async tokenizarTarjeta(card: any) {
      this.loading = true;
      this.textoLoading = 'Procesando pago...'
      this.setComprobanteModel();
      let r = await this.ss.tokenizarTarjeta(card);
      // let r = await this.ss.tokenizarTarjeta(this.tarjeta);
      if(r.ok){
        this.modeloComprobante.metodoPago = r.metodo_desc;
        this.GenerarCargo(r.token_id, r.deviceSessionId);
      } else {
        this.loading = false;
        this.ss.showNotification('error',r.msg, 6000)
      }
    }
    
    generarModeloCargo(deviceSessionId: any, encodedAuth: string){
      let userData = this.authService.getUserData();
      const dataCharge:any = {
        // 'token': tokenId,
        'amount': this.subasta!.apuesta,
        'description': 'Pago subasta GANADA-' + userData.id + '-'+this.subasta!.caption,
        'name':this.tarjeta.holder_name,       
        'lastName':this.tarjeta.holder_lastname,       
        'email':this.tarjeta.mail,
        'phone':this.tarjeta.phone,      
        'use_3d_secure': true,
        'device_session_id': deviceSessionId,
        'redirect_url':  `${environment.threeds_redirect_url}/${encodedAuth}` 
        // 'redirect_url': `http://localhost:4200/payment-callback/${encodedAuth}` 
        // 'redirect_url': 'https://www.xuba.mx/subasta-terminada/eyJpZFN1YmFzdGEiOjU1MzUsInRpcG9Vc3VhcmlvIjoiY29tcHJhZG9yIn0%3D' 
        // window.open(res.payment_method.url, '_blank');
        // 
      };
      return dataCharge;
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

    setToXubaComprobante(response: any){
      this.ss.setLocalStorageEncodedKey('transaction_id', response.id);
      this.ss.setLocalStorageEncodedKey('tmp_direccion_eg', this.miDireccionEntrega.id);
      this.ss.setLocalStorageEncodedKey('tmp_ticket_model',  JSON.stringify(this.modeloComprobante));
      this.ss.setLocalStorageEncodedKey('tmp_paqueteria_model',  JSON.stringify(this.paqueteriaRequestModel));
    }

    async GenerarCargo(tokenId: string, deviceSessionId: any, card_id?: any){
      // let userData = this.authService.getUserData();
      let _redirectTo = `subasta-terminada`
      // let _redirectTo = `subasta-terminada/${this.dataParams}`
      // let dataParamsEndAuth = JSON.stringify({ redirectTo: _redirectTo, moveToAuthPage:false});
      let dataParamsEndAuth = JSON.stringify({id: this.subasta!.id, tu:'comprador', rt: _redirectTo, mtap: false, process:'payment-winner'});
      // let dataParamsEndAuth = JSON.stringify({idSubasta: this.subasta!.id, tipoUsuario:'comprador', autoRedirect: false, redirectTo: _redirectTo, moveToAuthPage:false, process:'payment-winner'});
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
        this.CambiarEstatusSubasta(this.subasta!.id, AuctionStatus.Pagado, true);
      } else {
        this.createPaqueteriaModel();
        this.setToXubaComprobante(response)
        this.moveTo3DAuth(response);
      }
    }

    moveTo3DAuth(response: any){
      setTimeout(() => {
        let dataParams = JSON.stringify({'id': this.subasta!.id,'tid': response.id , tu:'comprador', 'rt': response.payment_method.url, mtap: true});
        let encoded = this.ss.encodeToBase64(dataParams);
        this.router.navigate(['/payment-callback',encoded]);
      }, 100);
    }

  
    //12 = Pendiente pago = 
    CambiarEstatusSubasta(idSubasta: number, nuevoEstatus: number, generaGuia?: boolean) {
      
      if(!this.loading) this.loading = true;
      this.subastasService.actualizarEstatusSubasta(idSubasta, nuevoEstatus).subscribe({
        next: (response) => {
          // this.loading = false;
          this.loading = false;
          this.ss.showNotification('success','Informacion actualizada correctamente');
         
          // this.closeModal();
          // this.getInitialData(this.subasta.id);
          console.log('Estatus actualizado:', response);
          if(generaGuia){
            this.generarGuiaDeEnvio();
          } else {
            this.getInitialData(true);
          }
          // 
        },  
        error: (error) => {
          this.ss.showNotification('error','Hubo un problema al cambiar estatus');
          this.loading = false;
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
            this.getInitialData(true);
            console.log('Guía de envío generada exitosamente:', response);
            this.ss.showNotification('success','Pago procesado correctamente');

            setTimeout(() => { this.openComprobante(); }, 350);
          },
          error: (error) => {
            this.loading = false;
            this.ss.showNotification('error','Hubo un problema al generar la guia de envio');
            this.showComprobante = true;
            this.openComprobante();
            setTimeout(() => { this.openComprobante(); }, 350);
            console.error('Error al generar la guía de envío:', error.error);
          }
        });
      }, 200);
      
    }

    async marcarProductoRecibido(){
      let r = await this.ss.showConfirmMessage(`¿Desea marcar este producto como recibido?`);
      if(r){
        this.CambiarEstatusSubasta(this.subasta!.id, AuctionStatus.Recibido );
      }
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
  

    onInput(event: any, atributo: any, fn?: (value: any) => void) {
      const soloNumeros = event.target.value.replace(/[^0-9]/g, '');
      atributo = soloNumeros;
      event.target.value = soloNumeros; 
      fn?.(soloNumeros);
      // Actualiza el input si el usuario pegó algo no numérico
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
  
    setOpenModal(modalName: string){
      
      switch(modalName){
        case 'detalleReclamo':
          if(this.informacionReclamo.idEstatus === 2){
            setTimeout(() => this.scrollToBottom({ behavior: 'smooth' }), 100);
          }
          break;
        // case 'disputa':
        //   this.getCategoriasReclamo();
        //   break;

      }
      this.isModalOpen[modalName] = true;
      // if(modalName === 'detalleReclamo'){
      //   if(this.informacionReclamo.idEstatus === 2){
      //     setTimeout(() => this.scrollToBottom({ behavior: 'smooth' }), 100);
      //   }
      // }
      
    }
    setCloseModal(modalName: string){
      this.isModalOpen[modalName] = false;
    }

    onCloseModal(modalName: string){
      this.isModalOpen[modalName] = false;
    }

    async AceptarOfertaGanador(){
      let r = await this.ss.showConfirmMessage(`¿Desea aceptar la oferta de compra actual al precio de: ${this.toCurrency(this.getLastOferta())}?`);
      if(r){
        this.CambiarEstatusSubasta(this.subasta!.id, AuctionStatus.PendientePago );
      }
    }

    async ConfirmarCorrectaRecepcion(){
      let r = await this.ss.showConfirmMessage(`¿Desea confirmar que recibio correctamente el articulo recibido?`);
      if(r){
        this.CambiarEstatusSubasta(this.subasta!.id, AuctionStatus.RecepcionCorrecta );
      }
    }

    async rechazarOfertaGanador(){
      let r = await this.ss.showConfirmMessage(`¿Desea rechazar la oferta? \n Una vez aceptado, se concluira la subasta`);
      if(r){
        this.CambiarEstatusSubasta(this.subasta!.id, AuctionStatus.RechazoGanador );
      }
    }

    abrirNuevaDisputa(){

    }

    // async print(){
      //   console.log('Printing ticket...')
      //   setTimeout(() => {
      //    this.ss.ImprimirTicket();
      //  }, 250);
      // try {
      //   await this.ss.captureAndPrintInline('printContainer', {
      //     scale: 2,                 // aumenta resolución (2-3 recomendado)
      //     backgroundColor: '#ffffff', // fuerza fondo blanco si tu comprobante tiene color de fondo
      //     fileName: undefined       // o 'comprobante_tr_ABC123.png' si quieres descargar
      //   });
      // } catch (err: any) {
      //   this.ss.showNotification('error','Error al intentar imprimir\n' + err.toString())
      //   console.error('Error al capturar/imprimir:', err);
      // }
      // window.print();
    // }
  

    async downloadComprobante(){
      console.log('descargar compronbante')
      const timestamp = Date.now();
      const _filename = `xuba_pay-${this.subasta!.id}-${timestamp}.pdf`; 
      const element: any = document.getElementById('printContainer');
      const opt: any = {
        margin: 10,
        filename: _filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(element).save();
      // this.ss.showNotification('success','Operation completed successfully');
      // this.ss.showNotification('error','Operation completed successfully');
      // this.ss.showNotification('info','Operation completed successfully');
      // this.ss.showNotification('warning','Operation completed successfully');
      // this.ss.showConfirmMessage('asdasdasdasd');
    }
}
