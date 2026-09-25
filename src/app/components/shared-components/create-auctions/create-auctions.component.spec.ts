import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAuctionsComponent } from './create-auctions.component';

describe('CreateAuctionsComponent', () => {
  let component: CreateAuctionsComponent;
  let fixture: ComponentFixture<CreateAuctionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAuctionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAuctionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
