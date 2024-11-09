import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoltageChartComponent } from './voltage-chart.component';

describe('VoltageChartComponent', () => {
  let component: VoltageChartComponent;
  let fixture: ComponentFixture<VoltageChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoltageChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoltageChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
