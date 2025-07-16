import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subasta } from '../models/subasta.model';
import { UrlCodec } from '@angular/common/upgrade';
const API_BASE_URL = (window as any).apiBaseUrl;
@Injectable({  providedIn: 'root'})

export class SubastasService {
  
  constructor(private http: HttpClient) {}
  
  getAuctions(tipo: 'porvencer' | 'premium' | 'todas'): Observable<Subasta[]> {
    const apiUrl = `${API_BASE_URL}/subastas/${tipo}`;
        
    return this.http.get<Subasta[]>(apiUrl);
  }
  consultarGanador(idSubasta: number) {
    return this.http.get<any>(`${API_BASE_URL}/subastas/ConsultaGanador/${idSubasta}`);
  }

  ConsultarSiSiguiendo(idUsuario: number, idSubasta: number) {
    return this.http.get<any>(`${API_BASE_URL}/seguirSubasta/siguiendo/${idUsuario}/${idSubasta}`);
  }
  seguirSubasta(idUsuario: number, idSubasta: string) {
    const payload = { idUsuario, idSubasta };
    return this.http.post(
      `${API_BASE_URL}/seguirSubasta`,
      payload,
      {
        responseType: 'text',
        observe: 'response'
      }
    );
  }

  dejarDeSeguirSubasta(idUsuario: number, idSubasta: string) {
    const payload = { idUsuario, idSubasta };
    return this.http.request(
      'delete',
      `${API_BASE_URL}/seguirSubasta`,
      {
        body: payload,
        responseType: 'text',
        observe: 'response'
      }
    );
  }

  buscarSubastas(termino: string): Observable<Subasta[]> {
    return this.http.get<Subasta[]>(`${API_BASE_URL}/subastas/SearchSubastas/${termino}`);
  }

  enviarApuesta(data: {
    idSubasta: number;
    idComprador: number;
    apuesta: number;
    compraDirecta: boolean;
  }): Observable<any> {
    const apiUrl = `${API_BASE_URL}/apuestas`;

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
