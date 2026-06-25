import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
// import { Timestamp } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';


import { AuctionStatus } from '../../enums/auction-estatus.enum';
import { AuctionClaveStatus } from '../../enums/auction-estatus-cve.enum';
import { CotizacionPaqueteriaModel } from '../models/cotizacion-model';
import { Subasta } from '../models/subasta.model';
declare var OpenPay: any;

type tipoNotificacion = 'success' | 'error' | 'info' | 'warning';

interface PrintOptions {
  scale?: number;             // resolución, 1..3 (recomiendo 2)
  backgroundColor?: string | null; // '#fff' para forzar blanco, null para transparente
  fileName?: string;          // opcional, si quieres también descargar la imagen
}

const enc = new TextEncoder();
const dec = new TextDecoder();
const replaces = [
  { og:'A', rp:'¶' }, { og:'B', rp:'Z' }, { og:'C', rp:'7' }, { og:'D', rp:'m' },
  { og:'E', rp:'/' }, { og:'F', rp:'Q' }, { og:'G', rp:'9' }, { og:'H', rp:'e' },
  { og:'I', rp:'+' }, { og:'J', rp:'u' }, { og:'K', rp:'2' }, { og:'L', rp:'a' },
  { og:'M', rp:'W' }, { og:'N', rp:'=' }, { og:'O', rp:'§' }, { og:'P', rp:'k' },
  { og:'Q', rp:'x' }, { og:'R', rp:'H' }, { og:'S', rp:'f' }, { og:'T', rp:'0' },
  { og:'U', rp:'N' }, { og:'V', rp:'C' }, { og:'W', rp:'8' }, { og:'X', rp:'P' },
  { og:'Y', rp:'$' }, { og:'Z', rp:'L' },

  { og:'a', rp:'Y' }, { og:'b', rp:'!' }, { og:'c', rp:'T' }, { og:'d', rp:'5' },
  { og:'e', rp:'S' }, { og:'f', rp:'O' }, { og:'g', rp:'J' }, { og:'h', rp:'1' },
  { og:'i', rp:'G' }, { og:'j', rp:'v' }, { og:'k', rp:'d' }, { og:'l', rp:'R' },
  { og:'m', rp:'E' }, { og:'n', rp:'U' }, { og:'o', rp:'K' }, { og:'p', rp:'3' },
  { og:'q', rp:'w' }, { og:'r', rp:'c' }, { og:'s', rp:'4' }, { og:'t', rp:'6' },
  { og:'u', rp:'I' }, { og:'v', rp:'D' }, { og:'w', rp:'y' }, { og:'x', rp:'b' },
  { og:'y', rp:'V' }, { og:'z', rp:'t' },

  { og:'0', rp:'±' }, { og:'1', rp:'o' }, { og:'2', rp:'A' }, { og:'3', rp:'X' },
  { og:'4', rp:'s' }, { og:'5', rp:'n' }, { og:'6', rp:'z' }, { og:'7', rp:'j' },
  { og:'8', rp:'q' }, { og:'9', rp:'p' }, { og:'+', rp:'F' }, { og:'/', rp:'h' },
  { og:'=', rp:'g' }
];
// const CLAVE_TO_STATUS: Record<AuctionClaveStatus, AuctionStatus> = {
//   [AuctionClaveStatus.SinEstatus]: AuctionStatus.SinEstatus,
//   [AuctionClaveStatus.Activa]: AuctionStatus.Activa,
//   [AuctionClaveStatus.Finalizada]: AuctionStatus.Finalizada,
//   [AuctionClaveStatus.PropuestaGanador]: AuctionStatus.PropuestaGanador,
//   [AuctionClaveStatus.RechazoGanador]: AuctionStatus.RechazoGanador,
//   [AuctionClaveStatus.AceptadoGanador]: AuctionStatus.AceptadoGanador,
//   [AuctionClaveStatus.PropuestaSiguiente]: AuctionStatus.PropuestaSiguiente,
//   [AuctionClaveStatus.AceptadoSiguiente]: AuctionStatus.AceptadoSiguiente,
//   [AuctionClaveStatus.RechazadoSiguiente]: AuctionStatus.RechazadoSiguiente,
//   [AuctionClaveStatus.NoEfectuada]: AuctionStatus.NoEfectuada,
//   [AuctionClaveStatus.Pagado]: AuctionStatus.Pagado,
//   [AuctionClaveStatus.PendientePago]: AuctionStatus.PendientePago,
//   [AuctionClaveStatus.PreparacionEnvio]: AuctionStatus.PreparacionEnvio,
//   [AuctionClaveStatus.Enviado]: AuctionStatus.Enviado,
//   [AuctionClaveStatus.Recibido]: AuctionStatus.Recibido
// };

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

    showNotification(tipo: tipoNotificacion, texto: string, tiempo?: number){
        let color: string;
        let timeActive = tiempo ?? 2000;
        let clase = '';
        switch(tipo){
            case 'success':
                color = 'green';
                clase = 'swal2-custom-success';
                break;
            case 'error':
                color = 'red';
                clase = 'swal2-custom-danger';
                break;
            case 'info':
                color = 'blue';
                clase = 'swal2-custom-info';
                break;
            case 'warning':
                color = 'yellow';
                clase = 'swal2-custom-warning';
                break;
        }
        Swal.fire({
            // title: 'Error!',
            // customClass: clase,
            text: texto,
            icon: tipo,
            showConfirmButton: false,
            // confirmButtonText: 'Cool',
            toast: true,
            position: 'top-end',
            timer: timeActive,
            showClass: {
              popup: 'animate__animated animate__fadeInRight fast-animation index-on-top'
            },
            hideClass: {
              popup: 'animate__animated animate__fadeOutLeft fast-animation index-on-top'
            },
            customClass: {
              container: 'index-on-top',
              popup: clase
            }
        });
    }

    showMessage(tipo: tipoNotificacion, texto: string, tiempo?: number){
      let color: string;
      let timeActive = tiempo ?? 2000;
      let clase = '';
      switch(tipo){
          case 'success':
              color = 'green';
              clase = 'swal2-custom-success';
              break;
          case 'error':
              color = 'red';
              clase = 'swal2-custom-danger';
              break;
          case 'info':
              color = 'blue';
              clase = 'swal2-custom-info';
              break;
          case 'warning':
              color = 'yellow';
              clase = 'swal2-custom-warning';
              break;
      }
      Swal.fire({
          // title: 'Error!',
          // customClass: clase,
          //text: texto,
          icon: tipo,
          showConfirmButton: true,
          html: texto,
          // confirmButtonText: 'Cool',
          // toast: true,
          // position: 'top-end',
          timer: timeActive,
          showClass: {
            popup: 'animate__animated animate__bounceIn fast-animation index-on-top'
          },
          hideClass: {
            popup: 'animate__animated animate__zoomOut fast-animation index-on-top'
          },
          customClass: {
            container: 'index-on-top',
            popup: clase
          }
      });
    }

    async showConfirmMessage(texto: string,customClass?:string){
        // let titulo = title?title:'Atencion!';
        let clase = 'swal2-custom-confirm';
        // let clase = customClass? `swal2-custom-${customClass}`:'swal2-custom-dark'
        let res = await new Promise<any> (resolve => {
        //   let acceptText = btnaccept?btnaccept:'Si';
        //   let cancelText = btncancel? btncancel:'No';
          Swal.fire({
            icon: "question",
            title: 'Atencion',
            html: texto,
            customClass: {
              container: 'index-on-top',
              popup: clase
            },
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

    // numericStatusFromClave(
    //   clave: string | AuctionClaveStatus | null | undefined
    // ): AuctionStatus | null {
    //   // validar null/undefined/empty
    //   if (clave == null) return null;           // null o undefined
    //   const claveStr = String(clave).trim();
    //   if (claveStr === '') return null;
    
    //   // Buscar la coincidencia sin importar mayúsculas/minúsculas
    //   const matched = (Object.values(AuctionClaveStatus) as string[])
    //     .find(v => v.toUpperCase() === claveStr.toUpperCase());
    
    //   if (!matched) return null;
    //   return CLAVE_TO_STATUS[matched as AuctionClaveStatus] ?? null;
    // }

    // resolveMinimumToNumeric(minimum: AuctionStatus | AuctionClaveStatus | string | null | undefined): AuctionStatus | null {
    //   if (typeof minimum === 'number') {
    //     // Validar que sea un valor del enum AuctionStatus
    //     if ((Object.values(AuctionStatus) as number[]).includes(minimum)) return minimum;
    //     return null;
    //   }
    //   return this.numericStatusFromClave(minimum as string);
    // }

    // isStatusAtLeast(
    //   currentClaveOrString: string | AuctionClaveStatus | null | undefined,
    //   minimum: AuctionStatus | AuctionClaveStatus | string | null | undefined
    // ): boolean {
    //   const currentNum = this.numericStatusFromClave(currentClaveOrString);
    //   const minNum = this.resolveMinimumToNumeric(minimum);
    
    //   if (currentNum === null || minNum === null) {
    //     // Si no podemos resolver alguno de los dos, retornamos false (opción segura)
    //     return false;
    //   }
    
    //   return currentNum >= minNum;
    // }

    getMensajeTextoErrorOpenPay(error_code: number){
      let text = '';
      switch(error_code) { 
        case 1000: 
          text = 'Se produjo un error en el servicio, porfavor contacte a soporte.';
          break;
        case 1001: 
          text = 'El correo proporcionado es inválido.';
          break;
        case 3001: 
          text =  'La tarjeta fue declinada.';
          break;
        case 3002: 
          text =  'La tarjeta ha expirado.';
          break;
        case 3003: 
          text =  'La tarjeta no tiene fondos suficientes.';
          break;
        case 3004: 
          text =  'La tarjeta ha sido identificada como una tarjeta robada.';
          break;
        case 3005: 
          text =  'La tarjeta ha sido rechazada por el sistema antifraudes.';
          break;
        case 15000: 
        case 15011: 
          text =  'Cuenta no verificada. Se ha denegado la transaccion';
          break;
        case 15001: 
          text =  'La verificacion de la cuenta fue rechazada';
          break;
        default: 
        text =  'No se completo la transaccion, se produjo un error desconocido ['+error_code+']';
          break;
      }
      return text;
    }
    getTextoErrorTokenOpenPay(error_desc: string){
      let errorMessage = '';
          switch(error_desc) {
              case 'card_number length is invalid':
                  errorMessage = 'El número de tarjeta tiene una longitud inválida.';
                  break;
              case 'cvv2 length must be 3 digits':
                  errorMessage = 'El CVV2 debe tener 3 dígitos.';
                  break;
              case 'cvv2 length must be 4 digits':
                  errorMessage = 'El CVV2 debe tener 4 dígitos.';
                  break;
              case 'The expiration date has expired':
                  errorMessage = 'La fecha de expiración es invalida.';
                  break;
              case 'The card number verification digit is invalid':
                  errorMessage = 'El numero de tarjeta es invalido.';
                  break;
              default:
                  errorMessage = 'No se ha podido generar el cargo [stp1-tkn]';
          }
      return errorMessage;
    }

    isValidModel(model: any, omitir: string[]){
        //console.log(omitir)
        let valid = true; 
        for (const [key, value] of Object.entries(model)) {
          let indexOmitir = omitir.length > 0 ? omitir.indexOf(key): -1;
         // console.log(key)
          //console.log(indexOmitir)
          //console.log(value)
          if(indexOmitir === -1){
            if (value === null || value === '' || value!.toString().trim() === '' || value!.toString().trim() === 'null') {
                valid = false;
                break;
              }
          }
          
        }
        return valid;
      }


  isValidModelV2(model: any, omitir?: string[]) {
    let resp: any = {valid:null,prop:null};
    let valid = true;
    for(let key of Object.keys(model)){
        if(!this.isInArraySimple(omitir!, key)){
          if(!this.isValidValue(model[key])){
            valid = false;
            resp.prop = key.replace('fkid','').replaceAll('_',' ');
            resp.prop = this.changeNameToLabel(key);
            
            break; 
          }
        }
    }
    resp.valid = valid;
    return resp;
  }

  changeNameToLabel(key: string){
    let name = key;
    switch(key.toLowerCase()){
        case 'caption': name = 'Nombre'
          break
        case 'apuesta': name = 'Valor inicial'
          break
        case 'ancho': name = 'Alto'
          break
        case 'iddireccion': name = 'Direccion'
          break
        case 'valoroferta': name = 'Incremento de oferta'
          break
    }

    return name;
  }

  isInArraySimple(array: any[], value: any){
    if(!array || array === null || array === undefined || array.length <=0){
      return false;
    }
    let inArray = array.filter(x => x === value)[0] !== undefined? true:false;
    return inArray;
  }

  isInArrayObject(array: any[], item: any, IdName: any[]){
    let Id1 = IdName[0];
    let Id2 = IdName[1]? IdName[1]:IdName[0];
    return array.findIndex(x => x[Id1] === item[Id2]) !== -1? true:false;
  }

  getIndexInArrayObject(array: any[], item: any, IdName: any[]){
    let Id1 = IdName[0];
    let Id2 = IdName[1]? IdName[1]:IdName[0];
    return array.findIndex(x => x[Id1] === item[Id2]);
  }


  isValidValue(value: any){
    console.log(value)
    return value !== null && value !== 'null' && value !== undefined && value.toString().trim() !== ''? true:false;
  }

      toCurrency(valor: number): string {
        return valor.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
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
    
      toXubaEncode(data: string){
        let b64 = this.encodeToBase64(data);
        console.log(b64)
        let reversed = b64?.split('').reverse();
        let newArray = [];
        for(let char of reversed!){
          let _char = replaces.find(x => x.og === char);
          newArray.push(_char?.rp);
        }
        let encoded = newArray.reverse().join('');
        return encoded;
        // console.log(reversed);
        // console.log(encoded);
      }
    
      decodeFromXuba(data: string){
        let reversed = data?.split('').reverse();
        let newArray = [];
        for(let char of reversed!){
          let _char = replaces.find(x => x.rp === char);
          newArray.push(_char?.og);
        }
        let decoded = newArray.reverse().join('');
        let result = this.decodeFromBase64(decoded);
        return result;
        // console.log(result)
      }
      // ImprimirTicket(){
      //   setTimeout(() => {
      //     let elem = document.getElementById('printContainer');
      //     // console.log(elem)
      //     let domClone: any = elem!.cloneNode(true);
      //     let d: any =  document.getElementById('iframeprint');
      //     domClone.className = "visibleticket";
      //     d.contentWindow.document.body.appendChild(domClone);
      //     d.contentWindow.print() ; 
      //     d.contentWindow.document.body.removeChild(domClone);
      //   }, 400);
      // }

      // async  captureAndPrintElementById(elementId: string, options?: {
      //   scale?: number,           // escala para aumentar resolución
      //   backgroundColor?: string, // fuerza un fondo si lo deseas (ej. '#ffffff'), null para transparencia
      //   fileName?: string         // opcional, si quieres descargar además
      // }) {
      //   const el = document.getElementById(elementId);
      //   if (!el) throw new Error(`Elemento con id "${elementId}" no encontrado`);
      
      //   // espera a que se carguen las fuentes (importante si usas fonts custom)
      //   if ('fonts' in document) {
      //     try { await (document as any).fonts.ready; } catch { /* ignore */ }
      //   }
      
      //   const scale = options?.scale ?? (window.devicePixelRatio || 2);
      //   const backgroundColor = options?.backgroundColor ?? null; // null -> transparencia
      
      //   // Opciones recomendadas para html2canvas
      //   const canvas = await html2canvas(el, {
      //     scale,
      //     useCORS: true,                 // importante si hay imágenes con CORS habilitado
      //     allowTaint: false,
      //     backgroundColor,               // usa null para transparencia o '#fff' para forzar blanco
      //     logging: false,
      //     imageTimeout: 20000,
      //     scrollY: -window.scrollY,      // evita offsets por scroll
      //     scrollX: -window.scrollX,
      //     // foreignObjectRendering: true, // puedes probarlo si tu CSS es complejo (puede mejorar o empeorar según caso)
      //   });
      
      //   // convertir a dataURL (png)
      //   const dataUrl = canvas.toDataURL('image/png');
      
      //   // Si quieres descargar además:
      //   if (options?.fileName) {
      //     const a = document.createElement('a');
      //     a.href = dataUrl;
      //     a.download = options.fileName;
      //     document.body.appendChild(a);
      //     a.click();
      //     a.remove();
      //   }
      
      //   // Abrir nueva ventana para imprimir
      //   const printWindow = window.open('', '_blank', 'noopener,noreferrer');
      //   if (!printWindow) {
      //     // Fallback: si popup bloqueado, abrir en la misma ventana (no ideal)
      //     const w = window;
      //     w.document.open();
      //     w.document.write(this.buildPrintHtml(dataUrl));
      //     w.document.close();
      //     setTimeout(() => w.print(), 500);
      //     return;
      //   }
      
      //   // Contenido HTML de la ventana de impresión
      //   printWindow.document.open();
      //   printWindow.document.write(this.buildPrintHtml(dataUrl));
      //   printWindow.document.close();
      
      //   // Esperar a que la imagen cargue, luego imprimir y cerrar la ventana
      //   const img = printWindow.document.getElementById('print-image') as HTMLImageElement | null;
      //   if (img) {
      //     img.onload = () => {
      //       // Delay pequeño para asegurar render en la ventana nueva
      //       setTimeout(() => {
      //         try {
      //           printWindow.focus();
      //           printWindow.print();
      //         } catch (e) { /* ignore */ }
      //         // opcional: cerrar ventana después de imprimir
      //         // setTimeout(() => printWindow.close(), 500);
      //       }, 250);
      //     };
      //   } else {
      //     // Si no encontramos la img por alguna razón, hacer print en 800ms
      //     setTimeout(() => {
      //       try { printWindow.print(); } catch {}
      //     }, 800);
      //   }
      // }
      
      //  buildPrintHtml(dataUrl: string) {
      //   // estilos inline importantes: asegurar impresión de color y centrar la imagen
      //   return `
      // <!doctype html>
      // <html>
      // <head>
      //   <meta charset="utf-8">
      //   <title>Imprimir comprobante</title>
      //   <style>
      //     html,body { height:90%; margin:0; padding:0; background: #ffffff; }
      //     body { display:flex; align-items:center; justify-content:center; padding:12px; }
      //     img { max-width:100%; max-height:100%; display:block; }
      
      //     /* Forzar impresión de colores en navegadores que respetan esta regla */
      //     * {
      //       -webkit-print-color-adjust: exact;
      //       print-color-adjust: exact;
      //     }
      
      //     /* Opcional: quita márgenes de la página al imprimir */
      //     @page {
      //       margin: 6mm;
      //     }
      //   </style>
      // </head>
      // <body>
      //   <img id="print-image" src="${dataUrl}" alt="Comprobante">
      //   <script>
      //     // auto print (sólo después de que la imagen haya cargado; el onload en la ventana padre también lo controla)
      //     const img = document.getElementById('print-image');
      //     if (img && img.complete) {
      //       try { window.focus(); window.print(); } catch(e) {}
      //     } else if (img) {
      //       img.onload = () => { try { window.focus(); window.print(); } catch(e) {} };
      //     }
      //   </script>
      // </body>
      // </html>`;
      // }
      
      async  captureAndPrintInline(elementId: string, opts: PrintOptions = {}): Promise<void> {
        const el = document.getElementById(elementId);
        if (!el) throw new Error(`Elemento con id "${elementId}" no encontrado`);
      
        // esperar fuentes custom
        if ('fonts' in document) {
          try { await (document as any).fonts.ready; } catch { /* ignore */ }
        }
      
        const scale = opts.scale ?? Math.max(1, Math.min(3, window.devicePixelRatio || 2));
        const backgroundColor = opts.backgroundColor === undefined ? null : opts.backgroundColor;
      
        // Captura con html2canvas
        const canvas = await html2canvas(el, {
          scale,
          useCORS: true,
          allowTaint: false,
          backgroundColor,
          imageTimeout: 20000,
          logging: false,
          scrollY: -window.scrollY,
          scrollX: -window.scrollX,
        });
      
        const dataUrl = canvas.toDataURL('image/png');
      
        // Opcional: descargar la imagen
        if (opts.fileName) {
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = opts.fileName;
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
      
        // Crear iframe off-screen (no display:none)
        const iframe = document.createElement('iframe');
        // estilos: off-screen pero visible para que chrome/firefox permitan print
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.top = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.style.overflow = 'hidden';
        // asegúrate de que no interfiera con la pantalla o tab order
        iframe.setAttribute('aria-hidden', 'true');
        document.body.appendChild(iframe);
      
        // Contenido HTML para imprimir (incluye css para asegurar colores)
        const printHtml = this.buildPrintHtmlForImage(dataUrl);
      
        // Escribir en el iframe
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
          document.body.removeChild(iframe);
          throw new Error('No se pudo acceder al documento del iframe');
        }
      
        iframeDoc.open();
        iframeDoc.write(printHtml);
        iframeDoc.close();
      
        // Esperar a que la imagen cargue dentro del iframe, luego imprimir y limpiar
        const tryPrint = () => {
          try {
            // focus en iframe (algunos browsers lo requieren)
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (e) {
            console.warn('Error al imprimir desde iframe:', e);
          } finally {
            // eliminar iframe después de un pequeño retardo para dejar que el diálogo se despliegue
            setTimeout(() => {
              try { document.body.removeChild(iframe); } catch (err) { /* ignore */ }
            }, 500);
          }
        };
      
        // Buscar la imagen en el iframe y esperar su carga
        const img = iframeDoc.getElementById('print-image') as HTMLImageElement | null;
        if (img) {
          if (img.complete) {
            // pequeña espera para asegurar render
            setTimeout(tryPrint, 150);
          } else {
            img.onload = () => setTimeout(tryPrint, 150);
            img.onerror = () => {
              // si falla la carga, aun así intentamos imprimir (posible fallback)
              setTimeout(tryPrint, 200);
            };
          }
        } else {
          // fallback si por alguna razón no existe la imagen
          setTimeout(tryPrint, 300);
        }
      }
      
       buildPrintHtmlForImage(dataUrl: string) {
        // estilos para forzar impresión a color y ajustar márgenes; la imagen se adapta al ancho de la página.
        return `<!doctype html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Comprobante</title>
        <style>
          html,body { height:95%; margin:0; padding:0; background:#ffffff; }
          body { display:flex; align-items:center; justify-content:center; padding:8mm; }
          img { max-width:100%; height:auto; display:block; }
      
          /* Forzar impresión de colores donde sea soportado */
          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
      
          @page { margin: 6mm; }
        </style>
      </head>
      <body>
        <img id="print-image" src="${dataUrl}" alt="Comprobante">
        <script>
          // Intentamos auto-disparar print si la política del navegador lo permite.
          (function(){
            const img = document.getElementById('print-image');
            if (!img) return;
            function tryPrint() {
              try { window.focus(); window.print(); } catch(e) {}
            }
            if (img.complete) {
              setTimeout(tryPrint, 150);
            } else {
              img.onload = tryPrint;
              img.onerror = tryPrint;
            }
          })();
        </script>
      </body>
      </html>`;
      }

      async captureAndDownloadPdf(elementId: string, options: any = {}): Promise<void> {
        const el = document.getElementById(elementId);
        if (!el) throw new Error(`Elemento no encontrado`);
      
        // Configuración mejorada
        const canvas = await html2canvas(el, {
          scale: 2, // Aumentar resolución
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: true, // Para depuración
          windowWidth: el.scrollWidth,
          windowHeight: el.scrollHeight,
          ignoreElements: (element) => element.classList.contains('button-close') // Ignorar botones
        });
      
        const imgData = canvas.toDataURL('image/jpeg', 0.95); // Mejor compresión
      
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
      
        // Calcular relación de aspecto
        const imgRatio = canvas.width / canvas.height;
        const pdfRatio = pageWidth / pageHeight;
      
        let imgWidth = pageWidth;
        let imgHeight = pageHeight;
      
        if (imgRatio > pdfRatio) {
          imgHeight = imgWidth / imgRatio;
        } else {
          imgWidth = imgHeight * imgRatio;
        }
      
        // Centrar imagen
        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;
      
        pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
        pdf.save(options.filename || 'document.pdf');
      }

      // async captureAndDownloadPdf(elementId: string, options: { filename?: string; scale?: number; backgroundColor?: string | null;  orientation?: 'p' | 'l'; format?: 'a4' | 'letter' | string; marginMm?: number;} = {}): Promise<void> {   
        
      //   const {   filename = 'document.pdf',
      //     scale = Math.max(1, Math.min(3, window.devicePixelRatio || 2)),
      //     backgroundColor = '#ffffff',
      //     orientation = 'p',
      //     format = 'a4',
      //     marginMm = 10
      //   } = options;
      
      //   const el = document.getElementById(elementId);
      //   if (!el) throw new Error(`Elemento con id "${elementId}" no encontrado`);
      
      //   // Esperar cargas de fonts (si usas webfonts)
      //   if ('fonts' in document) {
      //     try { await (document as any).fonts.ready; } catch { /* ignore */ }
      //   }
      
      //   // Captura con html2canvas
      //   const canvas = await html2canvas(el, {
      //     scale,
      //     useCORS: true,
      //     allowTaint: false,
      //     backgroundColor,   // force background if needed or null for transparent
      //     imageTimeout: 20000,
      //     logging: true,
      //     scrollY: -window.scrollY,
      //     scrollX: -window.scrollX,
          
      //   });
      
      //   const imgData = canvas.toDataURL('image/png');
      
      //   // Crear el PDF
      //   const pdf = new jsPDF(orientation, 'mm', format);
      //   const pageWidth = pdf.internal.pageSize.getWidth();
      //   const pageHeight = pdf.internal.pageSize.getHeight();
      
      //   const usableWidth = pageWidth - marginMm * 2;
      //   const usableHeight = pageHeight - marginMm * 2;
      
      //   // calcular altura de la imagen en mm manteniendo aspect ratio
      //   // imgHeight_mm = (canvas.height * imgWidth_mm) / canvas.width
      //   const imgWidthMm = usableWidth;
      //   const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;
      
      //   if (imgHeightMm <= usableHeight) {
      //     // cabe en una sola página
      //     pdf.addImage(imgData, 'PNG', marginMm, marginMm, imgWidthMm, imgHeightMm);
      //   } else {
      //     // necesita paginar: cortamos el canvas en slices verticales
      //     // calcular cuántos px del canvas equivalen a una página (pxPageHeight)
      //     // derivación: pxPageHeight = (usableHeight mm) * (canvas.width px / imgWidthMm mm)
      //     const pxPageHeight = Math.floor(usableHeight * (canvas.width / imgWidthMm));
      
      //     let position = 0;
      //     let pageIndex = 0;
      //     while (position < canvas.height) {
      //       const sliceHeightPx = Math.min(pxPageHeight, canvas.height - position);
      
      //       // canvas temporal para cada página
      //       const tmpCanvas = document.createElement('canvas');
      //       tmpCanvas.width = canvas.width;
      //       tmpCanvas.height = sliceHeightPx;
      //       const ctx = tmpCanvas.getContext('2d')!;
      //       ctx.drawImage(canvas, 0, position, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);
      
      //       const pageData = tmpCanvas.toDataURL('image/png');
      //       const pageImgHeightMm = (sliceHeightPx * imgWidthMm) / canvas.width;
      
      //       if (pageIndex > 0) pdf.addPage();
      //       pdf.addImage(pageData, 'PNG', marginMm, marginMm, imgWidthMm, pageImgHeightMm);
      
      //       position += sliceHeightPx;
      //       pageIndex++;
      //     }
      //   }
      
      //   // Guardar / descargar
      //   pdf.save(filename);
      // }

      getInitialCotizarEnvioModel(){
        const initialModel: CotizacionPaqueteriaModel = {
          codigoPostalOrigen: "",
          ciudadOrigen: "",
          codigoPostalDestino: "",
          ciudadDestino: "",
          peso: 0,
          logitud: 0,
          ancho: 0,
          altura: 0,
          fechaEnvio: ""
        };
        return initialModel;
      }


      getInitialGuiaModel(){
        return {
          plannedShippingDateAndTime: "2025-08-21T19:19:40 GMT+00:00",
          pickup: {
            "isRequested": false
          },
          productCode: "G",
          getRateEstimates: false,
          accounts: [
            {
              "number": "987283375",
              "typeCode": "shipper"
            }
          ],
          outputImageProperties: {
            "printerDPI": 300,
            "encodingFormat": "pdf",
            "imageOptions": [
              {
                "typeCode": "waybillDoc",
                "templateName": "ARCH_8x4",
                "isRequested": true,
                "hideAccountNumber": false,
                "numberOfCopies": 1
              },
              {
                "typeCode": "label",
                "templateName": "ECOM26_84_001",
                "isRequested": true
              }
            ],
            "splitTransportAndWaybillDocLabels": true,
            "allDocumentsInOneImage": false,
            "splitDocumentsByPages": true,
            "splitInvoiceAndReceipt": true,
            "receiptAndLabelsInOneImage": false
          },
          customerDetails: {
           
          },
          content: {  
            "packages": [
              {
                "typeCode": "2BP",
                "weight": 0.296,
                "dimensions": {
                  "length": 1,
                  "width": 1,
                  "height": 1
                }
              }
            ],
            "isCustomsDeclarable": false,
            "description": "Shipment Description",
            "incoterm": "DAP",
            "unitOfMeasurement": "metric"
          },
          getTransliteratedResponse: false,
          estimatedDeliveryDate: {
            "isRequested": false,
            "typeCode": "QDDC"
          },
          getAdditionalInformation: [
            {
              "typeCode": "pickupDetails",
              "isRequested": true
            }
          ]         
        }
      }

      setLocalStorageEncodedKey(key: string, data: string){
        let encodedKey =  this.encodeToBase64(key);
        localStorage.setItem(encodedKey!, data);
      }

      getLocalStorageEncodedKey(key: string){
        let encodedKey =  this.encodeToBase64(key);
        let data = localStorage.getItem(encodedKey!);
        return data;
      }

      removeLocalStorageEncodedKey(key: string){
        let encodedKey =  this.encodeToBase64(key);
        if(encodedKey)
          localStorage.removeItem(encodedKey);
      }

      async tokenizarTarjeta(tarjeta: any) {
        const deviceSessionId = OpenPay.deviceData.setup('payment-form', 'device-session-id');
        const dataToken = {
          holder_name: tarjeta.holder_name + ' ' + tarjeta.holder_lastname,
          card_number: tarjeta.card_number,
          expiration_month: tarjeta.expiration_month,
          expiration_year: tarjeta.expiration_year,
          cvv2: tarjeta.cvv2
        };
        let respuesta = await new Promise<any>((resolve) => {
          OpenPay.token.create(dataToken, 
            (response: any) => {
              const token_id = response.data.id;
              let cardnumber = response.data.card.card_number.slice(-4);
              var metodoPagoDescripcion = `Tarjeta • ${response.data.card.brand} • **** ${cardnumber}`;
              resolve({ok: true, msg:'', token_id, cardnumber, metodo_desc:  metodoPagoDescripcion, deviceSessionId, error: null})
              // this.GenerarCargo(token_id, deviceSessionId);
            },
            (error: any) => {
              let res_error = error.data;
              let errorMessage = this.getTextoErrorTokenOpenPay(res_error.description);
              resolve({ok: false, msg: errorMessage, innerMsg:error.error, error})

              // this.loading = false;
              // this.ss.showNotification('error','Hubo un problema al tokenizar la tarjeta, cargo no aplicado');
              // console.error('Error al tokenizar:', error);
            }
          );
        });
        return respuesta;
      }

      getDeviceSessionID(){
        const deviceSessionId = OpenPay.deviceData.setup('payment-form', 'device-session-id');
        return deviceSessionId;
      }

      getModelGuiaEnvioRegreso(subasta: Subasta, direccionEnvio: any,   direccionEntrega: any, infoUsuario: any){
        let paqueteriaRequestModel: any = this.getInitialGuiaModel();
        paqueteriaRequestModel.idsubasta = subasta!.id;
        paqueteriaRequestModel.plannedShippingDateAndTime = this.getCorrectDateFormat()//"2025-08-23T19:19:40 GMT+00:00"
        paqueteriaRequestModel.content = {
          "packages": [
              {
                "typeCode": "2BP",
                "weight": subasta!.peso,
                "dimensions": {
                  "length": subasta!.largo,
                  "width": subasta!.profundidad,
                  "height": subasta!.ancho
                }
              }
            ],
            "isCustomsDeclarable": false,
            "description": "Producto: " + subasta!.caption,
            "incoterm": "DAP",
            "unitOfMeasurement": "metric"
        }
        // DESDE DONDE SE ENVIA EL PRODUCTO
        paqueteriaRequestModel.customerDetails.shipperDetails = direccionEnvio
        paqueteriaRequestModel.customerDetails.shipperDetails.registrationNumbers = [
          {
            "typeCode": "VAT",
            "number": "244444911",
            "issuerCountryCode": "MX"
          }
        ];
        paqueteriaRequestModel.customerDetails.typeCode = "business"

        // {
        //   "postalAddress": {
        //         "postalCode": direccionEnvio.direccion.codigoPostal,
        //         "cityName": direccionEnvio.direccion.municipio,
        //         "countryCode": "MX",
        //         "addressLine1": `${direccionEnvio.direccion.calle} ${direccionEnvio.direccion.numeroExt} ${subasta!.direccion.numeroInt}`,
        //         "addressLine2": subasta!.direccion.colonia,
        //         "countryName": "Mexico"
        //   },
        //   "contactInformation": {
        //     "email": subasta!.direccion.correo,
        //     "phone": subasta!.direccion.telefono,
        //     "mobilePhone": "2563456227231",
        //     "companyName": "XUBA",
        //     "fullName": `${subasta!.musuarios.nombre} ${subasta!.musuarios.apellido}`
        //   },
        //   "registrationNumbers": [
        //     {
        //       "typeCode": "VAT",
        //       "number": "244444911",
        //       "issuerCountryCode": "MX"
        //     }
        //   ],
        //   "typeCode": "business"
        // }

        //DONDE SE ENTREGARA EL PRODUCTO
        paqueteriaRequestModel.customerDetails.receiverDetails = {
          "postalAddress": {
            "postalCode": direccionEntrega.codigoPostal,
            "cityName": direccionEntrega.municipio,
            "countryCode": "MX",
            "addressLine1": `${direccionEntrega.calle} ${direccionEntrega.numeroExt} ${direccionEntrega.numeroInt}`,
            "addressLine2": direccionEntrega.colonia,
            "countryName": "Mexico"
          },
          "contactInformation": {
            "email": infoUsuario.correo,
            "phone": infoUsuario.telefono,
            "mobilePhone": infoUsuario.telefono,
            "companyName": "XUBA",
            "fullName": `${infoUsuario.nombre} ${infoUsuario.apellido}`
          },
          "registrationNumbers": [
            {
              "typeCode": "VAT",
              "number": "12345678",
              "issuerCountryCode": "MX"
            }
          ],
          "typeCode": "business"
        }
      }

      getPaqueteriaGuiaModel(subasta: Subasta, direccionEnvio: any, usuarioEnvia: any,  direccionEntrega: any, usuarioEntrega: any){
        let paqueteriaRequestModel: any = this.getInitialGuiaModel();
        paqueteriaRequestModel.idsubasta = subasta!.id;
        paqueteriaRequestModel.plannedShippingDateAndTime = this.getCorrectDateFormat();
        paqueteriaRequestModel.content = {
          packages: [
              {
                typeCode: "2BP",
                weight: subasta!.peso,
                dimensions: {
                  length: subasta!.largo,
                  width: subasta!.profundidad,
                  height: subasta!.ancho
                }
              }
            ],
          isCustomsDeclarable: false,
          description: "Producto: " + subasta!.caption,
          incoterm: "DAP",
          unitOfMeasurement: "metric"
        }
        paqueteriaRequestModel.customerDetails.shipperDetails = {
          postalAddress: {
            postalCode: direccionEnvio.codigoPostal,
            cityName: direccionEnvio.municipio,
            countryCode: "MX",
            addressLine1: `${direccionEnvio.calle} ${direccionEnvio.numeroExt} ${direccionEnvio.numeroInt}`,
            addressLine2: direccionEnvio.colonia,
            countryName: "Mexico"
          },
          contactInformation: {
            email: usuarioEnvia.correo,
            phone: usuarioEnvia.telefono,
            mobilePhone: "2563456227231",
            companyName: "XUBA",
            fullName: `${usuarioEnvia.nombre} ${usuarioEnvia.apellido}`
          },
          registrationNumbers: [
            {
              typeCode: "VAT",
              number: "244444911",
              issuerCountryCode: "MX"
            }
          ],
          typeCode: "business"
        }, 
        paqueteriaRequestModel.customerDetails.receiverDetails = {
          postalAddress: {
            postalCode: direccionEntrega.codigoPostal,
            cityName: direccionEntrega.municipio,
            countryCode: "MX",
            addressLine1: `${direccionEntrega.calle} ${direccionEntrega.numeroExt} ${direccionEntrega.numeroInt}`,
            addressLine2: direccionEntrega.colonia,
            countryName: "Mexico"
          },
          contactInformation: {
            email: usuarioEntrega.correo,
            phone: usuarioEntrega.telefono,
            mobilePhone: usuarioEntrega.telefono,
            companyName: "XUBA",
            fullName: `${usuarioEntrega.nombre} ${usuarioEntrega.apellido}`
          },
          registrationNumbers: [
            {
              typeCode: "VAT",
              number: "12345678",
              issuerCountryCode: "MX"
            }
          ],
          typeCode: "business"
        }
        return paqueteriaRequestModel;
      }


  getCorrectDateFormat(): string{
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    let fecha = '';
    const yyyy = tomorrow.getUTCFullYear();
    const mm = String(tomorrow.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getUTCDate()).padStart(2, '0');
    const hh = String(tomorrow.getUTCHours()).padStart(2, '0');
    const mi = String(tomorrow.getUTCMinutes()).padStart(2, '0');
    const ss = String(tomorrow.getUTCSeconds()).padStart(2, '0');
    fecha = `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss} GMT+00:00`;
    return fecha;
  }

  getCotizarFecha(){
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return today.toISOString();
  }
}