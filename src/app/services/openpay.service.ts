import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from "rxjs/operators";
import { environment as env, headers, auth_headers, test_headers } from '../environment/environment';

@Injectable({ providedIn: 'root' })

export class OpenPayService {
  constructor(private http: HttpClient) { }


  // GenerarCargo(dataCargo: any) {
  //   return this.http.post(`${env.base_url}/Cargos/GenerarCargo`, dataCargo, { headers: test_headers }).pipe(map(res => res));
  // }

  // GenerarCargoSecureCard(dataCargo: any) {
  //   return this.http.post(`${env.base_url}/Cargos/CargoIdTarjeta`, dataCargo, { headers: test_headers }).pipe(map(res => res));
  // }

  // CrearClienteOpenPay(dataClient: any) {
  //   return this.http.post(`${env.base_url}/Customer/create-customer`, dataClient, { headers: test_headers }).pipe(map(res => res));
  // }

  // VerificarEstatusCargo(transactionId: string) {
  //   return this.http.get<any>(`${env.base_url}/Cargos/charges/${transactionId}`, { headers: test_headers });
  // }
  GenerarCargo(dataCargo: any) {
    return this.http.post(`${env.base_url}/OpenPay/GenerarCargo`, dataCargo, { headers: headers }).pipe(map(res => res));
  }

  GenerarCargoSecureCard(dataCargo: any) {
    return this.http.post(`${env.base_url}/OpenPay/CargoIdTarjeta`, dataCargo, { headers: headers }).pipe(map(res => res));
  }

  CrearClienteOpenPay(dataClient: any) {
    return this.http.post(`${env.base_url}/Customer/create-customer`, dataClient, { headers: headers }).pipe(map(res => res));
  }

  VerificarEstatusCargo(transactionId: string) {
    return this.http.get<any>(`${env.base_url}/OpenPay/ConsultarCargos`, { headers: headers, params: { chargeId: transactionId } });
  }
  // VerificarEstatusCargo(transactionId: string) {
  //   return this.http.get<any>(`${env.base_url}/Cargos/charges/${transactionId}`, { headers: test_headers });
  // }

  GuardarTarjeta(dataClient: any) {
    return this.http.post(`${env.base_url}/OpenPay/RegistrarTarjeta`, dataClient, { headers: headers }).pipe(map(res => res));
  }

  GetTarjetasUsuario(idUsuario: number) {
    return this.http.get<any>(`${env.base_url}/OpenPay/ConsultarTarjetas`, { headers: headers });
  }

  DeleteTarjetaUsuario(idUsuario: number, cardId: string) {
    return this.http.delete<any>(`${env.base_url}/OpenPay/EliminarTajetas`, { headers: headers, params: { cardId } });
  }
  // GuardarTarjeta(dataClient: any){
  //   return this.http.post(`${env.banca_url}/openpay/guardar-tarjeta-usuario`,dataClient,{headers:test_headers}).pipe(map(res => res));
  // }

  // getTarjetasUsuario(idUsuario: number){
  //   return this.http.get<any>(`${env.banca_url}/openpay/tarjetas-usuario/${idUsuario}`, {headers:test_headers});
  // }

  // deleteTarjetaUsuario(idUsuario: number, cardId: string){
  //   return this.http.delete<any>(`${env.banca_url}/openpay/eliminar-tarjetas-usuario/${idUsuario}/${cardId}`, {headers:test_headers});
  // }
}
