import { Component, Inject, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SignalRService } from '../../services/signalr.service';
import { AuthService } from '../../services/auth.service';
import { SubastasService } from '../../services/subastas.service';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../services/shared.service';
import { AuctionService } from '../../services/auction.service';
import { CommonModule, DOCUMENT } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subasta } from '../../models/subasta.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-auction-detail',
  imports: [CommonModule, FormsModule],
  templateUrl: './my-auction-detail.component.html',
  styleUrl: './my-auction-detail.component.css'
})
export class MyAuctionDetailComponent {
  subasta: Subasta | any = {};
  ganadorInfo: any = {};
  impuestos = 0;
  comisionXuba = 0;
  gananciaTotal = 0;
  iva = 0;
  isr = 0;
  listaEstatus: any[] = [];
  loading = false;
  mostrarModalVistas = false;
  listaVistas: any[] = [];
  mostrarModalOfertas = false;
  listaOfertas: any[] = [];
  textoLoading = '';
  indexCurrentImage: number = 0;
  listaImagenes: any[] = [];
  mostrarGaleria = false;
  listaHistorial: any[] = [];
  listaHistorialDHL: any[] = [];
  imagenSeleccionada = 0;
  ultimasVistas: any[] = [];
  paginaVistas = 1;
  tamanoPaginaVistas = 10;
  listaComisiones: any[] = [];
  paginaOfertas = 1;
  totalRegistrosOfertas = 0;
  hayMasOfertas = true;
  entregaSucursal = false;
  totalRegistrosVistas = 0;
  mostrarModalContraoferta = false;
  mostrarModalFinalizar = false;
  montoContraoferta = 0;
  mostrarModalCancelar = false;
  motivoCancelacion = '';
  minCaracteres = 30;
  subastaCancelada = false;
  estatusActual: any = {};
  mostrarModalGuiaEnvio = false;
  guiaEnvioUrl: SafeResourceUrl | null = null;


  get estatusDHLActual(): any {
    return this.listaHistorialDHL?.length
      ? this.listaHistorialDHL[0]
      : null;
  }

  private intervalId: any;
  constructor(private route: ActivatedRoute,
    private router: Router,
    private signalRService: SignalRService,
    private authService: AuthService,
    private subastasService: SubastasService,
    // private renderer: Renderer2,
    private toastr: ToastrService,
    private ss: SharedService,
    private auctionService: AuctionService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private sanitizer: DomSanitizer
  ) {
    const id = +this.route.snapshot.paramMap.get('id')!;
    console.log(id)
    this.getInitialData(id);
  }

  getInitialData(IdSubasta: number) {

    this.loading = true;

    this.subastasService.ConsultarDetalleSeguimientoId(IdSubasta).subscribe({

      next: (sub: any) => {
        console.log(sub);

        const historialDHLGuardado = this.listaHistorial.filter(
          (x: any) => x.tipo === 'DHL'
        );

        this.subasta = sub;
        console.log('Motivo:', this.subasta.motivoCanclacion?.motivoCancelacion);

        // Siempre cargar el historial de la subasta
        this.listaHistorial = (sub.historialEstatus || []).filter((item: any) => {
          return item.estatus !== '' && item.estatus !== 'Enviado';
        });
        this.listaHistorial.push(...historialDHLGuardado);

        this.estatusActual = this.listaHistorial.find(
          x => x.idEstatus === this.subasta.idEstatus
        );



        this.listaHistorial.sort((a: any, b: any) =>
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );

        // Si está Enviado o Entregado, agregar los eventos de DHL
        const posicion = this.listaHistorial.findIndex(item => item.idEstatus === 13);
        console.log("posicion idestatus " + posicion)
        if ((sub.idEstatus == 13 || sub.idEstatus == 1023) && sub.guiaEnvio && sub.guiaEnvio !== 'Guía no disponible') {

          this.cargarSeguimientoDHL(sub.numGuia, posicion);
          this.listaHistorial.sort((a: any, b: any) =>
            new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
          );

        }

        this.subasta.remaining = this.tiempoStringASegundos(sub.tiempoVence);

        // Detener un contador anterior
        clearInterval(this.intervalId);

        // Iniciar contador si aún hay tiempo
        if (this.subasta.remaining > 0) {
          this.setTimerV2();
        }

        this.listaImagenes = sub.imagenesSubasta || [];
        console.log('Historial:', this.listaHistorial);
        this.listaOfertas = sub.ultimasOfertas || [];

        this.listaVistas = sub.ultimasVistas || [];

        this.ganadorInfo = {
          nombre: sub.ganador,
          apuesta: sub.precioFinal,
          imgPerfil: sub.imgPerfilGanador,
          estatus: sub.estatus,
          claveEstatus: sub.idEstatus
        };

        this.subasta.estatus = sub.estatus;

        this.calcularGanancia();
        const usuario = this.authService.currentUser();

        if (usuario) {
          this.getComisionesUsuario(usuario.id);
        }

      }

    });

  }

