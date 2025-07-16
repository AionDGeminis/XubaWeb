import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XpressAuctionsComponent } from './xpress-auctions.component';

describe('XpressAuctionsComponent', () => {
  let component: XpressAuctionsComponent;
  let fixture: ComponentFixture<XpressAuctionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XpressAuctionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XpressAuctionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
