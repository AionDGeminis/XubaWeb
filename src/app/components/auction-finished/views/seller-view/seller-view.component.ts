import { Component, ElementRef, Input, OnChanges, OnInit, Signal, SimpleChanges, ViewChild } from '@angular/core';
import { Subasta, Usuario } from '../../../../models/subasta.model';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from "../../../../pipes/safeurl";
import { SharedService } from '../../../../services/shared.service';
import { SubastasService } from '../../../../services/subastas.service';
import { LoaderComponent } from '../../../loader/loader.component';
import { AuctionStatus } from '../../../../../enums/auction-estatus.enum';
import { FormsModule } from '@angular/forms';
import { PaymentComponent } from '../../../modals/payment/payment.component';
import { ReclamoEstatus } from '../../../../../enums/reclamo-status.enum';
import { ReclamoSubestatus } from '../../../../../enums/reclamo-subestatus.enum';
import { SignalRChatService } from '../../../../services/signalrchat.service';
import { CotizacionPaqueteriaModel } from '../../../../models/cotizacion-model';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-seller-view',
  imports: [CommonModule, FormsModule, SafeUrlPipe, LoaderComponent, PaymentComponent],
  standalone: true,
  templateUrl: './seller-view.component.html',
  styleUrl: './seller-view.component.css'
})
export class SellerViewComponent implements OnInit, OnChanges{
  @Input() subasta: Subasta | null = null;
  @Input() ganadorInfo: any | null = {};
  @Input() usuario!: Signal<Usuario|null>;
  @Input() isLoggedIn!: Signal<boolean>;
  // @Input() subasta: Subasta | null = null;
  // ganadorInfo: any;
  // listaEstatus: any[] = [];
  // loading: boolean = false;
  // estatusPendientePago: string = AuctionClaveStatus.PendientePago;
  // estatusPagado: string = AuctionClaveStatus.Pagado;
  // estatusEnviado: string = AuctionClaveStatus.Enviado;
  // tipoUsuario: string = '';
  // public usuario!: Signal<Usuario|null>;
  // public isLoggedIn!: Signal<boolean>;
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
  ordenEstatusValidaiones2: any = { 
    SST:1, 
    ACT:2,    
    FIN:3,
    MNA:4,
    PPR:5,
    PRA:6, 
    PTP:7,    
    PDO:8, 
    PEV:9,
    ENV:10,
    REC: 11
  };

  isModalOpen: any = {etiqueta: false, nuevaOferta: false, pago: false, viewer: false};
  minimoAlcanzado: boolean = false;
  loading: boolean = false;
  textoLoading: string = '';
  nuevaOfertaModel: any = {oferta: null, confirmarOferta: null}
  oferta2nd: boolean = false;
  // estatusPagoAVendedor: any = {nombre:'Pendiente',clave:'PEN'}; // PEN - EPP - PDO - RDO
  // estatusPagoAVendedor: any = {nombre:'En proceso',clave:'EPP'}; 
  estatusPagoAVendedor: any = {nombre:'Pagado',clave:'PDO'};
  // estatusPagoAVendedor: any = {nombre:'Rechazdo',clave:'RDO'}; 
  informacionReclamo: any = {};
  conversacion: any[] = [];
    // id:1,fecha: '10/10/2025 12:55',idUsuario:1, tipoUsuario:'C',mensaje:'Hola, recibí el producto pero tiene problemas. La pantalla está rayada y no enciende bien. Adjunto fotos.'},
    // {id:2,fecha: '10/10/2025 12:55',idUsuario:2, tipoUsuario:'V',mensaje:'Hola, ¿podrías proporcionar más detalles sobre el problema? Gracias.'},
    // {id:3,fecha: '10/10/2025 12:55',idUsuario:3, tipoUsuario:'A',mensaje:'Hola, estamos revisando tu caso. Te contactaremos pronto con una solución.'},
    // {id:4,fecha: '10/10/2025 12:55',idUsuario:1, tipoUsuario:'C',mensaje:'Sigo sin recibir informacion'}]
  newReclamoMessage: string = '';
  newMessageClass = '';
  subestatus = 'GRP';
  tarjetas: any[] = [];
  totalPago = 0;
  listaSeguimiento: any[] = [];
  classNavigateImg: string = '';
  sendingMessage: boolean = false;
  condicionesAceptadas: boolean = false;
  confirmarCondicion: boolean = false;
  listaDireccionesEntrega: any[] = [];
  miDireccionEntrega: any = null;
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  currentImageIndex: number = 0;
  listaTiposEnvio: any[] = [];
  tipoEnvioSeleccionado: any = null;
  precioEnvio: number = 0;
  infoUsuario: any = {}
  dataParamsAfterAuth: any = {id: 0, tu:'comprador', rt: '', mtap: false, process:'payment-guide-return'}
  // dataParamsAfterAuth: any = {id: this.subasta!.id, tu:'comprador', rt: _redirectTo, mtap: false, process:'payment-winner'}
  constructor(
    private ss: SharedService, 
    private subastaService: SubastasService, 
    private authService: AuthService , 
    private signalRChatService: SignalRChatService){
      this.GetSegumientoPaqueteria('5584773180');
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.checkApuestaTotal();
  }

