import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkFromHomeReportComponent } from './work-from-home-report.component';

describe('WorkFromHomeReportComponent', () => {
  let component: WorkFromHomeReportComponent;
  let fixture: ComponentFixture<WorkFromHomeReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkFromHomeReportComponent]
    });
    fixture = TestBed.createComponent(WorkFromHomeReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
