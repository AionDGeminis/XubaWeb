import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlidebuttonComponent } from './slidebutton.component';

describe('SlidebuttonComponent', () => {
  let component: SlidebuttonComponent;
  let fixture: ComponentFixture<SlidebuttonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlidebuttonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlidebuttonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
