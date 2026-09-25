import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnyuserViewComponent } from './anyuser-view.component';

describe('AnyuserViewComponent', () => {
  let component: AnyuserViewComponent;
  let fixture: ComponentFixture<AnyuserViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnyuserViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnyuserViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
