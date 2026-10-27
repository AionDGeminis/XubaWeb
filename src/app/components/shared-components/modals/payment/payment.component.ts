import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';
import { LoaderComponent } from '../../loader/loader.component';
import { DetalleSubasta, Subasta } from '../../../../models/subasta.model';
import { SharedService } from '../../../../services/shared.service';
import { SubastasService } from '../../../../services/subastas.service';
import { AuthService } from '../../../../services/auth.service';
import { OpenPayService } from '../../../../services/openpay.service';
import { environment } from '../../../../environment/environment';
import { ProcesoPago } from '../../../../../enums/tipo-proceso-pago.enum';
declare var OpenPay: any;

@Component({
  selector: 'app-payment',
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
  @Input() subasta: DetalleSubasta | null = null;
  @Input() tarjetas: any[] = [];
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
  @Input() dataParamsAfter3DSAuth: any = {};
  @Input() tipoUsuario: string = '';


  @Input() condicionesAceptadas: boolean = false;
  @Input() confirmarCondicion: boolean = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() onCompletePayment = new EventEmitter<void>();
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
    mail: '',
    phone: '',
  };
  mostrarCVV = false;
  tarjetaExpiracion = '';
  modeloComprobante: any = {};
  selectedCard: any = {};
  loading: boolean = false;
  textoLoading: string = '';
  paqueteriaRequestModel: any = {}
  infoUsuario: any = {};
  @ViewChild('modalBody') private modalBodyContainer!: ElementRef;

  constructor(private ss: SharedService, private router: Router, private subastaService: SubastasService, private authService: AuthService, private openPayService: OpenPayService) { }

  ngOnInit(): void {
    // OpenPay.setId('mz5jjyzabcb3zzpevo0l');
    // OpenPay.setApiKey('pk_f2da5530e74d4c7fbf292d886aba5e50');
    // OpenPay.setSandboxMode(true);
    OpenPay.setId(environment.openPayId);
    OpenPay.setApiKey(environment.openPayApiKey);
    OpenPay.setSandboxMode(environment.openPaySandBox);

    this.getInformacionUsuario();
    console.log(this.dataParamsAfter3DSAuth)
    console.log(this.subasta)
  }

  getInformacionUsuario() {
    this.loading = true;
    this.authService.consultarDatosUsuario(0).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.infoUsuario = response;
        console.log(this.infoUsuario)
        this.getSecureCards();
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Error fetching user information:', err);
      }
    });
  }

  formatearExpiracion(event: any) {
    let valor = event.target.value.replace(/\D/g, '');

    if (valor.length > 4) {
      valor = valor.substring(0, 4);
    }

    if (valor.length >= 2) {
      let mes = parseInt(valor.substring(0, 2), 10);

      if (mes > 12) mes = 12;
      if (mes <= 0) mes = 1;

      valor = mes.toString().padStart(2, '0') + valor.substring(2);
    }

    if (valor.length === 4) {
      let anio = parseInt(valor.substring(2, 4), 10);

      if (anio < 26) anio = 26;

      valor = valor.substring(0, 2) + anio.toString().padStart(2, '0');
    }

    if (valor.length > 2) {
      valor = valor.substring(0, 2) + '/' + valor.substring(2);
    }

    this.tarjetaExpiracion = valor;
  }


  closeModal(): void {
    this.cerrar.emit();
  }

  async onProcesarPago() {
    // if (!this.ss.isValidModel(this.tarjeta, [])) {
    //   this.ss.showNotification('error', 'Datos faltantes');
    //   return;
    // } else {
    //   if (+this.tarjeta.expiration_month > 12) {
    //     this.ss.showNotification('error', 'El mes de expiración de la tarjeta no es válido.', 3000);
    //     return;
    //   }
    //   //   // console.log(this.tarjeta)
    //   this.tokenizarTarjeta();
    // }
    let omitir = this.ss.isValidValue(this.selectedCard.id) ? ['card_number'] : ['id']
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
    console.log(_card)
    console.log(this.selectedCard)
    if (!this.ss.isValidModel(_card, omitir)) {
      this.ss.showNotification('error', 'Datos faltantes');
      return;
    } else {
      if (+_card.expiration_month > 12) {
        this.ss.showNotification('error', 'El mes de expiración de la tarjeta no es válido.', 3000);
        return;
      }
      let r = await this.ss.showConfirmMessage('¿Desea proceder con el pago?');
      if (r) {
        if (_card.id) {
          this.setComprobanteModel();
          let d_id = this.ss.getDeviceSessionID();
          console.log(d_id)
          let metodoPagoDescripcion = `Tarjeta • ${this.selectedCard.brand} • **** ${this.selectedCard.card_number}`;
          this.modeloComprobante.metodoPago = metodoPagoDescripcion;
          console.log(this.modeloComprobante);
          //this.setLoading.emit(true);
          // this.textoLoading = 'Procesando pago...'
          this.GenerarCargo('', d_id, _card.id)

        } else {
          this.tokenizarTarjeta(_card);
        }
      }
    }
  }


  getNewCardModel() {
    return {
      id: null,
      holder_name: '',
      holder_lastname: '',
      card_number: '',
      expiration_month: '',
      expiration_year: '',
      cvv2: '',
      mail: '',
      phone: '',
    };
  }

  async getSecureCards() {
    // this.openPayService.getTarjetasUsuario(this.infoUsuario.id).subscribe({
    this.openPayService.GetTarjetasUsuario(0).subscribe({
      next: (response: any) => {
        console.log(response)
        this.tarjetas = response;
        // let newCard = this.getNewCardModel();
        // this.tarjetas.push(newCard);
        // this.loading = false;
      },
      error: (err) => {
        console.log(err)
        // this.loading = false;
        //this.ss.showNotification('error', 'Hubo un problema al intentar obtener la lista de tarjetas');

      }
    })
  }

  acceptTerms() {
    this.condicionesAceptadas = true;
    this.confirmarCondicion = true;
    this.setCondicion.emit(true);
    this.scrollToTop();
  }

  private scrollToTop(options?: ScrollToOptions) {
    const el = this.modalBodyContainer.nativeElement;
    if (!el) return;
    // instantáneo o suave según options
    el.scrollTo({ top: 0, ...(options || {}) });
  }

  async tokenizarTarjeta(card: any) {
    this.setLoading.emit(true);
    // this.loading = true;
    // this.textoLoading = 'Procesando pago...'
    this.setComprobanteModel();
    let r = await this.ss.tokenizarTarjeta(card);
    console.log(r)
    // let r = await this.ss.tokenizarTarjeta(this.tarjeta);
    if (r.ok) {
      this.modeloComprobante.metodoPago = r.metodo_desc;
      this.GenerarCargo(r.token_id, r.deviceSessionId);
    } else {
      // this.loading = false;
      this.setLoading.emit(false);
      this.ss.showNotification('error', r.msg, 6000)
    }
  }
  // async tokenizarTarjeta() {
  //   this.loading = true;
  //   this.textoLoading = 'Procesando pago...'
  //   this.setComprobanteModel();
  //   let r = await this.ss.tokenizarTarjeta(this.tarjeta);
  //   if (r.ok) {
  //     this.modeloComprobante.metodoPago = r.metodo_desc;
  //     this.GenerarCargo(r.token_id, r.deviceSessionId);
  //   } else {
  //     this.loading = false;
  //     this.ss.showNotification('error', r.msg, 6000)
  //   }
  // }

  setComprobanteModel() {
    let clienteNombre = `${this.tarjeta?.holder_name} ${this.tarjeta?.holder_lastname}`

    this.modeloComprobante = {
      estatus: '',
      fecha: '',
      idTransaction: '',
      metodoPago: '',
      cliente: clienteNombre,
      correo: this.tarjeta.mail,
      ordenXuba: `XU-${this.process === 'PagoDevolucion' ? 'PDEV' : 'SGAN'}-${this.subasta!.id}`,
      total: this.totalPago,
      subtotal: 0,
      envio: this.precioEnvio,
      nombreArticulo: `Item #${this.subasta!.id}-${this.subasta!.caption}`,
      idArticulo: this.subasta!.id,
      descripcion: '',
      cantidad: 1,
      noAutorizacion: '',
    };
  }

  async GenerarCargo(tokenId: string, deviceSessionId: any, card_id?: any) {
    // let userData = this.authService.getUserData();
    //let _redirectTo = `subasta-terminada`
    // let _redirectTo = `subasta-terminada/${this.dataParams}`
    // let dataParamsEndAuth = JSON.stringify({ redirectTo: _redirectTo, moveToAuthPage:false});
    // let dataParamsEndAuth = JSON.stringify({ id: this.subasta!.id, tu: 'comprador', rt: _redirectTo, mtap: false, process: 'payment-winner' });
    console.log(this.dataParamsAfter3DSAuth)
    let dataParamsEndAuth = JSON.stringify(this.dataParamsAfter3DSAuth);
    // let dataParamsEndAuth = JSON.stringify({idSubasta: this.subasta!.id, tipoUsuario:'comprador', autoRedirect: false, redirectTo: _redirectTo, moveToAuthPage:false, process:'payment-winner'});
    let encodedAuth = this.ss.encodeToBase64(dataParamsEndAuth);
    console.log(dataParamsEndAuth)
    const dataCharge: any = this.generarModeloCargo(deviceSessionId, encodedAuth!);
    console.log(dataCharge)
    console.log(JSON.stringify(dataCharge))
    if (card_id) {
      dataCharge.idTarjeta = card_id;
      dataCharge.customerId = this.infoUsuario.customer_Id
      dataCharge.deviceSessionId = deviceSessionId
      dataCharge.redirectUrl = dataCharge.redirect_url
    } else {
      dataCharge.token = tokenId;
    }
    this.setLoading.emit(true);
    let responseCharge = await this.getChargePaymentResponse(dataCharge, card_id);
    console.log(responseCharge)
    if (responseCharge.success) {
      let res: any = card_id ? responseCharge.result : JSON.parse(responseCharge.result.message);
      if (res.error_code || res.error_message) {
        let textoError = this.ss.getMensajeTextoErrorOpenPay(res.error_code ?? res.error_message);
        this.ss.showNotification('error', textoError, 6000);
      } else {
        this.afterProcessCharge(res);
      }

    } else {
      let mensaje = responseCharge.result.error.message ? responseCharge.result.error.message : 'Hubo un problema al generar el cargo'
      let textoError = responseCharge.result.error && responseCharge.result.error.detail ? this.parseOpenpayError(responseCharge.result.error.detail) : null;
      let _mensaje = textoError ? textoError.description : mensaje;
      this.ss.showNotification('error', _mensaje, 5000);
      return;
    }
  }

  afterProcessCharge(response: any) {
    this.setResponseComprobanteData(response);
    if (response.status === 'completed') {
      this.onCompletePayment.emit(response);
      //this.CambiarEstatusSubasta(this.subasta!.id, AuctionStatus.PreparacionEnvio, true);
    } else {
      if (this.process !== ProcesoPago.PagoPremium) {
        this.createPaqueteriaModel();
      }
      // this.createRecoleccionModel();
      this.setToXubaComprobante(response)
      this.moveTo3DAuth(response);
    }
  }

  setResponseComprobanteData(response: any) {
    this.modeloComprobante.noAutorizacion = response.authorization;
    this.modeloComprobante.idTransaction = response.id;
    this.modeloComprobante.fecha = response.operation_date;
    this.modeloComprobante.estatus = 'Completado';
  }


  setToXubaComprobante(response: any) {
    this.ss.setLocalStorageEncodedKey('transaction_id', response.id);
    this.ss.setLocalStorageEncodedKey('tmp_direccion_eg', this.direccionEntrega.id);
    this.ss.setLocalStorageEncodedKey('tmp_ticket_model', JSON.stringify(this.modeloComprobante));
    this.ss.setLocalStorageEncodedKey('tmp_paqueteria_model', JSON.stringify(this.paqueteriaRequestModel));
    this.ss.setLocalStorageEncodedKey('tmp_recoleccion_model', JSON.stringify({})
    );
  }

  moveTo3DAuth(response: any) {
    setTimeout(() => {
      let dataParams = JSON.stringify({ 'id': this.subasta!.id, 'tid': response.id, tu: this.tipoUsuario, 'rt': response.payment_method.url, mtap: true });
      let encoded = this.ss.encodeToBase64(dataParams);
      this.router.navigate(['/payment-callback', encoded]);
    }, 100);
  }

  parseOpenpayError(msg: string): any | null {
    const start = msg.indexOf('{');
    const end = msg.lastIndexOf('}');
    if (start === -1 || end <= start) return null;

    try {
      return JSON.parse(msg.substring(start, end + 1));
    } catch {
      return null;
    }
  }



  generarModeloCargo(deviceSessionId: any, encodedAuth: string) {
    // let userData = this.authService.getUserData();
    // console.log(userData)
    let descripcion = ``;
    switch (this.process) {
      case 'PagoGanador':
        descripcion = `Pago subasta GANADA-${this.subasta!.id}-${this.subasta!.caption}`;
        break;
      case 'PagoDevolucion':
        descripcion = `Pago devolucion subasta-${this.subasta!.id}-${this.subasta!.caption}`;
        break;
      case 'PagoPremium':
        descripcion = `Pago subasta COMISIONISTA-${this.subasta!.id}-${this.subasta!.caption}`;
        break;
    }
    const dataCharge: any = {
      // 'token': tokenId,
      // 'amount': this.subasta!.apuesta,
      'amount': this.totalPago,
      'description': descripcion,
      'name': this.tarjeta.holder_name,
      'lastName': this.tarjeta.holder_lastname,
      'email': this.tarjeta.mail,
      'phone': this.tarjeta.phone,
      'use_3d_secure': true,
      'device_session_id': deviceSessionId,
      'redirect_url': `${environment.threeds_redirect_url}/${encodedAuth}`
    };
    return dataCharge;
  }

  async getChargePaymentResponse(dataChargeModel: any, card_id?: any) {
    let responseCharge = await new Promise<any>((res, rej) => {
      if (card_id) {
        this.openPayService.GenerarCargoSecureCard(dataChargeModel).subscribe({
          next: (response: any) => {
            this.loading = false;
            res({ success: true, result: response });
          },
          error: (error: any) => {
            this.loading = false;
            res({ success: false, result: error });
          }
        });
      } else {
        this.openPayService.GenerarCargo(dataChargeModel).subscribe({
          next: (response: any) => {
            this.loading = false;
            res({ success: true, result: response });
          },
          error: (error: any) => {
            this.loading = false;
            res({ success: false, result: error });
          }
        });
      }
    });
    return responseCharge;
  }



  // GenerarCargo(tokenId: string, deviceSessionId: any) {
  //   let userData = this.authService.getUserData();
  //   // let _redirectTo = `subasta-terminada`
  //   // let _redirectTo = `subasta-terminada/${this.dataParams}`
  //   // let dataParamsEndAuth = JSON.stringify({ redirectTo: _redirectTo, moveToAuthPage:false});
  //   // let dataParamsEndAuth = JSON.stringify({id: this.subasta!.id, tu:'comprador', rt: _redirectTo, mtap: false, process:'payment-winner'});
  //   let dataParamsEndAuth = JSON.stringify(this.dataParamsAfterAuth);
  //   // let dataParamsEndAuth = JSON.stringify({idSubasta: this.subasta!.id, tipoUsuario:'comprador', autoRedirect: false, redirectTo: _redirectTo, moveToAuthPage:false, process:'payment-winner'});
  //   let encodedAuth = this.ss.encodeToBase64(dataParamsEndAuth);


  //   const dataCharge = {
  //     'token': tokenId,
  //     'amount': this.totalPago,
  //     'description': 'Pago devolucion-' + userData.id + '-' + this.subasta!.caption,
  //     'name': this.tarjeta.holder_name,
  //     'lastName': this.tarjeta.holder_lastname,
  //     'email': this.tarjeta.mail,
  //     'phone': this.tarjeta.phone,
  //     'use_3d_secure': true,
  //     'device_session_id': deviceSessionId,
  //     'redirect_url': `${environment.threeds_redirect_url}/${encodedAuth}`
  //     //'redirect_url': `http://localhost:4200/payment-callback/${encodedAuth}` 
  //     // 'redirect_url': 'https://www.xuba.mx/subasta-terminada/eyJpZFN1YmFzdGEiOjU1MzUsInRpcG9Vc3VhcmlvIjoiY29tcHJhZG9yIn0%3D' 
  //     // window.open(res.payment_method.url, '_blank');
  //     // 
  //   };

  //   console.log(dataCharge)
  //   this.openPayService.GenerarCargo(dataCharge).subscribe({
  //     next: (response: any) => {
  //       this.loading = false;

  //       console.log('CARGO COMPLETADO')
  //       console.log(response);
  //       let res = JSON.parse(response.message);
  //       console.log(res);

  //       if (res.error_code) {
  //         let textoError = this.ss.getMensajeTextoErrorOpenPay(res.error_code);
  //         this.ss.showNotification('error', textoError, 6000);
  //       }
  //       else {
  //         switch (this.process) {
  //           case 'PagoPremium': this.PagoSubastaPremium(res);
  //             break;
  //           case 'PagoGanador': this.PagoSubastaGanador(res);
  //             break;
  //           case 'PagoDevolucion': this.PagoSubastaDevolucion(res);
  //             break;

  //         }
  //         // this.modeloComprobante.noAutorizacion = res.authorization;
  //         // this.modeloComprobante.idTransaction = res.id;
  //         // this.modeloComprobante.fecha = res.operation_date;
  //         // this.modeloComprobante.estatus = 'Completado';
  //         // this.modeloComprobante.correo = res.customer.email;
  //         // let estatusCargo = '';
  //         // if(res.status === 'completed'){
  //         //   estatusCargo = 'Completado';

  //         //   this.CambiarEstatusSubasta(this.subasta!.id, AuctionStatus.Pagado, true);

  //         // } else {
  //         //   this.createPaqueteriaModel();
  //         //   // let encodedKeyTicket = this.ss.encodeToBase64('tmp_ticket_model');
  //         //   // let encodedKeyPaqueteria = this.ss.encodeToBase64('tmp_paqueteria_model');
  //         //   // localStorage.setItem(encodedKeyTicket!, JSON.stringify(this.modeloComprobante));
  //         //   // localStorage.setItem(encodedKeyPaqueteria!, JSON.stringify(this.paqueteriaRequestModel));
  //         //   // this.paqueteriaRequestModel.idSubastaEntregaGanador = this.miDireccionEntrega.id;
  //         //   this.ss.setLocalStorageEncodedKey('transaction_id', res.id);
  //         //   this.ss.setLocalStorageEncodedKey('tmp_direccion_eg', this.miDireccionEntrega.id);
  //         //   this.ss.setLocalStorageEncodedKey('tmp_ticket_model',  JSON.stringify(this.modeloComprobante));
  //         //   this.ss.setLocalStorageEncodedKey('tmp_paqueteria_model',  JSON.stringify(this.paqueteriaRequestModel));
  //         //   setTimeout(() => {
  //         //     let dataParams = JSON.stringify({id: this.subasta!.id,tid:res.id , tu:'comprador', rt: res.payment_method.url, mtap: true});
  //         //     let encoded = this.ss.encodeToBase64(dataParams);
  //         //     this.router.navigate(['/payment-callback',encoded]);
  //         //   }, 100);
  //         //   // console.log(this.paqueteriaRequestModel)
  //         //   console.log(this.miDireccionEntrega)
  //         // }

  //       }
  //     },
  //     error: (error: any) => {
  //       this.loading = false;
  //       this.ss.showNotification('error', 'Hubo un problema al generar el cargo');
  //     }
  //   });
  // }

  // PagoSubastaPremium(res: any) {

  // }

  // PagoSubastaGanador(res: any) {

  // }

  // PagoSubastaDevolucion(res: any) {
  //   this.modeloComprobante.noAutorizacion = res.authorization;
  //   this.modeloComprobante.idTransaction = res.id;
  //   this.modeloComprobante.fecha = res.operation_date;
  //   this.modeloComprobante.estatus = 'Completado';
  //   this.modeloComprobante.correo = res.customer.email;
  //   let estatusCargo = '';
  //   if (res.status === 'completed') {
  //     estatusCargo = 'Completado';

  //     //this.CambiarEstatusSubasta(this.subasta!.id, AuctionStatus.Pagado, true);

  //   } else {
  //     this.createPaqueteriaModel();
  //     // let encodedKeyTicket = this.ss.encodeToBase64('tmp_ticket_model');
  //     // let encodedKeyPaqueteria = this.ss.encodeToBase64('tmp_paqueteria_model');
  //     // localStorage.setItem(encodedKeyTicket!, JSON.stringify(this.modeloComprobante));
  //     // localStorage.setItem(encodedKeyPaqueteria!, JSON.stringify(this.paqueteriaRequestModel));
  //     // this.paqueteriaRequestModel.idSubastaEntregaGanador = this.miDireccionEntrega.id;
  //     this.ss.setLocalStorageEncodedKey('transaction_id', res.id);
  //     this.ss.setLocalStorageEncodedKey('tmp_direccion_eg', this.direccionEntrega.id);
  //     this.ss.setLocalStorageEncodedKey('tmp_ticket_model', JSON.stringify(this.modeloComprobante));
  //     this.ss.setLocalStorageEncodedKey('tmp_paqueteria_model', JSON.stringify(this.paqueteriaRequestModel));
  //     setTimeout(() => {
  //       let dataParams = JSON.stringify({ id: this.subasta!.id, tid: res.id, tu: 'vendedor', rt: res.payment_method.url, mtap: true });
  //       let encoded = this.ss.encodeToBase64(dataParams);
  //       this.router.navigate(['/payment-callback', encoded]);
  //     }, 100);
  //     // console.log(this.paqueteriaRequestModel)
  //     console.log(this.direccionEntrega)
  //   }

  // }

  createPaqueteriaModel() {
    this.paqueteriaRequestModel = this.ss.getPaqueteriaGuiaModel(this.subasta!, this.direccionEntrega, this.infoUsuario);
    //this.paqueteriaRequestModel = this.ss.getPaqueteriaGuiaModel(this.subasta!, this.direccionEnvio, this.usuarioEnvio, this.direccionEntrega, this.usuarioEntrega);
  }

  emitirEvento() {
    this.procesaPago.emit(this.tarjeta);
  }

  onInput(event: any, atributo: any, fn?: (value: any) => void) {
    const soloNumeros = event.target.value.replace(/[^0-9]/g, '');
    atributo = soloNumeros;
    event.target.value = soloNumeros;
    fn?.(soloNumeros);
  }

  changeTarjetaSeleccionada() {
    this.tarjetaExpiracion = `${this.selectedCard.expiration_month}/${this.selectedCard.expiration_year}`;
    Object.assign(this.tarjeta, this.selectedCard);
  }

}
