import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/subasta.model';
const API_BASE_URL = (window as any).apiBaseUrl;

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {
  notificaciones: any[] = [];

  constructor(private http: HttpClient, private authService: AuthService,) {}

  ngOnInit(): void {
    const usuario = this.authService.currentUser();


    if (usuario) {
      const idUsuario = usuario.id;
      const apiUrl = `${API_BASE_URL}/notificaciones/${idUsuario}`;
    this.http.get<any[]>(apiUrl).subscribe({
      next: (data) => this.notificaciones = data,
      error: (err) => console.error('Error al cargar notificaciones', err)
    });
  }
}
}