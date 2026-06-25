import { Component, OnInit, Signal, computed } from '@angular/core';
import { Usuario } from '../../models/subasta.model';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { CommonModule } from '@angular/common';
import html2pdf from 'html2pdf.js';
import { SubastasService } from '../../services/subastas.service';
import { AuctionStatus } from '../../../enums/auction-estatus.enum';
import { Logob64redComponent } from '../logob64red/logob64red.component';
import { ReclamoEstatus } from '../../../enums/reclamo-status.enum';
import { OpenPayService } from '../../services/openpay.service';

@Component({
  selector: 'app-auth-callback',
  imports: [CommonModule,Logob64redComponent ],
  templateUrl: './auth-callback.component.html',
  styleUrl: './auth-callback.component.css'
})
export class AuthCallbackComponent implements OnInit{
  
  public usuario!: Signal<Usuario|null>;
  public isLoggedIn!: Signal<boolean>;
  jsonParams: any = {};
  hasPermiso: boolean = false;
  redirectAutoTime: number = 10; 
  modeloComprobante: any = {}
  currentStatusPayment = 'process';
  classComprobanteModal = '';
  intentos: number = 0;
  showContent: any = {success:false,error:false,waiting:false, nodisponible:false, actualizando:false, error_ap: false}
  checkingStatus: boolean = false;
  tituloErrorGeneral = '';

