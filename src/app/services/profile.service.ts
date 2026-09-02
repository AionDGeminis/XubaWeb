import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { ConsultaDatosUsuarioDTO } from '../models/profile';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor() { }

  private http = inject(HttpClient);
  private urlBase = environment.banca_url + '/usuarios';

  public ConsultarDatosUsuario(idUsuario: number) {
    return this.http.get<ConsultaDatosUsuarioDTO>(`${this.urlBase}/ConsultaDatosUsuario`,{
      params: {
        idUsuario
      }
    });
  }
}
