import { Component, EventEmitter, OnInit, Output, Signal } from '@angular/core';
import { initDataRegistrarSubasta, RegistrarSubasta } from '../../../../models/registrar-subasta-model';
import { SharedService } from '../../../../services/shared.service';
import { SubastasService } from '../../../../services/subastas.service';
import { OpenPayService } from '../../../../services/openpay.service';
import { AuthService } from '../../../../services/auth.service';
import { environment } from '../../../../environment/environment';
import { Router } from '@angular/router';
import { Usuario } from '../../../../models/subasta.model';
import { LoaderComponent } from '../../loader/loader.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { initDataTarjeta, Tarjeta } from '../../../../models/tarjeta-model';

declare var OpenPay: any;

@Component({
  selector: 'app-nueva-subasta-modal',
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './nueva-subasta-modal.component.html',
  styleUrl: './nueva-subasta-modal.component.css'
})
export class NuevaSubastaModalComponent implements OnInit {
  public usuario!: Signal<Usuario | null>;
  @Output() close = new EventEmitter<void>();
  subasta: RegistrarSubasta = initDataRegistrarSubasta();
  loading: boolean = false;
  direccionesUsuario: any[] = [];
  aceptarTerminosCrearSubasta: boolean = false;
  currentTabIndex: number = -1;
  tipoSubasta: 'general' | 'premium' = 'general';
  tarjeta: Tarjeta = initDataTarjeta();
  porcentajeValorInicial: number = 0;
  selectedCard: any = {};
  tarjetaExpiracion = '';
  textoLoading = '';
  Premium: number = 0;
  listaComisiones: any[] = [];
  modeloComprobante: any = {};
  tipoEntrega: 'sucursal' | 'domicilio' = 'sucursal';
  horaRecolecta: string | null = null;
  horaDomicilioFin: any;
  horarios: string[] = [];
  imagesPreview: any[] = [];
  terminosRevisados: boolean = false;
  tarjetas: any[] = [];
  mostrarCVV = false;
  aceptarTerminos: boolean = false;

  constructor(
    private ss: SharedService,
    private subastaService: SubastasService,
    private openPayService: OpenPayService,
    private router: Router,
    private authService: AuthService) {
    this.usuario = this.authService.currentUser;
    OpenPay.setId(environment.openPayId);
    OpenPay.setApiKey(environment.openPayApiKey);
    OpenPay.setSandboxMode(environment.openPaySandBox);
  }

  ngOnInit(): void {
    this.getComisionesUsuario(0, 'crearSubasta');
    this.getDireccionesUsusario();
    this.getHorarios();
    //throw new Error('Method not implemented.');
  }



