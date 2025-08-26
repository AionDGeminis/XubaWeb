import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../services/shared.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-register',
  imports: [FormsModule, CommonModule],
  templateUrl: './user-register.component.html',
  styleUrl: './user-register.component.css'
})
export class UserRegisterComponent {

  formData = {
    nombre:'',
    apellido:'',
    usuario:'',
    correo: '',
    telefono:'',
    contra: '',
    repcontra: '',
    genero: '',
    fechaNacimiento: new Date()
  };

  mailSoporte = 'soporte@xuba.mx'

   //  var newUserData = {
        //   "usuario": controllers['usuario']!.text,
        //   "nombre": controllers['nombre']!.text,
        //   "apellido": controllers['apellido']!.text,
        //   "telefono": controllers['telefono']!.text,
        //   "correo": controllers['correo']!.text,
        //   "contra": controllers['password']!.text,
        //   "genero": generoSeleccionado == 'Hombre'? 'H':'M'
        // };

  isRegistered: boolean = false;
  fechaNacimiento = {dia:null,mes:null,anio:null}

  dias = Array.from({ length: 31 }, (_, i) => i + 1);
  meses = [{id:1,nom:'Enero'},{id:2,nom:'Febrero'}, {id:3,nom:'Marzo'},
    {id:4,nom:'Abril'},{id:5,nom:'Mayo'}, {id:6,nom:'Junio'},
    {id:7,nom:'Julio'},{id:8,nom:'Agosto'}, {id:9,nom:'Septiembre'},
    {id:10,nom:'Octubre'},{id:11,nom:'Noviembre'}, {id:12,nom:'Diciembre'},
  ]
  anios = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
  
  constructor(private ss: SharedService, private auth: AuthService) {
    console.log(this.dias)
    console.log(this.meses)
    console.log(this.anios)

  }

  onSubmit(){
    console.log(this.formData)
    if(this.ss.isValidModel(this.formData, [])){
      if(!this.ss.isMailFormat(this.formData.correo)){
        this.ss.showNotification('error','El correo no tiene un formato valido');
        return;
      }
      if(this.formData.contra !== this.formData.repcontra){
        this.ss.showNotification('error','Las contrasenas no coinciden');
        return;
      }
      if(!this.ss.isValidModel(this.fechaNacimiento, [])){
        this.ss.showNotification('error','Fecha de nacimiento incompleta');
        return;
        // let fechaNac = new Date(this.fechaNacimiento.anio!, this.fechaNacimiento.mes! - 1, this.fechaNacimiento.dia!);
        // console.log(fechaNac);
      }
      this.formData.fechaNacimiento = new Date(this.fechaNacimiento.anio!, this.fechaNacimiento.mes! - 1, this.fechaNacimiento.dia!)
      this.auth.registerUser(this.formData).subscribe({
        next: (response) => {
          console.log('Registration response:', response);
          this.isRegistered = true;
        },
        error: (err) => {
          console.error('Registration error:', err);
          this.ss.showNotification('error', 'Error al registrar el usuario');
        }
      });
    } else {
      this.ss.showNotification('error','Por favor, complete todos los campos requeridos.');
      return;
    }
    this.isRegistered = true;
   
    console.log(this.fechaNacimiento)
    console.log( this.ss.isValidModel(this.fechaNacimiento, []))
    if(this.ss.isValidModel(this.fechaNacimiento, [])){
      let fechaNac = new Date(this.fechaNacimiento.anio!, this.fechaNacimiento.mes! - 1, this.fechaNacimiento.dia!);
      console.log(fechaNac);
    }
  }

  onInput(event: any) {
    // Solo deja los dígitos del 0 al 9
    const soloNumeros = event.target.value.replace(/[^0-9]/g, '');
    this.formData.telefono = soloNumeros;
    event.target.value = soloNumeros; // Actualiza el input si el usuario pegó algo no numérico
  }
}
