import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({ providedIn: 'root' })
export class SignalRNotificationService {
  private connection!: signalR.HubConnection;

  public async connectToNotifications( idUsuario: string, onNuevaNotificacion: (data: any) => void) {
    if (this.connection && this.connection.state !== signalR.HubConnectionState.Disconnected) {
      await this.connection.stop(); // Cierra anterior
    }

    this.connection = new signalR.HubConnectionBuilder()
    //   .withUrl("http://173.208.155.152:8088/notificacion")
      .withUrl("https://api.xuba.mx:8443/notificacion")
      .withAutomaticReconnect()
      .build();

      this.connection.off('CantidadNotificacion'); // Limpia si ya había handler
      this.connection.on('CantidadNotificacion', (datos) => {
        // console.log('Nueva notificacion recibida', datos);
        onNuevaNotificacion(datos);
      });
      this.setUpConnections();
//joinedToGroup
  
   
      console.log('try unir a grupo: ' + idUsuario)
    try {
    //    await this.connection.start();
      await this.connection.start().then(() => {
        // console.log('Conectado a SignalR');
        // console.log('joingroup con id usuario: ' + idUsuario);
        // this.connection.invoke('joinGroup', idUsuario);
        // this.connection.invoke('ConsultaCantidadNotificaciones', idUsuario);
        this.connection.invoke('joinGroup', +idUsuario).then(async () => {
          console.log(`Successfully joined group usuario: ${idUsuario}`);
          await this.connection.invoke('ConsultaCantidadNotificaciones', +idUsuario);
        }).catch(err => {
          console.error('Error joining group:', err);
        });
      });
    //   console.log('Conectado a SignalR');
    //   console.log('joingroup con id usuario: '+idUsuario);
    //   await this.connection.invoke('joinGroup', +idUsuario);
    //   await this.connection.invoke('ConsultaCantidadNotificaciones', idUsuario);
    } catch (err) {
      console.error('Error al conectar a SignalR:', err);
    //   setTimeout(() => this.connectToNotifications( idUsuario, onNuevaNotificacion), 2000);
    }

   
  }

  setUpConnections(){
      this.connection.onclose(error => {
      console.warn('Conexión SignalR cerrada', error);
    });

    this.connection.onreconnecting(() => {
      console.warn('Reconectando a SignalR...');
    });
    
    this.connection.onreconnected(() => {
      console.info('Reconectado a SignalR');
    });
    
  }

  async closeConnection(){
    await this.connection.stop();
  }

  public async leaveNotifications(idUsuario: string) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('removeGroup', idUsuario);
        console.log(`Saliste del grupo ${idUsuario}`);
      } catch (err) {
        console.error('Error al salir del grupo SignalR:', err);
      }
      await this.connection.stop();
    }
  }

  
}