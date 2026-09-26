import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardSguiComponent } from './card-sgui.component';

describe('CardSguiComponent', () => {
  let component: CardSguiComponent;
  let fixture: ComponentFixture<CardSguiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardSguiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardSguiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