  // showRedirecting: boolean = false;
  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private ss: SharedService, 
    private subastaService: SubastasService,
    private openPayService: OpenPayService,
    private router: Router ){
      this.usuario = this.authService.currentUser;
      this.isLoggedIn = computed(() => !!this.usuario());
      let dataParams: any = this.route.snapshot.params['responseData'];
     
      let decoded = this.ss.decodeFromBase64(dataParams);
      if(decoded){
        this.hasPermiso = true;
        this.jsonParams = JSON.parse(decoded);
        console.log(this.jsonParams)
        // this.jsonParams.moveToAuthPage ?? false;
        this.jsonParams.mtap ?? false;
      } else {
        this.hasPermiso = false;
      }
      // console.log(this.jsonParams);
  }

  ngOnInit(): void {
    if(this.jsonParams.mtap){
      this.startAuthCountdown();
    } else {
      this.checkCurrentChargeStatus();
    }
    // let idDireccion = this.ss.getLocalStorageEncodedKey('tmp_direccion_eg');
    // console.log(idDireccion)
  }

  startAuthCountdown(){
    if(this.redirectAutoTime > 0){
      this.redirectAutoTime--;
      setTimeout(() => {
        this.startAuthCountdown();
      }, 1000);
    } else{
      if(this.redirectAutoTime === 0){
        window.location.href = this.jsonParams.rt;
      }
    }
  }

  checkCurrentChargeStatus(){
    // let encodedKeyDataTransactionID =  this.ss.encodeToBase64('transaction_id');
    // let transactionID = localStorage.getItem(encodedKeyDataTransactionID!);
    let transactionID = this.ss.getLocalStorageEncodedKey('transaction_id');
    console.log(transactionID)
    if(this.intentos < 5){
      this.openPayService.VerificarEstatusCargo(transactionID!).subscribe({
        next:(response: any)=>{
          console.log(response)
          switch(response.status){
            case 'in_process':
                this.setShowContent('waiting');
                this.intentos++;
                setTimeout(() => {
                  this.checkCurrentChargeStatus();
                }, 20000);
              break;
            case 'completed':
                this.setShowContent('actualizando');
                this.checkCurrentProcess();
              break;
            default:
                this.setShowContent('error');
              break;
          }
        }, 
        error:(err) => {
          console.log(err)
        }
      });
    }
    else {
      this.setShowContent('nodisponible');
      // this.showContent =  {success:false,error:false,waiting:false, nodisponible:true}
    }
  }


  checkCurrentProcess(){
    let _status = this.jsonParams.process;//localStorage.getItem('current_payment_status');
    console.log(_status);
    switch(_status){
      case 'payment-premium': 
          this.saveNewSubasta();
        break;
      case 'payment-winner':
          this.CambiarEstatusSubasta(this.jsonParams.id,AuctionStatus.Pagado);
        break;
      case 'payment-guide-return':
          this.CambiarEstatusReclamo(this.jsonParams.idc);
        break;
    }
    // switch(_status){
    //   case 'process-from-uwp': 
    //     break;
    //   case 'validating-status':
    //     break;
    //   case 'process-from-home':
    //     break;
    // }

    // if(_status === 'process-from-uwp'){
    //   localStorage.setItem('current_payment_status','validating-status');
    // }
    // if(_status === 'validating-status'){
    //   let encodedKeyTicket = this.ss.encodeToBase64('tmp_ticket_model');
    //   console.log(encodedKeyTicket);
    //   //console.log('revisar en un bucle de 15 segundos el estatus del pago')
    //   let dataTicket = localStorage.getItem(encodedKeyTicket!);
    //   if(dataTicket){
    //     let jsonDataTicket = JSON.parse(dataTicket);
    //     //console.log(jsonDataTicket);
    //     this.modeloComprobante = jsonDataTicket;
    //     this.verificarEstatusCargo(this.modeloComprobante.idTransaction);
    //   }
    // }
  }


  setShowContent(status: string){
    this.showContent =  {success:false,error:false,waiting:false, nodisponible:false}
    this.showContent[status] = true;
  }

  
  saveNewSubasta(){
    // let encodedKeyDataSubasta =  this.ss.encodeToBase64('tmp_subasta_model');
    let created = localStorage.getItem('isXubastaCreated');
    if(created && created === 'CREATED'){
      console.log('ya guardada');
      this.showComprobanteCargo();
    } else {
      let subastaString = this.ss.getLocalStorageEncodedKey('tmp_subasta_model');
      let subasta = subastaString?  JSON.parse(subastaString!): null;
      console.log(subasta);
      if(subasta){
        this.subastaService.crearSubasta(subasta).subscribe({
          next: (response) => {
            this.ss.showNotification('success','Subasta creada exitosamente', 2000)
            this.showComprobanteCargo();
            localStorage.setItem('isXubastaCreated', 'CREATED');
          },
          error: (err) => {
            this.ss.showNotification('error', 'Hubo un problema al crear la subasta.', 3500);
            console.log(err)
          },
        });
      }
    }
  }

  

  CambiarEstatusSubasta(idSubasta: number, nuevoEstatus: number) {
    console.log(this.jsonParams)
    let updated = localStorage.getItem('isXubastaUpdated');
    // if(!this.loading) this.loading = true;
    if(updated && updated === 'UPDATED'){
      this.generarGuiaDeEnvio(false);
    } else {
      this.subastaService.actualizarEstatusSubasta(idSubasta, nuevoEstatus).subscribe({
        next: (response) => {
          console.log(response)
          // let encodedKeyPaqueteria = this.ss.encodeToBase64('tmp_paqueteria_model');
          // this.loading = false;
          // this.ss.showNotification('success','Informacion actualizada correctamente');
         
          // this.closeModal();
          // this.getInitialData(this.subasta.id);
          // console.log('Estatus actualizado:', response);
          // if(generaGuia){
            localStorage.setItem('isXubastaUpdated', 'UPDATED');
            this.generarGuiaDeEnvio(false);
            
          // } else {
            // this.getInitialData(true);
          // }
          // 
        },  
        error: (error) => {
          this.ss.showNotification('error','Hubo un problema al cambiar estatus');
          // this.loading = false;
          // setTimeout(() => { this.showContent =  {success:true,error:false,waiting:false, nodisponible:false} }, 350);
          console.error('Error al actualizar estatus:', error);
        }
      });
    }
  }

  async CambiarEstatusReclamo(idReclamo: number) {
    console.log(this.usuario())
    let updated = localStorage.getItem('isClaimUpdated');
    if(updated && updated === 'UPDATED'){
      this.generarGuiaDeEnvio(true);
    } else {
      let reclamo = {idReclamo: idReclamo, idEstatus: ReclamoEstatus.EnvioPagado , idUsuarioXuba: this.usuario()!.id}
      // let r = await this.ss.showConfirmMessage('¿Desea proceder con el reembolso al cliente sin reenvio del producto?');
      // if(r){
        // this.loading = true;
        this.subastaService.changeReclamoEstatus(reclamo).subscribe({
          next:(res) => {
            console.log(res);
            localStorage.setItem('isClaimUpdated', 'UPDATED');
            this.generarGuiaDeEnvio(true);
            // this.loading = false;
            // this.ss.showNotification('success', 'Estatus del reclamo actualizado');
          }, 
          error: (err) => {
            this.ss.showNotification('error','Hubo un problema al cambiar estatus de reclamo');
            console.error('Error al actualizar estatus reclamo:', err);
            // this.loading = false;
          }
        })
      // }
      // this.subastaService.actualizarEstatusSubasta(idReclamo, nuevoEstatus).subscribe({
      //   next: (response) => {
      //     console.log(response)
      //     // let encodedKeyPaqueteria = this.ss.encodeToBase64('tmp_paqueteria_model');
      //     // this.loading = false;
      //     // this.ss.showNotification('success','Informacion actualizada correctamente');
         
      //     // this.closeModal();
      //     // this.getInitialData(this.subasta.id);
      //     // console.log('Estatus actualizado:', response);
      //     // if(generaGuia){
      //       localStorage.setItem('isXubastaUpdated', 'UPDATED');
      //       this.generarGuiaDeEnvio();
            
      //     // } else {
      //       // this.getInitialData(true);
      //     // }
      //     // 
      //   },  
      //   error: (error) => {
      //     this.ss.showNotification('error','Hubo un problema al cambiar estatus');
      //     // this.loading = false;
      //     // setTimeout(() => { this.showContent =  {success:true,error:false,waiting:false, nodisponible:false} }, 350);
      //     console.error('Error al actualizar estatus:', error);
      //   }
      // });
    }
  }

  generarGuiaDeEnvio(forReturn: boolean){
    // this.textoLoading = 'Generando guia...'
    // this.loading = true;
    // this.createPaqueteriaModel();
    // setTimeout(() => {
      // console.log(this.paqueteriaRequestModel);
      // console.log(JSON.stringify(this.paqueteriaRequestModel));
      // console.log('intentar generar guia de envio');
      // let encodedKeyPaqueteria = this.ss.encodeToBase64('tmp_paqueteria_model');
      // let pm = localStorage.getItem(encodedKeyPaqueteria!);
      let guide = localStorage.getItem('isGuideGenerated');
      if(guide && guide === 'CREATED'){
        this.showComprobanteCargo();
      } else {
        let paqueteriaModelString = this.ss.getLocalStorageEncodedKey('tmp_paqueteria_model');
        let paqueteriaModel = paqueteriaModelString?  JSON.parse(paqueteriaModelString!): null;
        if(paqueteriaModel){
          console.log(paqueteriaModel);
          this.subastaService.generarGuiaPaqueteria(paqueteriaModel).subscribe({
            next: (response) => {
              console.log(response)
              // this.loading = false;
              // this.closeModal(); subasta test 11384
              // this.getInitialData(true);tmp_direccion_eg
              // console.log('Guía de envío generada exitosamente:', response);
              localStorage.setItem('isGuideGenerated', 'CREATED');
              if(forReturn){
                this.showComprobanteCargo();
                // localStorage.setItem('isGuideGenerated', 'CREATED');
              } else {
                let idDireccion = this.ss.getLocalStorageEncodedKey('tmp_direccion_eg');
                this.saveDireccionEntregaGanador(+idDireccion!);
              }
             
              // this.ss.showNotification('success','Pago procesado correctamente');
              // this.showComprobanteCargo();
              // localStorage.setItem('isGuideGenerated', 'CREATED');

              // setTimeout(() => { this.openComprobante(); }, 350);
            },
            error: (error) => {
              // this.loading = false;
              this.ss.showNotification('error','Hubo un problema al generar la guia de envio');
              // // this.showComprobante = true;
              // // this.openComprobante();
              // this.showContent =  {success:false,error:true,waiting:false, nodisponible:false}
              // setTimeout(() => { this.openComprobante(); }, 350);
              console.error('Error al generar la guía de envío:', error.error);
            }
          });
        }
      }
     
    // }, 200);
  }

  saveDireccionEntregaGanador(id: number){

    let model = {idSubasta:this.jsonParams.id,idDireccion: id}
    console.log(model)
    this.subastaService.saveDireccionEntregaComprador(model).subscribe({
      next: (data) =>{
        this.ss.showNotification('success','Pago procesado correctamente');
        this.showComprobanteCargo();
        localStorage.setItem('isGuideGenerated', 'CREATED');
      }, 
      error: (err) => {
        this.ss.showNotification('error','Hubo un problema al guardar la direccion de entrega');
        console.error('Error al guardar direccion de entrega ganador:', err.error);
      }
    })
  }


  showComprobanteCargo(){
    let dataTicketString =  this.ss.getLocalStorageEncodedKey('tmp_ticket_model');
    let dataTicket = dataTicketString?  JSON.parse(dataTicketString!): null;
    if(dataTicket){
      // this.ss.showNotification('success','Subasta creada exitosamente', 2000)
      this.modeloComprobante = dataTicket;
      this.setShowContent('success');
      // localStorage.setItem('isXubastaCreated', 'CREATED');
    }
  }

  downloadComprobante(){
    let orden_xuba = this.modeloComprobante.ordenXuba;
    orden_xuba = orden_xuba.replace('#','');
    const timestamp = Date.now();
    const _filename = `xuba_payment-${orden_xuba}-${timestamp}.pdf`; 
    const element: any = document.getElementById('printContainer');
    const opt: any = {
      margin: 2,
      filename: _filename,
      image: { type: 'jpeg', quality: 0.5 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  }


  toFormatDate(date: any){
    // const fechaStr = "2025-10-24T23:55:32-06:00";
    const fecha = new Date(date);

    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();
    const horas = (fecha.getHours() + 1).toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    const segundos = fecha.getSeconds().toString().padStart(2, '0');

    const formato = `${dia}/${mes}/${año} ${horas}:${minutos}:${segundos}`;
    return formato;
  }

  changeTemporalStatus(status: string){
    this.currentStatusPayment = status;
  }

  // volverAVentanaOrigen(){
  //   this.router.navigate(['profile'])
  // }
 
  beforeRedirect(){
    this.ss.removeLocalStorageEncodedKey('transaction_id');
    this.ss.removeLocalStorageEncodedKey('tmp_subasta_model');
    this.ss.removeLocalStorageEncodedKey('tmp_paqueteria_model');
    this.ss.removeLocalStorageEncodedKey('tmp_ticket_model');
    this.ss.removeLocalStorageEncodedKey('tmp_direccion_eg');
    localStorage.removeItem('isXubastaCreated');
    localStorage.removeItem('isXubastaUpdated');
    localStorage.removeItem('isGuideGenerated');
    localStorage.removeItem('isClaimUpdated');
  }


  async backHome(){
    console.log(this.jsonParams)
    let r = await this.ss.showConfirmMessage('¿Desea salir de esta pagina?');
    if(r){
      this.beforeRedirect();
     
      let _rt = '';
      if(this.jsonParams.rt === 'subasta-terminada'){
        let dataParams = JSON.stringify({ idSubasta: this.jsonParams.id, tipoUsuario:this.jsonParams.tu});
        let encoded = this.ss.encodeToBase64(dataParams);
        // this.router.navigate([this.jsonParams.rt])
        // setTimeout(() => {
        //   this.router.navigate(['/subasta-terminada', encoded]);
        // }, 200);
        _rt = `/${this.jsonParams.rt}/${encoded}`;
      } else {
        // setTimeout(() => {
        //   this.router.navigate([this.jsonParams.rt])
        // }, 200);
        _rt = this.jsonParams.rt;
      }

      setTimeout(() => {
        this.router.navigate([_rt])
      }, 200);
    }
   
  }
}
