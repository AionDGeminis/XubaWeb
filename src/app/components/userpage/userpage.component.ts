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
import { PerfilVendedor, SubastaActiva } from '../../models/UserPage.model';

@Component({
  selector: 'app-userpage',
  imports: [CommonModule, FormsModule, LoaderComponent, NgxPaginationModule],
  templateUrl: './userpage.component.html',
  styleUrl: './userpage.component.css'
})
export class UserpageComponent {
  infoUsuario: PerfilVendedor = {
    idVendedor: 0,
    nombre: '',
    usuario: '',
    imgPerfil: '',
    calificacion: 0,
    municipio: '',
    estado: '',
    subastasCreadas: 0,
    subastasConcretadas: 0,
    seguidores: 0,
    antiguedad: '',
    siguiendo: false,
    subastasExpress: [],
    subastasActivas: []
   };
  editInfoUsuario: any = {
    id: 0,
    telefono: '',
    correo: '',
    contra: ''
  }
  loading: boolean = false;
  tabIndex: number = 0;
  imageProfileSrc: string = 'images/nofound5.jpg'
  idVendedor: number = 0;
  idUsuario: number = 0;
  subastasActivas: SubastaActiva[] = [];
  subastasPremium: Subasta[] = [];
  subastasExpress: SubastaActiva[] = [];
  subastasTerminadas: Subasta[] = [];

  filtroActual = 'Todas';

  ordenActual = 'recientes';
  intervalId: any;
  allLoading: boolean = false;
  page = 1;
  pageSize = 10;
  
  mostrarFlechaIzquierda = false;
  mostrarFlechaDerecha = true;

  constructor(private subastasService: SubastasService, private authService: AuthService, private route: ActivatedRoute, private router: Router, private ss: SharedService) {
    let dataParams: any = this.route.snapshot.params;
    console.log('Parámetros:', dataParams);
    this.idVendedor = Number(dataParams['id']);
    this.idUsuario = Number(this.authService.idUsuario);

    if (this.idVendedor > 0 && this.idUsuario > 0) {
      this.getInformacionUsuario(this.idVendedor, this.idUsuario);
    }
    localStorage.removeItem('BCK-TO-PG');
    console.log(dataParams)
  }

  setCurrentTab(index: number) {

  }

  getInformacionUsuario(idVendedor: number, idUsuario: number) {
    this.allLoading = true;

    this.subastasService.ConsultarPerfilVendedorId(idVendedor, idUsuario).subscribe({
      next: (response: PerfilVendedor) => {
        this.allLoading = false;
        console.log("Informacion")
        console.log(response)

        this.infoUsuario = response;
        this.imageProfileSrc = response.imgPerfil;

        this.subastasActivas = response.subastasActivas || [];
        this.subastasExpress = response.subastasExpress || [];

        for (const p of this.subastasActivas) {
          p.venceSegundos = this.tiempoStringASegundos(p.tiempoVence);
          p.short_desc = this.toShort(p.descripcion);
        }
        for (const p of this.subastasExpress) {

  p.venceSegundos = this.tiempoStringASegundos(p.tiempoVence);

}

        this.setTimer(this.subastasActivas);
        this.setTimer(this.subastasExpress);
      },

      error: (err) => {
        this.allLoading = false;
        console.error('Error perfil vendedor:', err);
      }
    });
  }



  setTimer(litaItems: any[]) {
    this.intervalId = setInterval(() => {
      for (let item of litaItems) {
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

  toShort(val: string) {
    return val.length > 41 ? val.substring(0, 41) + '...' : val;
  }

  // 2. Función para convertir segundos a "hh:mm:ss"
  segundosATiempoString(segundos: number) {
    const h = String(Math.floor(segundos / 3600)).padStart(2, '0');
    const m = String(Math.floor((segundos % 3600) / 60)).padStart(2, '0');
    const s = String(segundos % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }


  openSubastaDetalle(id: number) {
    this.router.navigate(['/subasta-detalle', id, 'MyAuctionsPage']);
  }
  toggleSeguir() {
    if (!this.infoUsuario) {
      return;
    }

    const data = {
      idVendedor: this.infoUsuario.idVendedor
    };

    console.log('Datos para seguir:', data);

    if (this.infoUsuario.siguiendo) {

      this.subastasService.noseguirVendedor(data).subscribe({
        next: (response: any) => {
          console.log('Dejaste de seguir:', response);

          if (this.infoUsuario) {
            this.infoUsuario.siguiendo = false;
            this.infoUsuario.seguidores--;
          }
        },
        error: (err) => {
          console.error('Error al dejar de seguir:', err);
        }
      });

    } else {

      this.subastasService.seguirVendedor(data).subscribe({
        next: (response: any) => {
          console.log('Ahora sigues al vendedor:', response);

          if (this.infoUsuario) {
            this.infoUsuario.siguiendo = true;
            this.infoUsuario.seguidores++;
          }
        },
        error: (err) => {
          console.error('Error al seguir al vendedor:', err);
        }
      });
    }
  }

  verificarScroll(contenedor: HTMLElement) {

  this.mostrarFlechaIzquierda = contenedor.scrollLeft > 0;
  this.mostrarFlechaDerecha = true;

  const llegoAlFinal =
    contenedor.scrollLeft + contenedor.clientWidth >=
    contenedor.scrollWidth - 50;

 
}

 scrollDerecha(contenedor: HTMLElement) {
  const anchoVisible = contenedor.offsetWidth;

  if (
    contenedor.scrollLeft + anchoVisible >=
    contenedor.scrollWidth - 20
  ) {
   ;   // <-- la misma función
  }

  contenedor.scrollBy({
    left: anchoVisible,
    behavior: 'smooth'
  });

  setTimeout(() => this.verificarScroll(contenedor), 300);
}

  scrollIzquierda(contenedor: HTMLElement) {
    const anchoVisible = contenedor.offsetWidth;
    contenedor.scrollBy({ left: -anchoVisible, behavior: 'smooth' });

    setTimeout(() => this.verificarScroll(contenedor), 300);
  }


}