  setTimerV2() {

    clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {

      if (this.subasta.remaining > 0) {

        this.subasta.remaining--;

      } else {

        clearInterval(this.intervalId);

        this.getInitialData(this.subasta.id);

      }

    }, 1000);

  }
  formatTimeString(total: number): string {

    const dias = Math.floor(total / 86400);
    const horas = Math.floor((total % 86400) / 3600);
    const minutos = Math.floor((total % 3600) / 60);
    const segundos = total % 60;

    return `${dias}d ${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

  }
  abrirModalCancelar() {
    this.mostrarModalCancelar = true;
  }

  cerrarModalCancelar() {
    this.mostrarModalCancelar = false;
    this.motivoCancelacion = '';
  }

  confirmarCancelacion() {

    const usuario = this.authService.currentUser();

    const data = {
      idSubasta: this.subasta.id,
      idUsuario: usuario?.id,
      motivo: this.motivoCancelacion
    };

    console.log('Datos enviados:', data);

    this.subastasService.cancelarSubastaVendedor(data).subscribe({
      next: (res: any) => {

        console.log('Respuesta del servidor:', res);

        this.toastr.success('Subasta cancelada correctamente');
        this.subasta.motivoCanclacion = {
          motivoCancelacion: this.motivoCancelacion,
          fechaCancelacion: new Date()
        };

        this.cerrarModalCancelar();

        clearInterval(this.intervalId);

        this.getInitialData(this.subasta.id);

      },
      error: (err) => {
        console.error(err);
        this.toastr.error('No se pudo cancelar la subasta');
      }
    });
  }
  /*getInformacionGanador(idSubasta: number) {
  
    this.subastasService.ConsultarDetalleSeguimientoId(idSubasta).subscribe({
  
      next: (resp: any) => {
  
        this.ganadorInfo = {
          nombre: resp.ganador,
          apuesta: resp.precioFinal,
          imgPerfil: resp.imgPerfilGanador
        };
  
        this.calcularGanancia();
  
      }
  
    });
  
  }*/
  /*getHistorialEstatus(idSubasta:number){
  
    this.subastasService.ConsultarDetalleSeguimientoId(idSubasta).subscribe({
  
      next:(resp:any)=>{
  
        this.subasta.estatus = resp.estatus;
  
        this.listaEstatus = [];
  
      }
  
    });
  
  }*/
  tiempoStringASegundos(tiempo: string): number {

    if (!tiempo) {
      return 0;
    }

    const partes = tiempo.split(':');

    const horas = Number(partes[0]);
    const minutos = Number(partes[1]);
    const segundos = Number(partes[2]);

    return horas * 3600 + minutos * 60 + segundos;

  }
  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'images/nofound5.jpg';
  }
  abrirGaleria(index: number = 0) {
    console.log('Abrir galería', index);

    this.imagenSeleccionada = index;
    this.mostrarGaleria = true;
    this.document.body.style.overflow = 'hidden';

  }

  cerrarGaleria() {
    this.mostrarGaleria = false;
    this.document.body.style.overflow = 'auto';
  }

  seleccionarImagen(index: number) {
    this.imagenSeleccionada = index;
  }

  cargarSeguimientoDHL(noGuia: string, posicion: number) {

    console.log('Número de guía:', noGuia);
    this.listaHistorialDHL = [];

    this.subastasService.GetPaqueteriaSeguimiento(noGuia).subscribe({

      next: (resp: any) => {

        console.log('Respuesta DHL:', resp);

        if (!resp.events || resp.events.length === 0) {
          return;
        }

        // Crear la lista de eventos DHL
        const eventosDHL = resp.events.map((e: any) => {

          let estatus = e.description;

          switch (e.description) {

            case 'Shipment picked up':
              estatus = 'Paquete recolectado';
              break;

            case 'Shipment is out with courier for delivery':
              estatus = 'En ruta para entrega';
              break;

            case 'Delivered':
              estatus = 'Entregado';
              break;
          }

          return {
            estatus,
            descripcion: e.location,
            fecha: e.date,
            tipo: 'DHL'
          };

        }).reverse();
        this.listaHistorialDHL = eventosDHL;

        // Buscar "Enviado"
        const indexEnviado = this.listaHistorial.findIndex(x => x.idEstatus == 13);

        if (indexEnviado !== -1) {

          // Insertar DHL antes de "Enviado"
          this.listaHistorial.splice(indexEnviado, 0, ...eventosDHL);

        }
        if (indexEnviado !== -1) {
          // Quitar el estatus "Enviado"
          this.listaHistorial.splice(indexEnviado + eventosDHL.length, 1);
        }

        console.log('Historial final:', this.listaHistorial);

      },

      error: (err) => {

        console.error('Error DHL:', err);

        this.listaHistorial = [{
          estatus: 'No fue posible consultar el seguimiento',
          descripcion: 'La paquetería no respondió correctamente.',
          fecha: new Date()
        }];

      }

    });

  }

  CambiarEstatusSubasta(idSubasta: number, nuevoEstatus: number) {

    this.loading = true;

    this.subastasService.actualizarEstatusSubasta(idSubasta, nuevoEstatus).subscribe({

      next: (resp) => {

        console.log(resp);

        this.loading = false;

        this.getInitialData(idSubasta);

        //this.getHistorialEstatus(idSubasta);

        this.toastr.success("Estatus actualizado");

      },

      error: (err) => {

        this.loading = false;

        console.error(err);

        this.toastr.error("No se pudo actualizar el estatus");

      }

    });

  }
  async aceptarOfertaActual() {

    if (this.listaOfertas.length === 0) {
      this.toastr.warning("No hay ofertas para aceptar.");
      return;
    }

    const ultimaOferta = this.listaOfertas[0].ultimaOferta;

    const r = await this.ss.showConfirmMessage(
      `¿Desea aceptar la oferta de compra actual al precio de ${this.toCurrency(ultimaOferta)}?`
    );

    if (r) {

      // 1023 es un ejemplo.
      // Aquí debes poner el id del estatus "Pendiente de pago"
      this.CambiarEstatusSubasta(
        this.subasta.id,
        12
      );

    }

  }
  getLastOferta(): number {

    if (!this.listaOfertas || this.listaOfertas.length === 0) {
      return 0;
    }

    return this.listaOfertas[0].ultimaOferta;

  }
  toCurrency(valor: number): string {

    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor);

  }
  getComisionesUsuario(idUsuario: number) {

    this.subastasService.getComisionesCrearSubasta(idUsuario, 'crearSubasta')
      .subscribe({

        next: (resp: any) => {
          console.log(resp);

          this.listaComisiones = resp;

          this.calcularGanancia();

        },

        error: (err) => {

          console.error(err);

        }

      });

  }
  calcularGanancia() {

    const precioFinal = this.ganadorInfo.apuesta || 0;

    this.comisionXuba = 0;
    this.iva = 0;
    this.isr = 0;

    let totalComision = 0;

    for (const c of this.listaComisiones) {

      switch (c.concepto.toUpperCase()) {

        case 'COMISION DE APP':
          this.comisionXuba =
            c.tipoComision === 'Porcentaje'
              ? (precioFinal * c.porcentaje) / 100
              : c.porcentaje;
          break;

        case 'IVA A CUENTA DE TERCEROS':
          this.iva =
            c.tipoComision === 'Porcentaje'
              ? (precioFinal * c.porcentaje) / 100
              : c.porcentaje;
          break;

        case 'ISR A CUENTA DE TERCEROS':
          this.isr =
            c.tipoComision === 'Porcentaje'
              ? (precioFinal * c.porcentaje) / 100
              : c.porcentaje;
          break;
      }

      totalComision +=
        c.tipoComision === 'Porcentaje'
          ? (precioFinal * c.porcentaje) / 100
          : c.porcentaje;

    }

    this.gananciaTotal = precioFinal - totalComision;

  }
  cargarUltimasVistas() {

    const data = {
      idSubasta: this.subasta.idSubasta,
      pagina: this.paginaVistas,
      registros: this.tamanoPaginaVistas
    };

    this.subastasService.ConsultarUltimasVistas(data).subscribe({
      next: (resp: any) => {

        this.ultimasVistas = resp.data;
        this.totalRegistrosVistas = resp.totalRegistros;

      },
      error: (err) => {
        console.error(err);
      }
    });

  }

  abrirModalVistas() {

    this.paginaVistas = 1;

    this.mostrarModalVistas = true;

    this.cargarUltimasVistas();

  }

  cerrarModalVistas() {

    this.mostrarModalVistas = false;

  } cambiarPaginaVistas(pagina: number) {

    this.paginaVistas = pagina;

    this.cargarUltimasVistas();

  }
  cargarUltimasOfertas() {

    this.subastasService.ConsultarUltimasOfertas(
      this.subasta.id,
      this.paginaOfertas
    ).subscribe({

      next: (resp: any) => {

        console.log(resp);

        this.listaOfertas = resp.ofertas;
        this.totalRegistrosOfertas = resp.totalRegistros;

      },

      error: (err) => {
        console.error(err);
      }

    });

  }
  cambiarPaginaOfertas(pagina: number) {

    if (pagina < 1) {
      return;
    }

    this.paginaOfertas = pagina;

    this.cargarUltimasOfertas();

  }
  abrirModalOfertas() {

    this.paginaOfertas = 1;
    this.mostrarModalOfertas = true;
    this.cargarUltimasOfertas();

  }

  cerrarModalOfertas() {

    this.mostrarModalOfertas = false;

  }
  abrirModalContraoferta() {

    if (this.listaOfertas.length > 0) {
      this.montoContraoferta = this.listaOfertas[0].ultimaOferta;
    }

    this.mostrarModalContraoferta = true;

  }

  cerrarModalContraoferta() {

    this.mostrarModalContraoferta = false;

  }
  confirmarContraoferta() {

    const usuario = this.authService.currentUser();

    if (!usuario) {
      this.toastr.error('No se encontró el usuario.');
      return;
    }

    const data = {
      idSubasta: this.subasta.id,
      idUsuario: usuario.id,
      oferta: this.montoContraoferta,
      tipoUsuario: 'VEND'
    };

    console.log('Datos enviados de contra oferta:', data);

    this.subastasService.guardarOFertaCompraSubasta(data).subscribe({

      next: (resp: any) => {

        console.log(resp);

        this.toastr.success('Contraoferta enviada correctamente.');

        this.cerrarModalContraoferta();

        // Recargar la información
        this.getInitialData(this.subasta.id);

      },

      error: (err) => {

        console.error(err.error.mensaje);

        this.toastr.error('No se pudo enviar la contraoferta.');

      }

    });

  }
  abrirModalFinalizar() {

    this.mostrarModalFinalizar = true;

  }

  cerrarModalFinalizar() {

    this.mostrarModalFinalizar = false;

  }
  confirmarFinalizarSubasta() {

    //this.CambiarEstatusSubasta(
    this.subasta.id,
      /* id del estatus Finalizada */
      // );

      this.cerrarModalFinalizar();

  }
  get totalPalabras(): number {

    if (!this.motivoCancelacion?.trim()) {
      return 0;
    }

    return this.motivoCancelacion
      .trim()
      .split(/\s+/)
      .filter(p => p.length > 0).length;

  } get totalCaracteres(): number {

    return this.motivoCancelacion
      ? this.motivoCancelacion.trim().length
      : 0;

  }
  volverActivarSubasta() {

    // Aquí irá el consumo de la API

    console.log('Volver a activar la subasta');

  }

  abrirGuiaEnvio() {

    if (!this.subasta.guiaEnvio || this.subasta.guiaEnvio === 'Guía no disponible') {
      this.toastr.warning('La guía de envío aún no está disponible.');
      return;
    }

    if (window.innerWidth <= 767) {

      this.mostrarModalGuiaEnvio = true;
      this.document.body.style.overflow = 'hidden';

      return;
    }

    window.open(this.subasta.guiaEnvio, '_blank');
  }

  cerrarModalGuiaEnvio() {
    this.mostrarModalGuiaEnvio = false;
    this.document.body.style.overflow = 'auto';
  }


  descargarGuia() {
    if (!this.subasta.guiaEnvio || this.subasta.guiaEnvio === 'Guía no disponible') {
      this.toastr.warning('La guía de envío aún no está disponible.');
      return;
    }

    if (!this.subasta?.guiaEnvio) {
      this.toastr.warning('La guía no está disponible.');
      return;
    }

    this.subastasService.DescargarGuiaDhl(this.subasta.guiaEnvio);

  }



  regresar(): void {
    this.router.navigate(['/profile']);
  }

}
