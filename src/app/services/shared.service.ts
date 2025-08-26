import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
// import { Timestamp } from 'firebase/firestore';

type tipoNotificacion = 'success' | 'error' | 'info' | 'warning';


 const enc = new TextEncoder();
const dec = new TextDecoder();
@Injectable({
  providedIn: 'root'
})

export class SharedService {    


    encodeToBase64(str: string): string | null {
        try{
            return btoa(str);
        } catch (error) {
            return null;
        }
    }
    
    // Decodificar desde base64
    decodeFromBase64(base64: string): string | null{
        try{
            return atob(base64);
        } catch (error) {
            return null;
        }
        
    }

    saveLocalData(jsonData: any, key: any): boolean {
        let item = this.encodeToBase64(JSON.stringify(jsonData));
        if(item){
            localStorage.setItem(key,  item);
            return true;
        } else {
            return false;
        }
    }

    isMailFormat(email: string){
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    invertirString(texto: string) {
        return texto.split('').reverse().join('');
    }

    getLocalData(key: any): any {
        const data = localStorage.getItem(key);
        if(data){
            let jsonString = this.decodeFromBase64(data);
            if(jsonString){
                return JSON.parse(jsonString);
            } else {
                return null;
            }
        } else {
            return null;
        }
        // console.log(data);
        // let jsonString = this.decodeFromBase64(data);
        // return data ? this.decodeFromBase64(data) !== null ? JSON.parse(this.decodeFromBase64(data)): null: null;
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

    async showConfirmMessage(texto: string,customClass?:string){
        // let titulo = title?title:'Atencion!';
        // let clase = customClass? `swal2-custom-${customClass}`:'swal2-custom-dark'
        let res = await new Promise<any> (resolve => {
        //   let acceptText = btnaccept?btnaccept:'Si';
        //   let cancelText = btncancel? btncancel:'No';
          Swal.fire({
            icon: "question",
            title: 'Atencion',
            html: texto,
            // customClass:clase,
            confirmButtonText: 'Aceptar',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Cancelar'
          }).then((result) => {
            if (result.value) {
              resolve(true)
            } else {
              resolve(false);
            }
          });
        });
        return res;
      }

    isValidModel(model: any, omitir: string[]){
        console.log(omitir)
        let valid = true;
        for (const [key, value] of Object.entries(model)) {
          let indexOmitir = omitir.length > 0 ? omitir.indexOf(key): -1;
        //   console.log(key)
        //   console.log(index)
        //   console.log(value)
          if(indexOmitir === -1){
            if (value === null || value === '' || value!.toString().trim() === '' || value!.toString().trim() === 'null') {
                valid = false;
                break;
              }
          }
          
        }
        return valid;
      }


      private toB64(buf: ArrayBuffer): string {
        return btoa(String.fromCharCode(...new Uint8Array(buf)));
      }
    
      private fromB64(b64: string): ArrayBuffer {
        const bin = atob(b64);
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        return arr.buffer;
      }
    
      // Secreto embebido ofuscado (ajústalo/rotalo según tu app)
      private getAppSecret(): Uint8Array {
        const parts = ['k3', 'y_', 'My', 'App', '_s', 'ecr', 'et', '_v1'];
        return enc.encode(parts.join(''));
      }
    
      // Deriva una clave AES-256 con PBKDF2 (salt + iteraciones)
      private async deriveKeyFromAppSecret(salt: Uint8Array, iterations = 200_000): Promise<CryptoKey> {
        const secret = this.getAppSecret();
    
        // Mezcla con metadata de runtime para dificultar reutilización
        const mix = enc.encode(location.origin + navigator.userAgent);
        const material = new Uint8Array(secret.length + mix.length);
        material.set(secret, 0);
        material.set(mix, secret.length);
    
        const keyMaterial = await crypto.subtle.importKey('raw', material, { name: 'PBKDF2' }, false, ['deriveKey']);
        return crypto.subtle.deriveKey(
          { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
          keyMaterial,
          { name: 'AES-GCM', length: 256 },
          false,
          ['encrypt', 'decrypt']
        );
      }
    
      // Cifra y guarda en localStorage
      private async secureStore(keyName: string, value: unknown): Promise<void> {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const aesKey = await this.deriveKeyFromAppSecret(salt);
        const aad = enc.encode('myapp:v1:' + location.origin);
    
        const plaintext = enc.encode(JSON.stringify(value));
        const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: aad }, aesKey, plaintext);
    
        const payload = {
          v: 1,
          kdf: 'PBKDF2-SHA256',
          iter: 200_000,
          salt: this.toB64(salt.buffer),
          iv: this.toB64(iv.buffer),
          aad: 'myapp:v1',
          ct: this.toB64(ct)
        };
        localStorage.setItem(keyName, JSON.stringify(payload));
      }
    
      // Lee y descifra; devuelve null si falta o falla el descifrado
      private async secureLoad<T = unknown>(keyName: string): Promise<T | null> {
        const raw = localStorage.getItem(keyName);
        if (!raw) return null;
        try {
          const payload = JSON.parse(raw) as {
            v: number;
            iter: number;
            salt: string;
            iv: string;
            ct: string;
            aad?: string;
          };
    
          const salt = new Uint8Array(this.fromB64(payload.salt));
          const iv = new Uint8Array(this.fromB64(payload.iv));
          const aesKey = await this.deriveKeyFromAppSecret(salt, payload.iter || 200_000);
          const aad = enc.encode((payload.aad || 'myapp:v1') + ':' + location.origin);
    
          const pt = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv, additionalData: aad },
            aesKey,
            this.fromB64(payload.ct)
          );
          return JSON.parse(dec.decode(pt)) as T;
        } catch {
          return null;
        }
      }
    
      // API pública del servicio
    
      async saveLocalSecureData<T = unknown>(keyName: string, data: T): Promise<void> {
        return this.secureStore(keyName, data);
      }
    
      async loadLocalData<T = unknown>(keyName: string): Promise<T | null> {
        return this.secureLoad<T>(keyName);
      }
    
      removeLocalData(keyName: string): void {
        localStorage.removeItem(keyName);
      }
    
      // Atajos con clave por defecto (opcional)
      async saveDefault(json: unknown): Promise<void> {
        await this.saveLocalSecureData('myapp.secure', json);
      }
    
      async loadDefault<T = unknown>(): Promise<T | null> {
        return this.loadLocalData<T>('myapp.secure');
      }
    
}