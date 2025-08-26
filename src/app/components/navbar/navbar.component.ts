import { Component, computed, ElementRef, OnInit, Signal, ViewChild  } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BusquedaService } from '../../services/busqueda.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Usuario } from '../../models/subasta.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',  
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  @ViewChild('campoBusqueda') campoBusqueda!: ElementRef<HTMLInputElement>;
  public usuario!: Signal<Usuario|null>;
  public isLoggedIn!: Signal<boolean>;
  currentRoute: string = '';
  inPreregistro: boolean = false;
  isOpened: boolean = false;
  showSearch: boolean = false;
  showTitleDetail: boolean = false;
  paramParts: any[] = [];
  tituloDetalle: string = 'Prueba';
  constructor(private busquedaService: BusquedaService, private router: Router, private route: ActivatedRoute, private authService: AuthService)  {
    // const routePath = this.route.snapshot.routeConfig;
    // console.log('URL actual:', routePath);
   
  }

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Guarda la URL actual
        this.currentRoute = event.urlAfterRedirects;
        this.inPreregistro = this.currentRoute === '/preregistro'? true: false;
        console.log('Ruta actual:', this.currentRoute);
        this.showSearch = this.currentRoute.includes('home');
        this.paramParts = this.currentRoute.split('/');
        console.log(this.paramParts)
        this.showTitleDetail = this.paramParts.length > 2 && this.paramParts[1] === 'subasta';
        if(this.showTitleDetail && this.paramParts.length > 3){
          let _from = this.paramParts[3] || '';
          console.log(_from)
          switch(_from){
            case 'SubastasPremium':
              this.tituloDetalle = 'Premium';
              break;
            case 'Generales':
              this.tituloDetalle = 'Generales';
              break;
            case 'SubastasExpress':
              this.tituloDetalle = 'Express';
              break;
          }
        }
        // Aquí puedes hacer lógica para mostrar/ocultar elementos
      });

      this.usuario = this.authService.currentUser;
      this.isLoggedIn = computed(() => !!this.usuario());
      console.log(this.usuario())
  }
  
  mostrarBusqueda = false;
  textoBusqueda = '';

  toggleBusqueda() {
    if (!this.mostrarBusqueda) {
      this.textoBusqueda = '';      
    }
    this.mostrarBusqueda = !this.mostrarBusqueda;
    if (this.mostrarBusqueda) {
      setTimeout(() => {
        this.campoBusqueda.nativeElement.focus();
      });
    }
    setTimeout(() => {
        this.isOpened = !this.isOpened;
    }, 10);
    
  }
  recargarPagina() {
    if(this.inPreregistro) return;
    this.router.navigate(
      ['/home'],
    );
    // location.reload(); // ← Esto emula un F5

  }

  buscar() {
    const termino = this.textoBusqueda.trim();
    console.log('antes de buscar')
    if (termino) {
      this.busquedaService.setTermino(termino);
      this.mostrarBusqueda = false; // Oculta el campo
      this.textoBusqueda = ''; // Opcional: limpia el texto
      this.isOpened  = false;
    }
  }
}