  ngOnInit(): void {
    console.log(this.ganadorInfo)
    // if(this.ganadorInfo === null || this.ganado)
    // if(this.ganadorInfo && this.ganadorInfo.claveEstatus === 'RCM'){
    //   this.getReclamoInfo();
    // } else {
      this.getInformacionUsuario(this.usuario()!.id);
      this.getInitialData(this.subasta!.id);
    // }
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

  onCloseModal(){
    this.isModalOpen['pago'] = false;
  }

  setLoading($event: any){
    this.loading = $event.showLoading;
    this.textoLoading = $event.textLoading;
  }

  changeTipoEnvio(){
    this.precioEnvio = this.tipoEnvioSeleccionado?.precio || 0;
    this.totalPago = this.precioEnvio;
    // this.totalPago = this.precioEnvio + this.subasta!.apuesta;
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

  GetSegumientoPaqueteria(noGuia: string){
    this.subastaService.GetPaqueteriaSeguimiento(noGuia).subscribe((seguimiento: any) => {
      this.listaSeguimiento = seguimiento.events;

        console.log(this.listaSeguimiento);
    });
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
        }
          break;
    }
  }
  onProcesarPago($event: any){
    // console.log($event);
    // let tarjeta = $event;
    // if(!this.ss.isValidModel(tarjeta, [])){
    //   this.ss.showNotification('error', 'Datos faltantes');
    //   return;
    // } else {
    //   if(+tarjeta.expiration_month > 12){
    //     this.ss.showNotification('error', 'El mes de expiración de la tarjeta no es válido.', 3000);
    //     return;
    //   }
    //   // console.log(this.tarjeta)
    //   this.tokenizarTarjeta();
    // }
  }

  setCondicion($event: any){
    this.condicionesAceptadas = true;
    this.confirmarCondicion = true;
  }

 
  private scrollToBottom(options?: ScrollToOptions) {
    const el = this.messagesContainer.nativeElement;
    if (!el) return;
    // instantáneo o suave según options
    el.scrollTo({ top: el.scrollHeight, ...(options || {}) });
  }
  
