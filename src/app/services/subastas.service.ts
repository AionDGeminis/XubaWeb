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
  apiPaqueteria = 'https://envios.xuba.mx:10443/api';

  constructor(private http: HttpClient) {}
  
  getAuctions(tipo: 'porvencer' | 'premium' | 'todas'): Observable<Subasta[]> {
    const apiUrl = `${env.base_url}/subastas/${tipo}`; 
    return this.http.get<Subasta[]>(apiUrl, {headers:test_headers});
  }

  GetXubastasUsuarioPerfil(tipo: string, userId: number){
    return this.http.get<any>(`${env.base_url}/subastas/consultarMisSubastasParticipadasGanadas`, {params:{tipo,idUsuario: userId}, headers:test_headers});
  }

  getSubastasActivasVendedor(idVendedor: number){
    let data = {idVendedor};
    return this.http.post<Subasta[]>(`${env.base_url}/subastas/misSubastas`,data, {headers:test_headers});
  }

  getSubastasTerminadasVendedor(idVendedor: number){
    return this.http.get<Subasta[]>(`${env.base_url}/subastas/subastasNoActivas/${idVendedor}`, {headers:test_headers});
  }

  getSubastasUsuarioByEstatus(idUsuario: number, tipo: string){
    return this.http.get<Subasta[]>(`${env.base_url}/subastas/misSubastas/${idUsuario}/${tipo}`, {headers:test_headers});
  }

  getSubastasGanadas(idUsuario: number, pagina: number = 1) {
  const apiUrl =
    `${env.base_url}/subastas/ConsultaMisSubastasGanadas?idUsuario=${idUsuario}&pagina=${pagina}`;

  return this.http.get<Subasta[]>(apiUrl, { headers: test_headers })
    .pipe(map(res => res));
}
  
