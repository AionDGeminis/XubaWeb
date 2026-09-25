import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-fullscreen-modal',
  imports: [CommonModule],
  templateUrl: './fullscreen-modal.component.html',
  styleUrl: './fullscreen-modal.component.css'
})
export class FullscreenModalComponent {

  @Input() imageList: any[]  = [];
  @Output() onCloseModal = new EventEmitter<void>();
  @Output() onProcessModal = new EventEmitter<any>();
  currentImageIndex = 0;
  classNavigateImg = '';
  
  constructor(){}
  
  closeModal(): void {
    this.onCloseModal.emit();
  }

  processModal(): void {
    this.onProcessModal.emit();
  }

  navigateImage(to: string, event: any){
    event.stopPropagation();
    switch(to){
      case 'prev':
        if(this.currentImageIndex > 0){
          this.classNavigateImg = 'animate__fadeOutRight';
          setTimeout(() => {
            this.currentImageIndex--;
            this.classNavigateImg = 'animate__fadeInLeft';
          }, 350);
        }
          break;
      case 'next':
        if(this.currentImageIndex < this.imageList.length - 1) {
          this.classNavigateImg = 'animate__fadeOutLeft';
          setTimeout(() => {
            this.currentImageIndex++;
            this.classNavigateImg = 'animate__fadeInRight';
          }, 350);
          // this.currentImageIndex++;
        }
          break;
    }
  }

}
