import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../models/subasta.model';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  @Output() mostrarRegistro = new EventEmitter<void>();

  loginForm!: FormGroup;
  errorLogin = '';

  fields = [
    { name: 'telefono', type: 'text', placeholder: 'Teléfono', label: 'Telefóno' },
    { name: 'contra', type: 'password', placeholder: 'Contraseña', label: 'Contraseña' }
  ];

  constructor(private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router) {}

  ngOnInit(): void {
    const formControls: { [key: string]: any } = {};
    this.fields.forEach(field => {
      formControls[field.name] = ['', Validators.required];
    });
    this.loginForm = this.fb.group(formControls);
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { telefono, contra } = this.loginForm.value;

    const correo='';
    this.authService.login(telefono, contra, correo).subscribe({
      next: (usuario: Usuario) => {
        console.log('Login exitoso:', usuario);
        this.authService.setUser(usuario); 
        console.log('despues de setUser pero desde login:');
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.errorLogin = 'telefono o contraseña incorrectos.';
      }
    });
  }

  loginWithFacebook() {
    console.log('Login con Facebook');
  }

  loginWithGoogle() {
    console.log('Login con Google');
  }

abrirRegistro() {
  this.mostrarRegistro.emit();
}
}
