import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
// import { Timestamp } from 'firebase/firestore';

type tipoNotificacion = 'success' | 'error' | 'info' | 'warning';

@Injectable({
  providedIn: 'root'
})

export class SharedService {    


    encodeToBase64(str: string): string {
        return btoa(str);
    }
    
    // Decodificar desde base64
    decodeFromBase64(base64: string): string {
        return atob(base64);
    }

    saveLocalData(jsonData: any, key: any){
        localStorage.setItem(key, this.encodeToBase64(JSON.stringify(jsonData)) );
    }

    getLocalData(key: any): any {
        const data = localStorage.getItem(key);
        // console.log(data);
        return data ? JSON.parse(this.decodeFromBase64(data)): null;
    }

    showNotification(tipo: tipoNotificacion, texto: string){
        let color: string;
        switch(tipo){
            case 'success':
                color = 'green';
                break;
            case 'error':
                color = 'red';
                break;
            case 'info':
                color = 'blue';
                break;
            case 'warning':
                color = 'yellow';
                break;
        }
        Swal.fire({
            // title: 'Error!',
            
            text: texto,
            icon: tipo,
            showConfirmButton: false,
            // confirmButtonText: 'Cool',
            toast: true,
            position: 'top-end',
            timer: 2000,
        });
    }

    isValidModel(model: any, omitir: string[]){
        let valid = true;
        for (const [key, value] of Object.entries(model)) {
          let index = omitir.length > 0 ? omitir.indexOf(key):0;
          if (index !== -1 && (value === null || value === '' || value!.toString().trim() === '')) {
            valid = false;
            break;
          }
        }
        return valid;
      }
    
}