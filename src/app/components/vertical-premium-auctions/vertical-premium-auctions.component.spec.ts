import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerticalPremiumAuctionsComponent } from './vertical-premium-auctions.component';

describe('VerticalPremiumAuctionsComponent', () => {
  let component: VerticalPremiumAuctionsComponent;
  let fixture: ComponentFixture<VerticalPremiumAuctionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerticalPremiumAuctionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerticalPremiumAuctionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
