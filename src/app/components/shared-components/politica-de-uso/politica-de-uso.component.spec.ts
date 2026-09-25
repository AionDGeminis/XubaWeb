import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliticaDeUsoComponent } from './politica-de-uso.component';

describe('PoliticaDeUsoComponent', () => {
  let component: PoliticaDeUsoComponent;
  let fixture: ComponentFixture<PoliticaDeUsoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoliticaDeUsoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoliticaDeUsoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
