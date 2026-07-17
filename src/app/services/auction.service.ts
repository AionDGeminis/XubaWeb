import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subasta } from '../models/subasta.model';
import { Observable } from 'rxjs';
import {environment as env, headers, auth_headers, test_headers} from '../environment/environment';

// const API_BASE_URL = (window as any).apiBaseUrl;
@Injectable({
  providedIn: 'root'
})

export class AuctionService {
  private apiUrl = `${env.base_url}/seguirSubasta`;

  constructor(private http: HttpClient) {}

  getAuctions(userId: number, pagina: number = 1): Observable<Subasta[]> {
  const apiUrl =
    `${env.base_url}/seguirSubasta/ConsultarSubastasSeguidas?idUsuario=${userId}&pagina=${pagina}`;

  return this.http.get<Subasta[]>(apiUrl, { headers: test_headers });
}
}