getNotifications(idUsuario: number, pagina: number = 1) {
  const apiUrl = `${env.base_url}/notificaciones/ConsultarMisNotificaciones?idUsuario=${idUsuario}&pagina=${pagina}`;

  return this.http.get(apiUrl, { headers: test_headers })
    .pipe(map(res => res));
}

  marcarVistaNotificacion(idNotificacion:number) {
    const apiUrl = `${env.base_url}/notificaciones/VerNotificacion/`; 
    return this.http.put(apiUrl, {id: idNotificacion},{headers:test_headers}).pipe(map(res => res));//this.http.get<Subasta[]>(apiUrl);
  }
  
  getSeguidores(idUsuario: number, pagina: number = 1) {
  const apiUrl =
    `${env.base_url}/usuarios/ConsultarMisSeguidores?idUsuario=${idUsuario}&pagina=${pagina}`;

  return this.http.get(apiUrl, { headers: test_headers })
    .pipe(map(res => res));
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

  // GenerarCargoSubastaPremium(dataCargo: any){
  //   //https://banca.xuba.mx:9443/swagger/index.html    swagger
  //   // const apiBankUrl = 'http://173.208.155.152:8001/api/Cargos/GenerarCargo';
  //   const apiBankUrl = 'https://banca.xuba.mx:9443/api/Cargos/GenerarCargo';
  //   return this.http.post(apiBankUrl,dataCargo,{headers:test_headers}).pipe(map(res => res));
  // }



  // verificarEstatusCargo(transactionId: string){
  //   const apiBankUrl = 'https://banca.xuba.mx:9443/api/Cargos/charges';
  //   return this.http.get<any>(`${apiBankUrl}/${transactionId}`, {headers:test_headers});
  // }

  generarGuiaPaqueteria(data: any){
    // const apiPaqueteria = 'https://envios.xuba.mx:10443/api/DHL/Envio';
    return this.http.post(`${this.apiPaqueteria}/DHL/Envio`,data,{headers:test_headers}).pipe(map(res => res));
  }

  saveDireccionEntregaComprador(modelData: any){
    return this.http.put(`${env.base_url}/direcciones/EditarDireccionEntrega`,modelData,{headers:test_headers}).pipe(map(res => res));

  }

  cotizarEnvio(dataModel: any){
    // const apiPaqueteria = 'https://envios.xuba.mx:10443/api/DHL/Cotizar';
    return this.http.post(`${this.apiPaqueteria}/DHL/Cotizar`,dataModel,{headers:test_headers}).pipe(map(res => res));
  }

  getComisionesCrearSubasta(idUsuario: number){
    return this.http.get<any>(`${env.base_url}/Facturacion/ConsultarComisionesImpuestos/${idUsuario}/CrearSubasta`, {headers:test_headers});
  }

  GetPaqueteriaSeguimiento(noguia: string){

    return this.http.get(`${this.apiPaqueteria}/DHL/Seguimiento/${noguia}`, {headers:test_headers}).pipe(map(res => res));
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

  
  GetDireccionesUsuario(idUsuario: number, tipo: string){
    return this.http.get(`${env.base_url}/direcciones/Consulta/${idUsuario}`, {headers:test_headers}).pipe(map(res => res));
  }

  guardarDireccion(data: any) {
    return this.http.post(`${env.base_url}/direcciones/Registrar`,data,{headers:test_headers}).pipe(map(res => res));
  }

  editarDireccion(data: any) {
    return this.http.put(`${env.base_url}/direcciones/EditarDireccion`,data,{headers:test_headers}).pipe(map(res => res));
  }

  eliminarDirecion(id: number){
    return this.http.get(`${env.base_url}/direcciones/EliminarDireccion/${id}`, {headers:test_headers}).pipe(map(res => res));
  }

  buscarSubastas(termino: string): Observable<Subasta[]> {
    return this.http.get<Subasta[]>(`${env.base_url}/subastas/SearchSubastas/${termino}`).pipe(map(res => res));
  }

  actualizarEstatusSubasta(idSubasta: number, idEstatus: number){
    return this.http.put(`${env.base_url}/estatus/EditarEstatusSubasta/${idSubasta}/${idEstatus}`, {headers:test_headers}).pipe(map(res => res));
  }

  guardarOFertaCompraSubasta(data: any){
    return this.http.post(`${env.base_url}/subastas/RegistrarOferta`, data, {headers:test_headers}).pipe(map(res => res));
  }

 GetVendedoresSeguidos(idUsuario: number, pagina: number = 1) {
  const apiUrl = `${env.base_url}/seguirVendedor/ConsultarVendedoresSeguidos?idUsuario=${idUsuario}&pagina=${pagina}`;

  return this.http.get<any[]>(apiUrl, { headers: test_headers })
    .pipe(map((res: any) => res));
}

  seguirVendedor(data: any){
    return this.http.post(`${env.base_url}/seguirVendedor/Seguir`,data, {headers:test_headers}).pipe(map(res => res));
  }

  noseguirVendedor(data: any){
    return this.http.post(`${env.base_url}/seguirVendedor/DejarSeguir`,data, {headers:test_headers}).pipe(map(res => res));
  }

  getCategoriasReclamo(){
    return this.http.get(`${env.base_url}/CategoriasReclamos/ConsultaCategoriasReclamos/`, {headers:test_headers}).pipe(map(res => res));
  } 

  addReclamo(data: any){
    return this.http.post(`${env.base_url}/Reclamos/RegistrarReclamo`, data, {headers: test_headers}).pipe(map(res => res));
  }

  getInfoDetalleReclamo(idSubasta: number){
    return this.http.get(`${env.base_url}/Reclamos/ConsultarReclamoId/${idSubasta}`, {headers:test_headers}).pipe(map(res => res));
  }

  saveMessageChat(data: any){
    return this.http.post(`${env.base_url}/ChatReclamos/RegistrarMensaje`, data, {headers: test_headers}).pipe(map(res => res));
  }

  getMensajesChatReclamo(idReclamo: number){
    return this.http.get(`${env.base_url}/ChatReclamos/ConsultarMensajes/${idReclamo}`, {headers:test_headers}).pipe(map(res => res));
  }

  changeReclamoEstatus(data: any){
    return this.http.put(`${env.base_url}/Reclamos/ActualizarEstatus`, data, {headers: test_headers}).pipe(map(res => res));
  }

  aceptarReclamo(idReclamo: number){
    let reclamo = {idReclamo, idEstatus:2,idUsuarioXuba:1}
    return this.http.put(`${env.base_url}/Reclamos/AceptarReclamo`, reclamo, {headers: test_headers}).pipe(map(res => res));

  }

  getListaSubastasForReclamos(idUser: number){
    return this.http.get<any>(`${env.base_url}/Subastas/ConsultarMisSubastasEntregadas/${idUser}`, {headers:test_headers}).pipe(map(res => res));
  }
  
  getListaReclamosByUser(idUser: number){
    return this.http.get<any>(`${env.base_url}/Reclamos/ConsultarMisReclamos/${idUser}`, {headers:test_headers}).pipe(map(res => res));
  }

  updateSubastaRechazada(data: any){
    return this.http.post(`${env.base_url}/Subastas/EditarSubastaRechazada`, data, {headers: test_headers}).pipe(map(res => res));
  }

  registrarVista(data: any) {
    return this.http.post(`${env.base_url}/subastas/RegistrarVista`, data, {headers: test_headers}).pipe(map(res => res));
}
editarFotoPerfil(data: any) { 
  return this.http.post(`${env.base_url}/usuarios/EditarFotoPerfil`, data, { headers: test_headers }).pipe(map(res => res));
}
cancelarSubastaVendedor(data: any) {
  return this.http.post(`${env.base_url}/subastas/CancelarSubastaVendedor`, data, { headers: test_headers }).pipe(map(res => res));
}
  // @override
  // Future<List<UsuarioModel>> getListaVendedoresSeguidos(int id) async {
  //   try {
  //     final response = await dio.get('/seguirVendedor/$id', options: Options(headers: getHeaders()));
  //     var convertedList = getConvertedList(response.data);
  //     final respuesta = convertedList.map((e) => UsuarioModel.fromJson(e)).toList();
  //     return respuesta;
  //   } catch (e) {
  //     print('Error en la solicitud GET[getListaVendedoresSeguidos]: $e');
  //     return [];
  //   }
  // }

  // @override
  // Future<void> seguirVendedor(data) async {
  //   try {
  //     await dio.post('/seguirVendedor', data: data, options: Options(headers: getHeaders()));
  //   } catch (e) {
  //     print('Error en la solicitud POST[seguirVendedor]: $e');
  //   }
  // }

  // @override
  // Future<void> noseguirVendedor(data) async {
  //   try {
  //     await dio.delete('/seguirVendedor', data: data, options: Options(headers: getHeaders()));
  //   } catch (e) {
  //     print('Error en la solicitud DELETE[noseguirVendedor]: $e');
  //   }
  // }

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
