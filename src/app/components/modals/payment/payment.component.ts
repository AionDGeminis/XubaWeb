import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subasta } from '../../../models/subasta.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../../services/shared.service';
import { LoaderComponent } from '../../loader/loader.component';
import { SubastasService } from '../../../services/subastas.service';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../environment/environment';
import { Router } from '@angular/router';
import { OpenPayService } from '../../../services/openpay.service';
declare var OpenPay: any;

@Component({
  selector: 'app-payment',
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
  @Input() subasta: Subasta  | null = null;
  @Input() tarjetas: any[]  = [];
  @Input() totalPago: number = 0;
  @Input() precioEnvio: number = 0;
  @Input() idReclamo: number = 0;
  @Input() titulo: string = '';
  @Input() process: string = '';
  @Input() ganadorInfo: any = {};
  @Input() direccionEntrega: any = {};
  @Input() direccionEnvio: any = {};
  @Input() usuarioEnvio: any = {};
  @Input() usuarioEntrega: any = {};
  @Input() dataParamsAfterAuth: any = {};

  @Input() condicionesAceptadas: boolean = false;
  @Input() confirmarCondicion: boolean = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() procesaPago = new EventEmitter<any>();
  @Output() setLoading = new EventEmitter<boolean>();
  @Output() setCondicion = new EventEmitter<boolean>();
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
  modeloComprobante: any = {};
  selectedCard: any = {};
  loading: boolean = false;
  textoLoading: string = '';
  paqueteriaRequestModel: any = {}
  @ViewChild('modalBody') private modalBodyContainer!: ElementRef;

  constructor(private ss: SharedService, private router: Router, private subastaService: SubastasService,  private authService: AuthService, private openPayService: OpenPayService){}
  
  ngOnInit(): void {
    // OpenPay.setId('mz5jjyzabcb3zzpevo0l');
    // OpenPay.setApiKey('pk_f2da5530e74d4c7fbf292d886aba5e50');
    // OpenPay.setSandboxMode(true);
    OpenPay.setId(environment.openPayId);
      OpenPay.setApiKey(environment.openPayApiKey);
      OpenPay.setSandboxMode(environment.openPaySandBox);
  }

  
  closeModal(): void {
    this.cerrar.emit();
  }

  onProcesarPago(){
    if(!this.ss.isValidModel(this.tarjeta, [])){
      this.ss.showNotification('error', 'Datos faltantes');
      return;
    } else {
      if(+this.tarjeta.expiration_month > 12){
        this.ss.showNotification('error', 'El mes de expiración de la tarjeta no es válido.', 3000);
        return;
      }
    //   // console.log(this.tarjeta)
      this.tokenizarTarjeta();
    }
  }

  acceptTerms(){
    this.condicionesAceptadas = true;
    this.confirmarCondicion = true;
    this.setCondicion.emit(true);
    this.scrollToTop();
  }

  private scrollToTop(options?: ScrollToOptions){
    const el = this.modalBodyContainer.nativeElement;
    if (!el) return;
    // instantáneo o suave según options
    el.scrollTo({ top: 0, ...(options || {}) });
  }

  async tokenizarTarjeta() {
    this.loading = true;
    this.textoLoading = 'Procesando pago...'
    this.setComprobanteModel();
    let r = await this.ss.tokenizarTarjeta(this.tarjeta);
    if(r.ok){
      this.modeloComprobante.metodoPago = r.metodo_desc;
      this.GenerarCargo(r.token_id, r.deviceSessionId);
    } else {
      this.loading = false;
      this.ss.showNotification('error',r.msg, 6000)
    }
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
      total:this.totalPago,
      subtotal:0,
      envio:this.precioEnvio,
      nombreArticulo:`Item#${this.subasta!.id}-${this.subasta!.caption}`,
      idArticulo:this.subasta!.id,
      descripcion: '',
      cantidad:1,
      noAutorizacion: '',
    };
  }

  GenerarCargo(tokenId: string, deviceSessionId: any){
    let userData = this.authService.getUserData();
    // let _redirectTo = `subasta-terminada`
    // let _redirectTo = `subasta-terminada/${this.dataParams}`
    // let dataParamsEndAuth = JSON.stringify({ redirectTo: _redirectTo, moveToAuthPage:false});
    // let dataParamsEndAuth = JSON.stringify({id: this.subasta!.id, tu:'comprador', rt: _redirectTo, mtap: false, process:'payment-winner'});
    let dataParamsEndAuth = JSON.stringify(this.dataParamsAfterAuth);
    // let dataParamsEndAuth = JSON.stringify({idSubasta: this.subasta!.id, tipoUsuario:'comprador', autoRedirect: false, redirectTo: _redirectTo, moveToAuthPage:false, process:'payment-winner'});
    let encodedAuth = this.ss.encodeToBase64(dataParamsEndAuth);


    const dataCharge  = {
      'token': tokenId,
      'amount': this.totalPago,
      'description': 'Pago devolucion-' + userData.id + '-'+this.subasta!.caption,
      'name':this.tarjeta.holder_name,       
      'lastName':this.tarjeta.holder_lastname,       
      'email':this.tarjeta.mail,
      'phone':this.tarjeta.phone,      
      'use_3d_secure': true,
      'device_session_id': deviceSessionId,
     'redirect_url':  `${environment.threeds_redirect_url}/${encodedAuth}` 
     //'redirect_url': `http://localhost:4200/payment-callback/${encodedAuth}` 
      // 'redirect_url': 'https://www.xuba.mx/subasta-terminada/eyJpZFN1YmFzdGEiOjU1MzUsInRpcG9Vc3VhcmlvIjoiY29tcHJhZG9yIn0%3D' 
      // window.open(res.payment_method.url, '_blank');
// 
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
          let textoError = this.ss.getMensajeTextoErrorOpenPay(res.error_code);
          this.ss.showNotification('error', textoError, 6000);
        } 
        else {
          switch(this.process){
            case 'SubastaPremium': this.PagoSubastaPremium(res);
              break;
            case 'SubastaGanador': this.PagoSubastaGanador(res);
              break;
            case 'SubastaDevolucion': this.PagoSubastaDevolucion(res);
              break;

          }
          // this.modeloComprobante.noAutorizacion = res.authorization;
          // this.modeloComprobante.idTransaction = res.id;
          // this.modeloComprobante.fecha = res.operation_date;
          // this.modeloComprobante.estatus = 'Completado';
          // this.modeloComprobante.correo = res.customer.email;
          // let estatusCargo = '';
          // if(res.status === 'completed'){
          //   estatusCargo = 'Completado';

          //   this.CambiarEstatusSubasta(this.subasta!.id, AuctionStatus.Pagado, true);

          // } else {
          //   this.createPaqueteriaModel();
          //   // let encodedKeyTicket = this.ss.encodeToBase64('tmp_ticket_model');
          //   // let encodedKeyPaqueteria = this.ss.encodeToBase64('tmp_paqueteria_model');
          //   // localStorage.setItem(encodedKeyTicket!, JSON.stringify(this.modeloComprobante));
          //   // localStorage.setItem(encodedKeyPaqueteria!, JSON.stringify(this.paqueteriaRequestModel));
          //   // this.paqueteriaRequestModel.idSubastaEntregaGanador = this.miDireccionEntrega.id;
          //   this.ss.setLocalStorageEncodedKey('transaction_id', res.id);
          //   this.ss.setLocalStorageEncodedKey('tmp_direccion_eg', this.miDireccionEntrega.id);
          //   this.ss.setLocalStorageEncodedKey('tmp_ticket_model',  JSON.stringify(this.modeloComprobante));
          //   this.ss.setLocalStorageEncodedKey('tmp_paqueteria_model',  JSON.stringify(this.paqueteriaRequestModel));
          //   setTimeout(() => {
          //     let dataParams = JSON.stringify({id: this.subasta!.id,tid:res.id , tu:'comprador', rt: res.payment_method.url, mtap: true});
          //     let encoded = this.ss.encodeToBase64(dataParams);
          //     this.router.navigate(['/payment-callback',encoded]);
          //   }, 100);
          //   // console.log(this.paqueteriaRequestModel)
          //   console.log(this.miDireccionEntrega)
          // }

        }
      },
      error: (error: any) => {
        this.loading = false;
        this.ss.showNotification('error','Hubo un problema al generar el cargo');  
      }
    });
  }

  PagoSubastaPremium(res: any){

  }

  PagoSubastaGanador(res: any){

  }

  PagoSubastaDevolucion(res:any){
    this.modeloComprobante.noAutorizacion = res.authorization;
    this.modeloComprobante.idTransaction = res.id;
    this.modeloComprobante.fecha = res.operation_date;
    this.modeloComprobante.estatus = 'Completado';
    this.modeloComprobante.correo = res.customer.email;
    let estatusCargo = '';
    if(res.status === 'completed'){
      estatusCargo = 'Completado';

      //this.CambiarEstatusSubasta(this.subasta!.id, AuctionStatus.Pagado, true);

    } else {
      this.createPaqueteriaModel();
      // let encodedKeyTicket = this.ss.encodeToBase64('tmp_ticket_model');
      // let encodedKeyPaqueteria = this.ss.encodeToBase64('tmp_paqueteria_model');
      // localStorage.setItem(encodedKeyTicket!, JSON.stringify(this.modeloComprobante));
      // localStorage.setItem(encodedKeyPaqueteria!, JSON.stringify(this.paqueteriaRequestModel));
      // this.paqueteriaRequestModel.idSubastaEntregaGanador = this.miDireccionEntrega.id;
      this.ss.setLocalStorageEncodedKey('transaction_id', res.id);
      this.ss.setLocalStorageEncodedKey('tmp_direccion_eg', this.direccionEntrega.id);
      this.ss.setLocalStorageEncodedKey('tmp_ticket_model',  JSON.stringify(this.modeloComprobante));
      this.ss.setLocalStorageEncodedKey('tmp_paqueteria_model',  JSON.stringify(this.paqueteriaRequestModel));
      setTimeout(() => {
        let dataParams = JSON.stringify({id: this.subasta!.id,tid:res.id , tu:'vendedor', rt: res.payment_method.url, mtap: true});
        let encoded = this.ss.encodeToBase64(dataParams);
        this.router.navigate(['/payment-callback',encoded]);
      }, 100);
      // console.log(this.paqueteriaRequestModel)
      console.log(this.direccionEntrega)
    }

  }

  createPaqueteriaModel(){
    this.paqueteriaRequestModel = this.ss.getPaqueteriaGuiaModel(this.subasta!,this.direccionEnvio,this.usuarioEnvio,this.direccionEntrega, this.usuarioEntrega );
  }

  emitirEvento(){
    this.procesaPago.emit(this.tarjeta);
  }

  onInput(event: any, atributo: any, fn?: (value: any) => void) {
    const soloNumeros = event.target.value.replace(/[^0-9]/g, '');
    atributo = soloNumeros;
    event.target.value = soloNumeros; 
    fn?.(soloNumeros);
  }

  changeTarjetaSeleccionada(){
    Object.assign(this.tarjeta, this.selectedCard);
  }

}
