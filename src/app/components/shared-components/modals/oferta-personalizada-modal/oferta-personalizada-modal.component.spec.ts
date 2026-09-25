import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfertaPersonalizadaModalComponent } from './oferta-personalizada-modal.component';

describe('OfertaPersonalizadaModalComponent', () => {
  let component: OfertaPersonalizadaModalComponent;
  let fixture: ComponentFixture<OfertaPersonalizadaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfertaPersonalizadaModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfertaPersonalizadaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
