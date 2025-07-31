import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from "rxjs/operators";

import { Subasta } from '../models/subasta.model';
import { UrlCodec } from '@angular/common/upgrade';
// const API_BASE_URL = (window as any).apiBaseUrl;
import {environment as env, headers, auth_headers, test_headers} from '../environment/environment';

@Injectable({  providedIn: 'root'})

export class SubastasService {
  
  constructor(private http: HttpClient) {}
  
  getAuctions(tipo: 'porvencer' | 'premium' | 'todas'): Observable<Subasta[]> {
    const apiUrl = `${env.base_url}/subastas/${tipo}`; 
    return this.http.get<Subasta[]>(apiUrl, {headers:test_headers});
  }
  
  getNotifications(idUsuario:number) {
    const apiUrl = `${env.base_url}/notificaciones/${idUsuario}`; 
    return this.http.get(apiUrl,{headers:test_headers}).pipe(map(res => res));//this.http.get<Subasta[]>(apiUrl);
  }

  getAuctionById(id: number): Observable<Subasta> {
    return this.http.get<Subasta>(`${env.base_url}/subastas/ConsultaSubataId/${id}`, {headers:test_headers}).pipe(map(res => res));
  }
  consultarGanador(idSubasta: number) {
    return this.http.get<any>(`${env.base_url}/subastas/ConsultaGanador/${idSubasta}`, {headers:test_headers}).pipe(map(res => res));
  }

  ConsultarSiSiguiendo(idUsuario: number, idSubasta: number) {
    return this.http.get<any>(`${env.base_url}/seguirSubasta/siguiendo/${idUsuario}/${idSubasta}`, {headers:test_headers});
  }

  crearSubasta(subastaData:any) {
    return this.http.post(`${env.base_url}/subastas`,subastaData,{headers:test_headers}).pipe(map(res => res));
    // return this.http.post(`${env.base_url}/subastas`,JSON.stringify(subastaData),{headers:test_headers}).pipe(map(res => res));
  }

  GenerarCargoSubastaPremium(dataCargo: any){
    const apiBankUrl = 'http://173.208.155.152:8001/api/Cargos/GenerarCargo';
    return this.http.post(apiBankUrl,dataCargo,{headers:test_headers}).pipe(map(res => res));
  }

  seguirSubasta(idUsuario: number, idSubasta: string) {
    const payload = { idUsuario, idSubasta };
    return this.http.post(`${env.base_url}/seguirSubasta`,payload,{headers:test_headers}).pipe(map(res => res));
  }

  dejarDeSeguirSubasta(idUsuario: number, idSubasta: string) {
    const payload = { idUsuario, idSubasta };
    return this.http.request(
      'delete',
      `${env.base_url}/seguirSubasta`,
      {
        body: payload,
        responseType: 'text',
        observe: 'response'
      }
    );
  }

  GetInformacionSubastaTerminada(IdSubasta: number){
    return this.http.get(`${env.base_url}/subastas/ConsultaGanador/${IdSubasta}`, {headers:test_headers}).pipe(map(res => res));
  }

  GetHistorialEstatusSubasta(IdSubasta: number){
    return this.http.get(`${env.base_url}/subastas/historialSubasta/${IdSubasta}`, {headers:test_headers}).pipe(map(res => res));
  }

  buscarSubastas(termino: string): Observable<Subasta[]> {
    return this.http.get<Subasta[]>(`${env.base_url}/subastas/SearchSubastas/${termino}`).pipe(map(res => res));
  }

  actualizarEstatusSubasta(idSubasta: number, idEstatus: number){
    return this.http.put(`${env.base_url}/estatus/EditarEstatusSubasta/${idSubasta}/${idEstatus}`, {headers:test_headers}).pipe(map(res => res));
  }

  enviarApuesta(data: {
    idSubasta: number;
    idComprador: number;
    apuesta: number;
    compraDirecta: boolean;
  }): Observable<any> {
    const apiUrl = `${env.base_url}/apuestas`;

    const body = {
      id: 0,
      idSubasta: data.idSubasta,
      idComprador: data.idComprador,
      apuesta: data.apuesta,
      creado: new Date().toISOString(),
      compraDirecta: data.compraDirecta,
      cantidadApuestas: 0,
      musuarios: {
        id: 0,
        nombre: '',
        apellido: '',
        telefono: '',
        correo: '',
        contra: '',
        auth: false,
        stars: 0,
        registrado: false,
        subastasActivas: 0,
        usuario: '',
        creado: new Date().toISOString(),
        imgPerfil: ''
      }
    };
    console.log(body)
    return this.http.post(apiUrl, body);
  }
}
