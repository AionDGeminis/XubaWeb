import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardSsegComponent } from './card-sseg.component';

describe('CardSsegComponent', () => {
  let component: CardSsegComponent;
  let fixture: ComponentFixture<CardSsegComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardSsegComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardSsegComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