  addNewMessage(){
    if(!this.sendingMessage){
      this.sendingMessage = true;
      let mensaje = {idReclamo: this.informacionReclamo.id, mensaje:this.newReclamoMessage,tipoUsuario: 'V',idUsuario: this.usuario()!.id}
      this.subastaService.saveMessageChat(mensaje).subscribe({
        next: (response) => {
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

  async setNoReturnItem(){
    let reclamo = {idReclamo: this.informacionReclamo.id, idEstatus: ReclamoEstatus.Reembolso , idSubEstatus: ReclamoSubestatus.ReembolsoSinRetorno}
    let r = await this.ss.showConfirmMessage('¿Desea proceder con el reembolso al cliente sin reenvio del producto?');
    if(r){
      this.loading = true;
      this.subastaService.changeReclamoEstatus(reclamo).subscribe({
        next:(res) => {
          console.log(res);
          this.loading = false;
          this.ss.showNotification('success', 'Estatus del reclamo actualizado');
        }, 
        error: (err) => {
          this.loading = false;
        }
      })
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
  // addNewMessage(){
  //   let mensaje = { id: this.conversacion.length + 1, fecha: new Date().toISOString(), idUsuario: 1, tipoUsuario: 'V', mensaje: this.newReclamoMessage };
  //   this.conversacion.push(mensaje);
  //   this.newReclamoMessage = '';
  //   setTimeout(() => this.scrollToBottom({ behavior: 'smooth' }), 100);
  //   this.newMessageClass = 'animate__slideInRight';
  //   setTimeout(() => {
  //     this.newMessageClass = '';
  //   }, 200);
  // }

  getMensajesReclamo(idReclamo: number){
    this.subastaService.getMensajesChatReclamo(idReclamo).subscribe({
      next: (msg: any)=> {
        this.conversacion = msg;
        console.log(msg)
      },
      error: (error) => {
        console.log(error)
      }
    })
  }

  private conectarSignalR(idReclamo: number): void {
    this.signalRChatService.connectToChat(idReclamo.toString(), this.usuario()!.id.toString(), (datos: any[]) => {
      console.log('recibir mensajes en tiempo real')
      this.addMessageToList(datos);
    });
  }

  getReclamoInfo(){
    this.subastaService.getInfoDetalleReclamo(this.subasta!.id).subscribe({
        next: (reclamoInfo: any) => {
            this.informacionReclamo = reclamoInfo;
            if(this.informacionReclamo.cvStatus === 'PRO'){
              this.getMensajesReclamo(reclamoInfo.id)
              this.conectarSignalR(this.informacionReclamo.id);
            }
            if(this.informacionReclamo.cvStatus === 'REE' && this.miDireccionEntrega ){
              this.calcularPrecios();
            }
            this.dataParamsAfterAuth.idc = reclamoInfo.id
            console.log(reclamoInfo);
        },
        error: (err) => {
            console.error('Error fetching claim information:', err);
        }
    });
  }

  setOpenModalPago(){
    // this.loading = true;
    // this.subasta;
    // this.totalPago = this.getPagoEnvioRetorno();
    this.setOpenModal('pago')
  }

  getPagoEnvioRetorno(){
    return 1;
  }

  getDireccionesEntrega(idUsuario: number, tipo: string){
    this.subastaService.GetDireccionesUsuario(idUsuario, tipo).subscribe({
      next: (response: any) => {
          // console.log(response);
          this.listaDireccionesEntrega = response;
          this.miDireccionEntrega = this.listaDireccionesEntrega.length > 0 ? this.listaDireccionesEntrega.find((direccion: any) => direccion.predeterminada) : null;
          if(this.miDireccionEntrega && this.miDireccionEntrega !== null && this.miDireccionEntrega !== undefined){
            this.calcularPrecios();
          }
      },
      error: (error: any) => {
          console.error('Error fetching addresses:', error);
      }
    }
    );
  }

  setToProcesoTemporal(){
    this.informacionReclamo.idEstatus = 2;
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

  getInitialData(idSubasta: number){
    this.getDatosSubasta(idSubasta);
    // this.getInformacionGanador(idSubasta);
  }

  getDatosSubasta(idSubasta: number){
    this.loading = true;
    this.subastaService.getAuctionById(idSubasta).subscribe({
      next: (subasta) => {
        this.subasta = subasta;
        let _redirectTo = `subasta-terminada`
        this.dataParamsAfterAuth.id = this.subasta.id;
        this.dataParamsAfterAuth.rt = _redirectTo;
        this.loading = false;
        if(this.isLoggedIn()){
          this.getDireccionesEntrega(this.usuario()!.id, 'entrega');
        }
        this.getInformacionGanador(idSubasta);
        
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching auction details:', err);
      }
    });
  }

  getInformacionGanador(idSubasta: number){
    this.loading = true;
    this.subastaService.GetInformacionSubastaTerminada(idSubasta).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('informacion del ganador')
        console.log(response);
        this.ganadorInfo = response;
        if(this.ganadorInfo && this.ganadorInfo.claveEstatus === 'RCM'){
          this.getReclamoInfo();
          
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching winner information:', err);
      }
    });
  }
  
  checkApuestaTotal(){
    if(this.ganadorInfo && this.subasta){
      // this.minimoAlcanzado = this.ganadorInfo.apuesta >= this.subasta?.precio
      // if(this.minimoAlcanzado){
        // this.ganadorInfo.claveEstatus = 'MNA';
      // }
    }
    // console.log(this.subasta)
    // console.log(this.ganadorInfo)
  }

  setOpenModal(modalName: string){
    this.isModalOpen[modalName] = true;
    if(modalName === 'detalleReclamo'){
      if(this.informacionReclamo.idEstatus === 2){
        setTimeout(() => this.scrollToBottom({ behavior: 'smooth' }), 100);
      }
    }
  }
  setCloseModal(modalName: string){
    this.isModalOpen[modalName] = false;
  }

  getCotizarModelFormat(){
    const cotizacion: CotizacionPaqueteriaModel = {
      "codigoPostalOrigen": this.informacionReclamo.direccionEnvio.codigoPostal,
      "ciudadOrigen": this.informacionReclamo.direccionEnvio.municipio,
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

  getCotizarFecha(){
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return today.toISOString();
  }

  changeDireccion(){
    this.listaTiposEnvio = [];
    this.calcularPrecios();
  }


  async calcularPrecios(){
    // setTimeout(() => {
      this.precioEnvio = 0;
      let modeloCotizar = this.getCotizarModelFormat();
      console.log(modeloCotizar)
      this.loading = true;
      this.subastaService.cotizarEnvio(modeloCotizar).subscribe({
        next: (data: any) => {
          this.loading = false;
          this.listaTiposEnvio = data.filter( (x: any) => x.codigoProducto === 'G' || x.codigoProducto === 'N');
          this.tipoEnvioSeleccionado = this.listaTiposEnvio[0];
          this.precioEnvio = this.tipoEnvioSeleccionado.precio
          this.totalPago = this.precioEnvio;
          // this.totalPago = this.precioEnvio + this.subasta!.apuesta;
          console.log(this.totalPago)
        },
        error: (err) => {
          this.loading = false;
          console.error('Error en la cotización:', err);
        }
      })
    // }, 1500);
  
  }

  async downloadPdf(){
    try {
      const timestamp = Date.now();
      const filename = `guide_label-${this.subasta!.id}-${timestamp}.pdf`; 
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

  // async trydownloadPdf(){
  //   //   console.log('Printing ticket...')
  //   //   setTimeout(() => {
  //   //    this.ss.ImprimirTicket();
  //   //  }, 250);
  //   try {
  //     await this.ss.captureAndPrintInline('printContainer', {
  //       scale: 2,                 // aumenta resolución (2-3 recomendado)
  //       backgroundColor: '#ffffff', // fuerza fondo blanco si tu comprobante tiene color de fondo
  //       fileName: undefined       // o 'comprobante_tr_ABC123.png' si quieres descargar
  //     });
  //   } catch (err: any) {
  //     this.ss.showNotification('error','Error al intentar imprimir\n' + err.toString())
  //     console.error('Error al capturar/imprimir:', err);
  //   }
  // }

   // async  caprtureAndDownload(elementId: string, options?: {
      //   scale?: number,           // escala para aumentar resolución
      //   backgroundColor?: string, // fuerza un fondo si lo deseas (ej. '#ffffff'), null para transparencia
      //   fileName?: string         // opcional, si quieres descargar además
      // }) {
      //   const el = document.getElementById(elementId);
      //   if (!el) throw new Error(`Elemento con id "${elementId}" no encontrado`);
      
      //   // espera a que se carguen las fuentes (importante si usas fonts custom)
      //   if ('fonts' in document) {
      //     try { await (document as any).fonts.ready; } catch { /* ignore */ }
      //   }
      
      //   const scale = options?.scale ?? (window.devicePixelRatio || 2);
      //   const backgroundColor = options?.backgroundColor ?? null; // null -> transparencia
      
      //   // Opciones recomendadas para html2canvas
      //   const canvas = await html2canvas(el, {
      //     scale,
      //     useCORS: true,                 // importante si hay imágenes con CORS habilitado
      //     allowTaint: false,
      //     backgroundColor,               // usa null para transparencia o '#fff' para forzar blanco
      //     logging: false,
      //     imageTimeout: 20000,
      //     scrollY: -window.scrollY,      // evita offsets por scroll
      //     scrollX: -window.scrollX,
      //     // foreignObjectRendering: true, // puedes probarlo si tu CSS es complejo (puede mejorar o empeorar según caso)
      //   });
      
      //   // convertir a dataURL (png)
      //   const dataUrl = canvas.toDataURL('image/png');
      
      //   // Si quieres descargar además:
      //   if (options?.fileName) {
      //     const a = document.createElement('a');
      //     a.href = dataUrl;
      //     a.download = options.fileName;
      //     document.body.appendChild(a);
      //     a.click();
      //     a.remove();
      //   }
      
      //   // Abrir nueva ventana para imprimir
      //   const printWindow = window.open('', '_blank', 'noopener,noreferrer');
      //   if (!printWindow) {
      //     // Fallback: si popup bloqueado, abrir en la misma ventana (no ideal)
      //     const w = window;
      //     w.document.open();
      //     w.document.write(this.buildPrintHtml(dataUrl));
      //     w.document.close();
      //     setTimeout(() => w.print(), 500);
      //     return;
      //   }
      
      //   // Contenido HTML de la ventana de impresión
      //   printWindow.document.open();
      //   printWindow.document.write(this.buildPrintHtml(dataUrl));
      //   printWindow.document.close();
      
      //   // Esperar a que la imagen cargue, luego imprimir y cerrar la ventana
      //   const img = printWindow.document.getElementById('print-image') as HTMLImageElement | null;
      //   if (img) {
      //     img.onload = () => {
      //       // Delay pequeño para asegurar render en la ventana nueva
      //       setTimeout(() => {
      //         try {
      //           printWindow.focus();
      //           printWindow.print();
      //         } catch (e) { /* ignore */ }
      //         // opcional: cerrar ventana después de imprimir
      //         // setTimeout(() => printWindow.close(), 500);
      //       }, 250);
      //     };
      //   } else {
      //     // Si no encontramos la img por alguna razón, hacer print en 800ms
      //     setTimeout(() => {
      //       try { printWindow.print(); } catch {}
      //     }, 800);
      //   }
      // }

       //  buildPrintHtml(dataUrl: string) {
      //   // estilos inline importantes: asegurar impresión de color y centrar la imagen
      //   return `
      // <!doctype html>
      // <html>
      // <head>
      //   <meta charset="utf-8">
      //   <title>Imprimir comprobante</title>
      //   <style>
      //     html,body { height:90%; margin:0; padding:0; background: #ffffff; }
      //     body { display:flex; align-items:center; justify-content:center; padding:12px; }
      //     img { max-width:100%; max-height:100%; display:block; }
      
      //     /* Forzar impresión de colores en navegadores que respetan esta regla */
      //     * {
      //       -webkit-print-color-adjust: exact;
      //       print-color-adjust: exact;
      //     }
      
      //     /* Opcional: quita márgenes de la página al imprimir */
      //     @page {
      //       margin: 6mm;
      //     }
      //   </style>
      // </head>
      // <body>
      //   <img id="print-image" src="${dataUrl}" alt="Comprobante">
      //   <script>
      //     // auto print (sólo después de que la imagen haya cargado; el onload en la ventana padre también lo controla)
      //     const img = document.getElementById('print-image');
      //     if (img && img.complete) {
      //       try { window.focus(); window.print(); } catch(e) {}
      //     } else if (img) {
      //       img.onload = () => { try { window.focus(); window.print(); } catch(e) {} };
      //     }
      //   </script>
      // </body>
      // </html>`;
      // }

      // async captureAndDownloadPdf(elementId: string, options: any = {}): Promise<void> {
      //   const el = document.getElementById(elementId);
      //   if (!el) throw new Error(`Elemento no encontrado`);
      
      //   const canvas = await html2canvas(el, {
      //     scale: 2, // Aumentar resolución
      //     useCORS: true,
      //     backgroundColor: '#ffffff',
      //     logging: true, // Para depuración
      //     windowWidth: el.scrollWidth,
      //     windowHeight: el.scrollHeight,
      //     ignoreElements: (element) => element.classList.contains('button-close') // Ignorar botones
      //   });
      //   const imgData = canvas.toDataURL('image/jpeg', 0.95); // Mejor compresión
      //   const pdf = new jsPDF('p', 'mm', 'a4');
      //   const pageWidth = pdf.internal.pageSize.getWidth();
      //   const pageHeight = pdf.internal.pageSize.getHeight();
      //   const imgRatio = canvas.width / canvas.height;
      //   const pdfRatio = pageWidth / pageHeight;
      //   let imgWidth = pageWidth;
      //   let imgHeight = pageHeight;
      //   if (imgRatio > pdfRatio) {
      //     imgHeight = imgWidth / imgRatio;
      //   } else {
      //     imgWidth = imgHeight * imgRatio;
      //   }
      //   const x = (pageWidth - imgWidth) / 2;
      //   const y = (pageHeight - imgHeight) / 2;
      //   pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
      //   pdf.save(options.filename || 'document.pdf');
      // }

      // async captureAndDownloadPdf(elementId: string, options: { filename?: string; scale?: number; backgroundColor?: string | null;  orientation?: 'p' | 'l'; format?: 'a4' | 'letter' | string; marginMm?: number;} = {}): Promise<void> {   
      //   const {   filename = 'document.pdf',
      //     scale = Math.max(1, Math.min(3, window.devicePixelRatio || 2)),
      //     backgroundColor = '#ffffff',
      //     orientation = 'p',
      //     format = 'a4',
      //     marginMm = 10
      //   } = options;
      
      //   const el = document.getElementById(elementId);
      //   if (!el) throw new Error(`Elemento con id "${elementId}" no encontrado`);
      
      //   // Esperar cargas de fonts (si usas webfonts)
      //   if ('fonts' in document) {
      //     try { await (document as any).fonts.ready; } catch { /* ignore */ }
      //   }
      
      //   // Captura con html2canvas
      //   const canvas = await html2canvas(el, {
      //     scale,
      //     useCORS: true,
      //     allowTaint: false,
      //     backgroundColor,   // force background if needed or null for transparent
      //     imageTimeout: 20000,
      //     logging: true,
      //     scrollY: -window.scrollY,
      //     scrollX: -window.scrollX,
          
      //   });
      
      //   const imgData = canvas.toDataURL('image/png');
      
      //   // Crear el PDF
      //   const pdf = new jsPDF(orientation, 'mm', format);
      //   const pageWidth = pdf.internal.pageSize.getWidth();
      //   const pageHeight = pdf.internal.pageSize.getHeight();
      
      //   const usableWidth = pageWidth - marginMm * 2;
      //   const usableHeight = pageHeight - marginMm * 2;
      
      //   // calcular altura de la imagen en mm manteniendo aspect ratio
      //   // imgHeight_mm = (canvas.height * imgWidth_mm) / canvas.width
      //   const imgWidthMm = usableWidth;
      //   const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;
      
      //   if (imgHeightMm <= usableHeight) {
      //     // cabe en una sola página
      //     pdf.addImage(imgData, 'PNG', marginMm, marginMm, imgWidthMm, imgHeightMm);
      //   } else {
      //     // necesita paginar: cortamos el canvas en slices verticales
      //     // calcular cuántos px del canvas equivalen a una página (pxPageHeight)
      //     // derivación: pxPageHeight = (usableHeight mm) * (canvas.width px / imgWidthMm mm)
      //     const pxPageHeight = Math.floor(usableHeight * (canvas.width / imgWidthMm));
      
      //     let position = 0;
      //     let pageIndex = 0;
      //     while (position < canvas.height) {
      //       const sliceHeightPx = Math.min(pxPageHeight, canvas.height - position);
      
      //       // canvas temporal para cada página
      //       const tmpCanvas = document.createElement('canvas');
      //       tmpCanvas.width = canvas.width;
      //       tmpCanvas.height = sliceHeightPx;
      //       const ctx = tmpCanvas.getContext('2d')!;
      //       ctx.drawImage(canvas, 0, position, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);
      
      //       const pageData = tmpCanvas.toDataURL('image/png');
      //       const pageImgHeightMm = (sliceHeightPx * imgWidthMm) / canvas.width;
      
      //       if (pageIndex > 0) pdf.addPage();
      //       pdf.addImage(pageData, 'PNG', marginMm, marginMm, imgWidthMm, pageImgHeightMm);
      
      //       position += sliceHeightPx;
      //       pageIndex++;
      //     }
      //   }
      
      //   // Guardar / descargar
      //   pdf.save(filename);
      // }

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

  onContentClick(event: MouseEvent) {
    event.stopPropagation();
  }

  toCurrency(valor: number): string {
    return this.ss.toCurrency(valor);
  }

  getCurrentTipoOferta(){
    return this.ganadorInfo.ofertas && this.ganadorInfo.ofertas.length > 0 ? this.ganadorInfo.ofertas[this.ganadorInfo.ofertas.length - 1].tipoUsuario: '';
  }

  async aceptarOfertaActual(){
    let r = await this.ss.showConfirmMessage(`¿Desea aceptar la oferta de compra actual al precio de: ${this.toCurrency(this.getLastOferta())}?`);
    if(r){
      this.CambiarEstatusSubasta(this.subasta!.id, AuctionStatus.PendientePago );
    }
  }

  async ofrecerNuevoPrecio(){
    if(!this.nuevaOfertaModel.oferta || this.nuevaOfertaModel.oferta < 1 || this.nuevaOfertaModel.oferta === undefined){
      this.ss.showNotification('error','El valor de la oferta no es valido');
      return;
    }
    if(this.nuevaOfertaModel.oferta > this.subasta!.precio){
      this.ss.showNotification('error','La oferta no puede ser mayor al precio minimo');
      return;
    }
    let r = await this.ss.showConfirmMessage(`¿Desea enviar esta oferta al ganador?`);
    if(r){
      let dataOferta = {
        idSubasta: this.subasta!.id,
        idUsuario: this.usuario()!.id,
        oferta:this.nuevaOfertaModel.oferta,
        tipoUsuario: 'VEND'
      }
      this.setCloseModal('nuevaOferta');
      this.subastaService.guardarOFertaCompraSubasta(dataOferta).subscribe({
        next: () => {
          //this.ss.showNotification('success', 'Oferta enviada correctamente');
          this.CambiarEstatusSubasta(this.subasta!.id, AuctionStatus.PropuestaGanador);

        },
        error: (err) => {
          this.ss.showNotification('error', 'Error al enviar la oferta');
        }
      });
      // this.CambiarEstatusSubasta(this.subasta!.id, this.oferta2nd? AuctionStatus.PropuestaSiguiente:AuctionStatus.PropuestaGanador);
      this.oferta2nd = false;
    };
  }

  async finalizarSubasta() {
    let r = await this.ss.showConfirmMessage(`¿Desea realmente dar por finalizada la subasta?`);
    if(r){
      this.CambiarEstatusSubasta(this.subasta!.id, AuctionStatus.NoEfectuada);
    }
  }

  openOfertar2nd(){
    this.oferta2nd = true;
    this.setOpenModal('nuevaOferta');
  }

  marcarProductoEnviado(){
    // Logic to mark the product as sent
    this.CambiarEstatusSubasta(this.subasta!.id, AuctionStatus.Enviado);

  }

  getLastOferta(){
    return this.ganadorInfo.ofertas && this.ganadorInfo.ofertas.length > 0 ? this.ganadorInfo.ofertas[this.ganadorInfo.ofertas.length - 1].oferta : 0;
  }

  CambiarEstatusSubasta(idSubasta: number, nuevoEstatus: number) {
    this.subastaService.actualizarEstatusSubasta(idSubasta, nuevoEstatus).subscribe({
      next: (response) => {
        this.loading = false;
        this.ss.showNotification('success','Informacion actualizada correctamente');
        this.getInitialData(this.subasta!.id);
        console.log('Estatus actualizado:', response);
      },  
      error: (error) => {
        this.ss.showNotification('error','Hubo un problema al cambiar estatus');
        this.loading = false;
        console.error('Error al actualizar estatus:', error);
      }
    });
  }

  onInput(event: any, atributo: any, fn?: (value: any) => void) {
    const soloNumeros = event.target.value.replace(/[^0-9]/g, '');
    atributo = soloNumeros;
    event.target.value = soloNumeros; 
    fn?.(soloNumeros);
  }

}
