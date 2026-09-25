import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../../services/shared.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoaderComponent } from '../../shared-components/loader/loader.component';
import { UserRegister } from '../../../models/user-register-model';

@Component({
  selector: 'app-user-register',
  imports: [FormsModule, CommonModule, LoaderComponent],
  templateUrl: './user-register.component.html',
  styleUrl: './user-register.component.css'
})



export class UserRegisterComponent {
  private usuarioValidationTimer: ReturnType<typeof setTimeout> | undefined;
  formData: UserRegister = {
    nombre: '',
    apellido: '',
    usuario: '',
    correo: '',
    telefono: '',
    contra: '',
    repcontra: '',
    genero: '',
    fechaNacimiento: new Date(),
    interes: '',
    aceptaDocumentos: false
  };

  confirmar = {
    telefono: null,
    correo: null
  }
  loading: boolean = false;
  validandoUsuario: boolean = false;
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
  fechaNacimiento = { dia: null, mes: null, anio: null }

  dias = Array.from({ length: 31 }, (_, i) => i + 1);
  meses = [{ id: 1, nom: 'Enero' }, { id: 2, nom: 'Febrero' }, { id: 3, nom: 'Marzo' },
  { id: 4, nom: 'Abril' }, { id: 5, nom: 'Mayo' }, { id: 6, nom: 'Junio' },
  { id: 7, nom: 'Julio' }, { id: 8, nom: 'Agosto' }, { id: 9, nom: 'Septiembre' },
  { id: 10, nom: 'Octubre' }, { id: 11, nom: 'Noviembre' }, { id: 12, nom: 'Diciembre' },
  ]
  anios = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
  intereses: any = { vender: false, comprar: false }
  isValidAndAvailableUsername: boolean = false;

  constructor(private ss: SharedService, private auth: AuthService, private router: Router) {
    console.log(this.dias)
    console.log(this.meses)
    console.log(this.anios)

  }

  onSubmit() {
    //this.ss.showMessage('success','Registro exitoso<br />Revisar x')
    // console.log(this.formData)
    if (this.ss.isValidModel(this.formData, ['interes'])) {
      if (!this.ss.isMailFormat(this.formData.correo)) {
        this.ss.showNotification('warning', 'El correo no tiene un formato valido');
        return;
      }
      if (this.formData.telefono !== this.confirmar.telefono) {
        this.ss.showNotification('info', 'Los telefonos no coinciden');
        return;
      }
      if (this.formData.correo !== this.confirmar.correo) {
        this.ss.showNotification('info', 'Los correos no coinciden');
        return;
      }
      if (this.formData.contra !== this.formData.repcontra) {
        this.ss.showNotification('warning', 'Las contrasenas no coinciden');
        return;
      }
      if (!this.ss.isValidModel(this.fechaNacimiento, [])) {
        this.ss.showNotification('warning', 'Fecha de nacimiento incompleta');
        return;
        // let fechaNac = new Date(this.fechaNacimiento.anio!, this.fechaNacimiento.mes! - 1, this.fechaNacimiento.dia!);
        // console.log(fechaNac); 6567418523
      }
      if (!this.intereses.comprar && !this.intereses.vender) {
        this.ss.showNotification('warning', 'Seleccione alguna opcion de interes');
        return;
      }
      if (this.ss.isMailFormat(this.formData.nombre)) {
        this.ss.showNotification('warning', 'Tu nombre no puede tener formato de correo', 4000);
        return;
      }
      if (this.ss.isMailFormat(this.formData.usuario)) {
        this.ss.showNotification('warning', 'El nombre de usuario no puede tener formato de correo', 4000);
        return;
      }
      if (this.formData.usuario.includes('arroba') || this.formData.usuario.includes('punto') || this.formData.usuario.includes('@') || this.formData.usuario.includes('.')) {
        this.ss.showNotification('warning', 'El nombre de usuario contiene texto no permitido');
        return;
      }

      if (!this.formData.aceptaDocumentos) {
        this.ss.showNotification('warning', 'Debes aceptar los terminos y condiciones');
        return;
      }

      this.formData.interes = this.intereses.comprar && this.intereses.vender ? 'ambos' : this.intereses.comprar ? 'comprar' : 'vender'
      // console.log(this.formData)
      this.formData.fechaNacimiento = new Date(this.fechaNacimiento.anio!, this.fechaNacimiento.mes! - 1, this.fechaNacimiento.dia!)
      this.loading = true;
      this.auth.registerUser(this.formData).subscribe({
        next: (response) => {
          //     console.log('Registration response:', response);
          this.loading = false;
          this.isRegistered = true;
          this.tryLoginAfterRegister();
        },
        error: (err) => {
          this.loading = false;
          console.error('Registration error:', err);
          let errorText = err && err.error && err.error.mensaje ? err.error.mensaje : 'Error al registrar usuario'
          this.ss.showNotification('error', errorText, 3500);
        }
      });
    } else {
      this.ss.showNotification('error', 'Por favor, complete todos los campos requeridos.');
      return;
    }
  }

  validarDisponibilidadUsuario(usuario: string) {
    this.auth.consultarDisponibilidadUsuario(usuario).subscribe({
      next: (response) => {
        // console.log(response);
        this.validandoUsuario = false;
        this.isValidAndAvailableUsername = response;
      },
      error: (err) => {
        console.error('Error verifying username:', err);
        this.validandoUsuario = false;
        this.isValidAndAvailableUsername = false;
      }
    });
  }

  onInputNickname(event: any, atributo: any) {
    const validValue: string = event.target.value.replace(/[^a-zA-Z0-9]/g, '');
    //atributo = validValue;
    this.formData.usuario = validValue;
    //event.target.value = validValue;
    event.target.value = validValue;
    this.isValidAndAvailableUsername = false;
    if (this.usuarioValidationTimer) {
      clearTimeout(this.usuarioValidationTimer);
    }
    if (validValue.length < 3) {
      this.validandoUsuario = false;
      return;
    }

    this.validandoUsuario = true;
    this.usuarioValidationTimer = setTimeout(() => {
      this.validarDisponibilidadUsuario(validValue);
    }, 500);
  }

  tryLoginAfterRegister() {
    const correo = '';
    this.ss.setLocalStorageEncodedKey('first_home', 'YES');
    this.router.navigate(['/home']);
  }


  onInput(event: any, form: string) {
    // Solo deja los dígitos del 0 al 9
    const soloNumeros = event.target.value.replace(/[^0-9]/g, '');
    switch (form) {
      case 'formData': this.formData.telefono = soloNumeros;
        break;
      case 'confirmar': this.confirmar.telefono = soloNumeros;
        break;
    }

    event.target.value = soloNumeros; // Actualiza el input si el usuario pegó algo no numérico
  }

  openTerminosCondiciones() {
    window.open("https://www.xuba.mx/politica-de-uso", "_blank")
  }

  openAvisoPrivacidad() {
    window.open("https://www.xuba.mx/aviso-de-privacidad", "_blank")
  }
}


