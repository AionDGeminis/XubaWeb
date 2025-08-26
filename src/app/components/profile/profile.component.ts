import { Component, computed, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoaderComponent } from '../loader/loader.component';
import { CommonModule } from '@angular/common';
import { SubastasService } from '../../services/subastas.service';
import { Subasta, Usuario } from '../../models/subasta.model';
import { AuthService } from '../../services/auth.service';
import { AddressesService } from '../../services/addresses.service';
import { SharedService } from '../../services/shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, LoaderComponent, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
    //'Cq@3K$K$RD' = 'secure local card'
    isModalOpen: any = {direccion: false, clabe: false,tarjeta:false,wallet:false};

    // openModal: boolean = false;
    // openModalCuenta: boolean = false;
    // openModalViewer: boolean = false;
    // openModalTarjetas: boolean = false;

    loading: boolean = false;
    allLoading: boolean = false;


    direccion: any = {
      calle: '',
      numeroInt: '', 
      numeroExt: '',
      colonia: '',
      codigoPostal: '', 
      descripcionDomicilio: 'descripcion', 
      callesCruzan: '', 
      telefono: 'xxxxxxxxxx', 
      correo: 'correo@mail.com', 
      tipo:'',
      tipoDomicilio: 'ND', 
      estado: '',
      municipio: '',
      quienRecibe: 'ND', 
      idUsuario:0,
      predeterminada: false
    }
    public usuario!: Signal<Usuario|null>;
    public isLoggedIn!: Signal<boolean>;
    direcciones: any[] = [];
    tabIndex: number = 0;
    tabSubastasIndex: number = 0;
    tabCuentasIndex: number = 0;
    subastasActivas: Subasta[] = [];
    subastasInactivas: Subasta[] = [];
    infoUsuario: any;
    editInfoUsuario: any = {
      id: 0,
      telefono:'',
      correo:'',
      contra:''
    }
    tarjeta = {
      holder_name: '',
      holder_lastname: '',
      card_number: '',
      expiration_month: '',
      expiration_year: '',
      mail:'',
      phone: '',
      id_user: 0
    };

    dataEditImg = {
      idUsuario: 0, 
      fotoAnterior:'',
      fotoPerfil:''
    }
    private intervalId: any;

    cuentasClabe: any[] = [];
    cuentaClabeUsuario: any = {idUsuario:0,cuentaClabe:''};
    walletPagos: any[] = [];
    selectedWallet: any = {};
    fecha = new Date();
    updatingImage: boolean = false;
    imageProfileSrc: string = '';
    tarjetas: any[] | null = [];
    selectedColonia: any = null;
    hasColonias: boolean = false;
    manualColonia: boolean = true;
    listaColonias: any[] = [];
    codigoPostal = 'xxxxx';
    isEdit: boolean = false;

    constructor(private router: Router, private subastasService: SubastasService, private authService: AuthService, private addressService: AddressesService, private ss: SharedService) { 
      this.usuario = this.authService.currentUser;
      this.isLoggedIn = computed(() => !!this.usuario());
      console.log(this.usuario());
      if(this.isLoggedIn()){
        this.getDireccionesEntrega(this.usuario()!.id, 'entrega');
        this.getInformacionUsuario(this.usuario()!.id);
      }
    }

    getInformacionUsuario(idUsuario: number){
      this.allLoading = true;
      this.authService.consultarDatosUsuario(idUsuario).subscribe({
        next: (response: any) => {
          this.allLoading = false;
          this.infoUsuario = response;
          this.imageProfileSrc = response.imgPerfil;
            console.log(response);
        },
        error: (err: any) => {
          this.allLoading = false;

            console.error('Error fetching user information:', err);
        }
      });
    }

    initFormTarjeta(){
      this.tarjeta = {
        holder_name: '',
        holder_lastname: '',
        card_number: '',
        expiration_month: '',
        expiration_year: '',
        mail:'',
        phone: '',
        id_user: 0,
      };
    }

    initFormFoto(){
      this.dataEditImg = {
        idUsuario: 0, 
        fotoAnterior:'',
        fotoPerfil:''
      }
    }

    setTimer(litaItems: any[]){
      this.intervalId = setInterval(() => {
        for(let item of litaItems){
          if (item.venceSegundos > 0) {
            item.venceSegundos--;
          }
        }
        // console.log('descontar')
      }, 1000);
    }

    onImgError(event: Event) {
      const imgElement = event.target as HTMLImageElement;
      imgElement.src = 'images/nofound5.jpg';
    }

    async getSecureCards(){
      this.tarjetas = await this.ss.loadLocalData('Cq@3K$K$RD') ?? []; 
      if(this.tarjetas.length > 0){
        this.tarjetas = this.tarjetas.filter(x => x.id_user === this.usuario()?.id);
      }
      console.log('L117: obtener tarjetas ')
      console.log(this.tarjetas)
    }

    getDireccionesEntrega(idUsuario: number, tipo: string): void {
        // this.loading = true;
        this.subastasService.GetDireccionesUsuario(idUsuario, tipo).subscribe(
            (response: any) => {
              console.log('direcciones obtenidas');
                console.log(response);
                this.direcciones = [...response];
                this.getDireccionesEnvio(idUsuario, 'envio');
                // this.loading = false;
            },
            (error: any) => {
                console.error('Error fetching addresses:', error);
                // this.loading = false;
            }
        );
    }

    getDireccionesEnvio(idUsuario: number, tipo: string){
      this.subastasService.GetDireccionesUsuario(idUsuario, tipo).subscribe(
        (response: any) => {
            console.log(response);
            // this.direcciones = [...response];
            this.direcciones = [...this.direcciones, ...response];
            // this.loading = false;
        },
        (error: any) => {
            console.error('Error fetching addresses:', error);
            // this.loading = false;
        }
      );
    }

    GetCuentasClabe(idUsuario: number){
      console.log(idUsuario)

      this.authService.getCuentaClabe(idUsuario).subscribe({
        next: (cuentas) => {
          console.log(cuentas);
          this.cuentasClabe = cuentas;
          
        },
        error: (e) => {
          console.error('Error fetching cuentasClabe:', e);
        }
      });

    }

    setTipoDireccion(tipo: string) {
      this.direccion.tipo = tipo;
    }

    async saveInfoChange(){
      this.editInfoUsuario.telefono = this.infoUsuario.telefono;
      this.editInfoUsuario.correo = this.infoUsuario.correo;
      this.editInfoUsuario.id = this.infoUsuario.id;
      let r = await this.ss.showConfirmMessage('Desear guardar los cambios en la informacion?');
      if(r){
        this.loading = true; 
        // console.log('User confirmed saving changes');
        this.authService.editarDatosUsuario(this.editInfoUsuario).subscribe({
          next: (response) => {
            this.loading = false;
            this.ss.showNotification('success','Informacion actualizada correctamente');

            console.log('User information updated successfully', response);
          },
          error: (err) => {
            this.loading = false;
            this.ss.showNotification('error','Error updating user information');
            console.error('Error updating user information', err);
          }
        });
      }
      // this.authService.editarDatosUsuario(this.editInfoUsuario).subscribe({
      //   next: (response) => {
      //     console.log('User information updated successfully', response);
      //   },
      //   error: (err) => {
      //     console.error('Error updating user information', err);
      //   }
      // });
      // console.log(this.editInfoUsuario);
    }

    onInput(event: any, atributo: any, fn?: (value: any) => void) {
      const soloNumeros = event.target.value.replace(/[^0-9]/g, '');
      atributo = soloNumeros;
      event.target.value = soloNumeros; 
      fn?.(soloNumeros);
      // Actualiza el input si el usuario pegó algo no numérico
    }

    checkCodigoPostal = (value: any) =>{
      if(value.length === 5){
        if(value !== this.codigoPostal){
          this.codigoPostal = value;
          console.log(this.codigoPostal);
          console.log('Obtener datos');
          this.getInfoZipCode(this.codigoPostal);
        }
      } else {
        this.hasColonias = false;
        this.listaColonias = [];
      }
      
    }

    setSelectedColonia(){
      console.log(this.selectedColonia);
      if(this.selectedColonia.id > -1){
        this.manualColonia = false;
        this.direccion.colonia = this.selectedColonia.d_asenta;
        this.direccion.estado = this.selectedColonia.d_estado;
        this.direccion.municipio =  this.selectedColonia.d_ciudad ?? this.selectedColonia.d_mnpio;
      } else {
        this.direccion.colonia = null;
        this.direccion.estado = null;
        this.direccion.municipio = null;
        //this.hasColonias = false;
        this.manualColonia = true;
      }
    }


    // openModalFn(): void {
    //   this.openModal = true;
    // }

    // openModalView(pago: any){
    //   this.selectedWallet = pago;
    //   this.openModalViewer = true;
    // }
    
    // closeModalView() {
    //   this.openModalViewer = false;
    // }
    // openModalCuentaFn(){
    //   this.openModalCuenta = true;
    // }
    
    // closeModalCuentaFn() {
    //     this.openModalCuenta = false;
    // }

    // closeModal(){
    //   this.openModal = false;
    // }

    // openModalTarjetasFn(){
    //   this.openModalTarjetas = true;
    // }

    // closeModalTarjetasFn() {
    //   this.openModalTarjetas = false;
    // }
    openModal(key: string, prop?: any, value?: any){
      
      this.isEdit = false;
      this.isModalOpen[key] = true;
      if(key === 'tarjeta'){
        this.initFormTarjeta();
      }
      if(prop){
        prop = value;
      }
     
    }

    openEditModal(key: string, prop?: any, value?: any){
      this.isEdit = true;
      this.isModalOpen[key] = true;
      //if(prop){
        this.direccion = value;
      //}
      console.log(prop)
      console.log(prop)
    }

    closeModal(key: string){
      this.isModalOpen[key] = false;
    }

    onContentClick(event: MouseEvent) {
      event.stopPropagation();
    }

    initDireccion(){
      this.direccion = {
        calle: '',
        numeroInt: '', 
        numeroExt: '',
        colonia: '',
        codigoPostal: '', 
        descripcionDomicilio: 'descripcion', // 
        callesCruzan: '', 
        telefono: 'xxxxxxxxxx', //
        correo: 'correo@mail.com', //
        tipo:'',
        tipoDomicilio: 'ND', //
        estado: '',
        municipio: '',
        quienRecibe: 'ND', //
        idUsuario:0,
        predeterminada: false
      }
    }

    saveDireccion(){
       console.log(this.direccion)
      this.direccion.idUsuario = this.usuario()!.id;
      if(!this.ss.isValidModel(this.direccion, ['numeroInt'])){
        this.ss.showNotification('warning', 'Por favor, complete todos los campos requeridos');
        return;
      }
     
      this.loading = true;
      this.subastasService.guardarDireccion(this.direccion).subscribe(
        (response: any) => {
            console.log(response);
            this.loading = false;
            this.ss.showNotification('success', 'Direccion agregada correctamente');
            this.getDireccionesEntrega(this.usuario()!.id, 'entrega');
            this.initDireccion();
            this.closeModal('direccion');
        },
        (error: any) => {
          this.ss.showNotification('error', 'Se produjo un error al guardar la dirección');
          console.error('Error fetching addresses:', error);
          this.loading = false;
        }
      );
      // this.getInfoZipCode();
    }

    saveEditDireccion(){
      this.direccion.idUsuario = this.usuario()!.id;
      if(!this.ss.isValidModel(this.direccion, ['numeroInt'])){
        this.ss.showNotification('warning', 'Por favor, complete todos los campos requeridos');
        return;
      }
      this.loading = true;
      this.subastasService.editarDireccion(this.direccion).subscribe(
        (response: any) => {
            console.log(response);
            this.loading = false;
            this.ss.showNotification('success', 'Direccion actualizada correctamente');
            this.getDireccionesEntrega(this.usuario()!.id, 'entrega');
            this.initDireccion();
            this.closeModal('direccion');
        },
        (error: any) => {
          this.ss.showNotification('error', 'Se produjo un error al editar la dirección');
          console.error('Error fetching addresses:', error);
          this.loading = false;
        }
      );
    }

    saveCuentaClabe(){
      this.cuentaClabeUsuario.idUsuario = this.usuario()!.id;
      if(!this.cuentaClabeUsuario.cuentaClabe || this.cuentaClabeUsuario.cuentaClabe.trim() === ''){
        this.ss.showNotification('error', 'Cuenta CLABE no puede estar vacía');
        return;
      }      
      this.loading = true;
      this.authService.addCuentaClabe(this.cuentaClabeUsuario).subscribe({
        next: (response: any) => {
            console.log(response);
            this.loading = false;
            this.ss.showNotification('success', 'Cuenta CLABE agregada correctamente');
            this.GetCuentasClabe(this.usuario()!.id);
            this.closeModal('clabe');

        },
        error: (error: any) => {
            console.error('Error saving CLABE account:', error);
            this.loading = false;
        }

      }
      );
      // this.getInfoZipCode();
    }

    saveTarjeta(){
      this.tarjeta.id_user = +this.usuario()!.id;
      if(!this.ss.isValidModel(this.tarjeta, [])){
        this.ss.showNotification('error', 'Informacion incompleta');
        return;
      }
      
      this.tarjetas!.push(this.tarjeta);
      console.log(this.tarjetas)
      this.ss.saveLocalSecureData('Cq@3K$K$RD', this.tarjetas).then(() => {
        this.ss.showNotification('success', 'Tarjeta guardada exitosamente');
        this.closeModal('tarjeta');
        this.getSecureCards();
      }).catch((error) => {
        this.ss.showNotification('error', 'Error al guardar la tarjeta');
        console.error('Error saving tarjeta:', error);
      });
    }

    getInfoZipCode(codigoPostal: any){
        this.addressService.getDataZipCode(codigoPostal).subscribe({
            next: (data: any) => {
              console.log('Zip code info:', data);
              this.listaColonias = data.zip_codes;
              this.listaColonias.push({id:-1, d_asenta:'Otro' })
              if(this.listaColonias && this.listaColonias.length > 1){
                this.hasColonias = true;
              } else{
                this.hasColonias = false;
              }
              this.manualColonia = false;
            },
            error: (error: any) => {
              this.listaColonias = [];
              this.hasColonias = false;
              this.manualColonia = true;
                console.error('Error fetching zip code info:', error);
            }
        }
            // (data: any) => {
            //     console.log('Zip code info:', data);
            // },
            // (error: any) => {
            //     console.error('Error fetching zip code info:', error);
            // }
        );
    }



    setCurrentTab(tab: number){
      switch(tab){
        case 1:
            this.getSubastasUsuario();
            this.getSubastasInactivasUsuario();
            break;
        case 3: if(this.isLoggedIn()){
          this.getWalletPagos();
          this.GetCuentasClabe(this.usuario()!.id)
          this.getSecureCards();
        } 
            // Add logic for tab 3 if needed
            break;
      }
      this.tabIndex = tab;
    }

    setCurrentTabSubastas(tab: number){
      this.tabSubastasIndex = tab;
    }

    setCurrentCuentaIndex(tab: number){ 
      this.tabCuentasIndex = tab;
    }


    getSubastasUsuario(){
      this.subastasService.getSubastasActivasVendedor(this.usuario()!.id).subscribe({
        next: (subastas) => {
          this.subastasActivas = subastas;
            console.log(subastas);
            for(let p of this.subastasActivas){
              p.venceSegundos = this.tiempoStringASegundos(p.tiempoVence);
              p.short_desc = this.toShort(p.descripcion);
            }
            this.setTimer(this.subastasActivas);
            // Handle the fetched subastas here
        },
        error: (err) => {
            console.error('Error fetching subastas:', err);
        }
      });
    }

    getSubastasInactivasUsuario(){
      this.subastasService.getSubastasTerminadasVendedor(this.usuario()!.id).subscribe({
        next: (subastas) => {
          this.subastasInactivas = subastas
            console.log(subastas);
            for(let s of this.subastasInactivas){
              s.short_desc = this.toShort(s.descripcion);
            }
            // Handle the fetched subastas here
        },
        error: (err) => {
            console.error('Error fetching subastas:', err);
        }
      });
    }

    tiempoStringASegundos(tiempo: string) {
      const [h, m, s] = tiempo.split(':').map(Number);
      return h * 3600 + m * 60 + s;
    }

    toShort(val: string){
      return val.length > 41 ? val.substring(0, 41) + '...' : val;
    }
    
    // 2. Función para convertir segundos a "hh:mm:ss"
    segundosATiempoString(segundos: number) {
      const h = String(Math.floor(segundos / 3600)).padStart(2, '0');
      const m = String(Math.floor((segundos % 3600) / 60)).padStart(2, '0');
      const s = String(segundos % 60).padStart(2, '0');
      return `${h}:${m}:${s}`;
    }
  

    openSubastaDetalle(subasta: any){
      this.getDatosSubasta(subasta.id);
    }

    getWalletPagos(){
      // this.usuario()!.id
      this.walletPagos = [
        {id:2323,item: {name:'Mario Kart',id:4343,img: 'images/subasta1.webp'}, totalRecibir: 1230.00, fecha: new Date(), estatus:'Por pagar',estatusClave:'PPR', precio: 1700,retenciones:[{name:'IVA (16%)', valor:200}, {name:'ISR (16%)', valor:170}, {name:'XUBA (16%)', valor:100}], saldoNegativo:0, flete:0 },
        {id:5334,item: {name:'Memoria',id:54355,img: 'images/subasta2.webp'}, totalRecibir: 3422.00, fecha: new Date(), estatus:'Pagado',estatusClave:'PDO',precio: 4100,retenciones:[{name:'IVA (16%)', valor:300}, {name:'ISR (16%)', valor:200}, {name:'XUBA (16%)', valor:200}], saldoNegativo:0, flete:0 }
      ]
    }

    getDatosSubasta(id: number){
      this.allLoading = true;
      this.subastasService.getAuctionById(id).subscribe({
        next: subasta => {
          this.allLoading = false;
          let tiempoVence = subasta.tiempoVence?? '00:00:00';
          let _tiempoRestante = tiempoVence.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
          console.log(_tiempoRestante);
          if(_tiempoRestante > 0){
            this.router.navigate(['/subasta', subasta.id, 'MyAuctionsPage']);
          } else {
            let dataParams = JSON.stringify({ idSubasta: id, tipoUsuario:'vendedor'});
            let encoded = this.ss.encodeToBase64(dataParams);
            this.router.navigate(['/subasta-terminada', encoded]);
          }
        }, 
          error: err => {
            console.error('Error fetching auction data:', err);
            this.allLoading = false;
          }
      })
    }
  
    onFileChange(event: any) {
      const files = event.target.files;
      if (files && files.length > 0) {
        // for (let i = 0; i < files.length && this.subasta.mimagenesSubasta.length < 5; i++) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.imageProfileSrc = e.target.result;
            this.updatingImage = true;
            // this.subasta.mimagenesSubasta.push({url: e.target.result});
            // this.imagesPreview!.push({url: e.target.result});
            // this.imagenes.push(e.target.result);
          };
          reader.readAsDataURL(files[0]);
        // }
      }
    }

    getClearBase64(url: string){

        let index = url.indexOf('base64');
        let firstPart = url.substring(0,  index + 7);
        let clearB64 = url.replace(firstPart,'');
      
      return clearB64;
    }

    editImgPerfil(): void {
      this.initFormFoto();
      this.dataEditImg = {
        fotoPerfil: this.getClearBase64(this.imageProfileSrc) ,
        idUsuario:this.usuario()!.id,
        fotoAnterior:this.usuario()!.imgPerfil
      }
      this.loading = true;
      this.authService.actualizarFotoPerfilUsuario(this.dataEditImg).subscribe({
        next: (response: any) => {
          this.loading = false;
          console.log('Profile image updated successfully', response);
          this.usuario()!.imgPerfil = response.message;
          this.ss.showNotification('success','Foto actualizada correctamente');
          this.authService.setUser(this.usuario()!);
        },
        error: (error) => {
          this.loading = false;
          console.error('Error updating profile image', error);
        }
      });

      // this.usuario()!.imgPerfil = this.imageProfileSrc;
      // console.log(this.usuario())
      // console.log(this.dataEditImg)

    }
  
}
