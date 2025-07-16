import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralAuctionsComponent } from './general-auctions.component';

describe('GeneralAuctionsComponent', () => {
  let component: GeneralAuctionsComponent;
  let fixture: ComponentFixture<GeneralAuctionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralAuctionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralAuctionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
