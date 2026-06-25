import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Usuario } from '../models/subasta.model';
import {  map, Observable, tap } from 'rxjs';
import {environment as env, headers, auth_headers, test_headers} from '../environment/environment';
import { SharedService } from './shared.service';


// const API_BASE_URL = (window as any).apiBaseUrl;
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${env.base_url}/usuarios/login`;
  
  
  private _usuario = signal<Usuario | null>(null);
 

  currentUser = computed(() => this._usuario());
  validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=' //65
  // replaces= [
  //   {og:'A',rp:''},{og:'B',rp:''},{og:'C',rp:''},{og:'D',rp:''},{og:'E',rp:''},{og:'F',rp:''},
  //   {og:'G',rp:''},{og:'H',rp:''},{og:'I',rp:''},{og:'J',rp:''},{og:'K',rp:''},{og:'L',rp:''},
  //   {og:'M',rp:''},{og:'N',rp:''},{og:'O',rp:''},{og:'P',rp:''},{og:'Q',rp:''},{og:'R',rp:''},
  //   {og:'S',rp:''},{og:'T',rp:''},{og:'U',rp:''},{og:'V',rp:''},{og:'W',rp:''},{og:'X',rp:''},
  //   {og:'Y',rp:''},{og:'Z',rp:''},{og:'a',rp:''},{og:'b',rp:''},{og:'c',rp:''},{og:'d',rp:''},
  //   {og:'e',rp:''},{og:'f',rp:''},{og:'g',rp:''},{og:'h',rp:''},{og:'i',rp:''},{og:'j',rp:''},
  //   {og:'k',rp:''},{og:'l',rp:''},{og:'m',rp:''},{og:'n',rp:''},{og:'o',rp:''},{og:'p',rp:''},
  //   {og:'q',rp:''},{og:'r',rp:''},{og:'s',rp:''},{og:'t',rp:''},{og:'u',rp:''},{og:'v',rp:''},
  //   {og:'w',rp:''},{og:'x',rp:''},{og:'y',rp:''},{og:'z',rp:''},{og:'0',rp:''},{og:'1',rp:''},
  //   {og:'2',rp:''},{og:'3',rp:''},{og:'4',rp:''},{og:'5',rp:''},{og:'6',rp:''},{og:'7',rp:''},
  //   {og:'8',rp:''},{og:'9',rp:''},{og:'+',rp:''},{og:'/',rp:''},{og:'=',rp:''}
  // ];
  replaces = [
    { og:'A', rp:'¶' }, { og:'B', rp:'Z' }, { og:'C', rp:'7' }, { og:'D', rp:'m' },
    { og:'E', rp:'/' }, { og:'F', rp:'Q' }, { og:'G', rp:'9' }, { og:'H', rp:'e' },
    { og:'I', rp:'+' }, { og:'J', rp:'u' }, { og:'K', rp:'2' }, { og:'L', rp:'a' },
    { og:'M', rp:'W' }, { og:'N', rp:'=' }, { og:'O', rp:'§' }, { og:'P', rp:'k' },
    { og:'Q', rp:'x' }, { og:'R', rp:'H' }, { og:'S', rp:'f' }, { og:'T', rp:'0' },
    { og:'U', rp:'N' }, { og:'V', rp:'C' }, { og:'W', rp:'8' }, { og:'X', rp:'P' },
    { og:'Y', rp:'$' }, { og:'Z', rp:'L' },
  
    { og:'a', rp:'Y' }, { og:'b', rp:'!' }, { og:'c', rp:'T' }, { og:'d', rp:'5' },
    { og:'e', rp:'S' }, { og:'f', rp:'O' }, { og:'g', rp:'J' }, { og:'h', rp:'1' },
    { og:'i', rp:'G' }, { og:'j', rp:'v' }, { og:'k', rp:'d' }, { og:'l', rp:'R' },
    { og:'m', rp:'E' }, { og:'n', rp:'U' }, { og:'o', rp:'K' }, { og:'p', rp:'3' },
    { og:'q', rp:'w' }, { og:'r', rp:'c' }, { og:'s', rp:'4' }, { og:'t', rp:'6' },
    { og:'u', rp:'I' }, { og:'v', rp:'D' }, { og:'w', rp:'y' }, { og:'x', rp:'b' },
    { og:'y', rp:'V' }, { og:'z', rp:'t' },
  
    { og:'0', rp:'±' }, { og:'1', rp:'o' }, { og:'2', rp:'A' }, { og:'3', rp:'X' },
    { og:'4', rp:'s' }, { og:'5', rp:'n' }, { og:'6', rp:'z' }, { og:'7', rp:'j' },
    { og:'8', rp:'q' }, { og:'9', rp:'p' }, { og:'+', rp:'F' }, { og:'/', rp:'h' },
    { og:'=', rp:'g' }
  ];
  
  constructor(private http: HttpClient, private ss: SharedService)  {

    // const userData = localStorage.getItem('usuario');
    // if (userData) {
    //   this._usuario.set(JSON.parse(userData));
    // }
    this.getLocalSavedUser();
    
  }

  getLocalSavedUser(){
    let userData = this.getUserData();
    if (userData) {
      this._usuario.set(userData);
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
    console.log(user)
    let _userdata = this.toXubaEncode(JSON.stringify(user));
    let _userkey = this.toXubaEncode('VALID_USER');
    console.log(_userkey);
    // this.decodeFromXuba(_userencoded)
    this._usuario.set(user);
    localStorage.setItem(_userkey, _userdata); // opcional
    // localStorage.setItem('usuario', JSON.stringify(user)); // opcional
    // console.log('setUser');
  }

  toXubaEncode(data: string){
    let b64 = this.ss.encodeToBase64(data);
    // console.log(b64)
    let reversed = b64?.split('').reverse();
    let newArray = [];
    for(let char of reversed!){
      let _char = this.replaces.find(x => x.og === char);
      newArray.push(_char?.rp);
    }
    let encoded = newArray.reverse().join('');
    return encoded;
    // console.log(reversed);
    // console.log(encoded);
  }

  decodeFromXuba(data: string){
    let reversed = data?.split('').reverse();
    let newArray = [];
    for(let char of reversed!){
      let _char = this.replaces.find(x => x.rp === char);
      newArray.push(_char?.og);
    }
    let decoded = newArray.reverse().join('');
    let result = this.ss.decodeFromBase64(decoded);
    console.log(result)
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

  validarUsuario(model: any){
    return this.http.post(`${env.base_url}/usuarios/ValidarUsuario`,model,{headers:test_headers}).pipe(map(res => res));  
  }

  consultarCorreoExistente(model: any){
    return this.http.post(`${env.base_url}/usuarios/ConsultarCorreoExiste`,model,{headers:test_headers}).pipe(map(res => res));  
  }
  
  generarTokenRecuperacionContra(model: any){
    return this.http.post(`${env.base_url}/usuarios/GenerarTokenRecuperacionContra`,model,{headers:test_headers}).pipe(map(res => res));  
  }

  validarTokenRecuperacionContra(model: any){
    return this.http.post(`${env.base_url}/usuarios/ValidarTokenRecuperarContra`,model,{headers:test_headers}).pipe(map(res => res));  
  }

  cambiarPasswordUser(model: any){
    return this.http.post(`${env.base_url}/usuarios/CambiarContra`,model,{headers:test_headers}).pipe(map(res => res));  
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
    let _userkey = this.toXubaEncode('VALID_USER');
    let data = localStorage.getItem(_userkey);
    let dataString = data??'';
    let stringDecoded = this.ss.decodeFromXuba(dataString);

    // const userData = localStorage.getItem('usuario');
    return stringDecoded && stringDecoded !== '' ? JSON.parse(stringDecoded) : null;
    // return stringDecoded ? JSON.parse(userData) : null;
  }

  logout() {
    this._usuario.set(null);
    console.log('logout _usuario set null');
   
    let _userkey = this.toXubaEncode('VALID_USER');
    localStorage.removeItem('usuario');
    localStorage.removeItem(_userkey);
  }

  saveOrganization(data: any){
    return this.http.post(`${env.base_url}/Facturacion/CrearOrganizacion`,data,{headers:test_headers}).pipe(map(res => res));  
  }
  
  updateDataOrganization(data: any, idOrganizacion: number){
    return this.http.put(`${env.base_url}/Facturacion/organizaciones/${idOrganizacion}/legal`,data,{headers:test_headers}).pipe(map(res => res));  
  }

  saveEfima(form: FormData, idOrganizacion: number){
    return this.http.post(`${env.base_url}/Facturacion/organizaciones/${idOrganizacion}/certificado-sdk`,form).pipe(map(res => res));  
  }

  validarCorreoUsuario(dataModel: any){
    return this.http.post(`${env.base_url}/usuarios/ValidarCorreo`,dataModel).pipe(map(res => res));  
  }

  reenviarCorreoValidacion(modelValidacion: any){
    return this.http.post(`${env.base_url}/correos/correo-verificacion`,modelValidacion).pipe(map(res => res));  
  }
}
