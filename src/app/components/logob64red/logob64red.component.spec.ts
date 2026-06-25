import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Logob64redComponent } from './logob64red.component';

describe('Logob64redComponent', () => {
  let component: Logob64redComponent;
  let fixture: ComponentFixture<Logob64redComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Logob64redComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Logob64redComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
