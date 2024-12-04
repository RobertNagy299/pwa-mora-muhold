import { TestBed } from '@angular/core/testing';

import { VoltageChartService } from './voltage-chart.service';

describe('VoltageChartService', () => {
  let service: VoltageChartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoltageChartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
