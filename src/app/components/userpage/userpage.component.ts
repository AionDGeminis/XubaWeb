import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoaderComponent } from '../loader/loader.component';
import { SubastasService } from '../../services/subastas.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subasta } from '../../models/subasta.model';
import { SharedService } from '../../services/shared.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-userpage',
  imports: [CommonModule, FormsModule, LoaderComponent, NgxPaginationModule],
  templateUrl: './userpage.component.html',
  styleUrl: './userpage.component.css'
})
export class UserpageComponent {
  infoUsuario: any = {};
  editInfoUsuario: any = {
    id: 0,
    telefono:'',
    correo:'',
    contra:''
  }
  loading: boolean = false;
  tabIndex: number = 0;
  imageProfileSrc: string = 'images/nofound5.jpg'
  idUsuario: number = 0;
  subastasActivas: Subasta[] = [];
  intervalId: any;
  allLoading: boolean = false;
  page = 1;          
  pageSize = 30;

  constructor(private subastasService: SubastasService,private authService: AuthService, private route: ActivatedRoute, private router: Router, private ss: SharedService) {
    let dataParams: any = this.route.snapshot.params;
    this.idUsuario = dataParams['id'];
    if(this.idUsuario && this.idUsuario > 0){
      // this.getSubastasUsuario();
      this.getInformacionUsuario(this.idUsuario);
    }
    localStorage.removeItem('BCK-TO-PG');
    console.log(dataParams)
  }

  setCurrentTab(index: number){

  }

  getInformacionUsuario(idUsuario: number){
    this.allLoading = true;
    this.authService.consultarDatosUsuario(idUsuario).subscribe({
      next: (response: any) => {
        this.allLoading = false;
        this.infoUsuario = response;
        this.imageProfileSrc = response.imgPerfil;
        this.getSubastasUsuario();
          console.log(response);
      },
      error: (err: any) => {
        this.allLoading = false;
          console.error('Error fetching user information:', err);
      }
    });
  }

  getSubastasUsuario(){
    this.allLoading = true;
    // getSubastasUsuarioByEstatus(this.usuario()!.id, tipo)
    this.subastasService.getSubastasUsuarioByEstatus(this.idUsuario, 'Activa').subscribe({
      next: (subastas) => {
        this.allLoading = false;
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
        this.allLoading = false;
          console.error('Error fetching subastas:', err);
      }
    });
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


  getDatosSubasta(id: number){
    this.allLoading = true;
    this.subastasService.getAuctionById(id).subscribe({
      next: subasta => {
        this.allLoading = false;
        let tiempoVence = subasta.tiempoVence?? '00:00:00';
        let _tiempoRestante = tiempoVence.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
        console.log(_tiempoRestante);
        localStorage.setItem('BCK-TO-PG',`userpage/${this.idUsuario}`);
        if(_tiempoRestante > 0){
          this.router.navigate(['/subasta-detalle', subasta.id, 'MyAuctionsPage']);
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
}
