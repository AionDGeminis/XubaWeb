import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowedAuctionsComponent } from './followed-auctions.component';

describe('FollowedAuctionsComponent', () => {
  let component: FollowedAuctionsComponent;
  let fixture: ComponentFixture<FollowedAuctionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowedAuctionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FollowedAuctionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
