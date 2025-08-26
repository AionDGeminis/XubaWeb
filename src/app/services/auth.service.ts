import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Usuario } from '../models/subasta.model';
import {  map, Observable, tap } from 'rxjs';
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

  registerUser(dataUser: any){
    // final response = await dio.post('/usuarios/RegistroUsuario', data: data, options: Options(headers: getHeaders()));
    return this.http.post(`${env.base_url}/usuarios/RegistroUsuario`,dataUser,{headers:test_headers}).pipe(map(res => res));  
  }

  consultarDatosUsuario(idUsuario: number) {
    return this.http.get<any>(`${env.base_url}/usuarios/ConsultaDatosUsuario/${idUsuario}`, {headers:test_headers}).pipe(map(res => res));
  }

  editarDatosUsuario(data: any) {
    return this.http.put(`${env.base_url}/usuarios/EditarDatosUsuario`, data, {headers: test_headers}).pipe(map(res => res));
  }

  addCuentaClabe(dataUser: any){
    // final response = await dio.post('/usuarios/RegistroUsuario', data: data, options: Options(headers: getHeaders()));
    return this.http.post(`${env.base_url}/cuentasClabeUsuarios/RegistrarCuentaClabeUsuario`,dataUser,{headers:test_headers}).pipe(map(res => res));  
  }

  getCuentaClabe(idUsuario: number) {
    return this.http.get<any>(`${env.base_url}/cuentasClabeUsuarios/ConsultarCuentaClabeUsuario/${idUsuario}`, {headers:test_headers}).pipe(map(res => res));
  }

  editCuentaClabe(data: any) {
    return this.http.put(`${env.base_url}/cuentasClabeUsuarios/EditarCuentaClabeUsuario`, data, {headers: test_headers}).pipe(map(res => res));
  }

  actualizarFotoPerfilUsuario(data: any){
    return this.http.put(`${env.base_url}/usuarios/EditarFotoPerfil`, data, {headers: test_headers}).pipe(map(res => res));
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
