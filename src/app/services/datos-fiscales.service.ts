import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment, test_headers, headers } from '../environment/environment';
import { map } from 'rxjs';
import { RegistroDatosFiscales } from '../models/datos-fiscales-model';

@Injectable({
  providedIn: 'root'
})
export class DatosFiscalesService {

  constructor() { }

  private http = inject(HttpClient);
  private urlBase = environment.base_url + '/DatosFiscales';

  public RegistrarDatosFiscales(datos: RegistroDatosFiscales) {
    return this.http.post(`${this.urlBase}/RegistrarDatosFiscales`, datos, { headers: headers }).pipe(map(res => res));;
  }
}
