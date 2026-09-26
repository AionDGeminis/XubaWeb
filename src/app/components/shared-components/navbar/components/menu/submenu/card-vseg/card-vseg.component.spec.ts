import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardVsegComponent } from './card-vseg.component';

describe('CardVsegComponent', () => {
  let component: CardVsegComponent;
  let fixture: ComponentFixture<CardVsegComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardVsegComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardVsegComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
