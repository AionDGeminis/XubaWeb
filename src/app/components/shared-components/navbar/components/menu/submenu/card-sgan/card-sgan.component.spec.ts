import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardSganComponent } from './card-sgan.component';

describe('CardSganComponent', () => {
  let component: CardSganComponent;
  let fixture: ComponentFixture<CardSganComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardSganComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardSganComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
