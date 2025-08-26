import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SharedService } from '../../services/shared.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pageblock',
  imports: [CommonModule, FormsModule],
  templateUrl: './pageblock.component.html',
  styleUrl: './pageblock.component.css'
})
export class PageblockComponent  implements OnInit{

  showPage: boolean = true;
  pass: string = '';
  constructor(private router: Router, private ss: SharedService){
  }

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Guarda la URL actual
        const currentPage = event.urlAfterRedirects;
        this.showPage = this.checkDataUSer(currentPage);
        // Aquí puedes hacer lógica para mostrar/ocultar elementos
      });
  }

  checkDataUSer(currentPage: string){
    let show = true;
    if(currentPage === '/preregistro'){
      show = false;
    } else {
      let hasAccess = localStorage.getItem('ZGF0YVVzZXJBY2Nlc3M=');
      console.log('datauserAccess')
      console.log(hasAccess)
      if(hasAccess && hasAccess !== null && hasAccess === '=M1UFN0QB9lUFNVV'){
        show = false;
      }
    }
    console.log('Mostrar pagina?:')
    console.log(show)
    return show;
  }

  checkPasswordUser(){
    // let data = 'USER_ACCESS';
    if(this.pass && this.pass.trim() !== '' && this.pass.trim() === 'xubauser25'){
      localStorage.setItem('ZGF0YVVzZXJBY2Nlc3M=','=M1UFN0QB9lUFNVV');
      this.showPage = false;
    }
  }
}
