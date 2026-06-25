import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private connection!: signalR.HubConnection;

  public async connectToSubasta(idSubasta: string, idUsuario: string, onNuevaApuesta: (data: any) => void) {
    if (this.connection && this.connection.state !== signalR.HubConnectionState.Disconnected) {
      await this.connection.stop(); // Cierra anterior
    }

    this.connection = new signalR.HubConnectionBuilder()
      // .withUrl("http://173.208.155.152:8088/apuesta")
      .withUrl("https://api.xuba.mx:8443/apuesta")
      .withAutomaticReconnect()
      .build();

      this.connection.off('mostrarApuesta'); // Limpia si ya había handler
      this.connection.on('mostrarApuesta', (datos) => {
        console.log('Nueva apuesta recibida', datos);
        onNuevaApuesta(datos);
      });

    this.connection.onclose(error => {
      console.warn('Conexión SignalR cerrada', error);
    });

    this.connection.onreconnecting(() => {
      console.warn('Reconectando a SignalR...');
    });
    
    this.connection.onreconnected(() => {
      console.info('Reconectado a SignalR');
    });
    
   

    try {
      await this.connection.start();
      console.log('Conectado a SignalR');
      console.log('joingroup con id subasta: '+idSubasta);
      await this.connection.invoke('joinGroup', idSubasta, idUsuario);
      await this.connection.invoke('sendApuesta', idSubasta);
    } catch (err) {
      console.error('Error al conectar a SignalR:', err);
      setTimeout(() => this.connectToSubasta(idSubasta, idUsuario, onNuevaApuesta), 2000);
    }

  }

  public async leaveSubasta(idSubasta: string) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('removeGroup', idSubasta);
        console.log(`Saliste del grupo ${idSubasta}`);
      } catch (err) {
        console.error('Error al salir del grupo SignalR:', err);
      }
      await this.connection.stop();
    }
  }

  
}