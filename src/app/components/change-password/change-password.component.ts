import { Component } from '@angular/core';
import { LoaderComponent } from '../loader/loader.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SharedService } from '../../services/shared.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-change-password',
  imports: [CommonModule, LoaderComponent, FormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  loading: boolean = false;
  invalid: boolean = false;
  jsonParams: any = {};
  showFormChangePassword: boolean = false;
  pass: any = {new:null,repeat:null}
  // isValidToken: 
  constructor(private route: ActivatedRoute, private ss: SharedService, private auth: AuthService, private router: Router){
    let dataParams: any = this.route.snapshot.params['userValidateData'];
    let decoded = atob(dataParams)
    if(decoded){
     this.jsonParams = JSON.parse(decoded);
     this.checkValidToken();
     console.log(this.jsonParams);
     console.log(decoded)
    }

    // console.log(dataParams)
  }

  checkValidToken(){
    
    if(this.jsonParams.token){
      let model = {
        idUsuario: this.jsonParams.idUsuario,
        token: this.jsonParams.token
      }
      this.loading = true;
      this.auth.validarTokenRecuperacionContra(model).subscribe({
        next:(res: any) => {
          this.loading = false;
          if(res.success){
            this.invalid = false;
            this.showFormChangePassword = true;
          } 
          else {
            this.invalid = true;
            this.showFormChangePassword = false;
          }
          console.log(res);
        },
        error:(err) => {
         
          this.loading = false;
          this.invalid = true;
          this.showFormChangePassword = false;
          console.log(err)
        },
      })
    }
  }

  async changePasswordUser(){
    if(!this.pass.new || !this.pass.repeat || this.pass.new.trim() === '' || this.pass.repeat.trim() === ''){
      this.ss.showNotification('info', 'Informacion incompleta');
      return;
    }

    if(this.pass.new !== this.pass.repeat){
      this.ss.showNotification('warning', 'Las contraseñas no coinciden')
      return;
    }

    let r = await this.ss.showConfirmMessage('¿Desea guardar la informacion?');
    if(r){
      let model = {
        idUsuario: this.jsonParams.idUsuario,
        contra: this.pass.new
      }
      this.auth.cambiarPasswordUser(model).subscribe({
        next:(value: any) => {
          console.log(value);
          if(value.success){
           this.ss.showNotification('success', 'contraseña actualizada con exito', 4000);
           this.router.navigate(['home']);
          } 
          else {
            this.ss.showNotification('error',value.mensaje , 3000);
            return;
          }
        },
        error:(err) => {
          this.ss.showNotification('error',err.mensaje , 3000);
          return;
          console.log(err)
        },
      })
    }
  }
}

// eyJpZFVzdWFyaW8iOjIsInRva2VuIjoiaTNPV1A5QVx1MDAyQjdsajg1NWh2SGEzSllIM1lJSTVTQXNac2FtbTI4b3dXcUFjPSIsImV4cGlyYUhvcmFzIjoiMjAyNi0wMy0yNFQwNzo1Mzo0MS42MTgxMTA4WiJ9