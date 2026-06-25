import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({ providedIn: 'root' })
export class SignalRChatService {
  private connection!: signalR.HubConnection;

  public async connectToChat(idReclamo: string, idUsuario: string, onNuevoMensaje: (data: any) => void) {
    if (this.connection && this.connection.state !== signalR.HubConnectionState.Disconnected) {
      await this.connection.stop(); // Cierra anterior
    }

    this.connection = new signalR.HubConnectionBuilder()
      // .withUrl("http://173.208.155.152:8088/apuesta")
      .withUrl("https://api.xuba.mx:8443/chatReclamo")
      .withAutomaticReconnect()
      .build();

      this.connection.off('mostrarMensaje'); // Limpia si ya había handler
      this.connection.on('mostrarMensaje', (datos) => {
        console.log('Nueva apuesta recibida', datos);
        onNuevoMensaje(datos);
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
      console.log('try to joingroup con id reclamo: '+idReclamo);
      await this.connection.invoke('joinGroup',idReclamo, idUsuario);
        // await this.connection.invoke('enviarMensaje', +idReclamo);
    } catch (err) {
      console.error('Error al conectar a SignalR:', err);
      setTimeout(() => this.connectToChat(idReclamo, idUsuario, onNuevoMensaje), 2000);
    }
  }

  public async sendGetMessageAsync(idReclamo: number){
    await this.connection.invoke('enviarMensaje', idReclamo);
  }

  public async leaveChat(idReclamo: string) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('removeGroup', idReclamo);
        console.log(`Saliste del grupo ${idReclamo}`);
      } catch (err) {
        console.error('Error al salir del grupo SignalR:', err);
      }
      await this.connection.stop();
    }
  }

  
}