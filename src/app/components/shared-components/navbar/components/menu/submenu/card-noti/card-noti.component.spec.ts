import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardNotiComponent } from './card-noti.component';

describe('CardNotiComponent', () => {
  let component: CardNotiComponent;
  let fixture: ComponentFixture<CardNotiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardNotiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardNotiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
