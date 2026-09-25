import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageblockComponent } from './pageblock.component';

describe('PageblockComponent', () => {
  let component: PageblockComponent;
  let fixture: ComponentFixture<PageblockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageblockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageblockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
