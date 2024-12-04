import { TestBed } from '@angular/core/testing';

import { VoltageFirebaseService } from './voltage-firebase.service';

describe('VoltageFirebaseService', () => {
  let service: VoltageFirebaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoltageFirebaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
