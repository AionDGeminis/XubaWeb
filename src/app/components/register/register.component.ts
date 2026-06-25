import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors  } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [CommonModule, ReactiveFormsModule] 
})
export class RegisterComponent implements OnInit {
  formulario!: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.formulario = this.fb.group({
      usuario: ['', Validators.required],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      telefono: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      contra: ['', Validators.required],
      confirmarContra: ['', Validators.required],
      genero: ['', Validators.required]
    },
    { validators: this.contraseniasIguales } );
  }
  contraseniasIguales(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('contra')?.value;
    const confirm = group.get('confirmarContra')?.value;
    return pass === confirm ? null : { noCoincide: true };
  }
  registrarUsuario() {
    if (this.formulario.valid) {
        const datos = { ...this.formulario.value };
        delete datos.confirmarContra; // No lo mandamos al API

      this.http.post('http://173.208.155.152/api/usuarios/RegistroUsuario', this.formulario.value).subscribe({
        next: (res) => {          
          this.formulario.reset();
          const { telefono, contra } = this.formulario.value;
          this.hacerLogin(telefono, contra);
        },
        error: (err) => {
          console.error('Error al registrar', err);
          alert('Ocurrió un error al registrar el usuario');
        }
      });
    }
  }
  hacerLogin(telefono: string, contra: string) {
    const correo='';
    const datosLogin = { telefono, contra, correo };
  
    this.http.post<any>('http://173.208.155.152/api/login', datosLogin).subscribe({
      next: (res) => {
        localStorage.setItem('usuario', JSON.stringify(res));
  
        // Recarga la página
        location.reload();
      },
      error: (err) => {
        console.error('Login automático falló', err);
        alert('Registro exitoso, pero hubo un error al iniciar sesión');
      }
    });
  }
}

