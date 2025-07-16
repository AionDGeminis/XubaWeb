import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchAuctionsComponent } from './search-auctions.component';

describe('SearchAuctionsComponent', () => {
  let component: SearchAuctionsComponent;
  let fixture: ComponentFixture<SearchAuctionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchAuctionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchAuctionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
