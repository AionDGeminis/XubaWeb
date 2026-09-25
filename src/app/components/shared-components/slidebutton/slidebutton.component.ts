import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-slidebutton',
  standalone: true,
  templateUrl: './slidebutton.component.html',
  styleUrls: ['./slidebutton.component.css'],
})
export class SlidebuttonComponent implements AfterViewInit, OnDestroy {
  @Input() label = 'Desliza para ofertar';
  @Input() disabled = false;
  @Output() confirmed = new EventEmitter<void>();

  @ViewChild('track') trackRef!: ElementRef<HTMLElement>;
  @ViewChild('fill') fillRef!: ElementRef<HTMLElement>;
  @ViewChild('thumb') thumbRef!: ElementRef<HTMLElement>;
  @ViewChild('label') labelRef!: ElementRef<HTMLElement>;

  // "Feel" del componente
  private readonly THUMB_SIZE = 56;
  private readonly PADDING = 4;
  private readonly THRESHOLD = 92;          // % para confirmar
  private readonly RESET_MS = 200;          // regreso al soltar (con rebote)
  private readonly CONFIRM_WAIT_MS = 150;   // pausa mostrando "Oferta enviada"
  private readonly CONFIRM_RESET_MS = 320;

  // Estado en variables internas: siempre el valor real, nunca un binding atrasado
  private position = 0;
  private progress = 0;
  private dragging = false;
  private rafId: number | null = null;
  private confirmTimer: ReturnType<typeof setTimeout> | null = null;
  private trackRect: DOMRect | null = null;

  protected confirmedFlag = false;

  constructor(private zone: NgZone) { }

  ngAfterViewInit(): void {
    const track = this.trackRef.nativeElement;

    // Listeners fuera de Angular: el drag no dispara change detection (clave en móvil)
    this.zone.runOutsideAngular(() => {
      track.addEventListener('pointerdown', this.onPointerDown);
      track.addEventListener('pointermove', this.onPointerMove);
      track.addEventListener('pointerup', this.onPointerUp);
      track.addEventListener('pointercancel', this.onPointerUp);
    });

    this.paint(0);
  }

  ngOnDestroy(): void {
    this.stopAnimation();
    if (this.confirmTimer) clearTimeout(this.confirmTimer);

    const track = this.trackRef?.nativeElement;
    if (track) {
      track.removeEventListener('pointerdown', this.onPointerDown);
      track.removeEventListener('pointermove', this.onPointerMove);
      track.removeEventListener('pointerup', this.onPointerUp);
      track.removeEventListener('pointercancel', this.onPointerUp);
    }
  }

  // ---------- Eventos de puntero ----------

  private onPointerDown = (event: PointerEvent): void => {
    if (this.confirmedFlag || this.disabled) return;

    event.preventDefault();
    this.stopAnimation();

    // Pointer capture: los siguientes move/up llegan al track aunque el dedo salga
    this.trackRef.nativeElement.setPointerCapture(event.pointerId);
    this.trackRect = this.trackRef.nativeElement.getBoundingClientRect();

    this.dragging = true;
    this.updateFromClientX(event.clientX);
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (!this.dragging || this.confirmedFlag) return;
    this.updateFromClientX(event.clientX);
  };

  private onPointerUp = (): void => {
    if (!this.dragging || this.confirmedFlag) return;

    // FIX clave: leer el valor real, no un binding actualizado de forma asíncrona
    const finalProgress = this.progress;
    this.dragging = false;

    if (finalProgress >= this.THRESHOLD) this.confirm();
    else this.reset();
  };

  // ---------- Teclado ----------

  onKeyDown(event: KeyboardEvent): void {
    if (this.confirmedFlag || this.disabled) return;

    const max = this.maxPosition();

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        this.paint(Math.min(this.position + max / 10, max));
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.paint(Math.max(this.position - max / 10, 0));
        break;
      case 'Home':
        event.preventDefault();
        this.paint(0);
        break;
      case 'End':
        event.preventDefault();
        this.paint(max);
        break;
      case 'Escape':
        event.preventDefault();
        this.reset();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.progress >= this.THRESHOLD) this.confirm();
        else this.reset();
        break;
    }
  }

  // ---------- Lógica ----------

  private confirm(): void {
    this.zone.run(() => {
      this.confirmedFlag = true;
      this.confirmed.emit(); // tu función se ejecuta aquí
    });
    this.paint(this.maxPosition());

    this.confirmTimer = setTimeout(() => {
      this.zone.run(() => {
        this.confirmedFlag = false;
      });
      this.animateTo(0, this.CONFIRM_RESET_MS, 'back');
    }, this.CONFIRM_WAIT_MS);
  }

  private reset(): void {
    this.dragging = false;
    this.animateTo(0, this.RESET_MS, 'back');
  }

  private maxPosition(): number {
    const width = this.trackRef?.nativeElement?.clientWidth ?? 0;
    return Math.max(width - this.THUMB_SIZE - this.PADDING * 2, 1);
  }

  private updateFromClientX(clientX: number): void {
    if (!this.trackRect) return;
    this.paint(clientX - this.trackRect.left - this.PADDING - this.THUMB_SIZE / 2);
  }

  private paint(position: number): void {
    const max = this.maxPosition();
    const next = Math.max(0, Math.min(position, max));
    this.position = next;
    this.progress = (next / max) * 100;

    if (this.thumbRef) {
      const scale = this.dragging ? 1.06 : 1;
      this.thumbRef.nativeElement.style.transform =
        'translate3d(' + next + 'px, -50%, 0) scale(' + scale + ')';
      this.thumbRef.nativeElement.setAttribute('aria-valuenow', String(Math.round(this.progress)));
    }

    if (this.fillRef) {
      this.fillRef.nativeElement.style.clipPath =
        'inset(0 ' + (100 - this.progress) + '% 0 0 round 999px)';
    }

    if (this.labelRef) {
      this.labelRef.nativeElement.classList.toggle(
        'slide-over',
        this.progress > 45 || this.confirmedFlag
      );
      const text = this.confirmedFlag
        ? 'Oferta enviada'
        : this.progress >= this.THRESHOLD
          ? 'Suelta para ofertar'
          : this.label;
      if (this.labelRef.nativeElement.textContent !== text) {
        this.labelRef.nativeElement.textContent = text;
      }
    }
  }

  // ---------- Animación con requestAnimationFrame ----------

  private stopAnimation(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private animateTo(target: number, duration: number, ease: 'cubic' | 'back' = 'cubic'): void {
    this.stopAnimation();

    this.zone.runOutsideAngular(() => {
      const start = this.position;
      const t0 = performance.now();

      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const easeOutBack = (t: number) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
      };
      const curve = ease === 'back' ? easeOutBack : easeOutCubic;

      const step = (now: number) => {
        const raw = Math.min((now - t0) / duration, 1);
        this.paint(start + (target - start) * curve(raw));
        this.rafId = raw < 1 ? requestAnimationFrame(step) : null;
      };

      this.rafId = requestAnimationFrame(step);
    });
  }
}