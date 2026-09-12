import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment, test_headers, headers } from '../environment/environment';
import { RegistrardatosFiscalesDTO } from '../models/datos-fiscales';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatosFiscalesService {

  constructor() { }

  private http = inject(HttpClient);
  private urlBase = environment.base_url + '/DatosFiscales';

  public RegistrarDatosFiscales(datos: RegistrardatosFiscalesDTO) {
    return this.http.post(`${this.urlBase}/RegistrarDatosFiscales`, datos, { headers: headers }).pipe(map(res => res));;
  }
}