  getHorarios() {
    for (let h = 9; h <= 18; h++) {
      for (let m = 0; m < 60; m += 10) {
        if (h === 18 && m > 0) {
          break;
        }
        this.horarios.push(
          `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
        );
      }
    }
  }

  closeModal() {
    this.close.emit();
  }
  nextStep() {
    // console.log(this.subasta)
    // this.validarModelData();

    // this.subasta.horas = this.tipoSubasta ==='premium'? this.subasta.horas:100;
    // if(this.tipoSubasta !== 'premium'){
    // this.subasta.valorOferta = this.subasta.apuesta && this.subasta.apuesta < 100 ? 50:100 ;
    // }
    // let result = this.ss.isValidModelV2(this.subasta, ['url']);
    // if(!result.valid){
    //   let texto = result.prop === 'mimagenesSubasta'? 'Seleccione al menos una imagen':`Informacion faltante: ${result.prop}`;
    //   this.ss.showNotification('warning', texto, 6000);
    //   return;
    // }
    // console.log(result);
    // this.ss.showNotification('info', 'no se debe mostrar');
    // if((this.subasta, ['id','descripcion', 'premium', 'url', 'valorOferta'])){
    //   this.ss.showNotification('error', 'Informacion incompleta');
    //   // valid = false;
    // }
    if ((this.currentTabIndex < 2 && this.tipoSubasta === 'general') || (this.currentTabIndex < 3 && this.tipoSubasta === 'premium')) {
      this.currentTabIndex++;
    } else {
      if (this.isValidModelSubasta() && this.isValidNoNegativeValues()) {
        // this.ss.showNotification('success', 'todo correcto')
        let userData = this.authService.getUserData();
        this.subasta.imagenes = this.getClearBase64(this.subasta.imagenes);
        if (this.tipoSubasta === 'premium') {
          const partes = this.tarjetaExpiracion.split('/');
          if (partes.length !== 2) {
            this.ss.showNotification('warning', 'La fecha de expiración no es válida');
            return;
          }

          this.tarjeta.expiration_month = partes[0] ?? '';
          this.tarjeta.expiration_year = partes[1] ?? '';
          if (this.checkDataPago()) {
            // if(!this.subasta.valorOferta || this.subasta.valorOferta === undefined || this.subasta.valorOferta <= 0){
            //   this.ss.showNotification('warning','El incremento de oferta no es valido');
            //   return;
            // }
            this.subasta.premium = true;
            this.loading = true;
            if (this.selectedCard.id) {
              this.setComprobanteModel();
              let d_id = this.ss.getDeviceSessionID();
              let metodoPagoDescripcion = `Tarjeta • ${this.selectedCard.brand} • **** ${this.selectedCard.card_number}`;
              this.modeloComprobante.metodoPago = metodoPagoDescripcion;
              this.textoLoading = 'Procesando pago...'
              this.GenerarCargo('', d_id, this.selectedCard.id)
              console.log(d_id)

            } else {
              this.tokenizarTarjeta(this.tarjeta);
            }
            // this.tokenizarTarjeta();
          }
        } else {

          // if(this.checkDataSubasta()){
          this.subasta.premium = false;
          // this.subasta.valorOferta = this.subasta.apuesta! < 100 ? 50:100;
          this.loading = true;
          this.saveNewSubasta();
          // }
        }
      }
      // if(this.subasta.mimagenesSubasta.length === 0){
      //   this.ss.showNotification('warning','Debe agregar al menos una imagen');
      //   return;
      // }
      // if(this.subasta.mimagenesSubasta.length > 5 && this.tipoSubasta === 'general'){
      //   this.ss.showNotification('warning','Solo puedes subir 5 imagenes');
      //   return;
      // }

      //console.log(this.subasta.mimagenesSubasta);

    }
  }

  acceptTerms() {
    this.terminosRevisados = true;
  }

  saveNewSubasta() {
    console.log('horaRecolecta:', this.subasta.horaRecolecta);
    console.log('JSON:', this.subasta);
    console.log('JSON STRING:', JSON.stringify(this.subasta));
    this.subastaService.crearSubasta(this.subasta).subscribe({
      next: (response) => {
        this.loading = false;
        this.tarjeta = initDataTarjeta();
        this.subasta = initDataRegistrarSubasta();
        this.ss.showNotification('success', 'Subasta creada con éxito');
        this.closeModal();
      },
      error: (err) => {
        console.log(err)
        this.loading = false;
      },
    })
  }

  saveSubastaSuccess(data: any) {
    console.log(data)
    this.loading = false;
    // this.openModal = false;
    this.tarjeta = initDataTarjeta();
    this.subasta = initDataRegistrarSubasta();
    this.currentTabIndex = 0;
    this.ss.showNotification('success', 'Subasta creada con éxito');
    return;
  }


  getComisionesUsuario(idUsuario: number, aplica: string) {
    this.subastaService.getComisionesCrearSubasta(idUsuario, aplica).subscribe({
      next: (val) => {
        console.log('RESPUESTA:', val);

        this.listaComisiones = val;

        const premium = this.listaComisiones.find(
          (c: any) => c.concepto?.trim().toLowerCase() === 'pago subasta premium'
        );

        const comisionApp = this.listaComisiones.find(
          (c: any) => c.concepto?.trim().toLowerCase() === 'pasarela de pago'
        );

        console.log('PREMIUM:', val);
        console.log('COMISION APP:', comisionApp);

        if (premium && comisionApp) {

          const Premium = Number(premium.porcentaje);
          const porcentajeComision = Number(comisionApp.porcentaje);

          this.Premium = Number(((Premium * 1.16) + (Premium * (porcentajeComision * 1.16) / 100)).toFixed(2));

          console.log('Costo Premium:', Premium);
          console.log('Comisión:', porcentajeComision);
          console.log('PRECIO FINAL:', this.Premium);
        }
      },
      error: (err) => {
        console.error('Error:', err);
      }
    });
  }

  getDireccionesUsusario() {
    this.subastaService.GetDireccionesUsuario(0, '').subscribe({
      next: (response: any) => {
        console.log('Addresses fetched successfully:', response);
        this.direccionesUsuario = response;
      },
      error: (error: any) => {
        console.error('Error fetching addresses:', error);
      }
    }
    );
  }

  changeTarjetaSeleccionada() {
    Object.assign(this.tarjeta, this.selectedCard);

    if (this.selectedCard.id) {
      this.tarjetaExpiracion =
        `${this.selectedCard.expiration_month}/${this.selectedCard.expiration_year}`;

      this.tarjeta.cvv2 = this.selectedCard.cvv2;
    } else {
      this.tarjetaExpiracion = '';
      this.tarjeta.cvv2 = '';
    }
  }



  onInput(event: any, atributo: any, fn?: (value: any) => void) {
    const soloNumeros = event.target.value.replace(/[^0-9]/g, '');
    atributo = soloNumeros;
    event.target.value = soloNumeros;
    fn?.(soloNumeros);
  }

  toCurrency(valor: number): string {
    return this.ss.toCurrency(valor);
  }

  formatearExpiracion(event: any) {
    let valor = event.target.value.replace(/\D/g, '');

    // Máximo 4 números (MMYY)
    if (valor.length > 4) {
      valor = valor.substring(0, 4);
    }

    // Validar mes
    if (valor.length >= 2) {
      let mes = parseInt(valor.substring(0, 2), 10);

      if (mes > 12) {
        mes = 12;
      }

      if (mes <= 0) {
        mes = 1;
      }

      valor = mes.toString().padStart(2, '0') + valor.substring(2);
    }

    // Validar año
    if (valor.length === 4) {
      let anio = parseInt(valor.substring(2, 4), 10);

      if (anio < 26) {
        anio = 26;
      }

      valor = valor.substring(0, 2) + anio.toString().padStart(2, '0');
    }

    // Agregar "/"
    if (valor.length > 2) {
      valor = valor.substring(0, 2) + '/' + valor.substring(2);
    }

    this.tarjetaExpiracion = valor;
  }

  ocultarCVV(valor: string): string {
    return valor ? '•'.repeat(valor.length) : '';
  }
  cambiarCVV(event: any) {
    const valor = event.target.value.replace(/\D/g, '');

    this.tarjeta.cvv2 = valor.substring(0, 4);
  }


  getGanancia() {
    let totalComision = 0;
    if (this.listaComisiones.length > 0) {
      for (let c of this.listaComisiones) {
        switch (c.tipoComision) {
          case 'Porcentaje': let porcentajeValor = (c.porcentaje * this.subasta.precio!) / 100;
            totalComision += porcentajeValor;
            break;
          case 'Pago':
            totalComision += c.porcentaje;
            break;
        }
      }
    }
    return this.subasta.precio! - totalComision;
  }

  async tokenizarTarjeta(card: any) {
    // this.setComprobanteModel();
    // let r = await this.ss.tokenizarTarjeta(this.tarjeta);
    // if(r.ok){
    //   this.modeloComprobante.metodoPago = r.metodo_desc;
    //   this.GenerarCargo(r.token_id, r.deviceSessionId);
    // } else {
    //   this.ss.showNotification('error',r.msg)
    // }
    // console.log(r)
    this.loading = true;
    this.textoLoading = 'Procesando pago...'
    this.setComprobanteModel();
    let r = await this.ss.tokenizarTarjeta(card);
    if (r.ok) {
      this.modeloComprobante.metodoPago = r.metodo_desc;
      this.GenerarCargo(r.token_id, r.deviceSessionId);
    } else {
      this.loading = false;
      this.ss.showNotification('error', r.msg, 6000)
    }
  }

  onContentClick(event: MouseEvent) {
    if (this.loading) return;
    event.stopPropagation();
  }


  async GenerarCargo(tokenId: string, deviceSessionId: any, card_id?: any) {
    let dataParamsEndAuth = JSON.stringify({ id: -1, tu: 'vendedor', rt: 'home', mtap: false, process: 'payment-premium' });
    let encodedAuth = this.ss.encodeToBase64(dataParamsEndAuth);

    const dataCharge: any = this.generarModeloCargo(deviceSessionId, encodedAuth!);
    if (card_id) {
      dataCharge.idTarjeta = card_id;
      // dataCharge.customerId = this.usuario()?.customer_Id
      dataCharge.deviceSessionId = deviceSessionId
      dataCharge.redirectUrl = dataCharge.redirect_url
    } else {
      dataCharge.token = tokenId;
    }
    this.loading = true;
    let responseCharge = await this.getChargePaymentResponse(dataCharge, card_id);

    console.log(responseCharge);
    if (responseCharge.success) {
      let res: any = card_id ? responseCharge.result : JSON.parse(responseCharge.result.message);
      if (res.error_code || res.error_message) {
        let textoError = this.ss.getMensajeTextoErrorOpenPay(res.error_code ?? res.error_message);
        this.ss.showNotification('error', textoError, 6000);
      } else {
        this.afterProcessCharge(res);
      }

    } else {
      this.ss.showNotification('error', 'Hubo un problema al generar el cargo');
      return;
    }
  }


  afterProcessCharge(response: any) {
    this.setResponseComprobanteData(response);
    if (response.status === 'completed') {
      this.saveNewSubasta();
      //this.CambiarEstatusSubasta(this.subasta!.id, AuctionStatus.Pagado, true);
    } else {
      this.setToXubaComprobante(response)
      this.moveTo3DAuth(response);
    }
  }

  setResponseComprobanteData(response: any) {
    this.modeloComprobante.noAutorizacion = response.authorization;
    this.modeloComprobante.idTransaction = response.id;
    this.modeloComprobante.fecha = response.operation_date;
    this.modeloComprobante.estatus = 'Completado';
    this.modeloComprobante.correo = this.tarjeta.mail;
  }

  moveTo3DAuth(response: any) {
    setTimeout(() => {
      let dataParams = JSON.stringify({ 'id': -1, 'tid': response.id, 'tu': 'comprador', 'rt': response.payment_method.url, 'mtap': true });
      let encoded = this.ss.encodeToBase64(dataParams);
      this.router.navigate(['/payment-callback', encoded]);
    }, 100);
  }

  setToXubaComprobante(response: any) {
    this.ss.setLocalStorageEncodedKey('transaction_id', response.id);
    this.ss.setLocalStorageEncodedKey('tmp_subasta_model', JSON.stringify(this.subasta));
    this.ss.setLocalStorageEncodedKey('tmp_ticket_model', JSON.stringify(this.modeloComprobante));
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

  generarModeloCargo(deviceSessionId: any, encodedAuth: string) {
    let userData = this.authService.getUserData();
    const dataCharge: any = {
      'amount': this.Premium,
      'description': 'Pago subasta premium vendedor ' + userData.id,
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

  onFileChange(event: any) {
    const files = event.target.files;
    let maxFileCount = this.tipoSubasta === 'general' ? 5 : 100;
    let maxCantAdd = maxFileCount - this.subasta.imagenes.length;
    let restFilesCount = files && files.length > maxCantAdd ? maxCantAdd : files.length;
    // if (files && files.length + this.subasta.mimagenesSubasta.length <= maxFileCount) {
    if (restFilesCount > 0) {
      for (let i = 0; i < restFilesCount; i++) {
        // for (let i = 0; i < files.length && this.subasta.mimagenesSubasta.length < maxFileCount; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.subasta.imagenes.push({ base64: e.target.result });
          this.imagesPreview!.push({ url: e.target.result });
          // this.imagenes.push(e.target.result);
        };
        reader.readAsDataURL(files[i]);
        // }
      }
    }
  }

  eliminarImagen(index: number) {
    this.subasta.imagenes.splice(index, 1);
    this.imagesPreview!.splice(index, 1);
    // this.imagenes
  }


  setValorHoras() {
    if (this.tipoSubasta === 'general') {
      this.subasta.horas = 100;
      this.subasta.valorOferta = this.subasta.apuesta && this.subasta.apuesta < 100 ? 50 : 100;
      if (this.subasta.imagenes.length > 5) {
        this.subasta.imagenes.splice(5);
        this.imagesPreview.splice(5);

      }

    } else {
      this.subasta.horas = null;
      this.subasta.valorOferta = null;
      this.calcularValorInicial();
    }
    this.getComisionesUsuario(this.usuario()!.id, 'Premium');

  }


  calcularValorInicial() {
    this.subasta.apuesta = (this.subasta.precio! * this.porcentajeValorInicial) / 100
    this.subasta.valorOferta = this.subasta.apuesta * 0.6;
  }


  isValidModelSubasta() {
    let isValid = true;
    this.subasta.entregaSucursal = this.tipoEntrega === 'sucursal' ? true : false;
    if (this.tipoEntrega === 'domicilio') {
      this.subasta.horaRecolecta = this.horaRecolecta + ':00';

      if (
        this.horaRecolecta! < '09:00' ||
        this.horaRecolecta! > '18:00'
      ) {
        this.ss.showNotification(
          'warning',
          'La hora de recolecta debe estar entre las 9:00 AM y las 6:00 PM.'
        );
        return false;
      }

    }
    this.subasta.horas = this.tipoSubasta === 'premium' ? this.subasta.horas : 100;
    if (this.tipoSubasta !== 'premium') {
      this.subasta.valorOferta = this.subasta.apuesta && this.subasta.apuesta < 100 ? 50 : 100;
    }
    let result = this.ss.isValidModelV2(this.subasta, ['url', 'horaRecolecta']);
    if (!result.valid) {
      let texto = result.prop === 'mimagenesSubasta' ? 'Seleccione al menos una imagen' : `Informacion faltante: ${result.prop}`;
      this.ss.showNotification('warning', texto, 6000);
      isValid = false;
      // return;
    }
    return isValid;
  }

  setComprobanteModel() {
    let clienteNombre = `${this.usuario()?.nombre} ${this.usuario()?.apellido}`
    const timestamp = Date.now();

    this.modeloComprobante = {
      estatus: '',
      fecha: '',
      idTransaction: '',
      metodoPago: '',
      cliente: clienteNombre,
      correo: '',
      ordenXuba: `NAX-PREMIUM_${timestamp}-${this.usuario()?.id}`,
      total: this.Premium,
      subtotal: this.Premium,
      envio: 0,
      nombreArticulo: `NAX#${this.subasta.caption}-${this.subasta.descripcion?.substring(0, 10)}`,
      idArticulo: 0,
      descripcion: this.subasta.descripcion?.substring(0, 10),
      cantidad: 1,
      noAutorizacion: '',
    };
  }


  isValidNoNegativeValues() {
    if (this.subasta.peso! <= 0) {
      this.ss.showNotification('warning', 'El peso del producto no es valido');
      return false;
    }

    if (this.subasta.precio! <= 0) {
      this.ss.showNotification('warning', 'El precio es invalido');
      return false;
    }
    if (this.subasta.ancho! <= 0) {
      this.ss.showNotification('warning', 'El alto del producto no es valido');
      return false;
    }
    if (this.subasta.largo! <= 0) {
      this.ss.showNotification('warning', 'El largo del producto no es valido');
      return false;
    }
    if (this.subasta.profundidad! <= 0) {
      this.ss.showNotification('warning', 'El valor de profundidad no es valido');
      return false;
    }

    if (this.subasta.horas! <= 0 || this.subasta.horas! > 100 || (this.tipoSubasta === 'premium' && this.subasta.horas! < 1)) {
      this.ss.showNotification('warning', 'El tiempo no es valido');
      return false;
    }

    if (this.subasta.valorOferta! <= 0 || this.subasta.valorOferta! > this.subasta.precio!) {
      this.ss.showNotification('warning', 'El aumento de oferta no es valido');
      return false;
    }
    // if(this.tipoSubasta === 'premium' && (this.subasta.horas! <= 0))
    return true;
    //  return;
  }

  getClearBase64(array: any[]) {
    for (let i of array) {
      // console.log(i)
      let url = i.base64;
      let index = url.indexOf('base64');
      let firstPart = url.substring(0, index + 7);
      i.base64 = url.replace(firstPart, '');
    }
    return array;
  }

  checkDataPago() {
    let valid = true;
    let omitir = this.ss.isValidValue(this.selectedCard.id) ? ['card_number'] : ['id'];
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
    // if(!this.ss.isValidModel(_card,omitir)){
    // // if(!this.ss.isValidModel(this.tarjeta, [])){
    //   this.ss.showNotification('warning', 'Informacion de pago incompleta');
    //   valid = false;
    // }
    // 
    if (!this.ss.isValidModel(_card, omitir)) {
      this.ss.showNotification('error', 'Datos faltantes');
      valid = false;
    } else {
      if (+_card.expiration_month > 12) {
        this.ss.showNotification('error', 'El mes de expiración de la tarjeta no es válido.', 3000);
        valid = false;
      }
    }
    return valid;
  }

  handleError(data: any) {
    this.loading = false;
    console.log(data);
  }


}
