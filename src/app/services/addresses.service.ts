import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from "rxjs/operators";
import {environment as env, headers, auth_headers, test_headers} from '../environment/environment';

@Injectable({  providedIn: 'root'})

export class AddressesService {
private baseUrl = 'https://sepomex.icalialabs.com/api/v1/zip_codes?zip_code=';
  constructor(private http: HttpClient) {}
  
  getDataZipCode(codigoPostal: string): Observable<any> {
    const apiUrl = `${this.baseUrl}${codigoPostal}`;
    return this.http.get<any>(apiUrl).pipe(map(res => res));
  }

  getRegimenesUsoCFDI(){
    const apiUrl = `${env.base_url}/RegimenCfdi/ConsultarRegimenCfdi`;
    return this.http.get<any>(apiUrl).pipe(map(res => res));
  }
  

}
