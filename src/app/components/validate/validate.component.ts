import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoaderComponent } from '../loader/loader.component';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-validate',
  imports: [CommonModule, LoaderComponent],
  templateUrl: './validate.component.html',
  styleUrl: './validate.component.css'
})
export class ValidateComponent {
  isInvalidOrExpired: boolean = false;
  isValidateSuccess: boolean = false;
  isLinkResent: boolean = false;
  loading: boolean = false;
  jsonParams: any = {};
  constructor( private route: ActivatedRoute, private ss: SharedService, private auth: AuthService, private router: Router){
    let dataParams: any = this.route.snapshot.params['userValidateData'];
    let decoded = atob(dataParams)
    if(decoded){
     this.jsonParams = JSON.parse(decoded);
     console.log(this.jsonParams);
    //  console.log(decoded)
    }
   
  }

  validarCuenta(){
    this.loading = true;
    let model = {
      id: this.jsonParams.idUsuario,
      token: this.jsonParams.token
    }
    this.auth.validarCorreoUsuario(model).subscribe({
      next:(res: any) => {
        this.loading = false;
        if(res.success){
            this.isValidateSuccess = true;
            this.isInvalidOrExpired = false;
        } 
        else {
          this.isValidateSuccess = false;
          this.isInvalidOrExpired = true;
        }
        console.log(res);
      },
      error:(err) => {
        this.isValidateSuccess = false;
        this.isInvalidOrExpired = true;
        this.loading = false;
        console.log(err)
      },
    })
    // setTimeout(() => {
    //   this.isValidateSuccess = true;
    //   this.loading = false;
    // }, 2500);
    // this.isInvalidOrExpired = true;
    
  }

  reenviarEnlaceDeValidacion(){
    // this.isLinkResent = true;
    this.getInformacionUsuario(this.jsonParams.idUsuario);
  }

  goHome(){
    this.router.navigate(['/home']);
  }

  getInformacionUsuario(idUsuario: number){
    this.loading = true;
    this.auth.consultarDatosUsuario(idUsuario).subscribe({
      next: (response: any) => {
        this.loading = false;
      //  console.log(response)
       this.reenviarCorreo(idUsuario, response.correo);
      },
      error: (err: any) => {
        this.loading = false;

          console.error('Error fetching user information:', err);
      }
    });
  }

  reenviarCorreo(idUSer: number, correo: string){
    this.loading = true;
    let model = {idusuario: idUSer, correo};
    console.log(model)
    this.auth.reenviarCorreoValidacion(model).subscribe({
      next: (response: any) => {
        this.loading = false;
        if(response && response.success){
          this.isLinkResent = true;
        } else {
          this.isLinkResent = false;
          this.ss.showNotification('error','Hubo un problema al enviar el correo');
        }
        console.log(response)
      },
      error: (err: any) => {
        this.loading = false;
        this.ss.showNotification('error','Hubo un problema al intentar enviar el correo');
          console.error('Error fetching send mail verification:', err);
      }
    })
  }
}
