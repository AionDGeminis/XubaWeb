import { TestBed } from '@angular/core/testing';

import { SubastasService, SubastasServiceGeneral, SubastasServicePremium } from './subastas.service';

describe('SubastasService', () => {
  let service: SubastasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubastasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
describe('SubastasServicePremium', () => {
  let service: SubastasServicePremium;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubastasServicePremium);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
describe('SubastasServiceGeneral', () => {
  let service: SubastasServiceGeneral;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubastasServiceGeneral);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
