import { Component, EventEmitter, Input, Output } from '@angular/core';
import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-pago-subasta-ticket',
  imports: [],
  templateUrl: './pago-subasta-ticket.component.html',
  styleUrl: './pago-subasta-ticket.component.css'
})
export class PagoSubastaTicketComponent {
  @Input() modeloComprobante: any = {};
  @Input() fileName: string = '';
  @Output() onCloseModal = new EventEmitter<void>();
  classComprobanteModal = '';
  constructor(){}

  closeModal(){
    this.onCloseModal.emit();
  }

  async downloadComprobante(){
    console.log('descargar compronbante')
    const timestamp = Date.now();
    const _filename = `${this.fileName}.pdf`; 
    const element: any = document.getElementById('printContainer');
    const opt: any = {
      margin: 10,
      filename: _filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
    // this.ss.showNotification('success','Operation completed successfully');
    // this.ss.showNotification('error','Operation completed successfully');
    // this.ss.showNotification('info','Operation completed successfully');
    // this.ss.showNotification('warning','Operation completed successfully');
    // this.ss.showConfirmMessage('asdasdasdasd');
  }
}
