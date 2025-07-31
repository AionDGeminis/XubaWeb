import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Usuario } from '../models/subasta.model';
import {  Observable, tap } from 'rxjs';
import {environment as env, headers, auth_headers, test_headers} from '../environment/environment';


// const API_BASE_URL = (window as any).apiBaseUrl;
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${env.base_url}/usuarios/login`;
  
  
  private _usuario = signal<Usuario | null>(null);
 

  currentUser = computed(() => this._usuario());
  constructor(private http: HttpClient)  {

    const userData = localStorage.getItem('usuario');
    if (userData) {
      this._usuario.set(JSON.parse(userData));
    }
    
  }

  get idUsuario(): string {
    const user = this.currentUser();
    return user ? user.id.toString() : '';
  }

  login(telefono: string, contra: string, correo: string): Observable<Usuario> {
    const body= { telefono, contra, correo };

    return this.http.post<Usuario>(this.apiUrl, body);
  }
  setUser(user: Usuario) {
    this._usuario.set(user);
    localStorage.setItem('usuario', JSON.stringify(user)); // opcional
    console.log('setUser');
  }

  getUserData(){
    const userData = localStorage.getItem('usuario');
    return userData ? JSON.parse(userData) : null;
  }

  logout() {
    this._usuario.set(null);
    console.log('logout _usuario set null');
    localStorage.removeItem('usuario');
  }
}
