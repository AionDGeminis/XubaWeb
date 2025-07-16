import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremiumAuctionsComponent } from './premium-auctions.component';

describe('PremiumAuctionsComponent', () => {
  let component: PremiumAuctionsComponent;
  let fixture: ComponentFixture<PremiumAuctionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremiumAuctionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremiumAuctionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
