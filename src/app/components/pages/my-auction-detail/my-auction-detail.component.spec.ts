import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAuctionDetailComponent } from './my-auction-detail.component';

describe('MyAuctionDetailComponent', () => {
  let component: MyAuctionDetailComponent;
  let fixture: ComponentFixture<MyAuctionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyAuctionDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyAuctionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
